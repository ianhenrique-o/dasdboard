import { NextResponse } from "next/server"

/**
 * GET /api/auth/instagram
 * Inicia o fluxo OAuth do Meta para conectar uma conta do Instagram.
 */
export async function GET() {
  const appId = process.env.META_APP_ID
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const redirectUri = `${appUrl}/api/auth/instagram/callback`

  if (!appId) {
    return NextResponse.json(
      {
        error: "META_APP_ID não configurado",
        setup: "Crie um .env.local com META_APP_ID e META_APP_SECRET. Veja .env.local.example.",
      },
      { status: 500 }
    )
  }

  const scopes = [
    "instagram_basic",
    "instagram_manage_insights",
    "pages_show_list",
    "pages_read_engagement",
  ].join(",")

  const authUrl = new URL("https://www.facebook.com/v19.0/dialog/oauth")
  authUrl.searchParams.set("client_id", appId)
  authUrl.searchParams.set("redirect_uri", redirectUri)
  authUrl.searchParams.set("scope", scopes)
  authUrl.searchParams.set("response_type", "code")
  authUrl.searchParams.set("state", "ig_connect")

  return NextResponse.redirect(authUrl.toString())
}
