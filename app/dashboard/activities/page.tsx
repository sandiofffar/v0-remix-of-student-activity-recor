import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ActivityList } from "@/components/activities/activity-list"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export default async function ActivitiesPage() {
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

  // Get all activities for the student
  const { data: activities } = await supabase
    .from("activities")
    .select(`
      id,
      title,
      description,
      status,
      activity_date,
      location,
      duration_hours,
      points_claimed,
      points_awarded,
      created_at,
      activity_categories(name)
    `)
    .eq("student_id", user.id)
    .order("created_at", { ascending: false })

  // Get unread notifications count
  const { count: unreadNotifications } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("read", false)

  const formattedActivities =
    activities?.map((activity) => ({
      ...activity,
      category: activity.activity_categories?.name || "Unknown",
    })) || []

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
        <div className="max-w-6xl mx-auto">
          <ActivityList activities={formattedActivities} />
        </div>
      </main>
    </div>
  )
}
