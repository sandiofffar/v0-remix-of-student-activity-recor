import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Clock, Edit, ExternalLink, User } from "lucide-react"
import Link from "next/link"

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  revision_required: "bg-orange-100 text-orange-800",
}

const statusLabels = {
  pending: "Pending Review",
  approved: "Approved",
  rejected: "Rejected",
  revision_required: "Needs Revision",
}

export default async function ActivityDetailPage({
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
    .select(`
      *,
      activity_categories(name, description, points_multiplier),
      approved_by_profile:profiles!activities_approved_by_fkey(full_name)
    `)
    .eq("id", id)
    .eq("student_id", user.id)
    .single()

  if (!activity) {
    notFound()
  }

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
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{activity.title}</h1>
              <p className="text-muted-foreground">Activity Details</p>
            </div>
            <div className="flex gap-2">
              {(activity.status === "pending" || activity.status === "revision_required") && (
                <Button asChild variant="outline">
                  <Link href={`/dashboard/activities/${activity.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Activity
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline">
                <Link href="/dashboard/activities">Back to Activities</Link>
              </Button>
            </div>
          </div>

          {/* Status Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge className={statusColors[activity.status]} className="text-sm px-3 py-1">
                    {statusLabels[activity.status]}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    Submitted on {new Date(activity.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Points</div>
                  <div className="text-2xl font-bold">
                    {activity.status === "approved"
                      ? `${activity.points_awarded} awarded`
                      : `${activity.points_claimed} claimed`}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Activity Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-muted-foreground whitespace-pre-wrap">{activity.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">Activity Date</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(activity.activity_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {activity.duration_hours && (
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">Duration</div>
                          <div className="text-sm text-muted-foreground">{activity.duration_hours} hours</div>
                        </div>
                      </div>
                    )}

                    {activity.location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">Location</div>
                          <div className="text-sm text-muted-foreground">{activity.location}</div>
                        </div>
                      </div>
                    )}

                    {activity.organizer && (
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">Organizer</div>
                          <div className="text-sm text-muted-foreground">{activity.organizer}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Evidence */}
              {activity.evidence_urls && activity.evidence_urls.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Supporting Evidence</CardTitle>
                    <CardDescription>Documents and links provided as evidence</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {activity.evidence_urls.map((url: string, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <span className="text-sm truncate flex-1 mr-4">{url}</span>
                          <Button asChild variant="outline" size="sm">
                            <a href={url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Rejection Reason */}
              {activity.status === "rejected" && activity.rejection_reason && (
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-red-600">Rejection Reason</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-red-700">{activity.rejection_reason}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Category Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="font-medium">{activity.activity_categories?.name}</div>
                      <div className="text-sm text-muted-foreground">{activity.activity_categories?.description}</div>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Points Multiplier: </span>
                      <span className="font-medium">{activity.activity_categories?.points_multiplier}x</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Approval Info */}
              {activity.status === "approved" && activity.approved_by && (
                <Card>
                  <CardHeader>
                    <CardTitle>Approval Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <div className="text-sm text-muted-foreground">Approved by</div>
                        <div className="font-medium">{activity.approved_by_profile?.full_name}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Approved on</div>
                        <div className="font-medium">{new Date(activity.approved_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
