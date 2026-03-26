"use client"

import { useState, useMemo } from "react"
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Clock,
  Camera,
  PlayCircle,
  Music2,
  Globe,
  Briefcase,
  Hash,
  Clapperboard,
  Images,
  CheckCircle2,
  CalendarClock,
  FileEdit,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

type Platform = "instagram" | "youtube" | "tiktok" | "facebook" | "linkedin" | "twitter"
type ContentType = "post" | "reel" | "story" | "carrossel" | "video" | "shorts" | "artigo"
type Status = "publicado" | "agendado" | "rascunho"

interface CalPost {
  id: string
  platform: Platform
  type: ContentType
  status: Status
  caption: string
  date: string  // YYYY-MM-DD
  time: string  // HH:MM
}

// ─── Platform config ──────────────────────────────────────────────────────────

const PLATFORMS: Record<Platform, {
  label: string
  icon: React.ComponentType<{ className?: string }>
  chip: string          // chip bg + text
  dot: string           // solid dot color
  activePill: string    // filter pill when active
}> = {
  instagram: {
    label: "Instagram",
    icon: Camera,
    chip: "bg-pink-500/15 text-pink-300 border border-pink-500/20",
    dot: "bg-pink-500",
    activePill: "bg-pink-500/20 text-pink-300 border-pink-500/40",
  },
  youtube: {
    label: "YouTube",
    icon: PlayCircle,
    chip: "bg-red-500/15 text-red-300 border border-red-500/20",
    dot: "bg-red-500",
    activePill: "bg-red-500/20 text-red-300 border-red-500/40",
  },
  tiktok: {
    label: "TikTok",
    icon: Music2,
    chip: "bg-cyan-500/15 text-cyan-300 border border-cyan-500/20",
    dot: "bg-cyan-500",
    activePill: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
  },
  facebook: {
    label: "Facebook",
    icon: Globe,
    chip: "bg-blue-600/15 text-blue-300 border border-blue-600/20",
    dot: "bg-blue-500",
    activePill: "bg-blue-600/20 text-blue-300 border-blue-600/40",
  },
  linkedin: {
    label: "LinkedIn",
    icon: Briefcase,
    chip: "bg-sky-500/15 text-sky-300 border border-sky-500/20",
    dot: "bg-sky-500",
    activePill: "bg-sky-500/20 text-sky-300 border-sky-500/40",
  },
  twitter: {
    label: "Twitter / X",
    icon: Hash,
    chip: "bg-slate-500/15 text-slate-300 border border-slate-500/20",
    dot: "bg-slate-400",
    activePill: "bg-slate-500/20 text-slate-300 border-slate-500/40",
  },
}

const CONTENT_TYPES: Record<ContentType, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  post:     { label: "Post",     icon: Camera },
  reel:     { label: "Reel",     icon: Clapperboard },
  story:    { label: "Story",    icon: Clock },
  carrossel:{ label: "Carrossel",icon: Images },
  video:    { label: "Vídeo",    icon: PlayCircle },
  shorts:   { label: "Shorts",   icon: Music2 },
  artigo:   { label: "Artigo",   icon: Briefcase },
}

