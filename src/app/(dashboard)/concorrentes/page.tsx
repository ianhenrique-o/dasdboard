import { Users, TrendingUp, TrendingDown, Plus, ExternalLink } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const competitors = [
  {
    name: "@marca_alpha",
    handle: "marca_alpha",
    followers: "48.2k",
    followersRaw: 48200,
    postsMonth: 22,
    engagement: "5.1%",
    engagementChange: +0.3,
    lastPost: "há 2h",
    status: "ativo",
  },
  {
    name: "@brand_beta",
    handle: "brand_beta",
    followers: "31.7k",
    followersRaw: 31700,
    postsMonth: 14,
    engagement: "3.8%",
    engagementChange: -0.5,
    lastPost: "há 1 dia",
    status: "ativo",
  },
  {
    name: "@gama_oficial",
    handle: "gama_oficial",
    followers: "19.4k",
    followersRaw: 19400,
    postsMonth: 9,
    engagement: "7.2%",
    engagementChange: +1.1,
    lastPost: "há 4h",
    status: "ativo",
  },
  {
    name: "@delta_co",
    handle: "delta_co",
    followers: "8.8k",
    followersRaw: 8800,
    postsMonth: 5,
    engagement: "2.3%",
    engagementChange: -1.4,
    lastPost: "há 3 dias",
    status: "inativo",
  },
]

const insights = [
  { text: "@gama_oficial tem o maior engajamento (7.2%) mesmo com menos seguidores.", type: "info" },
  { text: "@marca_alpha postou 22 vezes este mês — 4x mais que você.", type: "warning" },
  { text: "Média de engajamento dos concorrentes: 4.6%. Você está em 4.7%.", type: "success" },
]

export default function ConcorrentesPage() {
  return (
    <div className="p-8 space-y-8 overflow-y-auto flex-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-500/15">
            <Users className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Rastreador de Concorrentes</h1>
            <p className="text-sm text-muted-foreground">Monitore a atividade da concorrência</p>
          </div>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Adicionar Concorrente
        </Button>
      </div>

      {/* Insights */}
      <div className="space-y-2">
        {insights.map((insight, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 px-4 py-3 rounded-lg text-sm border
              ${insight.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300" : ""}
              ${insight.type === "warning" ? "bg-amber-500/10 border-amber-500/20 text-amber-300" : ""}
              ${insight.type === "info" ? "bg-blue-500/10 border-blue-500/20 text-blue-300" : ""}
            `}
          >
            <span className="text-base leading-none mt-px">
              {insight.type === "success" ? "✓" : insight.type === "warning" ? "!" : "i"}
            </span>
            {insight.text}
          </div>
        ))}
      </div>

      {/* Competitors table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Concorrentes Monitorados</CardTitle>
          <CardDescription>{competitors.length} perfis rastreados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 text-xs font-medium text-muted-foreground">Perfil</th>
                  <th className="text-right py-2 px-4 text-xs font-medium text-muted-foreground">Seguidores</th>
                  <th className="text-right py-2 px-4 text-xs font-medium text-muted-foreground">Posts/mês</th>
                  <th className="text-right py-2 px-4 text-xs font-medium text-muted-foreground">Engajamento</th>
                  <th className="text-right py-2 px-4 text-xs font-medium text-muted-foreground">Último post</th>
                  <th className="text-right py-2 pl-4 text-xs font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {competitors.map((c) => (
                  <tr key={c.handle} className="border-b border-border/50 last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground">
                          {c.name[1].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{c.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 font-mono">{c.followers}</td>
                    <td className="text-right py-3 px-4 font-mono">{c.postsMonth}</td>
                    <td className="text-right py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <span className="font-mono">{c.engagement}</span>
                        {c.engagementChange > 0 ? (
                          <TrendingUp className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-red-400" />
                        )}
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 text-muted-foreground">{c.lastPost}</td>
                    <td className="text-right py-3 pl-4">
                      <Badge variant={c.status === "ativo" ? "success" : "secondary"}>
                        {c.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder */}
      <Card className="border-dashed border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-12 gap-3 text-center">
          <ExternalLink className="w-8 h-8 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">Análise de conteúdo em breve</p>
          <p className="text-xs text-muted-foreground/60 max-w-xs">
            Comparativo de estratégias, análise de hashtags dos concorrentes e alertas de publicação serão adicionados.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
