import { Newspaper, RefreshCw, ExternalLink, BookmarkPlus, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const categories = ["Todos", "Marketing", "Tecnologia", "IA", "Social Media", "E-commerce"]

const news = [
  {
    id: 1,
    title: "Instagram lança novos recursos de IA para criadores de conteúdo",
    source: "TechCrunch",
    category: "Social Media",
    time: "há 1h",
    summary:
      "A plataforma anuncia ferramentas baseadas em inteligência artificial para auxiliar na criação e agendamento de posts.",
    relevance: "alta",
  },
  {
    id: 2,
    title: "Tendências de marketing digital para o segundo semestre de 2025",
    source: "Marketing Week",
    category: "Marketing",
    time: "há 3h",
    summary:
      "Especialistas apontam o conteúdo curto em vídeo e a personalização por IA como as principais apostas do mercado.",
    relevance: "alta",
  },
  {
    id: 3,
    title: "Algoritmo do Instagram passa por atualização silenciosa",
    source: "Social Media Today",
    category: "Social Media",
    time: "há 5h",
    summary:
      "Criadores reportam mudanças no alcance orgânico. Reels com áudio original parecem ter prioridade nas últimas semanas.",
    relevance: "media",
  },
  {
    id: 4,
    title: "Estudo: consumidores preferem marcas com presença autêntica nas redes",
    source: "Harvard Business Review",
    category: "Marketing",
    time: "há 8h",
    summary:
      "Pesquisa com 12 mil consumidores revela que autenticidade supera frequência de posts como fator de engajamento.",
    relevance: "media",
  },
  {
    id: 5,
    title: "Novos modelos de linguagem reduzem custo de geração de conteúdo em 60%",
    source: "The Verge",
    category: "IA",
    time: "há 12h",
    summary:
      "Com modelos mais eficientes, pequenas agências podem escalar produção de conteúdo sem aumentar equipe.",
    relevance: "baixa",
  },
  {
    id: 6,
    title: "E-commerce: integração com redes sociais cresce 34% no trimestre",
    source: "Ecommerce Brasil",
    category: "E-commerce",
    time: "ontem",
    summary:
      "Social commerce consolida-se como canal relevante, com Instagram Shopping e TikTok Shop liderando as transações.",
    relevance: "baixa",
  },
]

const relevanceColor: Record<string, string> = {
  alta: "success",
  media: "warning",
  baixa: "secondary",
}

export default function NoticiasPage() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/15">
            <Newspaper className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Consolidador de Notícias</h1>
            <p className="text-sm text-muted-foreground">Acompanhe tendências e novidades do setor</p>
          </div>
        </div>
        <Button variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Atualizar feeds
        </Button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors
              ${cat === "Todos"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* News grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {news.map((item) => (
          <Card key={item.id} className="hover:border-border/80 transition-colors">
            <CardContent className="pt-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {item.category}
                  </Badge>
                  <Badge variant={relevanceColor[item.relevance] as "success" | "warning" | "secondary"} className="text-[10px]">
                    {item.relevance} relevância
                  </Badge>
                </div>
                <button className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                  <BookmarkPlus className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-sm font-semibold text-foreground leading-snug mb-2">
                {item.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                {item.summary}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{item.source}</span>
                  <span>·</span>
                  <span>{item.time}</span>
                </div>
                <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Ler mais <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load more placeholder */}
      <div className="flex justify-center">
        <Button variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Carregar mais notícias
        </Button>
      </div>
    </div>
  )
}
