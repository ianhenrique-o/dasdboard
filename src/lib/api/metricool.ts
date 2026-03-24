/**
 * Metricool API v2 Client
 *
 * Configuração:
 *   1. Gere sua API Key em app.metricool.com → Configurações → Desenvolvedor → API
 *   2. Copie o Blog ID da URL: /dashboard?blogId=<ID>
 *   3. Defina METRICOOL_API_KEY e METRICOOL_BLOG_ID em .env.local
 *
 * Referência: https://app.metricool.com/api/swagger
 */

const BASE_URL = "https://app.metricool.com/api/v2"

// ─── Types ────────────────────────────────────────────────────────────────────

export type Network = "instagram" | "facebook" | "twitter" | "linkedin" | "tiktok"

/** Um ponto de série temporal (impressões / engajamento / seguidores) */
export interface TimePoint {
  date: string   // YYYY-MM-DD
  value: number
}

/** Métricas de um único post */
export interface PostMetrics {
  id: string
  network: Network
  type: string            // "post" | "reel" | "story" | "carrossel"
  caption: string
  publishedAt: string     // ISO date
  impressions: number
  reach: number
  likes: number
  comments: number
  shares: number
  saves: number
  engagementRate: number  // 0–100
  url?: string
}

/** Totais do período */
export interface PeriodSummary {
  impressions: number
  reach: number
  engagementRate: number      // média do período (%)
  newFollowers: number
  totalFollowers: number
  followerGrowthPct: number   // variação % vs período anterior
  impressionChangePct: number
  engagementChangePct: number
}

/** Payload completo retornado pela rota /api/analytics */
export interface AnalyticsPayload {
  summary: PeriodSummary
  impressionsSeries: TimePoint[]
  engagementSeries: TimePoint[]
  followerSeries: TimePoint[]
  topPosts: PostMetrics[]
  source: "metricool" | "mock"
}

// ─── Client ───────────────────────────────────────────────────────────────────

interface MetricoolRequestOptions {
  startDate: string  // YYYY-MM-DD
  endDate: string    // YYYY-MM-DD
  network?: Network
}

function headers(): HeadersInit {
  return {
    "Authorization": `Bearer ${process.env.METRICOOL_API_KEY}`,
    "Content-Type": "application/json",
  }
}

function blogId(): string {
  return process.env.METRICOOL_BLOG_ID ?? ""
}

/** Verifica se a integração está configurada */
export function isMetricoolConfigured(): boolean {
  return Boolean(process.env.METRICOOL_API_KEY && process.env.METRICOOL_BLOG_ID)
}

/**
 * Retorna o resumo de métricas do período.
 * Endpoint: GET /api/v2/stats/summary
 */
export async function fetchSummary(opts: MetricoolRequestOptions): Promise<PeriodSummary> {
  const params = new URLSearchParams({
    blogId: blogId(),
    startDate: opts.startDate,
    endDate: opts.endDate,
    ...(opts.network ? { network: opts.network } : {}),
  })

  const res = await fetch(`${BASE_URL}/stats/summary?${params}`, {
    headers: headers(),
    next: { revalidate: 300 }, // cache 5 min
  })

  if (!res.ok) throw new Error(`Metricool summary error: ${res.status}`)

  const json = await res.json()

  // Normaliza a resposta da API para o formato interno
  return {
    impressions: json.data?.impressions ?? 0,
    reach: json.data?.reach ?? 0,
    engagementRate: json.data?.engagementRate ?? 0,
    newFollowers: json.data?.newFollowers ?? 0,
    totalFollowers: json.data?.totalFollowers ?? 0,
    followerGrowthPct: json.data?.followerGrowthPct ?? 0,
    impressionChangePct: json.data?.impressionChangePct ?? 0,
    engagementChangePct: json.data?.engagementChangePct ?? 0,
  }
}

/**
 * Retorna séries temporais de impressões, engajamento e seguidores.
 * Endpoint: GET /api/v2/stats/evolution
 */
export async function fetchEvolution(opts: MetricoolRequestOptions): Promise<{
  impressions: TimePoint[]
  engagement: TimePoint[]
  followers: TimePoint[]
}> {
  const params = new URLSearchParams({
    blogId: blogId(),
    startDate: opts.startDate,
    endDate: opts.endDate,
    metrics: "impressions,engagement,followers",
    ...(opts.network ? { network: opts.network } : {}),
  })

  const res = await fetch(`${BASE_URL}/stats/evolution?${params}`, {
    headers: headers(),
    next: { revalidate: 300 },
  })

  if (!res.ok) throw new Error(`Metricool evolution error: ${res.status}`)

  const json = await res.json()

  return {
    impressions: (json.data?.impressions ?? []).map((p: { date: string; value: number }) => ({
      date: p.date,
      value: p.value,
    })),
    engagement: (json.data?.engagement ?? []).map((p: { date: string; value: number }) => ({
      date: p.date,
      value: p.value,
    })),
    followers: (json.data?.followers ?? []).map((p: { date: string; value: number }) => ({
      date: p.date,
      value: p.value,
    })),
  }
}

