"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Camera,
  BarChart3,
  CalendarDays,
  Users,
  Newspaper,
  LayoutDashboard,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

const navItems = [
  {
    label: "Instagram",
    href: "/instagram",
    icon: Camera,
    description: "Gestão de posts e stories",
    color: "text-pink-400",
    glow: "group-hover:shadow-[0_0_8px_oklch(0.65_0.22_350_/_30%)]",
    activeBg: "bg-pink-500/10",
    activeBorder: "border-pink-500/25",
    activeColor: "text-pink-400",
    activeDot: "bg-pink-400",
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    description: "Métricas e desempenho",
    color: "text-blue-400",
    glow: "group-hover:shadow-[0_0_8px_oklch(0.65_0.2_220_/_30%)]",
    activeBg: "bg-blue-500/10",
    activeBorder: "border-blue-500/25",
    activeColor: "text-blue-400",
    activeDot: "bg-blue-400",
  },
  {
    label: "Calendário",
    href: "/calendario",
    icon: CalendarDays,
    description: "Agendamento de conteúdo",
    color: "text-violet-400",
    glow: "group-hover:shadow-[0_0_8px_oklch(0.65_0.2_270_/_30%)]",
    activeBg: "bg-violet-500/10",
    activeBorder: "border-violet-500/25",
    activeColor: "text-violet-400",
    activeDot: "bg-violet-400",
  },
  {
    label: "Concorrentes",
    href: "/concorrentes",
    icon: Users,
    description: "Rastreamento competitivo",
    color: "text-orange-400",
    glow: "group-hover:shadow-[0_0_8px_oklch(0.65_0.22_50_/_30%)]",
    activeBg: "bg-orange-500/10",
    activeBorder: "border-orange-500/25",
    activeColor: "text-orange-400",
    activeDot: "bg-orange-400",
  },
  {
    label: "Notícias",
    href: "/noticias",
    icon: Newspaper,
    description: "Feeds RSS ao vivo",
    color: "text-cyan-400",
    glow: "group-hover:shadow-[0_0_8px_oklch(0.65_0.18_200_/_30%)]",
    activeBg: "bg-cyan-500/10",
    activeBorder: "border-cyan-500/25",
    activeColor: "text-cyan-400",
    activeDot: "bg-cyan-400",
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex flex-col w-[230px] shrink-0 h-screen sticky top-0 bg-sidebar border-r border-sidebar-border">

      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-5 h-16 shrink-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/25 to-violet-700/20 border border-violet-500/20 shadow-[inset_0_1px_0_oklch(1_0_0_/_10%)]">
          <LayoutDashboard className="w-3.5 h-3.5 text-violet-300" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground leading-none tracking-tight">CMS Dashboard</p>
          <p className="text-[11px] text-muted-foreground/70 mt-0.5 leading-none">Gestão de Conteúdo</p>
        </div>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* ── Nav ── */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="px-2 mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
          Navegação
        </p>
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group",
                    isActive
                      ? cn(
                          "border",
                          item.activeBg,
                          item.activeBorder,
                          "shadow-[0_1px_3px_oklch(0_0_0_/_20%)]"
                        )
                      : "text-muted-foreground hover:bg-[oklch(1_0_0_/_4%)] hover:text-foreground border border-transparent"
                  )}
                >
                  <div className={cn(
                    "w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-all",
                    isActive
                      ? cn("bg-[oklch(1_0_0_/_6%)] border border-[oklch(1_0_0_/_8%)]", item.activeColor)
                      : "text-muted-foreground group-hover:text-foreground"
                  )}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className={cn(
                      "block text-sm leading-none",
                      isActive ? "font-medium text-foreground" : ""
                    )}>
                      {item.label}
                    </span>
                    {isActive && (
                      <span className="block text-[11px] text-muted-foreground/70 font-normal mt-1 leading-none truncate">
                        {item.description}
                      </span>
                    )}
                  </div>

                  {isActive && (
                    <div className={cn("w-1.5 h-1.5 rounded-full shrink-0 opacity-80", item.activeDot)} />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <Separator className="bg-sidebar-border" />

      {/* ── Footer ── */}
      <div className="px-5 py-4 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_oklch(0.75_0.18_160_/_60%)]" />
        <p className="text-[11px] text-muted-foreground/50">v0.1.0 · em desenvolvimento</p>
      </div>
    </aside>
  )
}
