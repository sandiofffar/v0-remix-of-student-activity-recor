import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Download, Share2 } from "lucide-react"

interface PortfolioHeaderProps {
  student: {
    full_name: string
    student_id: string
    department: string
    email: string
    phone?: string
    avatar_url?: string
  }
  portfolio: {
    total_points: number
    total_activities: number
    last_generated_at?: string
  }
}

export function PortfolioHeader({ student, portfolio }: PortfolioHeaderProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <Avatar className="h-24 w-24 border-4 border-white/20">
            <AvatarImage src={student.avatar_url || "/placeholder.svg"} alt={student.full_name} />
            <AvatarFallback className="text-2xl bg-white/20">{getInitials(student.full_name)}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{student.full_name}</h1>
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <Badge variant="secondary" className="bg-white/20 text-white">
                {student.student_id}
              </Badge>
              <span className="text-white/90">{student.department}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-white/70">Email</div>
                <div>{student.email}</div>
              </div>
              {student.phone && (
                <div>
                  <div className="text-white/70">Phone</div>
                  <div>{student.phone}</div>
                </div>
              )}
              <div>
                <div className="text-white/70">Portfolio Updated</div>
                <div>
                  {portfolio.last_generated_at ? new Date(portfolio.last_generated_at).toLocaleDateString() : "Never"}
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-6 mb-4">
              <div>
                <div className="text-3xl font-bold">{portfolio.total_points}</div>
                <div className="text-white/70 text-sm">Total Points</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{portfolio.total_activities}</div>
                <div className="text-white/70 text-sm">Activities</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="secondary" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
