import { NextRequest, NextResponse } from "next/server"
import {
  isMetricoolConfigured,
  fetchSummary,
  fetchEvolution,
  fetchTopPosts,
  getMockData,
  type AnalyticsPayload,
} from "@/lib/api/metricool"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const startDate = searchParams.get("startDate") ?? formatDate(daysAgo(30))
  const endDate = searchParams.get("endDate") ?? formatDate(new Date())

  // Quando a API não está configurada, retorna dados mock
  if (!isMetricoolConfigured()) {
    return NextResponse.json(getMockData(startDate, endDate))
  }

  try {
    const opts = { startDate, endDate }

    const [summary, evolution, topPosts] = await Promise.all([
      fetchSummary(opts),
      fetchEvolution(opts),
      fetchTopPosts(opts, 6),
    ])

    const payload: AnalyticsPayload = {
      source: "metricool",
      summary,
      impressionsSeries: evolution.impressions,
      engagementSeries: evolution.engagement,
      followerSeries: evolution.followers,
      topPosts,
    }

    return NextResponse.json(payload)
  } catch (error) {
    console.error("[analytics/route] Metricool API error:", error)

    // Fallback para mock em caso de erro para não quebrar a UI
    return NextResponse.json(
      { ...getMockData(startDate, endDate), source: "mock" as const },
      { status: 200 }
    )
  }
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}
