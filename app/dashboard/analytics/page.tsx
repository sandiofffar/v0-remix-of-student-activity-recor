import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ProgressMetrics } from "@/components/analytics/progress-metrics"
import { ActivityTrendsChart } from "@/components/analytics/activity-trends-chart"
import { CategoryPerformance } from "@/components/analytics/category-performance"
import { RecentInsights } from "@/components/analytics/recent-insights"
import { GoalTracking } from "@/components/analytics/goal-tracking"

export default async function AnalyticsPage() {
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

  // Get all activities for analytics
  const { data: activities } = await supabase
    .from("activities")
    .select(`
      *,
      activity_categories(name, points_multiplier)
    `)
    .eq("student_id", user.id)
    .order("created_at", { ascending: false })

  // Get unread notifications count
  const { count: unreadNotifications } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("read", false)

  // Process data for analytics
  const analyticsData = processAnalyticsData(activities || [])
  const insights = generateInsights(activities || [], portfolio)
  const goals = generateSampleGoals(portfolio)

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
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Track your progress and discover insights about your activities</p>
          </div>

          {/* Progress Metrics */}
          <ProgressMetrics metrics={analyticsData.metrics} />

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ActivityTrendsChart data={analyticsData.trendsData} />
            <CategoryPerformance data={analyticsData.categoryData} />
          </div>

          {/* Insights and Goals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentInsights insights={insights} />
            <GoalTracking goals={goals} />
          </div>
        </div>
      </main>
    </div>
  )
}

// Helper function to process analytics data
function processAnalyticsData(activities: any[]) {
  const approvedActivities = activities.filter((a) => a.status === "approved")
  const totalActivities = activities.length
  const totalApproved = approvedActivities.length
  const totalPoints = approvedActivities.reduce((sum, a) => sum + (a.points_awarded || 0), 0)

  // Generate monthly trends data
  const monthlyData = new Map()
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
    monthlyData.set(monthKey, { month: monthKey, activities: 0, points: 0 })
  }

  approvedActivities.forEach((activity) => {
    const date = new Date(activity.activity_date)
    const monthKey = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
    if (monthlyData.has(monthKey)) {
      const data = monthlyData.get(monthKey)
      data.activities += 1
      data.points += activity.points_awarded || 0
    }
  })

  // Generate category performance data
  const categoryMap = new Map()
  approvedActivities.forEach((activity) => {
    const category = activity.activity_categories?.name || "Unknown"
    if (!categoryMap.has(category)) {
      categoryMap.set(category, { category, activities: 0, points: 0, avgPoints: 0 })
    }
    const data = categoryMap.get(category)
    data.activities += 1
    data.points += activity.points_awarded || 0
    data.avgPoints = data.points / data.activities
  })

  return {
    metrics: {
      totalPoints,
      totalActivities: totalApproved,
      approvalRate: totalActivities > 0 ? (totalApproved / totalActivities) * 100 : 0,
      avgPointsPerActivity: totalApproved > 0 ? totalPoints / totalApproved : 0,
      monthlyGrowth: {
        points: Math.floor(Math.random() * 20) - 5, // Mock data
        activities: Math.floor(Math.random() * 15) - 3, // Mock data
      },
    },
    trendsData: Array.from(monthlyData.values()),
    categoryData: Array.from(categoryMap.values()),
  }
}

// Helper function to generate insights
function generateInsights(activities: any[], portfolio: any) {
  const insights = []
  const approvedActivities = activities.filter((a) => a.status === "approved")

  // Achievement insights
  if (portfolio?.total_points >= 100) {
    insights.push({
      type: "achievement" as const,
      title: "Milestone Reached!",
      description: "You've earned over 100 points! You're in the top 25% of active students.",
      value: `${portfolio.total_points} pts`,
      priority: "high" as const,
    })
  }

  // Trend insights
  const recentActivities = approvedActivities.filter(
    (a) => new Date(a.activity_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  )
  if (recentActivities.length >= 3) {
    insights.push({
      type: "trend" as const,
      title: "Great Momentum!",
      description: "You've been very active this month with multiple approved activities.",
      value: `${recentActivities.length} activities`,
      priority: "medium" as const,
    })
  }

  // Recommendation insights
  const categoryPoints = {
    academic: portfolio?.academic_points || 0,
    leadership: portfolio?.leadership_points || 0,
    community: portfolio?.community_points || 0,
  }
  const lowestCategory = Object.entries(categoryPoints).reduce((a, b) => (a[1] < b[1] ? a : b))
  if (lowestCategory[1] < 20) {
    insights.push({
      type: "recommendation" as const,
      title: "Diversify Your Activities",
      description: `Consider participating in more ${lowestCategory[0]} activities to build a well-rounded profile.`,
      priority: "medium" as const,
    })
  }

  return insights
}

// Helper function to generate sample goals
function generateSampleGoals(portfolio: any) {
  const goals = []

  if (portfolio?.total_points < 200) {
    goals.push({
      id: "1",
      title: "Reach 200 Points",
      description: "Earn 200 total activity points by end of semester",
      target: 200,
      current: portfolio?.total_points || 0,
      deadline: "2024-12-31",
      category: "Academic Progress",
    })
  }

  if (portfolio?.leadership_points < 50) {
    goals.push({
      id: "2",
      title: "Leadership Development",
      description: "Earn 50 points in leadership activities",
      target: 50,
      current: portfolio?.leadership_points || 0,
      deadline: "2024-11-30",
      category: "Leadership",
    })
  }

  return goals
}
