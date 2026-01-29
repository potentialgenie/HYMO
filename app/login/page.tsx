"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/lib/language-context"
import { Navbar } from "@/components/navbar"
import { storeAuthData, type LoginResponse } from "@/lib/auth"
import { Loader2, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("https://www.hymosetups.com/api/v1/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const contentType = response.headers.get("content-type") || ""
      const data: LoginResponse | string = contentType.includes("application/json")
        ? await response.json().catch(() => null)
        : await response.text().catch(() => "")

      if (!response.ok) {
        // Handle validation errors or other API errors
        const errorMessage =
          (typeof data === "object" && data && "message" in data && typeof data.message === "string" && data.message) ||
          (typeof data === "object" && data && "error" in data && typeof data.error === "string" && data.error) ||
          (typeof data === "string" && data) ||
          "Login failed. Please check your credentials and try again."
        throw new Error(errorMessage)
      }

      // Success - store auth data
      if (typeof data === "object" && data && "access_token" in data) {
        storeAuthData(data as LoginResponse)
        // Redirect to home page after successful login
        router.push("/")
      } else {
        throw new Error("Invalid response from server")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#1A191E]">
      <Navbar />
      <div className="absolute inset-0" aria-hidden="true">
        <Image
          src="/images/hero-bg.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>
      <section className="relative pt-24 pb-24 px-4 sm:px-6 md:px-12 lg:px-24 min-h-screen flex items-center justify-center lg:justify-end overflow-hidden">
        <div className="absolute inset-0 bg-circuit opacity-[0.4]" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-transparent" aria-hidden />
        <div className="relative z-10 w-full max-w-md">
          <Card className="login-glass-card relative border-0 bg-transparent shadow-none overflow-hidden rounded-2xl backdrop-blur-sm">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/80 to-transparent shadow-[0_0_12px_oklch(0.65_0.28_328_/_0.6)]" />
            <CardHeader className="text-center pb-2 items-center">
              <div className="flex flex-row items-center justify-center mt-12">
                <Image src="/images/hymo-logo1.png" alt="HYMO" width={100} height={100} className="h-16 w-auto" />
              </div>
              <CardTitle className="font-display text-3xl uppercase mt-2 text-brand-gradient">
                {t.auth.login.title}
              </CardTitle>
              <CardDescription className="text-muted-foreground/90">{t.auth.login.subtitle}</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 pb-2">
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-foreground/90">{t.auth.login.email}</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder={t.auth.login.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="input-neon bg-white/[0.06] border-white/20 placeholder:text-muted-foreground/70 h-10 focus-visible:border-primary/50 focus-visible:ring-0"
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-foreground/90">{t.auth.login.password}</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="input-neon bg-white/[0.06] border-white/20 placeholder:text-muted-foreground/70 h-10 focus-visible:border-primary/50 focus-visible:ring-0"
                    autoComplete="current-password"
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Use your account email</span>
                    <Link href="/forgot-password" className="text-primary hover:underline">
                      {t.auth.login.forgotPassword || "Forgot password?"}
                    </Link>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4 pt-2">
                <Button
                  type="submit"
                  className="w-full h-10 glow-primary shadow-[0_0_20px_oklch(0.65_0.28_328_/_0.35)] hover:shadow-[0_0_28px_oklch(0.65_0.28_328_/_0.5)]"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t.auth.login.submitting}
                    </>
                  ) : (
                    t.auth.login.submit
                  )}
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  {t.auth.login.noAccount}{" "}
                  <Link href="/register" className="text-primary font-medium hover:underline">
                    {t.auth.login.registerLink}
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </section>
    </main>
  )
}
