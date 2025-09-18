"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar, MapPin, Clock, User, ExternalLink, Check, X, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

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

interface ApprovalCardProps {
  activity: Activity
  onUpdate: () => void
}

export function ApprovalCard({ activity, onUpdate }: ApprovalCardProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [showRejectionDialog, setShowRejectionDialog] = useState(false)
  const [pointsAwarded, setPointsAwarded] = useState(activity.points_claimed.toString())
  const [rejectionReason, setRejectionReason] = useState("")

  const handleApprove = async () => {
    setIsLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const finalPoints = Math.round(Number.parseInt(pointsAwarded) * activity.category.points_multiplier)

      const { error } = await supabase
        .from("activities")
        .update({
          status: "approved",
          points_awarded: finalPoints,
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", activity.id)

      if (error) throw error

      setShowApprovalDialog(false)
      onUpdate()
    } catch (error) {
      console.error("Error approving activity:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from("activities")
        .update({
          status: "rejected",
          rejection_reason: rejectionReason,
        })
        .eq("id", activity.id)

      if (error) throw error

      setShowRejectionDialog(false)
      onUpdate()
    } catch (error) {
      console.error("Error rejecting activity:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestRevision = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from("activities")
        .update({
          status: "revision_required",
          rejection_reason: rejectionReason,
        })
        .eq("id", activity.id)

      if (error) throw error

      setShowRejectionDialog(false)
      onUpdate()
    } catch (error) {
      console.error("Error requesting revision:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const suggestedPoints = Math.round(activity.points_claimed * activity.category.points_multiplier)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{activity.title}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              <div className="flex items-center">
                <User className="mr-1 h-4 w-4" />
                {activity.student.full_name} ({activity.student.student_id})
              </div>
              <div>{activity.student.department}</div>
            </div>
            <Badge variant="outline" className="mb-3">
              {activity.category.name}
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Points Claimed</div>
            <div className="text-2xl font-bold">{activity.points_claimed}</div>
            <div className="text-xs text-muted-foreground">
              Suggested: {suggestedPoints} (×{activity.category.points_multiplier})
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Description</h4>
          <p className="text-sm text-muted-foreground line-clamp-3">{activity.description}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">Date</div>
              <div className="text-muted-foreground">{new Date(activity.activity_date).toLocaleDateString()}</div>
            </div>
          </div>

          {activity.duration_hours && (
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">Duration</div>
                <div className="text-muted-foreground">{activity.duration_hours}h</div>
              </div>
            </div>
          )}

          {activity.location && (
            <div className="flex items-center">
              <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">Location</div>
                <div className="text-muted-foreground">{activity.location}</div>
              </div>
            </div>
          )}

          <div>
            <div className="font-medium">Submitted</div>
            <div className="text-muted-foreground">{new Date(activity.created_at).toLocaleDateString()}</div>
          </div>
        </div>

        {activity.evidence_urls && activity.evidence_urls.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Evidence ({activity.evidence_urls.length})</h4>
            <div className="flex flex-wrap gap-2">
              {activity.evidence_urls.slice(0, 3).map((url, index) => (
                <Button key={index} asChild variant="outline" size="sm">
                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs">
                    <ExternalLink className="mr-1 h-3 w-3" />
                    Evidence {index + 1}
                  </a>
                </Button>
              ))}
              {activity.evidence_urls.length > 3 && (
                <span className="text-xs text-muted-foreground self-center">
                  +{activity.evidence_urls.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t">
          <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
            <DialogTrigger asChild>
              <Button className="flex-1">
                <Check className="mr-2 h-4 w-4" />
                Approve
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Approve Activity</DialogTitle>
                <DialogDescription>Review and approve this activity submission.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="points">Points to Award</Label>
                  <Input
                    id="points"
                    type="number"
                    value={pointsAwarded}
                    onChange={(e) => setPointsAwarded(e.target.value)}
                    min="0"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Suggested: {suggestedPoints} points (claimed {activity.points_claimed} ×{" "}
                    {activity.category.points_multiplier} multiplier)
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleApprove} disabled={isLoading} className="flex-1">
                    {isLoading ? "Approving..." : "Approve Activity"}
                  </Button>
                  <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="flex-1">
                <X className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reject or Request Revision</DialogTitle>
                <DialogDescription>Provide feedback for the student.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="reason">Reason for rejection/revision</Label>
                  <Textarea
                    id="reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide specific feedback..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleRequestRevision}
                    disabled={isLoading || !rejectionReason.trim()}
                    variant="outline"
                    className="flex-1 bg-transparent"
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    {isLoading ? "Processing..." : "Request Revision"}
                  </Button>
                  <Button
                    onClick={handleReject}
                    disabled={isLoading || !rejectionReason.trim()}
                    variant="destructive"
                    className="flex-1"
                  >
                    <X className="mr-2 h-4 w-4" />
                    {isLoading ? "Processing..." : "Reject"}
                  </Button>
                </div>
                <Button variant="ghost" onClick={() => setShowRejectionDialog(false)} className="w-full">
                  Cancel
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
