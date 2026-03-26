import { NextResponse } from "next/server"

// ─── Types ────────────────────────────────────────────────────────────────────

export type NewsTopic = "ferramentas" | "pesquisa" | "negocios" | "geral"

export interface NewsItem {
  id: string
  title: string
  source: string
  link: string
  publishedAt: string
  summary: string
  topic: NewsTopic
}

export interface NewsPayload {
  items: NewsItem[]
  source: "rss" | "mock"
  fetchedAt: string
}

// ─── RSS Feeds ────────────────────────────────────────────────────────────────

const FEEDS = [
  { url: "https://neilpatel.com/feed/",                          source: "Neil Patel" },
  { url: "https://blog.hubspot.com/marketing/rss.xml",           source: "HubSpot" },
  { url: "https://www.searchenginejournal.com/feed/",            source: "Search Engine Journal" },
  { url: "https://www.socialmediaexaminer.com/feed/",            source: "Social Media Examiner" },
  { url: "https://moz.com/blog/feed",                            source: "Moz Blog" },
  { url: "https://contentmarketinginstitute.com/feed/",          source: "Content Marketing Inst." },
  { url: "https://feeds.feedburner.com/entrepreneur/latest",     source: "Entrepreneur" },
  { url: "https://www.marketingprofs.com/rss/articles.rss",      source: "MarketingProfs" },
]

// ─── XML helpers ──────────────────────────────────────────────────────────────

function stripCdata(s: string): string {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
}

function stripHtml(s: string): string {
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#\d+;/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function getTagContent(xml: string, tag: string): string {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i")
  const match = xml.match(re)
  return match ? stripCdata(match[1]).trim() : ""
}

// ─── Topic classification ─────────────────────────────────────────────────────

const TOPIC_KEYWORDS: Record<NewsTopic, string[]> = {
  ferramentas: [
    "tool", "platform", "app", "software", "plugin", "integration",
    "feature", "launch", "automation", "ai", "chatgpt", "gpt", "api",
    "saas", "dashboard", "extension", "update", "release", "ferramenta",
    "plataforma", "recurso", "atualização",
  ],
  pesquisa: [
    "study", "research", "report", "survey", "data", "statistics", "stat",
    "analysis", "trend", "benchmark", "findings", "according to", "percent",
    "%", "pesquisa", "relatório", "estudo", "dados", "análise",
  ],
  negocios: [
    "business", "strategy", "brand", "revenue", "market", "growth", "roi",
    "budget", "agency", "client", "b2b", "ecommerce", "e-commerce", "sales",
    "campaign", "advertising", "ads", "negócio", "empresa", "mercado",
    "estratégia", "receita", "campanha", "anúncio",
  ],
  geral: [],
}

function classifyTopic(title: string, summary: string): NewsTopic {
  const text = (title + " " + summary).toLowerCase()
  const scores: Record<NewsTopic, number> = { ferramentas: 0, pesquisa: 0, negocios: 0, geral: 0 }

  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS) as [NewsTopic, string[]][]) {
    if (topic === "geral") continue
    scores[topic] = keywords.filter((k) => text.includes(k)).length
  }

  const max = Math.max(scores.ferramentas, scores.pesquisa, scores.negocios)
  if (max === 0) return "geral"
  if (scores.ferramentas === max) return "ferramentas"
  if (scores.pesquisa === max) return "pesquisa"
  return "negocios"
}

// ─── Feed parser ──────────────────────────────────────────────────────────────

async function parseFeed(url: string, source: string): Promise<NewsItem[]> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; RSS Reader/1.0)" },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 1800 },
    })
    if (!res.ok) return []
    const xml = await res.text()

    const items: NewsItem[] = []
    const itemPattern = /<item[^>]*>([\s\S]*?)<\/item>/gi
    let match: RegExpExecArray | null

    while ((match = itemPattern.exec(xml)) !== null) {
      const block = match[1]
      const title = stripHtml(getTagContent(block, "title"))
      const link =
        getTagContent(block, "link").replace(/\s/g, "") ||
        getTagContent(block, "guid")
      const pubDate =
        getTagContent(block, "pubDate") ||
        getTagContent(block, "dc:date") ||
        getTagContent(block, "published")
      const description = stripHtml(
        getTagContent(block, "description") ||
        getTagContent(block, "content:encoded") ||
        getTagContent(block, "summary")
      )

      if (!title || title.length < 5) continue

      const summary =
        description.slice(0, 220) + (description.length > 220 ? "…" : "")
      const topic = classifyTopic(title, description)

      let publishedAt: string
      try {
        publishedAt = pubDate ? new Date(pubDate).toISOString() : new Date().toISOString()
        if (isNaN(new Date(publishedAt).getTime())) publishedAt = new Date().toISOString()
      } catch {
        publishedAt = new Date().toISOString()
      }

      items.push({
        id: `${source}::${link || title}`,
        title,
        source,
        link,
        publishedAt,
        summary,
        topic,
      })

      if (items.length >= 10) break
    }

    return items
  } catch {
    return []
  }
}

// ─── Mock fallback ────────────────────────────────────────────────────────────

