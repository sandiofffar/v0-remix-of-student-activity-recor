"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface ActivityTrendsChartProps {
  data: Array<{
    month: string
    activities: number
    points: number
  }>
}

export function ActivityTrendsChart({ data }: ActivityTrendsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="activities"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Activities"
              />
              <Line yAxisId="right" type="monotone" dataKey="points" stroke="#10b981" strokeWidth={2} name="Points" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
