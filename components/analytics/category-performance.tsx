"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface CategoryPerformanceProps {
  data: Array<{
    category: string
    activities: number
    points: number
    avgPoints: number
  }>
}

export function CategoryPerformance({ data }: CategoryPerformanceProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="category" type="category" width={120} />
              <Tooltip />
              <Bar dataKey="points" fill="#3b82f6" name="Total Points" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
