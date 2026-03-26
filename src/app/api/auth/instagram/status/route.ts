import { NextRequest, NextResponse } from "next/server"

export interface InstagramStatus {
  connected: boolean
  configured: boolean  // META_APP_ID definido
  account?: {
    id: string
    name: string
    username: string
    picture: string
  }
}

/**
 * GET /api/auth/instagram/status
 * Retorna se há uma conta Instagram conectada e seus dados básicos.
 */
export async function GET(req: NextRequest): Promise<NextResponse<InstagramStatus>> {
  const configured = Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET)

  const token   = req.cookies.get("ig_access_token")?.value
  const userId  = req.cookies.get("ig_user_id")?.value
  const name    = req.cookies.get("ig_name")?.value
  const handle  = req.cookies.get("ig_username")?.value
  const picture = req.cookies.get("ig_picture")?.value

  if (!token || !userId) {
    return NextResponse.json({ connected: false, configured })
  }

  return NextResponse.json({
    connected: true,
    configured,
    account: {
      id:       userId,
      name:     name    ?? "",
      username: handle  ?? "",
      picture:  picture ?? "",
    },
  })
}
