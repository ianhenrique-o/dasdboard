/**
 * Competitors Service
 *
 * Camada de dados para rastreamento de concorrentes.
 *
 * APIs reais suportadas:
 *   YouTube Data API v3 — YOUTUBE_API_KEY em .env.local
 *     → Dados públicos de canal: inscritos, views, contagem de vídeos
 *
 * Para outras plataformas (Instagram, TikTok, etc.) não há APIs
 * públicas sem OAuth do próprio usuário. Os dados são simulados
 * com variação realista como fallback.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type Platform =
  | "instagram"
  | "youtube"
  | "tiktok"
  | "facebook"
  | "linkedin"
  | "twitter"

export interface RecentPost {
  id: string
  caption: string
  type: string
  publishedAt: string         // ISO
  likes: number
  comments: number
  shares: number
  url?: string
}

/** One data point for sparkline (weekly follower count) */
export interface FollowerPoint {
  week: number                // 0 = oldest, 11 = latest
  value: number
}

export interface Competitor {
  id: string
  handle: string              // @handle or channel ID
  name: string
  platform: Platform
  url?: string
  /** Total followers / subscribers */
  followers: number
  /** % growth vs 30 days ago */
  followerGrowthPct: number
  /** Average engagement rate over last 30 days (%) */
  engagementRate: number
  /** Change in eng. rate vs prev 30d */
  engagementDelta: number
  /** Posts published in the last 30 days */
  postsLast30d: number
  /** Total posts / videos on profile */
  postsTotal: number
  /** ISO timestamp of latest post */
  lastPostAt: string
  /** 12-point weekly follower series for sparkline */
  followerSeries: FollowerPoint[]
  recentPosts: RecentPost[]
  addedAt: string             // ISO
  source: "live" | "mock"
}

// ─── YouTube API ──────────────────────────────────────────────────────────────

export function isYouTubeConfigured(): boolean {
  return Boolean(process.env.YOUTUBE_API_KEY)
}

/**
 * Fetches public channel data from YouTube Data API v3.
 * Accepts either a @handle or a channel ID (UC...).
 */
export async function fetchYouTubeChannel(handleOrId: string): Promise<Competitor> {
  const key = process.env.YOUTUBE_API_KEY!
  const isId = handleOrId.startsWith("UC")

  const params = new URLSearchParams({
    part: "statistics,snippet",
    key,
    ...(isId
      ? { id: handleOrId }
      : { forHandle: handleOrId.replace(/^@/, "") }),
  })

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?${params}`,
    { next: { revalidate: 3600 } }
  )
  if (!res.ok) throw new Error(`YouTube API error: ${res.status}`)

  const json = await res.json()
  const item = json.items?.[0]
  if (!item) throw new Error(`Channel not found: ${handleOrId}`)

  const subs = Number(item.statistics.subscriberCount ?? 0)
  const videoCount = Number(item.statistics.videoCount ?? 0)

  return {
    id: item.id,
    handle: `@${item.snippet.customUrl ?? handleOrId}`,
    name: item.snippet.title,
    platform: "youtube",
    url: `https://youtube.com/${item.snippet.customUrl ? `@${item.snippet.customUrl}` : `channel/${item.id}`}`,
    followers: subs,
    followerGrowthPct: 0,       // requires historical data not in basic API
    engagementRate: 0,
    engagementDelta: 0,
    postsLast30d: 0,
    postsTotal: videoCount,
    lastPostAt: new Date().toISOString(),
    followerSeries: buildGrowthSeries(subs, 3),
    recentPosts: [],
    addedAt: new Date().toISOString(),
    source: "live",
  }
}

// ─── Mock data helpers ────────────────────────────────────────────────────────

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randFloat(min: number, max: number, decimals = 1): number {
  const v = Math.random() * (max - min) + min
  return parseFloat(v.toFixed(decimals))
}

