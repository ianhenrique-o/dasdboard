# CLAUDE.md — Dashboard CMS

Guia de contexto para agentes de IA e desenvolvedores trabalhando neste projeto.

---

## Stack Utilizada

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | Next.js (App Router) | 16.x |
| Linguagem | TypeScript | 5.x |
| Estilo | Tailwind CSS | 4.x |
| Componentes | shadcn/ui (manual) | — |
| Primitivos UI | Radix UI | latest |
| Ícones | Lucide React | latest |
| Utilitários | clsx + tailwind-merge | latest |

---

## Estrutura de Pastas

```
src/
├── app/
│   ├── (dashboard)/          # Route group com layout compartilhado (sidebar)
│   │   ├── layout.tsx        # Layout do dashboard (Sidebar + <main>)
│   │   ├── instagram/        # → /instagram
│   │   │   └── page.tsx
│   │   ├── analytics/        # → /analytics
│   │   │   └── page.tsx
│   │   ├── calendario/       # → /calendario
│   │   │   └── page.tsx
│   │   ├── concorrentes/     # → /concorrentes
│   │   │   └── page.tsx
│   │   └── noticias/         # → /noticias
│   │       └── page.tsx
│   ├── layout.tsx            # Root layout (fontes, metadata, dark mode global)
│   ├── page.tsx              # Redirect para /instagram
│   └── globals.css           # Tokens de design (CSS variables) + Tailwind base
├── components/
│   ├── ui/                   # Componentes shadcn/ui (Button, Card, Badge, Separator)
│   └── sidebar.tsx           # Navegação lateral compartilhada (Client Component)
└── lib/
    └── utils.ts              # Função cn() com clsx + tailwind-merge
```

---

## Padrões de Componentes

### shadcn/ui — Configuração Manual

O projeto usa Tailwind v4, que não é suportado pelo CLI do shadcn v2 (`tailwind.config.ts`
não existe). Os componentes são criados manualmente em `src/components/ui/` seguindo
a estrutura do shadcn.

**Componentes disponíveis:**
- `Button` — variantes: `default | outline | secondary | ghost | destructive | link`
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- `Badge` — variantes: `default | secondary | outline | success | warning | destructive`
- `Separator`

**Para adicionar novos componentes:** copiar o código da documentação oficial e adaptar
os tokens de cor para CSS variables conforme os existentes.

### Convenções de Código

- **Server Components por padrão.** Usar `"use client"` apenas quando necessário
  (hooks, interatividade, Radix primitives que usam refs/eventos).
- **Tailwind inline:** todos os estilos via `className`. Sem CSS modules.
- **`cn()`:** sempre usar `cn()` de `@/lib/utils` para combinar classes condicionais.
- **Imports com alias `@/`** para tudo dentro de `src/`.

### Estrutura de Página (padrão)

```tsx
// Server Component (sem "use client")
export default function NomePage() {
  return (
    <div className="p-8 space-y-8">
      {/* Header com ícone + título + ação primária */}
      {/* Grid de KPIs/stats */}
      {/* Conteúdo principal */}
      {/* Card placeholder para funcionalidades futuras */}
    </div>
  )
}
```

---

## Tema e Design

### Tema Escuro Global

O tema escuro é o **único tema** — não há toggle light/dark. Configurado em:
- `src/app/globals.css`: variáveis CSS definidas no `:root` com valores escuros.
- `src/app/layout.tsx`: classe `dark` adicionada estaticamente na tag `<html>`.

### Tokens de Cor (CSS Variables)

Todos os tokens seguem o padrão shadcn/ui e são mapeados via `@theme inline`:
- `--background` / `--foreground` — fundo e texto principal
- `--card` — fundos de cards
- `--muted` / `--muted-foreground` — elementos secundários
- `--primary` — cor de destaque (roxo/violeta)
- `--border` / `--input` — bordas e inputs
- `--sidebar` / `--sidebar-*` — tokens exclusivos da sidebar

### Cores de Acento por Seção

| Seção | Cor | Classe Tailwind |
|-------|-----|----------------|
| Instagram | Rosa | `bg-pink-500/15`, `text-pink-400` |
| Analytics | Azul | `bg-blue-500/15`, `text-blue-400` |
| Calendário | Violeta | `bg-violet-500/15`, `text-violet-400` |
| Concorrentes | Laranja | `bg-orange-500/15`, `text-orange-400` |
| Notícias | Ciano | `bg-cyan-500/15`, `text-cyan-400` |

---

## Decisões Importantes

### 1. Route Group `(dashboard)`

Usado para compartilhar o layout com Sidebar entre todas as 5 seções sem afetar as URLs.
O grupo `(dashboard)` não aparece na URL — `/instagram`, `/analytics`, etc. são diretas.

### 2. Sidebar como Client Component

A `Sidebar` usa `"use client"` por depender de `usePathname()` para detectar a rota ativa
e aplicar o estilo de seleção. Apenas este componente é cliente; as páginas são Server Components.

### 3. Tailwind v4 sem `tailwind.config.ts`

O Tailwind v4 usa `@tailwindcss/postcss` e configura tudo via `globals.css` com `@theme inline`.
Extensões de tema são feitas via CSS variables — não editar um arquivo de configuração.

### 4. shadcn/ui instalado manualmente

O CLI do shadcn v4 exige conexão com `ui.shadcn.com`. O CLI v2 não suporta Tailwind v4.
Solução: componentes criados manualmente seguindo as convenções do shadcn, compatíveis
com futuras atualizações da biblioteca.

### 5. Dados mockados (sem API)

Todas as páginas usam dados estáticos hardcoded como placeholders visuais.
Ao implementar funcionalidades reais, criar `src/lib/api/` ou `src/services/`
e substituir os dados mockados por chamadas reais.

---

## Scripts Disponíveis

```bash
npm run dev      # Servidor de desenvolvimento (porta 3000)
npm run build    # Build de produção
npm run start    # Iniciar servidor de produção
npm run lint     # ESLint
npx tsc --noEmit # Verificação de tipos TypeScript
```
