import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

  console.log("[v0] Auth callback - Code:", code ? "present" : "missing")
  console.log("[v0] Auth callback - Origin:", origin)
  console.log("[v0] Auth callback - Full URL:", request.url)

  if (code) {
    try {
      const supabase = createServerClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.log("[v0] Auth callback - Exchange error:", error.message)
        return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent(error.message)}`)
      }

      // Get user data to determine redirect based on role
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        console.log("[v0] Auth callback - User fetch error:", userError.message)
        return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent(userError.message)}`)
      }

      console.log("[v0] Auth callback - User type:", user?.user_metadata?.user_type)

      if (user?.user_metadata?.user_type === "faculty") {
        return NextResponse.redirect(`${origin}/faculty`)
      } else if (user?.user_metadata?.user_type === "admin") {
        return NextResponse.redirect(`${origin}/admin`)
      } else {
        return NextResponse.redirect(`${origin}/dashboard`)
      }
    } catch (error) {
      console.log("[v0] Auth callback - Unexpected error:", error)
      return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent("Authentication failed")}`)
    }
  }

  console.log("[v0] Auth callback - No code parameter found")
  return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent("No authentication code provided")}`)
}
