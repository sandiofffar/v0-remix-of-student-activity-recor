import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, Code, Users, Lightbulb } from "lucide-react"

interface Skill {
  name: string
  level: number
  category: "technical" | "leadership" | "creative" | "analytical"
  activities_count: number
}

interface SkillsSectionProps {
  skills: Skill[]
}

const skillIcons = {
  technical: Code,
  leadership: Users,
  creative: Lightbulb,
  analytical: Brain,
}

const skillColors = {
  technical: "bg-blue-100 text-blue-800",
  leadership: "bg-green-100 text-green-800",
  creative: "bg-purple-100 text-purple-800",
  analytical: "bg-orange-100 text-orange-800",
}

export function SkillsSection({ skills }: SkillsSectionProps) {
  const groupedSkills = skills.reduce(
    (acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = []
      }
      acc[skill.category].push(skill)
      return acc
    },
    {} as Record<string, Skill[]>,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Brain className="h-5 w-5 mr-2" />
          Skills & Competencies
        </CardTitle>
      </CardHeader>
      <CardContent>
        {skills.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Skills will be automatically identified from your activities.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedSkills).map(([category, categorySkills]) => {
              const Icon = skillIcons[category as keyof typeof skillIcons]
              return (
                <div key={category}>
                  <div className="flex items-center mb-4">
                    <Icon className="h-4 w-4 mr-2" />
                    <h4 className="font-semibold capitalize">{category} Skills</h4>
                    <Badge className={skillColors[category as keyof typeof skillColors]} variant="secondary">
                      {categorySkills.length}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categorySkills.map((skill, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{skill.name}</span>
                          <span className="text-xs text-muted-foreground">{skill.activities_count} activities</span>
                        </div>
                        <Progress value={skill.level} className="h-2" />
                        <div className="text-xs text-muted-foreground">
                          {skill.level < 30 && "Beginner"}
                          {skill.level >= 30 && skill.level < 70 && "Intermediate"}
                          {skill.level >= 70 && "Advanced"}
                        </div>
                      </div>
                    ))}
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
