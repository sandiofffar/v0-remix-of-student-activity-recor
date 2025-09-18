"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PieChartIcon } from "lucide-react"
import dynamic from "next/dynamic"

const PieChart = dynamic(() => import("recharts").then((mod) => mod.PieChart), { ssr: false })
const Pie = dynamic(() => import("recharts").then((mod) => mod.Pie), { ssr: false })
const Cell = dynamic(() => import("recharts").then((mod) => mod.Cell), { ssr: false })
const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer), { ssr: false })
const Legend = dynamic(() => import("recharts").then((mod) => mod.Legend), { ssr: false })
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), { ssr: false })

interface CategoryBreakdownProps {
  categoryPoints: {
    academic_points: number
    leadership_points: number
    community_points: number
    sports_points: number
    cultural_points: number
    technical_points: number
    entrepreneurship_points: number
  }
  totalPoints: number
}

const categoryLabels = {
  academic_points: { label: "Academic Excellence", color: "#10b981" },
  leadership_points: { label: "Leadership", color: "#f59e0b" },
  community_points: { label: "Community Service", color: "#ef4444" },
  sports_points: { label: "Sports & Recreation", color: "#3b82f6" },
  cultural_points: { label: "Cultural Activities", color: "#8b5cf6" },
  technical_points: { label: "Technical Skills", color: "#06b6d4" },
  entrepreneurship_points: { label: "Entrepreneurship", color: "#f97316" },
}

export function CategoryBreakdown({ categoryPoints, totalPoints }: CategoryBreakdownProps) {
  const chartData = Object.entries(categoryPoints)
    .filter(([_, points]) => points > 0)
    .map(([key, points]) => ({
      name: categoryLabels[key as keyof typeof categoryLabels].label,
      value: points,
      color: categoryLabels[key as keyof typeof categoryLabels].color,
    }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <PieChartIcon className="h-5 w-5 mr-2" />
          Points Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} points`, "Points"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Breakdown List */}
          <div className="space-y-4">
            {Object.entries(categoryPoints).map(([key, points]) => {
              const category = categoryLabels[key as keyof typeof categoryLabels]
              const percentage = totalPoints > 0 ? (points / totalPoints) * 100 : 0

              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                      <span>{category.label}</span>
                    </div>
                    <span className="font-medium">
                      {points} pts ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
