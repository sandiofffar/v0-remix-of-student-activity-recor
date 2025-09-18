import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function FacultyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user profile to check if they're faculty or admin
  const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).single()

  if (!profile || (profile.user_type !== "faculty" && profile.user_type !== "admin")) {
    // Redirect non-faculty to appropriate dashboard
    if (profile?.user_type === "student") {
      redirect("/dashboard")
    } else {
      redirect("/auth/login")
    }
  }

  return <>{children}</>
}
