"use client"

import { useState, useEffect, useCallback } from "react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  Users,
  Heart,
  Zap,
  RefreshCw,
  CalendarDays,
  ExternalLink,
  AlertCircle,
  Clapperboard,
  Camera,
  Images,
  Clock,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { AnalyticsPayload, PostMetrics } from "@/lib/api/metricool"

// ─── Types ────────────────────────────────────────────────────────────────────

interface DateRange { startDate: string; endDate: string }

const PRESETS = [
  { label: "7 dias",  days: 7  },
  { label: "14 dias", days: 14 },
  { label: "30 dias", days: 30 },
  { label: "90 dias", days: 90 },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDate(d: Date): string { return d.toISOString().slice(0, 10) }
function daysAgo(n: number): string {
  const d = new Date(); d.setDate(d.getDate() - n); return toDate(d)
}
function today(): string { return toDate(new Date()) }

function fmtNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

function fmtDate(iso: string): string {
  const [, m, d] = iso.split("-")
  const months = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"]
  return `${parseInt(d)} ${months[parseInt(m) - 1]}`
}

function fmtDateFull(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
}

const postTypeIcons: Record<string, React.ReactNode> = {
  reel:      <Clapperboard className="w-3 h-3" />,
  carrossel: <Images className="w-3 h-3" />,
  story:     <Clock className="w-3 h-3" />,
  post:      <Camera className="w-3 h-3" />,
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

interface ChartTooltipProps {
  active?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[]
  label?: string
  unit?: string
  formatter?: (v: number) => string
}

function ChartTooltip({ active, payload, label, unit = "", formatter }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  const value = payload[0]?.value as number | undefined
  if (value === undefined) return null
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl text-xs">
      <p className="text-muted-foreground mb-1">{label ? fmtDate(label) : ""}</p>
      <p className="text-foreground font-semibold">
        {formatter ? formatter(value) : fmtNumber(value)}{unit}
      </p>
    </div>
  )
}

// ─── Chart wrapper ────────────────────────────────────────────────────────────

function ChartCard({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        {description && <CardDescription className="text-xs">{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-secondary", className)} />
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  changePct,
  icon,
  iconBg,
  iconColor,
  loading,
}: {
  label: string
  value: string
  changePct: number
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  loading: boolean
}) {
  const up = changePct >= 0
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", iconBg)}>
            <span className={iconColor}>{icon}</span>
          </div>
        </div>
        {loading ? (
          <Skeleton className="h-8 w-24 mt-2" />
        ) : (
          <p className="text-3xl font-bold mt-2 tabular-nums">{value}</p>
        )}
        {loading ? (
          <Skeleton className="h-4 w-28 mt-2" />
        ) : (
          <div className={cn("flex items-center gap-1 text-xs mt-2", up ? "text-emerald-400" : "text-red-400")}>
            {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {up ? "+" : ""}{changePct.toFixed(1)}% vs período anterior
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Top Post Row ─────────────────────────────────────────────────────────────

function TopPostRow({ post, rank }: { post: PostMetrics; rank: number }) {
  return (
    <div className="flex items-center gap-4 py-3.5 border-b border-border/50 last:border-0">
      {/* Rank */}
      <span className="text-xs font-mono text-muted-foreground/60 w-4 shrink-0">{rank}</span>

      {/* Type icon */}
      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 text-muted-foreground">
        {postTypeIcons[post.type] ?? postTypeIcons.post}
      </div>

      {/* Caption */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground line-clamp-1">{post.caption}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{fmtDateFull(post.publishedAt)}</p>
      </div>

      {/* Metrics */}
      <div className="hidden lg:flex items-center gap-5 shrink-0 text-xs text-muted-foreground">
        <span className="flex items-center gap-1 w-16 justify-end">
          <Eye className="w-3.5 h-3.5" /> {fmtNumber(post.impressions)}
        </span>
        <span className="flex items-center gap-1 w-14 justify-end">
          <Heart className="w-3.5 h-3.5 text-pink-400" /> {fmtNumber(post.likes)}
        </span>
        <Badge
          variant={post.engagementRate >= 10 ? "success" : post.engagementRate >= 5 ? "warning" : "secondary"}
          className="text-[10px] w-16 justify-center"
        >
          {post.engagementRate.toFixed(1)}% eng.
        </Badge>
      </div>

      {post.url && (
        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [range, setRange] = useState<DateRange>({ startDate: daysAgo(30), endDate: today() })
  const [activePreset, setActivePreset] = useState<number>(30)
  const [data, setData] = useState<AnalyticsPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (r: DateRange) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/analytics?startDate=${r.startDate}&endDate=${r.endDate}`
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json: AnalyticsPayload = await res.json()
      setData(json)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar dados")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(range) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function applyPreset(days: number) {
    const r = { startDate: daysAgo(days), endDate: today() }
    setActivePreset(days)
    setRange(r)
    load(r)
  }

  function applyCustomRange() {
    setActivePreset(0)
    load(range)
  }

  const s = data?.summary

  // Tick formatter for axis
  const axisTick = { fill: "oklch(0.6 0.01 260)", fontSize: 11 }
  const gridStroke = "oklch(1 0 0 / 6%)"

  return (
    <div className="p-8 space-y-8">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/15">
            <BarChart3 className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
            <p className="text-sm text-muted-foreground">
              Performance de conteúdo
              {data?.source === "mock" && (
                <span className="ml-2 text-amber-400/80">· dados de demonstração</span>
              )}
            </p>
          </div>
        </div>

        {/* Date controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Presets */}
          <div className="flex items-center gap-1 bg-secondary rounded-xl p-1">
            {PRESETS.map((p) => (
              <button
                key={p.days}
                onClick={() => applyPreset(p.days)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                  activePreset === p.days
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom range */}
          <div className="flex items-center gap-1.5 bg-secondary rounded-xl px-3 py-1.5">
            <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="date"
              value={range.startDate}
              max={range.endDate}
              onChange={(e) => setRange((r) => ({ ...r, startDate: e.target.value }))}
              className="bg-transparent text-xs text-foreground outline-none w-28 [color-scheme:dark]"
            />
            <span className="text-muted-foreground text-xs">→</span>
            <input
              type="date"
              value={range.endDate}
              min={range.startDate}
              max={today()}
              onChange={(e) => setRange((r) => ({ ...r, endDate: e.target.value }))}
              className="bg-transparent text-xs text-foreground outline-none w-28 [color-scheme:dark]"
            />
            <button
              onClick={applyCustomRange}
              className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <Button variant="ghost" size="sm" className="ml-auto" onClick={() => load(range)}>
            Tentar novamente
          </Button>
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="Impressões totais"
          value={s ? fmtNumber(s.impressions) : "—"}
          changePct={s?.impressionChangePct ?? 0}
          icon={<Eye className="w-4 h-4" />}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-400"
          loading={loading}
        />
        <KpiCard
          label="Engajamento médio"
          value={s ? `${s.engagementRate.toFixed(1)}%` : "—"}
          changePct={s?.engagementChangePct ?? 0}
          icon={<Zap className="w-4 h-4" />}
          iconBg="bg-pink-500/10"
          iconColor="text-pink-400"
          loading={loading}
        />
        <KpiCard
          label="Novos seguidores"
          value={s ? (s.newFollowers >= 0 ? `+${fmtNumber(s.newFollowers)}` : fmtNumber(s.newFollowers)) : "—"}
          changePct={s?.followerGrowthPct ?? 0}
          icon={<Users className="w-4 h-4" />}
          iconBg="bg-violet-500/10"
          iconColor="text-violet-400"
          loading={loading}
        />
        <KpiCard
          label="Alcance total"
          value={s ? fmtNumber(s.reach) : "—"}
          changePct={s ? (s.impressionChangePct * 0.72) : 0}
          icon={<TrendingUp className="w-4 h-4" />}
          iconBg="bg-emerald-500/10"
          iconColor="text-emerald-400"
          loading={loading}
        />
      </div>

      {/* ── Charts row 1: Impressões + Engajamento ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Impressões — Line Chart */}
        <ChartCard
          title="Impressões por dia"
          description={`${fmtDate(range.startDate)} – ${fmtDate(range.endDate)}`}
        >
          {loading ? (
            <Skeleton className="h-52 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <LineChart
                data={data?.impressionsSeries ?? []}
                margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
              >
                <defs>
                  <linearGradient id="impressGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.65 0.2 220)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.65 0.2 220)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={fmtDate}
                  tick={axisTick}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickFormatter={fmtNumber}
                  tick={axisTick}
                  tickLine={false}
                  axisLine={false}
                  width={48}
                />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="oklch(0.65 0.2 220)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "oklch(0.65 0.2 220)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Engajamento — Bar Chart */}
        <ChartCard
          title="Taxa de engajamento (%)"
          description="Média diária no período"
        >
          {loading ? (
            <Skeleton className="h-52 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart
                data={data?.engagementSeries ?? []}
                margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
                barCategoryGap="30%"
              >
                <defs>
                  <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.72 0.22 350)" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="oklch(0.72 0.22 350)" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={fmtDate}
                  tick={axisTick}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickFormatter={(v: number) => `${v}%`}
                  tick={axisTick}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <Tooltip
                  content={
                    <ChartTooltip
                      unit="%"
                      formatter={(v: number) => v.toFixed(2)}
                    />
                  }
                />
                <Bar
                  dataKey="value"
                  fill="url(#engGrad)"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* ── Crescimento de seguidores — Area Chart ── */}
      <ChartCard
        title="Crescimento de seguidores"
        description="Evolução da base ao longo do período"
      >
        {loading ? (
          <Skeleton className="h-52 w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart
              data={data?.followerSeries ?? []}
              margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id="follGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.65 0.2 270)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="oklch(0.65 0.2 270)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={fmtDate}
                tick={axisTick}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tickFormatter={fmtNumber}
                tick={axisTick}
                tickLine={false}
                axisLine={false}
                width={52}
                domain={["auto", "auto"]}
              />
              <Tooltip content={<ChartTooltip formatter={(v: number) => fmtNumber(v)} />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="oklch(0.65 0.2 270)"
                strokeWidth={2}
                fill="url(#follGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "oklch(0.65 0.2 270)" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* ── Top Posts ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Posts com Melhor Desempenho</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Ordenados por impressões no período selecionado
              </CardDescription>
            </div>
            <div className="hidden lg:flex items-center gap-5 text-[10px] text-muted-foreground/60 uppercase tracking-wider pr-2">
              <span className="w-16 text-right">Impressões</span>
              <span className="w-14 text-right">Curtidas</span>
              <span className="w-16 text-center">Engajamento</span>
              <span className="w-3.5" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 py-3">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                  <Skeleton className="h-5 w-20" />
                </div>
              ))}
            </div>
          ) : (
            (data?.topPosts ?? []).map((post, i) => (
              <TopPostRow key={post.id} post={post} rank={i + 1} />
            ))
          )}
        </CardContent>
      </Card>

    </div>
  )
}
