"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MapPin, Clock, Edit, Eye, Search, Filter } from "lucide-react"
import Link from "next/link"

interface Activity {
  id: string
  title: string
  description: string
  status: "pending" | "approved" | "rejected" | "revision_required"
  activity_date: string
  location?: string
  duration_hours?: number
  points_claimed: number
  points_awarded?: number
  category: string
  created_at: string
}

interface ActivityListProps {
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

export function ActivityList({ activities }: ActivityListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")

  const filteredActivities = activities
    .filter((activity) => {
      const matchesSearch =
        activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.category.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || activity.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "points":
          return (b.points_awarded || b.points_claimed) - (a.points_awarded || a.points_claimed)
        case "date":
          return new Date(b.activity_date).getTime() - new Date(a.activity_date).getTime()
        default:
          return 0
      }
    })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Activities</h1>
          <p className="text-muted-foreground">Manage and track your submitted activities</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/activities/new">Submit New Activity</Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search activities..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="revision_required">Needs Revision</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="points">Highest Points</SelectItem>
                <SelectItem value="date">Activity Date</SelectItem>
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
              <p className="text-muted-foreground mb-4">
                {activities.length === 0 ? "No activities submitted yet." : "No activities match your current filters."}
              </p>
              {activities.length === 0 && (
                <Button asChild>
                  <Link href="/dashboard/activities/new">Submit Your First Activity</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredActivities.map((activity) => (
            <Card key={activity.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{activity.title}</h3>
                      <Badge className={statusColors[activity.status]}>{statusLabels[activity.status]}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{activity.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        {new Date(activity.activity_date).toLocaleDateString()}
                      </div>
                      {activity.location && (
                        <div className="flex items-center">
                          <MapPin className="mr-1 h-4 w-4" />
                          {activity.location}
                        </div>
                      )}
                      {activity.duration_hours && (
                        <div className="flex items-center">
                          <Clock className="mr-1 h-4 w-4" />
                          {activity.duration_hours}h
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Points</div>
                      <div className="font-semibold">
                        {activity.status === "approved"
                          ? `${activity.points_awarded} awarded`
                          : `${activity.points_claimed} claimed`}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/activities/${activity.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      {(activity.status === "pending" || activity.status === "revision_required") && (
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dashboard/activities/${activity.id}/edit`}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-sm font-medium text-primary">{activity.category}</span>
                  <span className="text-xs text-muted-foreground">
                    Submitted {new Date(activity.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