const STATUS_CONFIG: Record<Status, {
  label: string
  icon: React.ComponentType<{ className?: string }>
  class: string
}> = {
  publicado: { label: "Publicado",  icon: CheckCircle2,  class: "text-emerald-400" },
  agendado:  { label: "Agendado",   icon: CalendarClock, class: "text-amber-400" },
  rascunho:  { label: "Rascunho",   icon: FileEdit,      class: "text-muted-foreground" },
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const POSTS: CalPost[] = [
  // March 2026 — past (publicado)
  { id: "1",  platform: "instagram", type: "reel",      status: "publicado", caption: "Tutorial rápido: 3 dicas que mudaram minha rotina de trabalho 🚀", date: "2026-03-03", time: "14:00" },
  { id: "2",  platform: "youtube",   type: "video",     status: "publicado", caption: "Review completo: testamos o produto por 30 dias — vale a pena?",    date: "2026-03-04", time: "18:00" },
  { id: "3",  platform: "tiktok",    type: "shorts",    status: "publicado", caption: "POV: quando você descobre esse truque de produtividade 😅",         date: "2026-03-05", time: "12:00" },
  { id: "4",  platform: "instagram", type: "carrossel", status: "publicado", caption: "Guia completo: do zero ao primeiro post que performa de verdade",    date: "2026-03-07", time: "10:00" },
  { id: "5",  platform: "linkedin",  type: "artigo",    status: "publicado", caption: "5 erros que toda marca comete nas redes sociais (e como evitá-los)", date: "2026-03-07", time: "09:00" },
  { id: "6",  platform: "facebook",  type: "post",      status: "publicado", caption: "Conheça a nova linha de produtos — disponível agora na loja!",       date: "2026-03-10", time: "11:00" },
  { id: "7",  platform: "instagram", type: "story",     status: "publicado", caption: "Enquete: qual é o seu maior desafio com criação de conteúdo?",        date: "2026-03-11", time: "18:00" },
  { id: "8",  platform: "tiktok",    type: "shorts",    status: "publicado", caption: "Trend da semana: desafio do produto — participe!",                   date: "2026-03-12", time: "16:00" },
  { id: "9",  platform: "youtube",   type: "video",     status: "publicado", caption: "Bastidores: como gravamos nosso conteúdo com smartphone",            date: "2026-03-14", time: "15:00" },
  { id: "10", platform: "instagram", type: "reel",      status: "publicado", caption: "Antes e depois: reformulamos toda a nossa identidade visual",         date: "2026-03-15", time: "12:00" },
  { id: "11", platform: "twitter",   type: "post",      status: "publicado", caption: "Thread: o que aprendi depois de 1 ano criando conteúdo todos os dias", date: "2026-03-17", time: "10:00" },
  { id: "12", platform: "instagram", type: "carrossel", status: "publicado", caption: "10 ferramentas gratuitas para criadores de conteúdo em 2026",         date: "2026-03-18", time: "09:00" },
  { id: "13", platform: "facebook",  type: "post",      status: "publicado", caption: "Semana do cliente: descontos especiais para quem nos segue",          date: "2026-03-19", time: "08:00" },
  { id: "14", platform: "linkedin",  type: "artigo",    status: "publicado", caption: "Como construir autoridade de marca no LinkedIn em 90 dias",           date: "2026-03-21", time: "09:00" },
  { id: "15", platform: "tiktok",    type: "shorts",    status: "publicado", caption: "Dueto com @criador parceiro — resultado incrível 🔥",                 date: "2026-03-21", time: "17:00" },

  // March 2026 — current week (agendado)
  { id: "16", platform: "instagram", type: "reel",      status: "agendado",  caption: "Collab especial com parceiro — não perca o lançamento!",             date: "2026-03-25", time: "14:00" },
  { id: "17", platform: "youtube",   type: "video",     status: "agendado",  caption: "Vídeo completo: configuramos um home office do zero com R$500",       date: "2026-03-26", time: "18:00" },
  { id: "18", platform: "tiktok",    type: "shorts",    status: "agendado",  caption: "Mini tutorial: edição de vídeo no celular em 60 segundos",             date: "2026-03-26", time: "12:00" },
  { id: "19", platform: "instagram", type: "story",     status: "agendado",  caption: "Quiz de quinta: você conhece nossa história?",                         date: "2026-03-27", time: "10:00" },
  { id: "20", platform: "facebook",  type: "post",      status: "agendado",  caption: "Conteúdo exclusivo para membros — clique e saiba mais",                date: "2026-03-27", time: "11:30" },
  { id: "21", platform: "instagram", type: "carrossel", status: "agendado",  caption: "Mês de março: compilado dos melhores momentos do time",               date: "2026-03-28", time: "09:00" },
  { id: "22", platform: "linkedin",  type: "artigo",    status: "agendado",  caption: "Relatório: tendências de marketing digital para Q2 2026",             date: "2026-03-28", time: "08:00" },
  { id: "23", platform: "twitter",   type: "post",      status: "agendado",  caption: "Live de encerramento do mês — participe e tire suas dúvidas",          date: "2026-03-29", time: "20:00" },
  { id: "24", platform: "tiktok",    type: "shorts",    status: "agendado",  caption: "Novo produto em destaque: primeiras impressões",                       date: "2026-03-30", time: "15:00" },
  { id: "25", platform: "instagram", type: "reel",      status: "agendado",  caption: "Resumo mensal em 60s: março em números e destaques",                  date: "2026-03-31", time: "12:00" },

  // April 2026 (rascunho + agendado)
  { id: "26", platform: "youtube",   type: "video",     status: "agendado",  caption: "Abril começa com novidades: o que vem por aí este mês",               date: "2026-04-01", time: "18:00" },
  { id: "27", platform: "instagram", type: "post",      status: "rascunho",  caption: "Ideia: campanha de Páscoa com produto temático",                       date: "2026-04-05", time: "10:00" },
  { id: "28", platform: "tiktok",    type: "shorts",    status: "rascunho",  caption: "Trend de abril: participar ou não?",                                    date: "2026-04-07", time: "14:00" },
  { id: "29", platform: "instagram", type: "carrossel", status: "agendado",  caption: "3 anos de marca: história, aprendizados e o que vem pela frente",      date: "2026-04-10", time: "09:00" },
  { id: "30", platform: "linkedin",  type: "artigo",    status: "rascunho",  caption: "Case de sucesso: como dobramos o engajamento em 60 dias",              date: "2026-04-14", time: "09:00" },
]

// ─── Calendar helpers ─────────────────────────────────────────────────────────

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const MONTHS_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"]

function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate() }
function firstDayOfMonth(y: number, m: number) { return new Date(y, m, 1).getDay() }
function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Chip inside a calendar cell */
function PostChip({ post }: { post: CalPost }) {
  const pc = PLATFORMS[post.platform]
  const isDraft = post.status === "rascunho"
  return (
    <div
      className={cn(
        "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] leading-tight truncate min-w-0 w-full",
        pc.chip,
        isDraft && "opacity-50"
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", pc.dot)} />
      <span className="truncate">{post.time} {post.caption}</span>
    </div>
  )
}

/** Detail card inside the side panel */
function PostDetail({ post }: { post: CalPost }) {
  const pc = PLATFORMS[post.platform]
  const ct = CONTENT_TYPES[post.type]
  const sc = STATUS_CONFIG[post.status]
  const PlatformIcon = pc.icon
  const TypeIcon = ct.icon
  const StatusIcon = sc.icon

  return (
    <div className={cn(
      "p-3.5 rounded-xl border space-y-2.5",
      "bg-background/60 border-border/60"
    )}>
      {/* Platform + Type + Status row */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={cn("flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border", pc.chip)}>
          <PlatformIcon className="w-2.5 h-2.5" />
          {pc.label}
        </span>
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] border border-border bg-secondary text-muted-foreground">
          <TypeIcon className="w-2.5 h-2.5" />
          {ct.label}
        </span>
        <span className={cn("flex items-center gap-1 ml-auto text-[10px]", sc.class)}>
          <StatusIcon className="w-3 h-3" />
          {sc.label}
        </span>
      </div>

      {/* Caption */}
      <p className="text-xs text-foreground leading-relaxed">{post.caption}</p>

      {/* Time */}
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
        <Clock className="w-3 h-3" />
        {post.time}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CalendarioPage() {
  const realToday = new Date()
  const [viewYear, setViewYear] = useState(realToday.getFullYear())
  const [viewMonth, setViewMonth] = useState(realToday.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [activePlatforms, setActivePlatforms] = useState<Set<Platform>>(new Set())

  // ── Navigation ──
  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
    setSelectedDate(null)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
    setSelectedDate(null)
  }

  // ── Platform filter toggle ──
  function togglePlatform(p: Platform) {
    setActivePlatforms(prev => {
      const next = new Set(prev)
      if (next.has(p)) next.delete(p); else next.add(p)
      return next
    })
  }
  const noFilter = activePlatforms.size === 0

  // ── Posts filtered ──
  const visiblePosts = useMemo(() =>
    POSTS.filter(p => noFilter || activePlatforms.has(p.platform)),
    [activePlatforms, noFilter]
  )

  // ── Posts indexed by date ──
  const postsByDate = useMemo(() => {
    const map: Record<string, CalPost[]> = {}
    for (const p of visiblePosts) {
      if (!map[p.date]) map[p.date] = []
      map[p.date].push(p)
    }
    // sort each day's posts by time
    for (const d of Object.keys(map)) {
      map[d].sort((a, b) => a.time.localeCompare(b.time))
    }
    return map
  }, [visiblePosts])

  // ── Selected day posts ──
  const selectedPosts = selectedDate ? (postsByDate[selectedDate] ?? []) : []

  // ── Calendar grid cells ──
  const numDays = daysInMonth(viewYear, viewMonth)
  const firstDay = firstDayOfMonth(viewYear, viewMonth)
  const cells: Array<number | null> = [
    ...Array<null>(firstDay).fill(null),
    ...Array.from({ length: numDays }, (_, i) => i + 1),
  ]
  // pad to complete last week
  while (cells.length % 7 !== 0) cells.push(null)

  const todayStr = toDateStr(
    realToday.getFullYear(),
    realToday.getMonth(),
    realToday.getDate()
  )

  // ── Count chips per status for legend ──
  const monthStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`
  const monthPosts = visiblePosts.filter(p => p.date.startsWith(monthStr))
  const counts = {
    publicado: monthPosts.filter(p => p.status === "publicado").length,
    agendado: monthPosts.filter(p => p.status === "agendado").length,
    rascunho: monthPosts.filter(p => p.status === "rascunho").length,
  }

  return (
    <div className="flex flex-col h-full">

      {/* ── Top bar ── */}
      <div className="px-8 pt-8 pb-4 space-y-4 shrink-0">

        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-500/12 border border-violet-500/20">
              <CalendarDays className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Calendário de Conteúdo</h1>
              <p className="text-sm text-muted-foreground">
                {counts.publicado} publicados · {counts.agendado} agendados · {counts.rascunho} rascunhos
              </p>
            </div>
          </div>
          <Button className="gap-2" size="sm">
            <Plus className="w-3.5 h-3.5" />
            Novo Post
          </Button>
        </div>

        {/* Platform filters + month nav in the same row */}
        <div className="flex items-center justify-between gap-4 flex-wrap">

          {/* Platform filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setActivePlatforms(new Set())}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                noFilter
                  ? "bg-primary/20 text-primary border-primary/40"
                  : "bg-secondary text-muted-foreground border-transparent hover:text-foreground"
              )}
            >
              Todos
            </button>
            {(Object.entries(PLATFORMS) as [Platform, typeof PLATFORMS[Platform]][]).map(([key, cfg]) => {
              const Icon = cfg.icon
              const isActive = activePlatforms.has(key)
              return (
                <button
                  key={key}
                  onClick={() => togglePlatform(key)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                    isActive
                      ? cfg.activePill
                      : "bg-secondary text-muted-foreground border-transparent hover:text-foreground"
                  )}
                >
                  <Icon className="w-3 h-3" />
                  {cfg.label}
                </button>
              )
            })}
          </div>

          {/* Month nav */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={prevMonth}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold w-32 text-center">
              {MONTHS_PT[viewMonth]} {viewYear}
            </span>
            <button
              onClick={nextMonth}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <Separator />

      {/* ── Calendar + Panel ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Calendar grid ── */}
        <div className={cn(
          "flex-1 overflow-y-auto p-6 transition-all duration-300",
        )}>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {WEEKDAYS.map(d => (
              <div key={d} className="text-center text-[11px] font-medium text-muted-foreground py-1.5">
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {cells.map((day, i) => {
              if (day === null) {
                return <div key={`empty-${i}`} className="min-h-[110px]" />
              }

              const dateStr = toDateStr(viewYear, viewMonth, day)
              const dayPosts = postsByDate[dateStr] ?? []
              const isToday = dateStr === todayStr
              const isSelected = dateStr === selectedDate
              const isPast = dateStr < todayStr
              const CHIP_LIMIT = 3
              const overflow = dayPosts.length - CHIP_LIMIT

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                  className={cn(
                    "min-h-[110px] rounded-xl p-2 border cursor-pointer transition-all flex flex-col gap-1",
                    "hover:border-border",
                    isPast && !isToday ? "bg-background/40" : "bg-card/50",
                    isToday && "border-primary/50 bg-primary/5",
                    isSelected && "border-primary ring-1 ring-primary/30 bg-primary/5",
                    !isToday && !isSelected && "border-border/40",
                  )}
                >
                  {/* Day number */}
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full",
                      isToday
                        ? "bg-primary text-primary-foreground"
                        : isPast
                        ? "text-muted-foreground/60"
                        : "text-foreground"
                    )}>
                      {day}
                    </span>
                    {dayPosts.length > 0 && (
                      <span className="text-[9px] text-muted-foreground/60">
                        {dayPosts.length}
                      </span>
                    )}
                  </div>

                  {/* Chips */}
                  <div className="flex flex-col gap-0.5 flex-1">
                    {dayPosts.slice(0, CHIP_LIMIT).map(post => (
                      <PostChip key={post.id} post={post} />
                    ))}
                    {overflow > 0 && (
                      <div className="text-[9px] text-muted-foreground px-1.5">
                        +{overflow} mais
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Day detail panel ── */}
        {selectedDate && (
          <>
            <Separator orientation="vertical" />
            <aside className="w-72 shrink-0 overflow-y-auto flex flex-col bg-background/50">
              {/* Panel header */}
              <div className="flex items-center justify-between px-5 py-4 sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border/50 z-10">
                <div>
                  <p className="text-sm font-semibold">
                    {new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedPosts.length === 0
                      ? "Nenhum conteúdo"
                      : `${selectedPosts.length} ${selectedPosts.length === 1 ? "publicação" : "publicações"}`
                    }
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Posts list */}
              <div className="flex-1 p-4 space-y-2.5">
                {selectedPosts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      <CalendarDays className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">Nenhum post neste dia</p>
                    <button className="flex items-center gap-1 text-xs text-primary hover:underline">
                      <Plus className="w-3 h-3" /> Adicionar post
                    </button>
                  </div>
                ) : (
                  selectedPosts.map(post => (
                    <PostDetail key={post.id} post={post} />
                  ))
                )}
              </div>

              {/* Add button */}
              <div className="p-4 border-t border-border/50 sticky bottom-0 bg-background/80 backdrop-blur-sm">
                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-border/70 text-xs text-muted-foreground hover:text-foreground hover:border-border transition-all">
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar post neste dia
                </button>
              </div>
            </aside>
          </>
        )}
      </div>
    </div>
  )
}
