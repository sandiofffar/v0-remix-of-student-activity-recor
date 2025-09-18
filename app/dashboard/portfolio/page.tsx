import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { PortfolioHeader } from "@/components/portfolio/portfolio-header"
import { AchievementsSection } from "@/components/portfolio/achievements-section"
import { ActivitiesTimeline } from "@/components/portfolio/activities-timeline"
import { SkillsSection } from "@/components/portfolio/skills-section"
import { CategoryBreakdown } from "@/components/portfolio/category-breakdown"

export default async function PortfolioPage() {
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

  // Get approved activities
  const { data: activities } = await supabase
    .from("activities")
    .select(`
      id,
      title,
      description,
      activity_date,
      location,
      duration_hours,
      points_awarded,
      evidence_urls,
      activity_categories(name)
    `)
    .eq("student_id", user.id)
    .eq("status", "approved")
    .order("activity_date", { ascending: false })

  // Get unread notifications count
  const { count: unreadNotifications } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("read", false)

  // Generate achievements based on activities
  const achievements = generateAchievements(activities || [], portfolio)

  // Generate skills based on activities
  const skills = generateSkills(activities || [])

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
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Portfolio Header */}
          <PortfolioHeader
            student={{
              full_name: profile.full_name,
              student_id: profile.student_id || "N/A",
              department: profile.department || "Unknown",
              email: profile.email,
              phone: profile.phone,
              avatar_url: profile.avatar_url,
            }}
            portfolio={{
              total_points: portfolio?.total_points || 0,
              total_activities: portfolio?.total_activities || 0,
              last_generated_at: portfolio?.last_generated_at,
            }}
          />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <AchievementsSection achievements={achievements} />
              <ActivitiesTimeline activities={formattedActivities} />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {portfolio && (
                <CategoryBreakdown
                  categoryPoints={{
                    academic_points: portfolio.academic_points,
                    leadership_points: portfolio.leadership_points,
                    community_points: portfolio.community_points,
                    sports_points: portfolio.sports_points,
                    cultural_points: portfolio.cultural_points,
                    technical_points: portfolio.technical_points,
                    entrepreneurship_points: portfolio.entrepreneurship_points,
                  }}
                  totalPoints={portfolio.total_points}
                />
              )}
              <SkillsSection skills={skills} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// Helper function to generate achievements based on activities
function generateAchievements(activities: any[], portfolio: any) {
  const achievements = []

  // Milestone achievements
  if (portfolio?.total_points >= 100) {
    achievements.push({
      title: "Century Achiever",
      description: "Earned 100+ activity points",
      category: "Milestone",
      points: portfolio.total_points,
      date: new Date().toISOString(),
      type: "milestone" as const,
    })
  }

  if (portfolio?.total_activities >= 10) {
    achievements.push({
      title: "Active Participant",
      description: "Completed 10+ activities",
      category: "Participation",
      points: portfolio.total_activities * 5,
      date: new Date().toISOString(),
      type: "participation" as const,
    })
  }

  // Excellence achievements
  const highPointActivities = activities.filter((a) => a.points_awarded >= 50)
  if (highPointActivities.length >= 3) {
    achievements.push({
      title: "Excellence Seeker",
      description: "Completed 3+ high-impact activities (50+ points each)",
      category: "Excellence",
      points: 75,
      date: new Date().toISOString(),
      type: "excellence" as const,
    })
  }

  // Leadership achievements
  if (portfolio?.leadership_points >= 50) {
    achievements.push({
      title: "Leadership Champion",
      description: "Demonstrated strong leadership skills",
      category: "Leadership",
      points: portfolio.leadership_points,
      date: new Date().toISOString(),
      type: "leadership" as const,
    })
  }

  return achievements
}

// Helper function to generate skills based on activities
function generateSkills(activities: any[]) {
  const skillsMap = new Map()

  activities.forEach((activity) => {
    const category = activity.activity_categories?.name
    let skills: string[] = []

    // Map categories to skills
    switch (category) {
      case "Academic Excellence":
        skills = ["Research", "Critical Thinking", "Problem Solving"]
        break
      case "Leadership":
        skills = ["Team Management", "Communication", "Decision Making"]
        break
      case "Community Service":
        skills = ["Social Awareness", "Empathy", "Project Management"]
        break
      case "Sports & Recreation":
        skills = ["Teamwork", "Discipline", "Physical Fitness"]
        break
      case "Cultural Activities":
        skills = ["Creativity", "Cultural Awareness", "Artistic Expression"]
        break
      case "Technical Skills":
        skills = ["Programming", "Technical Analysis", "Innovation"]
        break
      case "Entrepreneurship":
        skills = ["Business Development", "Strategic Thinking", "Risk Management"]
        break
    }

    skills.forEach((skill) => {
      if (!skillsMap.has(skill)) {
        skillsMap.set(skill, {
          name: skill,
          level: 0,
          category: getCategoryForSkill(skill),
          activities_count: 0,
        })
      }
      const skillData = skillsMap.get(skill)
      skillData.level = Math.min(100, skillData.level + 15)
      skillData.activities_count += 1
    })
  })

  return Array.from(skillsMap.values())
}

function getCategoryForSkill(skill: string): "technical" | "leadership" | "creative" | "analytical" {
  const technicalSkills = ["Programming", "Technical Analysis", "Innovation"]
  const leadershipSkills = ["Team Management", "Communication", "Decision Making", "Project Management"]
  const creativeSkills = ["Creativity", "Artistic Expression", "Cultural Awareness"]
  const analyticalSkills = ["Research", "Critical Thinking", "Problem Solving", "Strategic Thinking"]

  if (technicalSkills.includes(skill)) return "technical"
  if (leadershipSkills.includes(skill)) return "leadership"
  if (creativeSkills.includes(skill)) return "creative"
  return "analytical"
}
