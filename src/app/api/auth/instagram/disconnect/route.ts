import { NextResponse } from "next/server"

const COOKIES = [
  "ig_access_token",
  "ig_user_id",
  "ig_name",
  "ig_username",
  "ig_picture",
]

/**
 * POST /api/auth/instagram/disconnect
 * Remove todos os cookies da conta Instagram conectada.
 */
export async function POST() {
  const res = NextResponse.json({ ok: true })
  for (const name of COOKIES) {
    res.cookies.set(name, "", { maxAge: 0, path: "/" })
  }
  return res
}
