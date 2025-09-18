"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Target, Plus } from "lucide-react"

interface Goal {
  id: string
  title: string
  description: string
  target: number
  current: number
  deadline: string
  category: string
}

interface GoalTrackingProps {
  goals: Goal[]
}

export function GoalTracking({ goals }: GoalTrackingProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Goal Tracking
          </CardTitle>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Goal
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {goals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No goals set yet. Set goals to track your progress!</p>
              <Button className="mt-4 bg-transparent" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Set Your First Goal
              </Button>
            </div>
          ) : (
            goals.map((goal) => {
              const progress = (goal.current / goal.target) * 100
              const isOverdue = new Date(goal.deadline) < new Date()
              const daysLeft = Math.ceil(
                (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
              )

              return (
                <div key={goal.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{goal.title}</h4>
                      <p className="text-sm text-muted-foreground">{goal.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {goal.current} / {goal.target}
                      </div>
                      <div className={`text-xs ${isOverdue ? "text-red-600" : "text-muted-foreground"}`}>
                        {isOverdue ? "Overdue" : `${daysLeft} days left`}
                      </div>
                    </div>
                  </div>
                  <Progress value={Math.min(progress, 100)} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{goal.category}</span>
                    <span>{progress.toFixed(1)}% complete</span>
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
