"use client"

import { useState, useMemo, useCallback } from "react"
import {
  LineChart, Line, Tooltip,
} from "recharts"
import {
  Users, Plus, Trash2, ExternalLink, TrendingUp, TrendingDown,
  ChevronUp, ChevronDown, ChevronsUpDown, ChevronRight,
  Camera, PlayCircle, Music2, Globe, Briefcase, Hash,
  Heart, MessageCircle, Share2, Clock, AlertCircle,
  Loader2, CheckCircle2, BarChart3, Zap, Activity,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  SEED_COMPETITORS,
  type Competitor, type Platform, type RecentPost,
} from "@/lib/api/competitors"

// ─── Platform config ──────────────────────────────────────────────────────────

const PLATFORMS: Record<Platform, {
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string   // text color
  bg: string      // bg pill
  border: string  // border
}> = {
  instagram: { label: "Instagram", icon: Camera,     color: "text-pink-400",   bg: "bg-pink-500/15",   border: "border-pink-500/30" },
  youtube:   { label: "YouTube",   icon: PlayCircle, color: "text-red-400",    bg: "bg-red-500/15",    border: "border-red-500/30" },
  tiktok:    { label: "TikTok",    icon: Music2,     color: "text-cyan-400",   bg: "bg-cyan-500/15",   border: "border-cyan-500/30" },
  facebook:  { label: "Facebook",  icon: Globe,      color: "text-blue-400",   bg: "bg-blue-600/15",   border: "border-blue-600/30" },
  linkedin:  { label: "LinkedIn",  icon: Briefcase,  color: "text-sky-400",    bg: "bg-sky-500/15",    border: "border-sky-500/30" },
  twitter:   { label: "Twitter/X", icon: Hash,       color: "text-slate-400",  bg: "bg-slate-500/15",  border: "border-slate-500/30" },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtN(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diffMs / 3_600_000)
  if (h < 1)  return "há menos de 1h"
  if (h < 24) return `há ${h}h`
  const d = Math.floor(h / 24)
  if (d < 7)  return `há ${d}d`
  const w = Math.floor(d / 7)
  return `há ${w} sem.`
}

function initials(name: string): string {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()
}

const AVATAR_COLORS = [
  "bg-pink-500/30 text-pink-200",
  "bg-violet-500/30 text-violet-200",
  "bg-blue-500/30 text-blue-200",
  "bg-emerald-500/30 text-emerald-200",
  "bg-amber-500/30 text-amber-200",
  "bg-cyan-500/30 text-cyan-200",
  "bg-orange-500/30 text-orange-200",
]

