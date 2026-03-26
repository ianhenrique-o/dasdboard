import { NextRequest, NextResponse } from "next/server"

const COOKIE_TOKEN   = "ig_access_token"
const COOKIE_USER_ID = "ig_user_id"
const COOKIE_NAME    = "ig_name"
const COOKIE_HANDLE  = "ig_username"
const COOKIE_PICTURE = "ig_picture"
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 24 * 60 * 60, // 60 dias
}

/**
 * GET /api/auth/instagram/callback
 * Recebe o código OAuth do Meta, troca por token de longa duração
 * e armazena as informações da conta em cookies HTTP-only.
 */
export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const redirectUri = `${appUrl}/api/auth/instagram/callback`
  const { searchParams } = new URL(req.url)

  const code  = searchParams.get("code")
  const error = searchParams.get("error")
  const errorDesc = searchParams.get("error_description")

  if (error || !code) {
    const msg = encodeURIComponent(errorDesc ?? error ?? "Acesso negado")
    return NextResponse.redirect(new URL(`/instagram?auth=error&msg=${msg}`, appUrl))
  }

  try {
    // 1. Trocar código por token de curta duração
    const tokenRes = await fetch("https://graph.facebook.com/v19.0/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id:     process.env.META_APP_ID!,
        client_secret: process.env.META_APP_SECRET!,
        redirect_uri:  redirectUri,
        code,
      }),
    })
    const tokenData = await tokenRes.json()
    if (tokenData.error) throw new Error(tokenData.error.message)

    // 2. Trocar por token de longa duração (~60 dias)
    const longRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?` +
      `grant_type=fb_exchange_token` +
      `&client_id=${process.env.META_APP_ID}` +
      `&client_secret=${process.env.META_APP_SECRET}` +
      `&fb_exchange_token=${tokenData.access_token}`
    )
    const longData = await longRes.json()
    const accessToken: string = longData.access_token ?? tokenData.access_token

    // 3. Buscar páginas do Facebook com conta Instagram Business vinculada
    const pagesRes = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts` +
      `?fields=instagram_business_account{id,name,username,profile_picture_url,followers_count}` +
      `&access_token=${accessToken}`
    )
    const pagesData = await pagesRes.json()

    // Pega o primeiro Instagram Business Account encontrado
    const igAccount = pagesData.data
      ?.map((p: Record<string, unknown>) => p.instagram_business_account)
      .find(Boolean) as Record<string, string> | undefined

    if (!igAccount) {
      // Token válido mas sem conta Business vinculada
      const response = NextResponse.redirect(
        new URL("/instagram?auth=no_business", appUrl)
      )
      response.cookies.set(COOKIE_TOKEN, accessToken, COOKIE_OPTS)
      return response
    }

    // 4. Armazenar dados da conta em cookies
    const response = NextResponse.redirect(new URL("/instagram?auth=success", appUrl))
    response.cookies.set(COOKIE_TOKEN,   accessToken,                  COOKIE_OPTS)
    response.cookies.set(COOKIE_USER_ID, igAccount.id ?? "",           COOKIE_OPTS)
    response.cookies.set(COOKIE_NAME,    igAccount.name ?? "",          COOKIE_OPTS)
    response.cookies.set(COOKIE_HANDLE,  igAccount.username ?? "",      COOKIE_OPTS)
    response.cookies.set(COOKIE_PICTURE, igAccount.profile_picture_url ?? "", COOKIE_OPTS)

    return response
  } catch (e) {
    const msg = encodeURIComponent(e instanceof Error ? e.message : "Erro ao conectar")
    return NextResponse.redirect(new URL(`/instagram?auth=error&msg=${msg}`, appUrl))
  }
}
