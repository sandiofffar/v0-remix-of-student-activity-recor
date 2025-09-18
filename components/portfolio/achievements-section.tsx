import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Award, Trophy, Star, Target } from "lucide-react"

interface Achievement {
  title: string
  description: string
  category: string
  points: number
  date: string
  type: "milestone" | "excellence" | "leadership" | "participation"
}

interface AchievementsSectionProps {
  achievements: Achievement[]
}

const achievementIcons = {
  milestone: Trophy,
  excellence: Award,
  leadership: Star,
  participation: Target,
}

const achievementColors = {
  milestone: "bg-yellow-100 text-yellow-800",
  excellence: "bg-purple-100 text-purple-800",
  leadership: "bg-blue-100 text-blue-800",
  participation: "bg-green-100 text-green-800",
}

export function AchievementsSection({ achievements }: AchievementsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Award className="h-5 w-5 mr-2" />
          Key Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        {achievements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No achievements yet. Keep participating in activities to earn achievements!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {achievements.map((achievement, index) => {
              const Icon = achievementIcons[achievement.type]
              return (
                <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{achievement.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge className={achievementColors[achievement.type]}>{achievement.type}</Badge>
                        <span className="text-sm font-medium">{achievement.points} pts</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{achievement.category}</span>
                      <span>{new Date(achievement.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