function buildGrowthSeries(currentFollowers: number, weeklyGrowthPct: number): FollowerPoint[] {
  const series: FollowerPoint[] = []
  let value = currentFollowers
  for (let w = 11; w >= 0; w--) {
    series.unshift({ week: 11 - w, value: Math.round(value) })
    value = value / (1 + weeklyGrowthPct / 100 + (Math.random() - 0.4) * 0.01)
  }
  return series
}

function mockRecentPosts(platform: Platform, count = 4): RecentPost[] {
  const postTypes: Record<Platform, string[]> = {
    instagram: ["post", "reel", "story", "carrossel"],
    youtube:   ["video", "shorts"],
    tiktok:    ["video"],
    facebook:  ["post", "video", "story"],
    linkedin:  ["artigo", "post"],
    twitter:   ["tweet", "thread"],
  }
  const captions = [
    "Lançamento de produto — confira os detalhes e aproveite a oferta exclusiva!",
    "Bastidores da nossa última sessão de fotos 📸 Como foi feito",
    "Dica rápida de produtividade que vai mudar sua rotina de trabalho",
    "Resultados de março: crescemos 23% no engajamento com essa estratégia",
    "Novidade: parceria com marca líder do mercado — detalhes em breve 👀",
    "Tutorial completo: do zero ao perfil profissional em 30 minutos",
  ]

  const now = new Date()
  const types = postTypes[platform]
  return Array.from({ length: count }, (_, i) => {
    const daysAgo = [1, 3, 7, 14][i] ?? rand(7, 21)
    const d = new Date(now)
    d.setDate(d.getDate() - daysAgo)
    const likes = rand(200, 15000)
    return {
      id: `mock-post-${i}`,
      caption: captions[i % captions.length],
      type: types[rand(0, types.length - 1)],
      publishedAt: d.toISOString(),
      likes,
      comments: Math.round(likes * randFloat(0.03, 0.12)),
      shares: Math.round(likes * randFloat(0.01, 0.06)),
    }
  })
}

/** Generates a realistic mock competitor profile */
export function buildMockCompetitor(
  handle: string,
  name: string,
  platform: Platform,
  followerBase: number,
  growthPct: number,
): Competitor {
  const engRate = randFloat(1.5, 12.0)
  const postsMonth = rand(4, 28)
  const now = new Date()
  const lastPostDays = rand(0, 5)
  const lastPostDate = new Date(now)
  lastPostDate.setDate(lastPostDate.getDate() - lastPostDays)

  return {
    id: `mock-${handle}-${platform}`,
    handle,
    name,
    platform,
    url: `https://${platform}.com/${handle.replace("@", "")}`,
    followers: followerBase,
    followerGrowthPct: growthPct,
    engagementRate: engRate,
    engagementDelta: randFloat(-2.0, 2.5),
    postsLast30d: postsMonth,
    postsTotal: rand(postsMonth * 6, postsMonth * 36),
    lastPostAt: lastPostDate.toISOString(),
    followerSeries: buildGrowthSeries(followerBase, growthPct / 12),
    recentPosts: mockRecentPosts(platform),
    addedAt: new Date().toISOString(),
    source: "mock",
  }
}

// ─── Default seed data ────────────────────────────────────────────────────────

export const SEED_COMPETITORS: Competitor[] = [
  buildMockCompetitor("@criativa_studio", "Criativa Studio",  "instagram", 84_300,  4.2),
  buildMockCompetitor("@brandbeta",       "Brand Beta",       "instagram", 52_100,  1.8),
  buildMockCompetitor("@conteudo_pro",    "Conteúdo Pro",     "instagram", 31_700, -0.4),
  buildMockCompetitor("@AlphaChannel",    "Alpha Channel",    "youtube",  128_000,  6.7),
  buildMockCompetitor("@digitalflow_",   "Digital Flow",     "tiktok",   210_400,  9.1),
  buildMockCompetitor("@nexus_br",        "Nexus Brasil",     "linkedin",  18_900,  3.3),
]
