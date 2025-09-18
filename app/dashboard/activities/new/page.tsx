import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ActivityForm } from "@/components/activities/activity-form"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export default async function NewActivityPage() {
  const supabase = await createClient()

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.user_type !== "student") {
    redirect("/auth/login")
  }

  // Get activity categories
  const { data: categories } = await supabase.from("activity_categories").select("*").order("name")

  // Get unread notifications count
  const { count: unreadNotifications } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("read", false)

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        user={{
          full_name: profile.full_name,
          email: profile.email,
          avatar_url: profile.avatar_url,
        }}
        unreadNotifications={unreadNotifications || 0}
      />

      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          <ActivityForm categories={categories || []} mode="create" />
        </div>
      </main>
    </div>
  )
}
