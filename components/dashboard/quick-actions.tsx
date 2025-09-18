import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, FileText, Award, BarChart3, Bell } from "lucide-react"
import Link from "next/link"

interface QuickActionsProps {
  unreadNotifications: number
}

export function QuickActions({ unreadNotifications }: QuickActionsProps) {
  const actions = [
    {
      title: "Submit Activity",
      description: "Add a new activity to your record",
      icon: Plus,
      href: "/dashboard/activities/new",
      variant: "default" as const,
    },
    {
      title: "View Portfolio",
      description: "See your digital portfolio",
      icon: FileText,
      href: "/dashboard/portfolio",
      variant: "outline" as const,
    },
    {
      title: "Achievements",
      description: "View your accomplishments",
      icon: Award,
      href: "/dashboard/achievements",
      variant: "outline" as const,
    },
    {
      title: "Analytics",
      description: "Track your progress",
      icon: BarChart3,
      href: "/dashboard/analytics",
      variant: "outline" as const,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <Button
              key={action.title}
              asChild
              variant={action.variant}
              className="h-auto p-4 flex flex-col items-center space-y-2"
            >
              <Link href={action.href}>
                <action.icon className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </Link>
            </Button>
          ))}
        </div>

        {unreadNotifications > 0 && (
          <div className="mt-4 pt-4 border-t">
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/dashboard/notifications" className="flex items-center justify-center space-x-2">
                <Bell className="h-4 w-4" />
                <span>View Notifications ({unreadNotifications})</span>
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
