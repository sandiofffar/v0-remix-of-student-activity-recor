"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { FacultyHeader } from "@/components/faculty/faculty-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Users, Activity, Award, TrendingUp } from "lucide-react"

export default function FacultyAnalyticsPage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<any>(null)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState("all")

  useEffect(() => {
    loadData()
  }, [timeFilter])

  const loadData = async () => {
    setLoading(true)
    try {
      // Get user profile
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      setProfile(profileData)

      // Get analytics data
      const { data: activities } = await supabase
        .from("activities")
        .select(`
          *,
          profiles!activities_student_id_fkey(full_name, department),
          activity_categories(name)
        `)
        .order("created_at", { ascending: false })

      const { data: students } = await supabase.from("profiles").select("*").eq("user_type", "student")

      // Process analytics
      const processed = processAnalytics(activities || [], students || [])
      setAnalyticsData(processed)
    } catch (error) {
      console.error("Error loading analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !profile || !analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <FacultyHeader
        user={{
          full_name: profile.full_name,
          email: profile.email,
          avatar_url: profile.avatar_url,
          department: profile.department,
        }}
      />

      <main className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Faculty Analytics</h1>
              <p className="text-muted-foreground">Insights into student activity patterns and performance</p>
            </div>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="semester">This Semester</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.totalStudents}</div>
                <p className="text-xs text-muted-foreground">Active students</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.totalActivities}</div>
                <p className="text-xs text-muted-foreground">Submitted activities</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.approvalRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Activities approved</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Points</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.avgPoints.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">Per approved activity</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Performance by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.departmentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="activities" fill="#3b82f6" name="Activities" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {analyticsData.categoryData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.topStudents.map((student: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold">{student.name}</div>
                        <div className="text-sm text-muted-foreground">{student.department}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{student.points} points</div>
                      <div className="text-sm text-muted-foreground">{student.activities} activities</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

// Helper function to process analytics data
function processAnalytics(activities: any[], students: any[]) {
  const approvedActivities = activities.filter((a) => a.status === "approved")
  const totalActivities = activities.length
  const totalApproved = approvedActivities.length

  // Department data
  const departmentMap = new Map()
  students.forEach((student) => {
    const dept = student.department || "Unknown"
    if (!departmentMap.has(dept)) {
      departmentMap.set(dept, { department: dept, students: 0, activities: 0, points: 0 })
    }
    departmentMap.get(dept).students += 1
  })

  activities.forEach((activity) => {
    const dept = activity.profiles?.department || "Unknown"
    if (departmentMap.has(dept)) {
      departmentMap.get(dept).activities += 1
      if (activity.status === "approved") {
        departmentMap.get(dept).points += activity.points_awarded || 0
      }
    }
  })

  // Category data
  const categoryMap = new Map()
  const categoryColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316"]
  let colorIndex = 0

  approvedActivities.forEach((activity) => {
    const category = activity.activity_categories?.name || "Unknown"
    if (!categoryMap.has(category)) {
      categoryMap.set(category, {
        name: category,
        value: 0,
        color: categoryColors[colorIndex % categoryColors.length],
      })
      colorIndex++
    }
    categoryMap.get(category).value += 1
  })

  // Top students (mock data based on activities)
  const studentPerformance = new Map()
  approvedActivities.forEach((activity) => {
    const studentName = activity.profiles?.full_name || "Unknown"
    const studentDept = activity.profiles?.department || "Unknown"
    if (!studentPerformance.has(studentName)) {
      studentPerformance.set(studentName, {
        name: studentName,
        department: studentDept,
        activities: 0,
        points: 0,
      })
    }
    const student = studentPerformance.get(studentName)
    student.activities += 1
    student.points += activity.points_awarded || 0
  })

  const topStudents = Array.from(studentPerformance.values())
    .sort((a, b) => b.points - a.points)
    .slice(0, 5)

  return {
    totalStudents: students.length,
    totalActivities,
    approvalRate: totalActivities > 0 ? (totalApproved / totalActivities) * 100 : 0,
    avgPoints:
      totalApproved > 0 ? approvedActivities.reduce((sum, a) => sum + (a.points_awarded || 0), 0) / totalApproved : 0,
    departmentData: Array.from(departmentMap.values()),
    categoryData: Array.from(categoryMap.values()),
    topStudents,
  }
}
