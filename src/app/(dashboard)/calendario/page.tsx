import { CalendarDays, Plus, Camera, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

const scheduledPosts: Record<number, { caption: string; time: string; type: string }[]> = {
  3: [{ caption: "Post produto novo", time: "10:00", type: "post" }],
  5: [
    { caption: "Reel tutorial", time: "14:00", type: "reel" },
    { caption: "Story enquete", time: "18:00", type: "story" },
  ],
  8: [{ caption: "Post motivacional", time: "09:00", type: "post" }],
  12: [{ caption: "Collab especial", time: "12:00", type: "post" }],
  15: [{ caption: "Bastidores", time: "16:00", type: "story" }],
  19: [{ caption: "Review produto", time: "11:00", type: "reel" }],
  22: [{ caption: "Post semanal", time: "10:00", type: "post" }],
  26: [{ caption: "Campanha mês", time: "09:00", type: "post" }],
}

const upcomingPosts = [
  { caption: "Post produto novo", date: "Hoje, 10:00", platform: "Instagram", type: "post" },
  { caption: "Reel tutorial", date: "Amanhã, 14:00", platform: "Instagram", type: "reel" },
  { caption: "Story enquete", date: "Amanhã, 18:00", platform: "Instagram", type: "story" },
  { caption: "Post motivacional", date: "Sex, 09:00", platform: "Instagram", type: "post" },
]

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export default function CalendarioPage() {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const monthName = today.toLocaleString("pt-BR", { month: "long", year: "numeric" })

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-500/15">
            <CalendarDays className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Calendário de Conteúdo</h1>
            <p className="text-sm text-muted-foreground">Planeje e agende suas publicações</p>
          </div>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Agendar Post
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Calendar grid */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base capitalize">{monthName}</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm">‹</Button>
                  <Button variant="ghost" size="sm">›</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Week days header */}
              <div className="grid grid-cols-7 mb-2">
                {weekDays.map((d) => (
                  <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">
                    {d}
                  </div>
                ))}
              </div>
              {/* Days grid */}
              <div className="grid grid-cols-7 gap-1">
                {cells.map((day, i) => {
                  const hasContent = day !== null && scheduledPosts[day]
                  const isToday = day === today.getDate()
                  return (
                    <div
                      key={i}
                      className={`
                        min-h-[72px] rounded-lg p-1.5 text-xs border
                        ${day === null ? "border-transparent" : "border-border/50 hover:border-border cursor-pointer"}
                        ${isToday ? "border-primary/50 bg-primary/5" : ""}
                      `}
                    >
                      {day !== null && (
                        <>
                          <span className={`font-medium ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                            {day}
                          </span>
                          <div className="mt-1 space-y-0.5">
                            {(scheduledPosts[day] || []).map((p, j) => (
                              <div
                                key={j}
                                className="text-[10px] px-1 py-0.5 rounded bg-violet-500/20 text-violet-300 truncate"
                              >
                                {p.time} {p.caption}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Próximas Publicações</CardTitle>
              <CardDescription>Agendamentos pendentes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingPosts.map((post, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <Camera className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{post.caption}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{post.date}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[10px] capitalize shrink-0">
                    {post.type}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-dashed border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-8 gap-2 text-center">
              <Plus className="w-6 h-6 text-muted-foreground/50" />
              <p className="text-xs text-muted-foreground">Arrastar e soltar em breve</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
