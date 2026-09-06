import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"

export function extractUserId(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) return null
  const token = authHeader.split(" ")[1]
  const payload = verifyToken(token)
  return payload?.userId || null
}

export function requireAuth(
  request: NextRequest,
): { userId: string } | { response: NextResponse } {
  const userId = extractUserId(request)
  if (!userId) {
    return { response: NextResponse.json({ success: false, error: "未登录" }, { status: 401 }) }
  }
  return { userId }
}
