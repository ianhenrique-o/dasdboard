"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Newspaper,
  RefreshCw,
  ExternalLink,
  Clock,
  AlertCircle,
  Wrench,
  FlaskConical,
  Briefcase,
  Globe,
  Rss,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { NewsItem, NewsTopic, NewsPayload } from "@/app/api/noticias/route"

// ─── Topic config ─────────────────────────────────────────────────────────────

const TOPIC_CONFIG: Record<
  NewsTopic | "todos",
  { label: string; icon: React.ReactNode; color: string; bg: string }
> = {
  todos:       { label: "Todos",       icon: <Globe className="w-3 h-3" />,       color: "text-foreground",    bg: "bg-primary/20 text-primary border-primary/40" },
  ferramentas: { label: "Ferramentas", icon: <Wrench className="w-3 h-3" />,      color: "text-violet-400",    bg: "bg-violet-500/20 text-violet-300 border-violet-500/40" },
  pesquisa:    { label: "Pesquisa",    icon: <FlaskConical className="w-3 h-3" />, color: "text-blue-400",      bg: "bg-blue-500/20 text-blue-300 border-blue-500/40" },
  negocios:    { label: "Negócios",    icon: <Briefcase className="w-3 h-3" />,    color: "text-amber-400",     bg: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
  geral:       { label: "Geral",       icon: <Newspaper className="w-3 h-3" />,    color: "text-cyan-400",      bg: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" },
}

const TOPIC_BADGE: Record<NewsTopic, "default" | "secondary" | "outline"> = {
  ferramentas: "default",
  pesquisa:    "secondary",
  negocios:    "secondary",
  geral:       "outline",
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffH = Math.floor(diffMs / 3600_000)
  const diffM = Math.floor(diffMs / 60_000)

  if (diffM < 1)  return "agora mesmo"
  if (diffM < 60) return `há ${diffM}min`
  if (diffH < 24) return `há ${diffH}h`
  const diffD = Math.floor(diffH / 24)
  if (diffD === 1) return "ontem"
  if (diffD < 7)   return `há ${diffD} dias`
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <Card>
      <CardContent className="pt-5 pb-4 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 w-20 rounded-full bg-secondary animate-pulse" />
          <div className="h-5 w-16 rounded-full bg-secondary animate-pulse" />
        </div>
        <div className="space-y-1.5">
          <div className="h-4 w-full rounded bg-secondary animate-pulse" />
          <div className="h-4 w-4/5 rounded bg-secondary animate-pulse" />
        </div>
        <div className="space-y-1">
          <div className="h-3 w-full rounded bg-secondary animate-pulse" />
          <div className="h-3 w-3/4 rounded bg-secondary animate-pulse" />
        </div>
        <div className="flex justify-between pt-1">
          <div className="h-3 w-28 rounded bg-secondary animate-pulse" />
          <div className="h-3 w-14 rounded bg-secondary animate-pulse" />
        </div>
      </CardContent>
    </Card>
  )
}

// ─── News card ────────────────────────────────────────────────────────────────

function NewsCard({ item }: { item: NewsItem }) {
  const tc = TOPIC_CONFIG[item.topic]

  return (
    <Card className="hover:border-border/80 transition-colors group flex flex-col">
      <CardContent className="pt-5 pb-4 flex flex-col flex-1 gap-0">
        {/* Badges */}
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border",
              TOPIC_CONFIG[item.topic].bg
            )}
          >
            {tc.icon}
            {tc.label}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-foreground leading-snug mb-2 line-clamp-2">
          {item.title}
        </h3>

        {/* Summary */}
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 flex-1 mb-4">
          {item.summary || "Sem resumo disponível."}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto border-t border-border/40 pt-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
            <Clock className="w-3 h-3 shrink-0" />
            <span className="font-medium text-foreground/70 truncate">{item.source}</span>
            <span className="shrink-0">·</span>
            <span className="shrink-0">{formatDate(item.publishedAt)}</span>
          </div>

          {item.link && item.link !== "#" && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0 ml-2 opacity-0 group-hover:opacity-100"
            >
              Ler <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NoticiasPage() {
  const [data, setData] = useState<NewsPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTopic, setActiveTopic] = useState<NewsTopic | "todos">("todos")

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/noticias")
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json: NewsPayload = await res.json()
      setData(json)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar feeds")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered =
    activeTopic === "todos"
      ? (data?.items ?? [])
      : (data?.items ?? []).filter((i) => i.topic === activeTopic)

  const counts: Record<NewsTopic | "todos", number> = {
    todos:       data?.items.length ?? 0,
    ferramentas: data?.items.filter((i) => i.topic === "ferramentas").length ?? 0,
    pesquisa:    data?.items.filter((i) => i.topic === "pesquisa").length ?? 0,
    negocios:    data?.items.filter((i) => i.topic === "negocios").length ?? 0,
    geral:       data?.items.filter((i) => i.topic === "geral").length ?? 0,
  }

  return (
    <div className="p-8 space-y-8 overflow-y-auto flex-1">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/15">
            <Newspaper className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Consolidador de Notícias</h1>
            <p className="text-sm text-muted-foreground">
              Marketing digital — feeds RSS em tempo real
              {data?.source === "mock" && (
                <span className="ml-2 text-amber-400/80">· dados de demonstração</span>
              )}
              {data?.source === "rss" && (
                <span className="ml-2 text-emerald-400/70 inline-flex items-center gap-1">
                  <Rss className="w-3 h-3" /> ao vivo
                </span>
              )}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          className="gap-2 shrink-0"
          onClick={load}
          disabled={loading}
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          Atualizar
        </Button>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <Button variant="ghost" size="sm" className="ml-auto" onClick={load}>
            Tentar novamente
          </Button>
        </div>
      )}

      {/* ── Topic filters ── */}
      <div className="flex gap-2 flex-wrap">
        {(["todos", "ferramentas", "pesquisa", "negocios", "geral"] as const).map((topic) => {
          const cfg = TOPIC_CONFIG[topic]
          const isActive = activeTopic === topic
          const count = counts[topic]

          return (
            <button
              key={topic}
              onClick={() => setActiveTopic(topic)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                isActive
                  ? cfg.bg
                  : "bg-secondary text-muted-foreground border-transparent hover:text-foreground hover:border-border/50"
              )}
            >
              {cfg.icon}
              {cfg.label}
              {!loading && count > 0 && (
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full font-semibold",
                  isActive ? "bg-white/15" : "bg-muted text-muted-foreground"
                )}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── News grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : filtered.length === 0
          ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                <Newspaper className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Nenhuma notícia encontrada para este tópico.
              </p>
            </div>
          )
          : filtered.map((item) => <NewsCard key={item.id} item={item} />)
        }
      </div>

      {/* ── Footer info ── */}
      {!loading && data && (
        <p className="text-center text-xs text-muted-foreground/50">
          {filtered.length} artigo{filtered.length !== 1 ? "s" : ""} ·{" "}
          atualizado {formatDate(data.fetchedAt)}
        </p>
      )}
    </div>
  )
}
