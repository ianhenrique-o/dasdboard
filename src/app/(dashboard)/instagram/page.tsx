import { Camera, ImagePlus, Heart, MessageCircle, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const stats = [
  { label: "Seguidores", value: "12.4k", change: "+3.2%", up: true },
  { label: "Posts este mês", value: "18", change: "+4 vs mês ant.", up: true },
  { label: "Engajamento médio", value: "4.7%", change: "-0.3%", up: false },
  { label: "Alcance semanal", value: "38.1k", change: "+12%", up: true },
]

const recentPosts = [
  { id: 1, caption: "Novo produto em destaque 🚀", likes: 342, comments: 28, status: "publicado" },
  { id: 2, caption: "Dicas de produtividade para 2025", likes: 218, comments: 15, status: "publicado" },
  { id: 3, caption: "Bastidores do nosso processo criativo", likes: 0, comments: 0, status: "agendado" },
  { id: 4, caption: "Collab especial em breve...", likes: 0, comments: 0, status: "rascunho" },
]

export default function InstagramPage() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-pink-500/15">
            <Camera className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestor de Instagram</h1>
            <p className="text-sm text-muted-foreground">Gerencie posts, stories e métricas</p>
          </div>
        </div>
        <Button className="gap-2">
          <ImagePlus className="w-4 h-4" />
          Novo Post
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
              <p className={`text-xs mt-1 ${stat.up ? "text-emerald-400" : "text-red-400"}`}>
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Posts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Posts Recentes</CardTitle>
          <CardDescription>Últimas publicações e conteúdos agendados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentPosts.map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-secondary shrink-0 flex items-center justify-center">
                    <Camera className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-foreground truncate">{post.caption}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0 ml-4">
                  {post.status === "publicado" && (
                    <div className="flex items-center gap-3 text-muted-foreground text-xs">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5" /> {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5" /> {post.comments}
                      </span>
                    </div>
                  )}
                  <Badge
                    variant={
                      post.status === "publicado"
                        ? "success"
                        : post.status === "agendado"
                        ? "warning"
                        : "secondary"
                    }
                  >
                    {post.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Placeholder CTA */}
      <Card className="border-dashed border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-12 gap-3 text-center">
          <TrendingUp className="w-8 h-8 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">Mais funcionalidades em breve</p>
          <p className="text-xs text-muted-foreground/60 max-w-xs">
            Análise de hashtags, comparativo de stories e relatórios automáticos estão sendo desenvolvidos.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
