import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardLayout({
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

  // Get user profile to check if they're a student
  const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).single()

  if (!profile || profile.user_type !== "student") {
    // Redirect non-students to appropriate dashboard
    if (profile?.user_type === "faculty") {
      redirect("/faculty")
    } else if (profile?.user_type === "admin") {
      redirect("/admin")
    } else {
      redirect("/auth/login")
    }
  }

  return <>{children}</>
}
