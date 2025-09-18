import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertCircle } from "lucide-react"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const params = await searchParams
  const errorMessage = params?.message || params?.error

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold text-destructive">Authentication Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {errorMessage ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground bg-destructive/10 p-3 rounded-md">
                  Error: {decodeURIComponent(errorMessage)}
                </p>
                {errorMessage.includes("localhost") || errorMessage.includes("refused to connect") ? (
                  <div className="bg-yellow-50 p-3 rounded-md text-left">
                    <p className="text-xs text-yellow-800 font-medium mb-2">Troubleshooting Tips:</p>
                    <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
                      <li>Make sure your development server is running</li>
                      <li>Try opening the email link in the same browser where you registered</li>
                      <li>Copy the link and paste it directly in your browser address bar</li>
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">An authentication error occurred. Please try again.</p>
            )}
            <div className="pt-4 space-y-2">
              <Button asChild className="w-full">
                <Link href="/auth/login">Try Again</Link>
              </Button>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/auth/register">Create New Account</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
