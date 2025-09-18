import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { GraduationCap, Users, Award, BarChart3, FileText, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">Smart Student Hub</h1>
          </div>
          <div className="space-x-2">
            <Button asChild variant="outline">
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6 text-balance">
            Comprehensive Student Activity Management Platform
          </h2>
          <p className="text-xl text-gray-600 mb-8 text-pretty">
            Track, validate, and showcase your academic journey with our intelligent platform designed for Higher
            Education Institutions.
          </p>
          <div className="space-x-4">
            <Button asChild size="lg" className="text-lg px-8 py-3">
              <Link href="/auth/register">Start Your Journey</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-3 bg-transparent">
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Powerful Features</h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to manage and showcase student activities in one comprehensive platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="w-12 h-12 text-blue-600 mb-4" />
              <CardTitle>Real-time Dashboard</CardTitle>
              <CardDescription>
                Personalized dashboards with live updates on activity status, points, and achievements.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Shield className="w-12 h-12 text-green-600 mb-4" />
              <CardTitle>Faculty Validation</CardTitle>
              <CardDescription>
                Streamlined approval process with faculty panel for activity verification and point allocation.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <FileText className="w-12 h-12 text-purple-600 mb-4" />
              <CardTitle>Auto-Generated Portfolios</CardTitle>
              <CardDescription>
                Dynamic digital portfolios showcasing achievements, skills, and comprehensive activity records.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <BarChart3 className="w-12 h-12 text-orange-600 mb-4" />
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>
                Detailed insights and reports for students, faculty, and administrators with trend analysis.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Award className="w-12 h-12 text-red-600 mb-4" />
              <CardTitle>Smart Point System</CardTitle>
              <CardDescription>
                Intelligent scoring system with category-based multipliers and achievement recognition.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <GraduationCap className="w-12 h-12 text-indigo-600 mb-4" />
              <CardTitle>Multi-Role Support</CardTitle>
              <CardDescription>
                Tailored interfaces for students, faculty, and administrators with role-based permissions.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Transform Student Engagement?</h3>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of students and educators already using Smart Student Hub to track, validate, and showcase
            academic achievements.
          </p>
          <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-3">
            <Link href="/auth/register">Get Started Today</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <GraduationCap className="w-6 h-6" />
            <span className="text-lg font-semibold">Smart Student Hub</span>
          </div>
          <p className="text-gray-400">Empowering students and educators with comprehensive activity management.</p>
        </div>
      </footer>
    </div>
  )
}
