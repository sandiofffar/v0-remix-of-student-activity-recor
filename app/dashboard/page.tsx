import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { StatsCard } from "@/components/dashboard/stats-card"
import { RecentActivities } from "@/components/dashboard/recent-activities"
import { PointsBreakdown } from "@/components/dashboard/points-breakdown"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Award, Activity, Clock, TrendingUp } from "lucide-react"

export default async function DashboardPage() {
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

  // Get portfolio data
  const { data: portfolio } = await supabase.from("portfolios").select("*").eq("student_id", user.id).single()

  // Get recent activities
  const { data: activities } = await supabase
    .from("activities")
    .select(`
      id,
      title,
      status,
      activity_date,
      location,
      duration_hours,
      points_claimed,
      points_awarded,
      activity_categories(name)
    `)
    .eq("student_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  // Get unread notifications count
  const { count: unreadNotifications } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("read", false)

  // Get activity stats
  const { count: totalActivities } = await supabase
    .from("activities")
    .select("*", { count: "exact", head: true })
    .eq("student_id", user.id)

  const { count: pendingActivities } = await supabase
    .from("activities")
    .select("*", { count: "exact", head: true })
    .eq("student_id", user.id)
    .eq("status", "pending")

  const { count: approvedActivities } = await supabase
    .from("activities")
    .select("*", { count: "exact", head: true })
    .eq("student_id", user.id)
    .eq("status", "approved")

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
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Points"
              value={portfolio?.total_points || 0}
              description="Accumulated points"
              icon={Award}
              trend={{ value: 12, isPositive: true }}
            />
            <StatsCard
              title="Total Activities"
              value={totalActivities || 0}
              description="Activities submitted"
              icon={Activity}
            />
            <StatsCard
              title="Pending Review"
              value={pendingActivities || 0}
              description="Awaiting approval"
              icon={Clock}
            />
            <StatsCard
              title="Approved"
              value={approvedActivities || 0}
              description="Successfully validated"
              icon={TrendingUp}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activities - Takes 2 columns */}
            <div className="lg:col-span-2">
              <RecentActivities activities={formattedActivities} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <QuickActions unreadNotifications={unreadNotifications || 0} />

              {portfolio && (
                <PointsBreakdown
                  totalPoints={portfolio.total_points}
                  categoryPoints={{
                    academic_points: portfolio.academic_points,
                    leadership_points: portfolio.leadership_points,
                    community_points: portfolio.community_points,
                    sports_points: portfolio.sports_points,
                    cultural_points: portfolio.cultural_points,
                    technical_points: portfolio.technical_points,
                    entrepreneurship_points: portfolio.entrepreneurship_points,
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
