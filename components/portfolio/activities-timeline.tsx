import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Clock, ExternalLink } from "lucide-react"

interface Activity {
  id: string
  title: string
  description: string
  category: string
  activity_date: string
  location?: string
  duration_hours?: number
  points_awarded: number
  evidence_urls?: string[]
}

interface ActivitiesTimelineProps {
  activities: Activity[]
}

const categoryColors: Record<string, string> = {
  "Academic Excellence": "bg-green-100 text-green-800",
  Leadership: "bg-yellow-100 text-yellow-800",
  "Community Service": "bg-red-100 text-red-800",
  "Sports & Recreation": "bg-blue-100 text-blue-800",
  "Cultural Activities": "bg-purple-100 text-purple-800",
  "Technical Skills": "bg-cyan-100 text-cyan-800",
  Entrepreneurship: "bg-orange-100 text-orange-800",
}

export function ActivitiesTimeline({ activities }: ActivitiesTimelineProps) {
  const sortedActivities = activities.sort(
    (a, b) => new Date(b.activity_date).getTime() - new Date(a.activity_date).getTime(),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Activities Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedActivities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No approved activities yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedActivities.map((activity, index) => (
              <div key={activity.id} className="relative">
                {index < sortedActivities.length - 1 && <div className="absolute left-4 top-12 w-0.5 h-16 bg-border" />}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold truncate">{activity.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge className={categoryColors[activity.category] || "bg-gray-100 text-gray-800"}>
                          {activity.category}
                        </Badge>
                        <span className="text-sm font-medium">{activity.points_awarded} pts</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{activity.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
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
                    {activity.evidence_urls && activity.evidence_urls.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Evidence:</span>
                        {activity.evidence_urls.slice(0, 2).map((url, urlIndex) => (
                          <a
                            key={urlIndex}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center"
                          >
                            <ExternalLink className="mr-1 h-3 w-3" />
                            Link {urlIndex + 1}
                          </a>
                        ))}
                        {activity.evidence_urls.length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{activity.evidence_urls.length - 2} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
