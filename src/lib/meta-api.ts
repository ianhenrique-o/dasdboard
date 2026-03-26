/**
 * Cliente para Instagram Graph API (Meta)
 *
 * Documentação: https://developers.facebook.com/docs/instagram-api
 *
 * Requer: access_token com permissões:
 *   - instagram_basic
 *   - instagram_manage_insights
 *   - pages_show_list
 */

const GRAPH = "https://graph.facebook.com/v19.0"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface IgAccountInfo {
  id: string
  username: string
  name: string
  biography: string
  followersCount: number
  followingCount: number
  mediaCount: number
  profilePictureUrl: string
  website: string
}

export interface IgMedia {
  id: string
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM"
  mediaUrl: string
  thumbnail?: string
  caption: string
  timestamp: string
  permalink: string
  likeCount: number
  commentsCount: number
}

export interface IgInsightPoint {
  date: string   // YYYY-MM-DD
  value: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function graphGet<T>(path: string, token: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${GRAPH}/${path}`)
  url.searchParams.set("access_token", token)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)

  const res = await fetch(url.toString(), { next: { revalidate: 300 } })
  const data = await res.json()

  if (data.error) throw new Error(`Meta API: ${data.error.message} (code ${data.error.code})`)
  return data as T
}

// ─── Account info ─────────────────────────────────────────────────────────────

export async function fetchIgAccount(igUserId: string, token: string): Promise<IgAccountInfo> {
  const fields = "id,username,name,biography,followers_count,following_count,media_count,profile_picture_url,website"
  const data = await graphGet<Record<string, unknown>>(igUserId, token, { fields })

  return {
    id:                 String(data.id ?? ""),
    username:           String(data.username ?? ""),
    name:               String(data.name ?? ""),
    biography:          String(data.biography ?? ""),
    followersCount:     Number(data.followers_count ?? 0),
    followingCount:     Number(data.following_count ?? 0),
    mediaCount:         Number(data.media_count ?? 0),
    profilePictureUrl:  String(data.profile_picture_url ?? ""),
    website:            String(data.website ?? ""),
  }
}

// ─── Media ────────────────────────────────────────────────────────────────────

export async function fetchIgMedia(igUserId: string, token: string, limit = 12): Promise<IgMedia[]> {
  const fields = "id,media_type,media_url,thumbnail_url,caption,timestamp,permalink,like_count,comments_count"
  const data = await graphGet<{ data: Record<string, unknown>[] }>(
    `${igUserId}/media`,
    token,
    { fields, limit: String(limit) }
  )

  return (data.data ?? []).map((m) => ({
    id:            String(m.id ?? ""),
    mediaType:     (m.media_type as IgMedia["mediaType"]) ?? "IMAGE",
    mediaUrl:      String(m.media_url ?? m.thumbnail_url ?? ""),
    thumbnail:     m.thumbnail_url ? String(m.thumbnail_url) : undefined,
    caption:       String(m.caption ?? ""),
    timestamp:     String(m.timestamp ?? ""),
    permalink:     String(m.permalink ?? ""),
    likeCount:     Number(m.like_count ?? 0),
    commentsCount: Number(m.comments_count ?? 0),
  }))
}

// ─── Insights ─────────────────────────────────────────────────────────────────

export async function fetchIgInsights(
  igUserId: string,
  token: string,
  metric: "impressions" | "reach" | "profile_views" | "follower_count",
  since: string,
  until: string
): Promise<IgInsightPoint[]> {
  const data = await graphGet<{ data: { values: { value: number; end_time: string }[] }[] }>(
    `${igUserId}/insights`,
    token,
    { metric, period: "day", since, until }
  )

  const values = data.data?.[0]?.values ?? []
  return values.map((v) => ({
    date:  v.end_time.slice(0, 10),
    value: v.value,
  }))
}
