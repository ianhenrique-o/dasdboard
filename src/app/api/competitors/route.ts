import { NextRequest, NextResponse } from "next/server"
import {
  buildMockCompetitor,
  fetchYouTubeChannel,
  isYouTubeConfigured,
  type Platform,
} from "@/lib/api/competitors"

/**
 * POST /api/competitors
 * Body: { handle: string; platform: Platform; name?: string }
 *
 * Returns an enriched Competitor object.
 * Uses real YouTube API if YOUTUBE_API_KEY is set; otherwise returns mock.
 */
export async function POST(request: NextRequest) {
  const body = await request.json() as {
    handle: string
    platform: Platform
    name?: string
  }

  const { handle, platform, name } = body

  if (!handle || !platform) {
    return NextResponse.json({ error: "handle and platform are required" }, { status: 400 })
  }

  try {
    // YouTube: use real API if configured
    if (platform === "youtube" && isYouTubeConfigured()) {
      const competitor = await fetchYouTubeChannel(handle)
      return NextResponse.json(competitor)
    }

    // All other platforms (or YouTube without API key): return mock data
    const displayName = name?.trim() || handle.replace(/^@/, "")
    const followerBase = Math.floor(10_000 + Math.random() * 200_000)
    const growthPct = parseFloat((Math.random() * 10 - 1).toFixed(1))

    const competitor = buildMockCompetitor(
      handle.startsWith("@") ? handle : `@${handle}`,
      displayName,
      platform,
      followerBase,
      growthPct,
    )

    return NextResponse.json(competitor)
  } catch (error) {
    console.error("[competitors/route] error:", error)
    return NextResponse.json({ error: "Falha ao buscar dados do perfil" }, { status: 500 })
  }
}
