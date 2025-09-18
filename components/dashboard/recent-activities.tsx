import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Clock, ExternalLink } from "lucide-react"
import Link from "next/link"

interface Activity {
  id: string
  title: string
  category: string
  status: "pending" | "approved" | "rejected" | "revision_required"
  activity_date: string
  location?: string
  duration_hours?: number
  points_claimed: number
  points_awarded?: number
}

interface RecentActivitiesProps {
  activities: Activity[]
}

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

export function RecentActivities({ activities }: RecentActivitiesProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Your latest submitted activities</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/activities">
              View All <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No activities submitted yet.</p>
              <Button asChild className="mt-4">
                <Link href="/dashboard/activities/new">Submit Your First Activity</Link>
              </Button>
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium truncate">{activity.title}</h4>
                    <Badge className={statusColors[activity.status]}>{statusLabels[activity.status]}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{activity.category}</p>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      {new Date(activity.activity_date).toLocaleDateString()}
                    </div>
                    {activity.location && (
                      <div className="flex items-center">
                        <MapPin className="mr-1 h-3 w-3" />
                        {activity.location}
                      </div>
                    )}
                    {activity.duration_hours && (
                      <div className="flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        {activity.duration_hours}h
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-sm">
                    <span className="text-muted-foreground">Points: </span>
                    <span className="font-medium">
                      {activity.status === "approved" ? activity.points_awarded : activity.points_claimed}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
