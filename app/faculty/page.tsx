"use client"

import { useState, useEffect } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { FacultyHeader } from "@/components/faculty/faculty-header"
import { FacultyStats } from "@/components/faculty/faculty-stats"
import { ApprovalCard } from "@/components/faculty/approval-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, Filter, RefreshCw } from "lucide-react"

interface Activity {
  id: string
  title: string
  description: string
  activity_date: string
  location?: string
  duration_hours?: number
  organizer?: string
  points_claimed: number
  evidence_urls?: string[]
  created_at: string
  student: {
    full_name: string
    student_id: string
    department: string
  }
  category: {
    name: string
    points_multiplier: number
  }
}

export default function FacultyPage() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, revision_required: 0 })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("pending")
  const [departmentFilter, setDepartmentFilter] = useState("all")

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      redirect("/auth/login")
      return
    }

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (!profile || (profile.user_type !== "faculty" && profile.user_type !== "admin")) {
      redirect("/auth/login")
      return
    }

    setUser(user)
    setProfile(profile)
    await loadData()
  }

  const loadData = async () => {
    setLoading(true)
    try {
      // Load activities
      const { data: activitiesData } = await supabase
        .from("activities")
        .select(`
          id,
          title,
          description,
          activity_date,
          location,
          duration_hours,
          organizer,
          points_claimed,
          evidence_urls,
          created_at,
          status,
          profiles!activities_student_id_fkey(full_name, student_id, department),
          activity_categories(name, points_multiplier)
        `)
        .order("created_at", { ascending: false })

      const formattedActivities =
        activitiesData?.map((activity) => ({
          ...activity,
          student: {
            full_name: activity.profiles?.full_name || "Unknown",
            student_id: activity.profiles?.student_id || "N/A",
            department: activity.profiles?.department || "Unknown",
          },
          category: {
            name: activity.activity_categories?.name || "Unknown",
            points_multiplier: activity.activity_categories?.points_multiplier || 1,
          },
        })) || []

      setActivities(formattedActivities)

      // Calculate stats
      const newStats = formattedActivities.reduce(
        (acc, activity) => {
          acc[activity.status as keyof typeof acc]++
          return acc
        },
        { pending: 0, approved: 0, rejected: 0, revision_required: 0 },
      )
      setStats(newStats)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.student.student_id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || activity.status === statusFilter
    const matchesDepartment = departmentFilter === "all" || activity.student.department === departmentFilter

    return matchesSearch && matchesStatus && matchesDepartment
  })

  const departments = Array.from(new Set(activities.map((a) => a.student.department))).filter(Boolean)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading faculty panel...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return null
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
          {/* Stats */}
          <FacultyStats stats={stats} />

          {/* Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Activity Reviews</CardTitle>
                <Button onClick={loadData} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search activities or students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="revision_required">Needs Revision</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="text-sm text-muted-foreground flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  {filteredActivities.length} of {activities.length} activities
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activities List */}
          <div className="space-y-4">
            {filteredActivities.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground">
                    {activities.length === 0 ? "No activities to review." : "No activities match your current filters."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredActivities.map((activity) => (
                <ApprovalCard key={activity.id} activity={activity} onUpdate={loadData} />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
