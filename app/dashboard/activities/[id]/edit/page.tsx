import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ActivityForm } from "@/components/activities/activity-form"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export default async function EditActivityPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
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

  // Get activity details
  const { data: activity } = await supabase
    .from("activities")
    .select("*")
    .eq("id", id)
    .eq("student_id", user.id)
    .single()

  if (!activity) {
    notFound()
  }

  // Check if activity can be edited
  if (activity.status !== "pending" && activity.status !== "revision_required") {
    redirect(`/dashboard/activities/${id}`)
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
          <ActivityForm
            categories={categories || []}
            initialData={{
              id: activity.id,
              title: activity.title,
              description: activity.description,
              category_id: activity.category_id,
              activity_date: activity.activity_date,
              duration_hours: activity.duration_hours,
              location: activity.location,
              organizer: activity.organizer,
              points_claimed: activity.points_claimed,
              evidence_urls: activity.evidence_urls || [],
            }}
            mode="edit"
          />
        </div>
      </main>
    </div>
  )
}
