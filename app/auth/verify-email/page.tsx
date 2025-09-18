import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mail, AlertTriangle } from "lucide-react"

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
            <CardDescription className="text-base">We've sent you a verification link</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Please check your email and click the verification link to activate your Smart Student Hub account.
            </p>
            <p className="text-sm text-muted-foreground">
              Once verified, you'll be automatically redirected to your dashboard based on your role.
            </p>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded-md">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-medium text-amber-800 mb-1">Development Environment Note:</p>
                  <p className="text-xs text-amber-700 mb-2">
                    If clicking the email link shows "localhost refused to connect":
                  </p>
                  <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
                    <li>Make sure this development server is still running</li>
                    <li>Copy the link from your email and paste it in this browser tab</li>
                    <li>The link should work when pasted directly in the address bar</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-xs text-blue-700">
                <strong>Note:</strong> The verification link will redirect you back to the application automatically. No
                need to return to this page manually.
              </p>
            </div>
            <div className="pt-4">
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/auth/login">Back to Sign In</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
