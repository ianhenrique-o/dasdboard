import { BarChart3, TrendingUp, TrendingDown, Eye, MousePointerClick, Users, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const kpis = [
  { label: "Impressões totais", value: "248.3k", change: "+18%", up: true, icon: Eye },
  { label: "Cliques", value: "9.1k", change: "+5.4%", up: true, icon: MousePointerClick },
  { label: "Novos seguidores", value: "1.2k", change: "-2.1%", up: false, icon: Users },
  { label: "Tempo médio", value: "2m 34s", change: "+8s", up: true, icon: Clock },
]

const topContent = [
  { title: "Post: Lançamento produto X", platform: "Instagram", impressions: "42.1k", ctr: "6.2%" },
  { title: "Reel: Tutorial rápido", platform: "Instagram", impressions: "38.7k", ctr: "8.4%" },
  { title: "Story: Enquete semanal", platform: "Instagram", impressions: "21.3k", ctr: "12.1%" },
  { title: "Post: Dicas de uso", platform: "Instagram", impressions: "18.9k", ctr: "4.7%" },
]

export default function AnalyticsPage() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/15">
            <BarChart3 className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
            <p className="text-sm text-muted-foreground">Desempenho e métricas de conteúdo</p>
          </div>
        </div>
        <div className="flex gap-2">
          {["7d", "30d", "90d"].map((period) => (
            <Button key={period} variant={period === "30d" ? "default" : "outline"} size="sm">
              {period}
            </Button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.label}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{kpi.label}</p>
                    <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
                <div className={`flex items-center gap-1 text-xs mt-2 ${kpi.up ? "text-emerald-400" : "text-red-400"}`}>
                  {kpi.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {kpi.change} vs período anterior
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Chart placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Impressões ao longo do tempo</CardTitle>
          <CardDescription>Últimos 30 dias</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-end gap-1.5">
            {Array.from({ length: 30 }, (_, i) => {
              const height = 20 + Math.sin(i * 0.4) * 30 + Math.random() * 40
              return (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm bg-primary/30 hover:bg-primary/60 transition-colors cursor-pointer"
                  style={{ height: `${height}%` }}
                />
              )
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>1 mar</span>
            <span>15 mar</span>
            <span>30 mar</span>
          </div>
        </CardContent>
      </Card>

      {/* Top content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Conteúdos com Melhor Desempenho</CardTitle>
          <CardDescription>Top 4 por impressões no período</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {topContent.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground w-4">{i + 1}</span>
                  <div>
                    <p className="text-sm text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.platform}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{item.impressions} imp.</span>
                  <Badge variant="outline">{item.ctr} CTR</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