/**
 * Retorna os posts com melhor desempenho.
 * Endpoint: GET /api/v2/posts
 */
export async function fetchTopPosts(
  opts: MetricoolRequestOptions,
  limit = 6
): Promise<PostMetrics[]> {
  const params = new URLSearchParams({
    blogId: blogId(),
    startDate: opts.startDate,
    endDate: opts.endDate,
    sort: "impressions",
    order: "desc",
    limit: String(limit),
    ...(opts.network ? { network: opts.network } : {}),
  })

  const res = await fetch(`${BASE_URL}/posts?${params}`, {
    headers: headers(),
    next: { revalidate: 300 },
  })

  if (!res.ok) throw new Error(`Metricool posts error: ${res.status}`)

  const json = await res.json()

  return (json.data ?? []).map((p: Record<string, unknown>) => ({
    id: String(p.id),
    network: (p.network as Network) ?? "instagram",
    type: String(p.type ?? "post"),
    caption: String(p.caption ?? ""),
    publishedAt: String(p.publishedAt ?? ""),
    impressions: Number(p.impressions ?? 0),
    reach: Number(p.reach ?? 0),
    likes: Number(p.likes ?? 0),
    comments: Number(p.comments ?? 0),
    shares: Number(p.shares ?? 0),
    saves: Number(p.saves ?? 0),
    engagementRate: Number(p.engagementRate ?? 0),
    url: p.url ? String(p.url) : undefined,
  }))
}

// ─── Mock data (fallback quando API não está configurada) ─────────────────────

function generateSeries(days: number, base: number, volatility: number): TimePoint[] {
  const series: TimePoint[] = []
  let value = base
  const end = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end)
    d.setDate(d.getDate() - i)
    value = Math.max(0, value + (Math.random() - 0.45) * volatility)
    series.push({
      date: d.toISOString().slice(0, 10),
      value: Math.round(value),
    })
  }
  return series
}

export function getMockData(startDate: string, endDate: string): AnalyticsPayload {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1)

  const impressionsSeries = generateSeries(days, 8000, 3000)
  const engagementSeries = generateSeries(days, 4.5, 1.2)
  const followerSeries = generateSeries(days, 12000, 150)

  const totalImpressions = impressionsSeries.reduce((s, p) => s + p.value, 0)
  const avgEngagement = engagementSeries.reduce((s, p) => s + p.value, 0) / days
  const lastFollowers = followerSeries[followerSeries.length - 1]?.value ?? 0
  const firstFollowers = followerSeries[0]?.value ?? lastFollowers
  const newFollowers = lastFollowers - firstFollowers

  return {
    source: "mock",
    summary: {
      impressions: totalImpressions,
      reach: Math.round(totalImpressions * 0.72),
      engagementRate: parseFloat(avgEngagement.toFixed(2)),
      newFollowers,
      totalFollowers: lastFollowers,
      followerGrowthPct: parseFloat(((newFollowers / firstFollowers) * 100).toFixed(1)),
      impressionChangePct: 18.3,
      engagementChangePct: -2.1,
    },
    impressionsSeries,
    engagementSeries,
    followerSeries,
    topPosts: [
      { id: "1", network: "instagram", type: "reel", caption: "Tutorial rápido: 3 dicas que mudaram minha rotina de trabalho 🚀", publishedAt: "2026-03-18T14:00:00Z", impressions: 42100, reach: 31000, likes: 1820, comments: 143, shares: 87, saves: 312, engagementRate: 11.4 },
      { id: "2", network: "instagram", type: "carrossel", caption: "Lançamento: conheça nossa nova linha de produtos — deslize para ver tudo →", publishedAt: "2026-03-14T10:00:00Z", impressions: 38700, reach: 28500, likes: 1560, comments: 98, shares: 54, saves: 280, engagementRate: 9.8 },
      { id: "3", network: "instagram", type: "post", caption: "Bastidores do processo criativo — nem tudo sai perfeito na primeira tentativa.", publishedAt: "2026-03-10T18:00:00Z", impressions: 21300, reach: 16400, likes: 940, comments: 62, shares: 28, saves: 115, engagementRate: 7.1 },
      { id: "4", network: "instagram", type: "story", caption: "Enquete semanal: qual recurso você mais usa?", publishedAt: "2026-03-07T09:00:00Z", impressions: 18900, reach: 14200, likes: 0, comments: 44, shares: 0, saves: 0, engagementRate: 5.2 },
      { id: "5", network: "instagram", type: "reel", caption: "POV: você descobre esse truque de produtividade só agora 😅", publishedAt: "2026-03-03T16:00:00Z", impressions: 17400, reach: 13100, likes: 1230, comments: 87, shares: 95, saves: 420, engagementRate: 14.2 },
      { id: "6", network: "instagram", type: "carrossel", caption: "Guia completo: do zero ao primeiro post que performa de verdade.", publishedAt: "2026-02-28T11:00:00Z", impressions: 15800, reach: 11900, likes: 870, comments: 55, shares: 67, saves: 340, engagementRate: 10.3 },
    ],
  }
}
