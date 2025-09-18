import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, TrendingUp, Award, Target } from "lucide-react"

interface Insight {
  type: "achievement" | "trend" | "recommendation" | "milestone"
  title: string
  description: string
  value?: string
  priority: "high" | "medium" | "low"
}

interface RecentInsightsProps {
  insights: Insight[]
}

const insightIcons = {
  achievement: Award,
  trend: TrendingUp,
  recommendation: Lightbulb,
  milestone: Target,
}

const insightColors = {
  achievement: "bg-green-100 text-green-800",
  trend: "bg-blue-100 text-blue-800",
  recommendation: "bg-yellow-100 text-yellow-800",
  milestone: "bg-purple-100 text-purple-800",
}

const priorityColors = {
  high: "border-red-200 bg-red-50",
  medium: "border-yellow-200 bg-yellow-50",
  low: "border-green-200 bg-green-50",
}

export function RecentInsights({ insights }: RecentInsightsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Lightbulb className="h-5 w-5 mr-2" />
          Recent Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No insights available yet. Complete more activities to get personalized insights!</p>
            </div>
          ) : (
            insights.map((insight, index) => {
              const Icon = insightIcons[insight.type]
              return (
                <div key={index} className={`p-4 rounded-lg border-2 ${priorityColors[insight.priority]}`}>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Icon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{insight.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge className={insightColors[insight.type]}>{insight.type}</Badge>
                          {insight.value && <span className="text-sm font-medium">{insight.value}</span>}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{insight.description}</p>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
