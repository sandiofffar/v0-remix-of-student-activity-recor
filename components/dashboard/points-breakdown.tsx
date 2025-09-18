import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface PointsBreakdownProps {
  totalPoints: number
  categoryPoints: {
    academic_points: number
    leadership_points: number
    community_points: number
    sports_points: number
    cultural_points: number
    technical_points: number
    entrepreneurship_points: number
  }
}

const categoryLabels = {
  academic_points: { label: "Academic Excellence", color: "bg-green-500" },
  leadership_points: { label: "Leadership", color: "bg-yellow-500" },
  community_points: { label: "Community Service", color: "bg-red-500" },
  sports_points: { label: "Sports & Recreation", color: "bg-blue-500" },
  cultural_points: { label: "Cultural Activities", color: "bg-purple-500" },
  technical_points: { label: "Technical Skills", color: "bg-cyan-500" },
  entrepreneurship_points: { label: "Entrepreneurship", color: "bg-orange-500" },
}

export function PointsBreakdown({ totalPoints, categoryPoints }: PointsBreakdownProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Points Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(categoryPoints).map(([key, points]) => {
            const category = categoryLabels[key as keyof typeof categoryLabels]
            const percentage = totalPoints > 0 ? (points / totalPoints) * 100 : 0

            return (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${category.color}`} />
                    <span>{category.label}</span>
                  </div>
                  <span className="font-medium">{points} pts</span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
