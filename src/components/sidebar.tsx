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
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    description: "Métricas e desempenho",
  },
  {
    label: "Calendário",
    href: "/calendario",
    icon: CalendarDays,
    description: "Agendamento de conteúdo",
  },
  {
    label: "Concorrentes",
    href: "/concorrentes",
    icon: Users,
    description: "Rastreamento competitivo",
  },
  {
    label: "Notícias",
    href: "/noticias",
    icon: Newspaper,
    description: "Consolidador de notícias",
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex flex-col w-60 shrink-0 h-screen sticky top-0 bg-sidebar border-r border-sidebar-border">
      {/* Logo / Header */}
      <div className="flex items-center gap-2.5 px-5 h-16 shrink-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20">
          <LayoutDashboard className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground leading-none">CMS Dashboard</p>
          <p className="text-xs text-muted-foreground mt-0.5">Gestão de Conteúdo</p>
        </div>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="px-2 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Menu
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
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 shrink-0 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="block">{item.label}</span>
                    {isActive && (
                      <span className="block text-[11px] text-muted-foreground font-normal truncate">
                        {item.description}
                      </span>
                    )}
                  </div>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <Separator className="bg-sidebar-border" />

      {/* Footer */}
      <div className="px-5 py-4">
        <p className="text-[11px] text-muted-foreground">v0.1.0 — em desenvolvimento</p>
      </div>
    </aside>
  )
}