function avatarColor(id: string) {
  let hash = 0
  for (const c of id) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

// ─── Types ────────────────────────────────────────────────────────────────────

type SortKey = "name" | "followers" | "followerGrowthPct" | "engagementRate" | "postsLast30d" | "lastPostAt"
type SortDir = "asc" | "desc"

const PLATFORM_ALL = "all" as const
type PlatformFilter = Platform | typeof PLATFORM_ALL

// ─── Sparkline ────────────────────────────────────────────────────────────────

// Fixed dimensions (no ResponsiveContainer) — table cells break ResizeObserver
function Sparkline({ data, positive }: { data: { week: number; value: number }[]; positive: boolean }) {
  const color = positive ? "#34d399" : "#f87171"
  return (
    <LineChart
      width={80}
      height={32}
      data={data}
      margin={{ top: 3, right: 2, bottom: 3, left: 2 }}
    >
      <Tooltip
        content={({ active, payload }) => {
          if (!active || !payload?.length) return null
          return (
            <div className="bg-card border border-border rounded px-2 py-1 text-[10px] text-foreground shadow-lg">
              {fmtN(payload[0]?.value as number)}
            </div>
          )
        }}
      />
      <Line
        type="monotone"
        dataKey="value"
        stroke={color}
        strokeWidth={1.5}
        dot={false}
        isAnimationActive={false}
      />
    </LineChart>
  )
}

// ─── Sort Header ──────────────────────────────────────────────────────────────

function SortTh({
  label, colKey, sortKey, sortDir, onSort, className,
}: {
  label: string
  colKey: SortKey
  sortKey: SortKey
  sortDir: SortDir
  onSort: (k: SortKey) => void
  className?: string
}) {
  const active = sortKey === colKey
  return (
    <th
      className={cn("py-3 px-3 text-[11px] font-semibold uppercase tracking-wider cursor-pointer select-none group", className)}
      onClick={() => onSort(colKey)}
    >
      <div className={cn("flex items-center gap-1", className?.includes("text-right") ? "justify-end" : "justify-start")}>
        <span className={active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground transition-colors"}>
          {label}
        </span>
        <span className="text-muted-foreground/50 group-hover:text-muted-foreground transition-colors">
          {active
            ? sortDir === "asc"
              ? <ChevronUp className="w-3 h-3" />
              : <ChevronDown className="w-3 h-3" />
            : <ChevronsUpDown className="w-3 h-3" />
          }
        </span>
      </div>
    </th>
  )
}

// ─── Recent Post Row ──────────────────────────────────────────────────────────

function PostRow({ post }: { post: RecentPost }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border/30 last:border-0">
      <div className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center shrink-0">
        <span className="text-[9px] font-semibold uppercase text-muted-foreground">{post.type.slice(0,3)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-foreground line-clamp-2 leading-relaxed">{post.caption}</p>
        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-0.5"><Heart className="w-2.5 h-2.5 text-pink-400" />{fmtN(post.likes)}</span>
          <span className="flex items-center gap-0.5"><MessageCircle className="w-2.5 h-2.5" />{fmtN(post.comments)}</span>
          <span className="flex items-center gap-0.5"><Share2 className="w-2.5 h-2.5" />{fmtN(post.shares)}</span>
          <span className="flex items-center gap-0.5 ml-auto"><Clock className="w-2.5 h-2.5" />{timeAgo(post.publishedAt)}</span>
        </div>
      </div>
      {post.url && (
        <a href={post.url} target="_blank" rel="noopener noreferrer"
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors mt-0.5">
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  )
}

// ─── Competitor Table Row ─────────────────────────────────────────────────────

function CompetitorRow({
  competitor,
  expanded,
  onToggle,
  onDelete,
}: {
  competitor: Competitor
  expanded: boolean
  onToggle: () => void
  onDelete: () => void
}) {
  const pc = PLATFORMS[competitor.platform]
  const PlatformIcon = pc.icon
  const growthUp = competitor.followerGrowthPct >= 0
  const engUp = competitor.engagementDelta >= 0
  const lastPostDays = Math.floor((Date.now() - new Date(competitor.lastPostAt).getTime()) / 86_400_000)
  const isStale = lastPostDays > 7

  return (
    <>
      <tr
        className={cn(
          "border-b border-border/40 cursor-pointer group transition-colors",
          expanded ? "bg-secondary/40" : "hover:bg-secondary/20"
        )}
        onClick={onToggle}
      >
        {/* Profile */}
        <td className="py-3.5 pl-4 pr-3">
          <div className="flex items-center gap-3">
            {/* Expand chevron */}
            <ChevronRight className={cn(
              "w-3.5 h-3.5 text-muted-foreground/50 shrink-0 transition-transform duration-200",
              expanded && "rotate-90"
            )} />

            {/* Avatar */}
            <div className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0",
              avatarColor(competitor.id)
            )}>
              {initials(competitor.name)}
            </div>

            {/* Name + handle */}
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{competitor.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={cn(
                  "flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md border",
                  pc.bg, pc.color, pc.border
                )}>
                  <PlatformIcon className="w-2.5 h-2.5" />
                  {competitor.handle}
                </span>
                {competitor.source === "mock" && (
                  <span className="text-[9px] text-muted-foreground/50">demo</span>
                )}
              </div>
            </div>
          </div>
        </td>

        {/* Followers */}
        <td className="py-3.5 px-3 text-right">
          <p className="text-sm font-semibold tabular-nums">{fmtN(competitor.followers)}</p>
        </td>

        {/* Growth */}
        <td className="py-3.5 px-3 text-right">
          <div className={cn(
            "inline-flex items-center gap-1 text-xs font-medium",
            growthUp ? "text-emerald-400" : "text-red-400"
          )}>
            {growthUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {growthUp ? "+" : ""}{competitor.followerGrowthPct.toFixed(1)}%
          </div>
        </td>

        {/* Engagement */}
        <td className="py-3.5 px-3 text-right">
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-sm font-semibold tabular-nums">{competitor.engagementRate.toFixed(1)}%</span>
            <span className={cn("text-[10px]", engUp ? "text-emerald-400" : "text-red-400")}>
              {engUp ? "+" : ""}{competitor.engagementDelta.toFixed(1)}%
            </span>
          </div>
        </td>

        {/* Posts/month */}
        <td className="py-3.5 px-3 text-right">
          <span className="text-sm tabular-nums">{competitor.postsLast30d}</span>
          <span className="text-[10px] text-muted-foreground ml-1">/mês</span>
        </td>

        {/* Last post */}
        <td className="py-3.5 px-3 text-right">
          <span className={cn("text-xs", isStale ? "text-amber-400" : "text-muted-foreground")}>
            {timeAgo(competitor.lastPostAt)}
          </span>
        </td>

        {/* Sparkline */}
        <td className="py-3.5 px-3">
          <Sparkline data={competitor.followerSeries} positive={growthUp} />
        </td>

        {/* Actions */}
        <td className="py-3.5 pl-3 pr-4 text-right">
          <div className="flex items-center justify-end gap-1">
            {competitor.url && (
              <a
                href={competitor.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              onClick={e => { e.stopPropagation(); onDelete() }}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded: recent posts */}
      {expanded && (
        <tr className="bg-secondary/20">
          <td colSpan={8} className="px-4 pb-4 pt-2">
            <div className="ml-[88px]">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Posts recentes
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6">
                {competitor.recentPosts.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">Nenhum post disponível</p>
                ) : (
                  competitor.recentPosts.map(post => (
                    <PostRow key={post.id} post={post} />
                  ))
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

// ─── Add competitor form ──────────────────────────────────────────────────────

function AddCompetitorDialog({
  open,
  onClose,
  onAdd,
}: {
  open: boolean
  onClose: () => void
  onAdd: (c: Competitor) => void
}) {
  const [handle, setHandle] = useState("")
  const [name, setName] = useState("")
  const [platform, setPlatform] = useState<Platform>("instagram")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function reset() {
    setHandle(""); setName(""); setPlatform("instagram"); setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!handle.trim()) return
    setLoading(true); setError(null)
    try {
      const res = await fetch("/api/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: handle.trim(), platform, name: name.trim() }),
      })
      if (!res.ok) {
        const j = await res.json() as { error?: string }
        throw new Error(j.error ?? `HTTP ${res.status}`)
      }
      const competitor = await res.json() as Competitor
      onAdd(competitor)
      reset()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); onClose() } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar concorrente</DialogTitle>
          <DialogDescription>
            Insira o handle ou nome do perfil. Para YouTube com YOUTUBE_API_KEY configurada,
            dados reais serão buscados. Demais plataformas usam dados de demonstração.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Platform */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Plataforma
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(PLATFORMS) as [Platform, typeof PLATFORMS[Platform]][]).map(([key, cfg]) => {
                const Icon = cfg.icon
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPlatform(key)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all",
                      platform === key
                        ? cn(cfg.bg, cfg.color, cfg.border)
                        : "bg-secondary border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    {cfg.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Handle */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Handle / @usuário
            </label>
            <input
              type="text"
              value={handle}
              onChange={e => setHandle(e.target.value)}
              placeholder={platform === "youtube" ? "@canal ou UCxxx..." : "@perfil"}
              required
              className={cn(
                "w-full rounded-lg border border-input bg-secondary px-3 py-2 text-sm",
                "text-foreground placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-1 focus:ring-ring"
              )}
            />
          </div>

          {/* Name (optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Nome de exibição <span className="text-muted-foreground/50 normal-case">(opcional)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nome da marca ou canal"
              className={cn(
                "w-full rounded-lg border border-input bg-secondary px-3 py-2 text-sm",
                "text-foreground placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-1 focus:ring-ring"
              )}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <DialogClose asChild>
              <Button type="button" variant="ghost" onClick={reset}>Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={loading || !handle.trim()} className="gap-2 min-w-[120px]">
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              {loading ? "Buscando..." : "Adicionar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ConcorrentesPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>(SEED_COMPETITORS)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>("followers")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("all")
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  // ── Sort handler ──
  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortKey(key); setSortDir("desc") }
  }

  // ── Filtered + sorted data ──
  const displayed = useMemo(() => {
    let list = platformFilter === "all"
      ? competitors
      : competitors.filter(c => c.platform === platformFilter)

    return [...list].sort((a, b) => {
      const va = a[sortKey]
      const vb = b[sortKey]
      if (typeof va === "string" && typeof vb === "string") {
        const cmp = va.localeCompare(vb)
        return sortDir === "asc" ? cmp : -cmp
      }
      const na = va as number
      const nb = vb as number
      return sortDir === "asc" ? na - nb : nb - na
    })
  }, [competitors, sortKey, sortDir, platformFilter])

  // ── Summary KPIs ──
  const summary = useMemo(() => {
    if (!displayed.length) return null
    const avgEng = displayed.reduce((s, c) => s + c.engagementRate, 0) / displayed.length
    const totalFollowers = displayed.reduce((s, c) => s + c.followers, 0)
    const avgPosts = displayed.reduce((s, c) => s + c.postsLast30d, 0) / displayed.length
    const topEng = displayed.reduce((best, c) => c.engagementRate > best.engagementRate ? c : best)
    const topGrowth = displayed.reduce((best, c) => c.followerGrowthPct > best.followerGrowthPct ? c : best)
    return { avgEng, totalFollowers, avgPosts, topEng, topGrowth }
  }, [displayed])

  // ── Auto insights ──
  const insights = useMemo(() => {
    if (!summary || displayed.length < 2) return []
    const list: Array<{ text: string; type: "success" | "warning" | "info" }> = []

    if (summary.topEng.engagementRate > 8) {
      list.push({ type: "info", text: `${summary.topEng.name} lidera em engajamento com ${summary.topEng.engagementRate.toFixed(1)}% — analise o tipo de conteúdo que estão publicando.` })
    }
    if (summary.topGrowth.followerGrowthPct > 5) {
      list.push({ type: "warning", text: `${summary.topGrowth.name} está crescendo ${summary.topGrowth.followerGrowthPct.toFixed(1)}% ao mês — o maior crescimento entre os monitorados.` })
    }
    const stale = displayed.filter(c =>
      (Date.now() - new Date(c.lastPostAt).getTime()) > 7 * 86_400_000
    )
    if (stale.length > 0) {
      list.push({ type: "success", text: `${stale.map(c => c.name).join(", ")} não publicou nos últimos 7 dias — oportunidade para aumentar sua presença.` })
    }
    if (summary.avgEng > 0) {
      list.push({ type: "info", text: `Média de engajamento dos concorrentes: ${summary.avgEng.toFixed(1)}%. Use isso como benchmark para seus próprios conteúdos.` })
    }
    return list.slice(0, 3)
  }, [summary, displayed])

  // ── Handlers ──
  const handleAdd = useCallback((c: Competitor) => {
    setCompetitors(prev => {
      if (prev.some(p => p.id === c.id)) return prev
      return [c, ...prev]
    })
  }, [])

  function confirmDelete(id: string) {
    setCompetitors(prev => prev.filter(c => c.id !== id))
    if (expandedId === id) setExpandedId(null)
    setDeleteTarget(null)
  }

  // ── Platform counts for filter tabs ──
  const platformCounts = useMemo(() => {
    const counts: Partial<Record<Platform | "all", number>> = { all: competitors.length }
    for (const c of competitors) counts[c.platform] = (counts[c.platform] ?? 0) + 1
    return counts
  }, [competitors])

  const sortProps = { sortKey, sortDir, onSort: handleSort }

  return (
    <div className="p-8 space-y-6 overflow-y-auto flex-1">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-500/15">
            <Users className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Rastreador de Concorrentes</h1>
            <p className="text-sm text-muted-foreground">
              {competitors.length} perfis monitorados em {new Set(competitors.map(c => c.platform)).size} plataformas
            </p>
          </div>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Adicionar Perfil
        </Button>
      </div>

      {/* ── Summary KPIs ── */}
      {summary && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            {
              label: "Seguidores totais",
              value: fmtN(summary.totalFollowers),
              sub: "entre todos os perfis",
              icon: <Users className="w-4 h-4" />,
              bg: "bg-orange-500/10", color: "text-orange-400",
            },
            {
              label: "Engajamento médio",
              value: `${summary.avgEng.toFixed(1)}%`,
              sub: "média do grupo",
              icon: <Zap className="w-4 h-4" />,
              bg: "bg-pink-500/10", color: "text-pink-400",
            },
            {
              label: "Maior engajamento",
              value: `${summary.topEng.engagementRate.toFixed(1)}%`,
              sub: summary.topEng.name,
              icon: <Activity className="w-4 h-4" />,
              bg: "bg-emerald-500/10", color: "text-emerald-400",
            },
            {
              label: "Maior crescimento",
              value: `+${summary.topGrowth.followerGrowthPct.toFixed(1)}%`,
              sub: summary.topGrowth.name,
              icon: <BarChart3 className="w-4 h-4" />,
              bg: "bg-violet-500/10", color: "text-violet-400",
            },
          ].map(k => (
            <Card key={k.label}>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-start justify-between">
                  <p className="text-sm text-muted-foreground">{k.label}</p>
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", k.bg)}>
                    <span className={k.color}>{k.icon}</span>
                  </div>
                </div>
                <p className="text-3xl font-bold mt-2 tabular-nums">{k.value}</p>
                <p className="text-xs text-muted-foreground mt-1 truncate">{k.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Insights ── */}
      {insights.length > 0 && (
        <div className="space-y-2">
          {insights.map((ins, i) => (
            <div key={i} className={cn(
              "flex items-start gap-3 px-4 py-3 rounded-xl text-sm border",
              ins.type === "success" && "bg-emerald-500/8 border-emerald-500/20 text-emerald-300",
              ins.type === "warning" && "bg-amber-500/8 border-amber-500/20 text-amber-300",
              ins.type === "info"    && "bg-blue-500/8 border-blue-500/20 text-blue-300",
            )}>
              <span className="shrink-0 mt-0.5">
                {ins.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : ins.type === "warning" ? <AlertCircle className="w-4 h-4" /> : <BarChart3 className="w-4 h-4" />}
              </span>
              {ins.text}
            </div>
          ))}
        </div>
      )}

      {/* ── Platform tabs ── */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {([["all", "Todos"] as const, ...Object.entries(PLATFORMS).map(([k, v]) => [k, v.label] as [Platform, string])]).map(([key, label]) => {
          const count = platformCounts[key as Platform | "all"] ?? 0
          if (key !== "all" && count === 0) return null
          const cfg = key === "all" ? null : PLATFORMS[key as Platform]
          const isActive = platformFilter === key
          return (
            <button
              key={key}
              onClick={() => setPlatformFilter(key as PlatformFilter)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all",
                isActive
                  ? cfg ? cn(cfg.bg, cfg.color, cfg.border) : "bg-primary/20 text-primary border-primary/40"
                  : "bg-secondary border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {cfg && <cfg.icon className="w-3 h-3" />}
              {label}
              <span className={cn("text-[10px] px-1 py-0.5 rounded-md", isActive ? "bg-black/20" : "bg-secondary")}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── Table ── */}
      <Card>
        <CardHeader className="pb-3 pt-4">
          <CardTitle className="text-sm font-semibold">
            {displayed.length} {displayed.length === 1 ? "perfil" : "perfis"} — clique para expandir os posts recentes
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-y border-border/50 bg-secondary/30">
                <SortTh label="Perfil"       colKey="name"              {...sortProps} className="pl-4 pr-3" />
                <SortTh label="Seguidores"   colKey="followers"         {...sortProps} className="px-3 text-right" />
                <SortTh label="Crescimento"  colKey="followerGrowthPct" {...sortProps} className="px-3 text-right" />
                <SortTh label="Engajamento"  colKey="engagementRate"    {...sortProps} className="px-3 text-right" />
                <SortTh label="Posts/mês"    colKey="postsLast30d"      {...sortProps} className="px-3 text-right" />
                <SortTh label="Último post"  colKey="lastPostAt"        {...sortProps} className="px-3 text-right" />
                <th className="py-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Tendência
                </th>
                <th className="py-3 pl-3 pr-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {displayed.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <Users className="w-8 h-8 opacity-30" />
                      <p className="text-sm">Nenhum concorrente nesta plataforma</p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayed.map(c => (
                  <CompetitorRow
                    key={c.id}
                    competitor={c}
                    expanded={expandedId === c.id}
                    onToggle={() => setExpandedId(expandedId === c.id ? null : c.id)}
                    onDelete={() => setDeleteTarget(c.id)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Add dialog ── */}
      <AddCompetitorDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={handleAdd}
      />

      {/* ── Delete confirm dialog ── */}
      <Dialog open={deleteTarget !== null} onOpenChange={o => { if (!o) setDeleteTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover concorrente</DialogTitle>
            <DialogDescription>
              Tem certeza? O perfil e todos os dados associados serão removidos da lista.
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={() => deleteTarget && confirmDelete(deleteTarget)}
              className="gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remover
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
