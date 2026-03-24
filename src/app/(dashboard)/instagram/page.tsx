"use client"

import { useState } from "react"
import {
  Camera,
  ImagePlus,
  Heart,
  MessageCircle,
  CalendarClock,
  FileEdit,
  CheckCircle2,
  Lightbulb,
  Clapperboard,
  Images,
  Clock,
  Trash2,
  MoreHorizontal,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

type PostType = "post" | "reel" | "story" | "carrossel"
type PostStatus = "publicado" | "agendado" | "rascunho" | "backlog"

interface Post {
  id: number
  caption: string
  type: PostType
  status: PostStatus
  scheduledAt?: string
  likes?: number
  comments?: number
}

// ─── Initial data ─────────────────────────────────────────────────────────────

const initialPosts: Post[] = [
  {
    id: 1,
    caption: "Novo produto em destaque 🚀 Conheça a linha que vai transformar sua rotina.",
    type: "post",
    status: "publicado",
    likes: 342,
    comments: 28,
  },
  {
    id: 2,
    caption: "Dicas de produtividade para 2025 — o fio que todo mundo pediu.",
    type: "carrossel",
    status: "publicado",
    likes: 218,
    comments: 15,
  },
  {
    id: 3,
    caption: "Bastidores do nosso processo criativo. Nem tudo sai perfeito na primeira.",
    type: "reel",
    status: "agendado",
    scheduledAt: "2026-03-26T10:00",
  },
  {
    id: 4,
    caption: "Collab especial em breve... fique de olho 👀",
    type: "story",
    status: "agendado",
    scheduledAt: "2026-03-27T18:00",
  },
  {
    id: 5,
    caption: "Review do produto X — testamos por 30 dias e aqui está o resultado.",
    type: "reel",
    status: "rascunho",
  },
  {
    id: 6,
    caption: "Tutorial rápido: como usar o novo recurso em menos de 60 segundos.",
    type: "story",
    status: "rascunho",
  },
  {
    id: 7,
    caption: "Ideia: série de posts sobre bastidores da marca — humanizar o perfil.",
    type: "post",
    status: "backlog",
  },
  {
    id: 8,
    caption: "Campanha de aniversário — sortear produto com parceiros.",
    type: "carrossel",
    status: "backlog",
  },
  {
    id: 9,
    caption: "Comparativo: produto antigo vs novo — lado a lado.",
    type: "reel",
    status: "backlog",
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const typeIcons: Record<PostType, React.ReactNode> = {
  post: <Camera className="w-3.5 h-3.5" />,
  reel: <Clapperboard className="w-3.5 h-3.5" />,
  story: <Clock className="w-3.5 h-3.5" />,
  carrossel: <Images className="w-3.5 h-3.5" />,
}

const typeLabel: Record<PostType, string> = {
  post: "Post",
  reel: "Reel",
  story: "Story",
  carrossel: "Carrossel",
}

const statusConfig: Record<
  PostStatus,
  { label: string; variant: "success" | "warning" | "secondary" | "outline"; icon: React.ReactNode }
> = {
  publicado: { label: "Publicado", variant: "success", icon: <CheckCircle2 className="w-3 h-3" /> },
  agendado: { label: "Agendado", variant: "warning", icon: <CalendarClock className="w-3 h-3" /> },
  rascunho: { label: "Rascunho", variant: "secondary", icon: <FileEdit className="w-3 h-3" /> },
  backlog: { label: "Backlog", variant: "outline", icon: <Lightbulb className="w-3 h-3" /> },
}

function formatSchedule(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// ─── Post Card ────────────────────────────────────────────────────────────────

function PostCard({ post, onDelete }: { post: Post; onDelete: (id: number) => void }) {
  const sc = statusConfig[post.status]
  return (
    <Card className="group hover:border-border/80 transition-colors">
      <CardContent className="pt-5 pb-4">
        {/* top row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="secondary" className="gap-1 text-[10px]">
              {typeIcons[post.type]}
              {typeLabel[post.type]}
            </Badge>
            <Badge variant={sc.variant} className="gap-1 text-[10px]">
              {sc.icon}
              {sc.label}
            </Badge>
          </div>
          <button
            onClick={() => onDelete(post.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* caption */}
        <p className="text-sm text-foreground leading-relaxed line-clamp-3">
          {post.caption}
        </p>

        {/* footer */}
        {(post.likes !== undefined || post.scheduledAt) && (
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground border-t border-border/50 pt-3">
            {post.status === "publicado" && post.likes !== undefined && (
              <>
                <span className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-pink-400" /> {post.likes}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5" /> {post.comments}
                </span>
              </>
            )}
            {post.scheduledAt && (
              <span className="flex items-center gap-1">
                <CalendarClock className="w-3.5 h-3.5 text-amber-400" />
                {formatSchedule(post.scheduledAt)}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ label }: { label: string }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
        <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">Nenhum {label} ainda</p>
    </div>
  )
}

// ─── Tab grid ─────────────────────────────────────────────────────────────────

function PostGrid({ posts, status, emptyLabel, onDelete }: {
  posts: Post[]
  status: PostStatus
  emptyLabel: string
  onDelete: (id: number) => void
}) {
  const filtered = posts.filter((p) => p.status === status)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {filtered.length === 0
        ? <EmptyState label={emptyLabel} />
        : filtered.map((p) => <PostCard key={p.id} post={p} onDelete={onDelete} />)
      }
    </div>
  )
}

// ─── Add post form ────────────────────────────────────────────────────────────

interface FormState {
  caption: string
  type: PostType
  status: PostStatus
  scheduledAt: string
}

const defaultForm: FormState = {
  caption: "",
  type: "post",
  status: "backlog",
  scheduledAt: "",
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InstagramPage() {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<FormState>(defaultForm)

  const counts = {
    agendado: posts.filter((p) => p.status === "agendado").length,
    rascunho: posts.filter((p) => p.status === "rascunho").length,
    publicado: posts.filter((p) => p.status === "publicado").length,
    backlog: posts.filter((p) => p.status === "backlog").length,
  }

  function handleDelete(id: number) {
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.caption.trim()) return

    const newPost: Post = {
      id: Date.now(),
      caption: form.caption.trim(),
      type: form.type,
      status: form.status,
      scheduledAt: form.status === "agendado" && form.scheduledAt ? form.scheduledAt : undefined,
    }
    setPosts((prev) => [newPost, ...prev])
    setForm(defaultForm)
    setOpen(false)
  }

  return (
    <div className="p-8 space-y-8 overflow-y-auto flex-1">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-pink-500/15">
            <Camera className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestor de Instagram</h1>
            <p className="text-sm text-muted-foreground">Gerencie seus conteúdos por status</p>
          </div>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2">
          <ImagePlus className="w-4 h-4" />
          Nova Ideia
        </Button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          { label: "Agendados", count: counts.agendado, icon: <CalendarClock className="w-4 h-4" />, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Rascunhos", count: counts.rascunho, icon: <FileEdit className="w-4 h-4" />, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Publicados", count: counts.publicado, icon: <CheckCircle2 className="w-4 h-4" />, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Backlog", count: counts.backlog, icon: <Lightbulb className="w-4 h-4" />, color: "text-violet-400", bg: "bg-violet-500/10" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", s.bg)}>
                  <span className={s.color}>{s.icon}</span>
                </div>
              </div>
              <p className="text-3xl font-bold mt-2 tabular-nums">{s.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="agendado">
        <TabsList>
          <TabsTrigger value="agendado">
            <CalendarClock className="w-3.5 h-3.5" />
            Agendados
            {counts.agendado > 0 && (
              <span className="ml-1 text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full font-semibold">
                {counts.agendado}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="rascunho">
            <FileEdit className="w-3.5 h-3.5" />
            Rascunhos
            {counts.rascunho > 0 && (
              <span className="ml-1 text-[10px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded-full font-semibold">
                {counts.rascunho}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="publicado">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Publicados
          </TabsTrigger>
          <TabsTrigger value="backlog">
            <Lightbulb className="w-3.5 h-3.5" />
            Backlog
            {counts.backlog > 0 && (
              <span className="ml-1 text-[10px] bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded-full font-semibold">
                {counts.backlog}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="agendado">
            <PostGrid posts={posts} status="agendado" emptyLabel="post agendado" onDelete={handleDelete} />
          </TabsContent>
          <TabsContent value="rascunho">
            <PostGrid posts={posts} status="rascunho" emptyLabel="rascunho" onDelete={handleDelete} />
          </TabsContent>
          <TabsContent value="publicado">
            <PostGrid posts={posts} status="publicado" emptyLabel="post publicado" onDelete={handleDelete} />
          </TabsContent>
          <TabsContent value="backlog">
            <PostGrid posts={posts} status="backlog" emptyLabel="ideia no backlog" onDelete={handleDelete} />
          </TabsContent>
        </div>
      </Tabs>

      {/* ── Add post dialog ── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova ideia de post</DialogTitle>
            <DialogDescription>
              Adicione uma legenda, escolha o tipo e defina o status inicial.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Caption */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Legenda
              </label>
              <textarea
                value={form.caption}
                onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))}
                placeholder="Escreva a legenda do post..."
                rows={4}
                required
                className={cn(
                  "w-full resize-none rounded-lg border border-input bg-secondary px-3 py-2.5 text-sm",
                  "text-foreground placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-1 focus:ring-ring"
                )}
              />
              <p className="text-[11px] text-muted-foreground text-right">
                {form.caption.length} caracteres
              </p>
            </div>

            {/* Type + Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Tipo de post
                </label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm((f) => ({ ...f, type: v as PostType }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="post">Post</SelectItem>
                    <SelectItem value="reel">Reel</SelectItem>
                    <SelectItem value="story">Story</SelectItem>
                    <SelectItem value="carrossel">Carrossel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm((f) => ({ ...f, status: v as PostStatus }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="backlog">Backlog</SelectItem>
                    <SelectItem value="rascunho">Rascunho</SelectItem>
                    <SelectItem value="agendado">Agendado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Schedule date — only when agendado */}
            {form.status === "agendado" && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Data e hora de publicação
                </label>
                <input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                  required
                  className={cn(
                    "w-full rounded-lg border border-input bg-secondary px-3 py-2 text-sm",
                    "text-foreground",
                    "focus:outline-none focus:ring-1 focus:ring-ring",
                    "[color-scheme:dark]"
                  )}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-1">
              <DialogClose asChild>
                <Button type="button" variant="ghost">Cancelar</Button>
              </DialogClose>
              <Button type="submit" disabled={!form.caption.trim()}>
                Adicionar post
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