const MOCK_ITEMS: NewsItem[] = [
  {
    id: "mock-1",
    title: "ChatGPT Enterprise ganha novas integrações com ferramentas de marketing",
    source: "Marketing Week",
    link: "#",
    publishedAt: new Date(Date.now() - 1 * 3600_000).toISOString(),
    summary: "OpenAI anuncia parcerias com HubSpot, Mailchimp e outras plataformas, permitindo automação direta de campanhas via prompts em linguagem natural.",
    topic: "ferramentas",
  },
  {
    id: "mock-2",
    title: "Pesquisa: 73% das marcas vão aumentar investimento em IA generativa em 2026",
    source: "HubSpot",
    link: "#",
    publishedAt: new Date(Date.now() - 3 * 3600_000).toISOString(),
    summary: "Estudo com 4.200 profissionais de marketing aponta que a criação de conteúdo com IA é a principal prioridade de investimento para o próximo ano.",
    topic: "pesquisa",
  },
  {
    id: "mock-3",
    title: "Google Ads lança novo formato de campanha baseado em Performance Max com IA",
    source: "Search Engine Journal",
    link: "#",
    publishedAt: new Date(Date.now() - 5 * 3600_000).toISOString(),
    summary: "A atualização permite que o algoritmo do Google otimize automaticamente criativos, lances e públicos em tempo real, reduzindo trabalho manual de gestores.",
    topic: "ferramentas",
  },
  {
    id: "mock-4",
    title: "Relatório revela que conteúdo em vídeo curto gera 3x mais engajamento",
    source: "Social Media Examiner",
    link: "#",
    publishedAt: new Date(Date.now() - 8 * 3600_000).toISOString(),
    summary: "Dados de 2025 mostram que Reels e TikToks com menos de 60 segundos superam posts estáticos em alcance orgânico, mesmo para marcas B2B.",
    topic: "pesquisa",
  },
  {
    id: "mock-5",
    title: "Agências de marketing digital crescem 28% no Brasil em 2025",
    source: "Entrepreneur",
    link: "#",
    publishedAt: new Date(Date.now() - 12 * 3600_000).toISOString(),
    summary: "Setor impulsionado pela digitalização de pequenas empresas e pela demanda por gestão profissional de redes sociais, aponta levantamento da ABRADI.",
    topic: "negocios",
  },
  {
    id: "mock-6",
    title: "Semrush lança ferramenta de análise de concorrentes com IA integrada",
    source: "Moz Blog",
    link: "#",
    publishedAt: new Date(Date.now() - 18 * 3600_000).toISOString(),
    summary: "Nova funcionalidade permite identificar lacunas de conteúdo e oportunidades de SEO em relação a concorrentes com apenas um clique.",
    topic: "ferramentas",
  },
  {
    id: "mock-7",
    title: "Email marketing ainda supera redes sociais em ROI, aponta novo estudo",
    source: "MarketingProfs",
    link: "#",
    publishedAt: new Date(Date.now() - 24 * 3600_000).toISOString(),
    summary: "Com retorno médio de R$42 para cada R$1 investido, o email se mantém como o canal de maior ROI no marketing digital, segundo análise de 2.000 campanhas.",
    topic: "pesquisa",
  },
  {
    id: "mock-8",
    title: "Meta anuncia novo modelo de atribuição para anúncios no Instagram e Facebook",
    source: "Neil Patel",
    link: "#",
    publishedAt: new Date(Date.now() - 30 * 3600_000).toISOString(),
    summary: "Mudança afeta como as conversões são contabilizadas nas campanhas, podendo impactar o ROAS reportado em até 15% dependendo do setor de atuação.",
    topic: "negocios",
  },
  {
    id: "mock-9",
    title: "TikTok Shop expande para o Brasil com integração nativa de checkout",
    source: "Content Marketing Inst.",
    link: "#",
    publishedAt: new Date(Date.now() - 36 * 3600_000).toISOString(),
    summary: "Social commerce ganha força no mercado brasileiro com a chegada do TikTok Shop, que permite compras sem sair do feed, aumentando taxas de conversão.",
    topic: "negocios",
  },
  {
    id: "mock-10",
    title: "Canva lança recursos de edição de vídeo com IA para criadores de conteúdo",
    source: "Social Media Examiner",
    link: "#",
    publishedAt: new Date(Date.now() - 48 * 3600_000).toISOString(),
    summary: "Novos filtros inteligentes, geração automática de legendas e sugestões de corte tornam o Canva um concorrente direto de ferramentas como CapCut e Premiere Rush.",
    topic: "ferramentas",
  },
]

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET() {
  const results = await Promise.allSettled(
    FEEDS.map((f) => parseFeed(f.url, f.source))
  )

  const items: NewsItem[] = []
  for (const r of results) {
    if (r.status === "fulfilled") items.push(...r.value)
  }

  if (items.length === 0) {
    return NextResponse.json({
      items: MOCK_ITEMS,
      source: "mock",
      fetchedAt: new Date().toISOString(),
    } satisfies NewsPayload)
  }

  items.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )

  return NextResponse.json({
    items: items.slice(0, 40),
    source: "rss",
    fetchedAt: new Date().toISOString(),
  } satisfies NewsPayload)
}
