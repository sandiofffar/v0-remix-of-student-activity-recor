import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface ProgressMetricsProps {
  metrics: {
    totalPoints: number
    totalActivities: number
    approvalRate: number
    avgPointsPerActivity: number
    monthlyGrowth: {
      points: number
      activities: number
    }
  }
}

export function ProgressMetrics({ metrics }: ProgressMetricsProps) {
  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-600" />
  }

  const getTrendColor = (value: number) => {
    if (value > 0) return "text-green-600"
    if (value < 0) return "text-red-600"
    return "text-gray-600"
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Points</CardTitle>
          {getTrendIcon(metrics.monthlyGrowth.points)}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalPoints}</div>
          <p className={`text-xs ${getTrendColor(metrics.monthlyGrowth.points)}`}>
            {metrics.monthlyGrowth.points > 0 ? "+" : ""}
            {metrics.monthlyGrowth.points}% from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
          {getTrendIcon(metrics.monthlyGrowth.activities)}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalActivities}</div>
          <p className={`text-xs ${getTrendColor(metrics.monthlyGrowth.activities)}`}>
            {metrics.monthlyGrowth.activities > 0 ? "+" : ""}
            {metrics.monthlyGrowth.activities}% from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.approvalRate.toFixed(1)}%</div>
          <Progress value={metrics.approvalRate} className="mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Points/Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.avgPointsPerActivity.toFixed(1)}</div>
          <p className="text-xs text-muted-foreground">Per approved activity</p>
        </CardContent>
      </Card>
    </div>
  )
}
