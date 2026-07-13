"use client"

import { useActionState } from "react"
import { authenticate } from "@/app/login/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function LoginForm() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined
  )

  return (
    <Card className="w-full max-w-sm border-white/20 bg-white/10 backdrop-blur-md shadow-2xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight text-white">
          Sign In
        </CardTitle>
        <CardDescription className="text-white/70">
          Enter your email and password.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              className="bg-white/20 border-white/10 text-white placeholder:text-white/50 focus-visible:ring-white/30"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              className="bg-white/20 border-white/10 text-white placeholder:text-white/50 focus-visible:ring-white/30"
            />
          </div>

          {errorMessage && (
            <div className="text-sm text-red-300 font-medium bg-red-950/50 p-2 rounded-md border border-red-500/30">
              {errorMessage}
            </div>
          )}
        </CardContent>
        <CardFooter className="mt-6">
          <Button
            className="w-full bg-white text-black hover:bg-gray-200 transition-colors"
            type="submit"
            disabled={isPending}
          >
            {isPending ? "Authenticating..." : "Sign in"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
