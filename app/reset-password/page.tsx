"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LanguageSelect } from "@/components/language-select"
import { useLanguage } from "@/lib/language-context"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { t } = useLanguage()
  const [email, setEmail] = useState("")
  const [token, setToken] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isCheckingParams, setIsCheckingParams] = useState(true)

  const passwordsMatch = !confirmPassword || password === confirmPassword

  // Extract token from URL params
  useEffect(() => {
    const tokenParam = searchParams.get("token") || ""
    
    setToken(tokenParam)
    
    // Small delay to ensure search params are loaded
    const timer = setTimeout(() => {
      setIsCheckingParams(false)
    }, 100)
    return () => clearTimeout(timer)
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) return
    if (!email) {
      setError(t.auth.resetPassword.missingEmail || "Email is required.")
      return
    }
    if (!token) {
      setError(t.auth.resetPassword.missingToken || "Reset token is missing. Please use the link from your email.")
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch("https://www.hymosetups.com/api/v1/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email,
          token,
          password,
          password_confirmation: confirmPassword,
        }),
      })

      const contentType = response.headers.get("content-type") || ""
      const data = contentType.includes("application/json")
        ? await response.json().catch(() => null)
        : await response.text().catch(() => "")

      if (!response.ok) {
        const errorMessage =
          (typeof data === "object" && data && "message" in data && typeof data.message === "string" && data.message) ||
          (typeof data === "object" && data && "error" in data && typeof data.error === "string" && data.error) ||
          (typeof data === "string" && data) ||
          t.auth.resetPassword.error || "Failed to reset password. Please try again."
        throw new Error(errorMessage)
      }

      // Success
      setSuccess(true)
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : t.auth.resetPassword.error || "Failed to reset password. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#1A191E]">
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-20 px-4 sm:px-6 md:px-12 lg:px-24 pt-0 backdrop-blur-md bg-transparent">
        <Link href="/" className="flex-shrink-0">
          <img src="/images/hymo-logo.png" alt="HYMO" className="h-8 w-auto" />
        </Link>
        <LanguageSelect />
      </header>
      <div className="absolute inset-0" aria-hidden="true">
        <Image
          src="/images/hero-bg.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center rotate-y-180"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/30 to-background/20" />
      </div>
      <section className="relative pt-24 pb-24 px-4 sm:px-6 md:px-12 lg:px-24 min-h-screen flex items-center justify-end overflow-hidden">
        <div className="absolute inset-0 bg-circuit opacity-[0.4]" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-transparent" aria-hidden />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[420px] rounded-full bg-primary/10 blur-[100px] pointer-events-none" aria-hidden />
        <div className="relative z-10 w-full max-w-md">
          <Card className="login-glass-card relative border-0 bg-transparent shadow-none overflow-hidden rounded-2xl backdrop-blur-sm">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/80 to-transparent shadow-[0_0_12px_oklch(0.65_0.28_328_/_0.6)]" />
            <CardHeader className="text-center pb-2 items-center">
              <div className="flex flex-row items-center justify-center mt-12">
                <Image src="/images/hymo-logo1.png" alt="HYMO" width={100} height={100} className="h-16 w-auto" />
              </div>
              <CardTitle className="font-display text-3xl uppercase mt-2 text-brand-gradient">
                {t.auth.resetPassword.title}
              </CardTitle>
              <CardDescription className="text-muted-foreground/90">{t.auth.resetPassword.subtitle}</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 pb-2">
                {isCheckingParams && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading...</span>
                  </div>
                )}
                {success && (
                  <div className="flex items-center gap-2 p-3 rounded-md bg-green-500/10 border border-green-500/20 text-sm text-green-400">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                    <span>{t.auth.resetPassword.success}</span>
                  </div>
                )}
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                {!isCheckingParams && !success && (
                  <>
                    {!token && (
                      <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span>{t.auth.resetPassword.missingToken || "Reset token is missing. Please use the link from your email."}</span>
                      </div>
                    )}
                    {token && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="reset-email" className="text-foreground/90">{t.auth.resetPassword.email}</Label>
                          <Input
                            id="reset-email"
                            type="email"
                            placeholder={t.auth.resetPassword.emailPlaceholder}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isSubmitting}
                            className="input-neon bg-white/[0.06] border-white/20 placeholder:text-muted-foreground/70 h-10 focus-visible:border-primary/50 focus-visible:ring-0"
                            autoComplete="email"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reset-password" className="text-foreground/90">{t.auth.resetPassword.password}</Label>
                          <Input
                            id="reset-password"
                            type="password"
                            placeholder="********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                            disabled={isSubmitting}
                            className="input-neon bg-white/[0.06] border-white/20 placeholder:text-muted-foreground/70 h-10 focus-visible:border-primary/50 focus-visible:ring-0"
                            autoComplete="new-password"
                          />
                          <p className="text-xs text-muted-foreground">{t.auth.resetPassword.passwordHint}</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reset-confirm" className="text-foreground/90">{t.auth.resetPassword.confirmPassword}</Label>
                          <Input
                            id="reset-confirm"
                            type="password"
                            placeholder="********"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={8}
                            disabled={isSubmitting}
                            className={`input-neon bg-white/[0.06] border-white/20 placeholder:text-muted-foreground/70 h-10 focus-visible:border-primary/50 focus-visible:ring-0 ${!passwordsMatch ? "border-destructive" : ""}`}
                            autoComplete="new-password"
                            aria-invalid={!passwordsMatch}
                          />
                          {!passwordsMatch && (
                            <p className="text-xs text-destructive">{t.auth.resetPassword.passwordMismatch}</p>
                          )}
                        </div>
                      </>
                    )}
                  </>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-4 pt-2">
                {!success && (
                  <Button
                    type="submit"
                    className="w-full h-10 glow-primary shadow-[0_0_20px_oklch(0.65_0.28_328_/_0.35)] hover:shadow-[0_0_28px_oklch(0.65_0.28_328_/_0.5)]"
                    size="lg"
                    disabled={!passwordsMatch || isSubmitting || !email || !token}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t.auth.resetPassword.submitting}
                      </>
                    ) : (
                      t.auth.resetPassword.submit
                    )}
                  </Button>
                )}
                <p className="text-sm text-muted-foreground text-center">
                  {t.auth.resetPassword.rememberPassword}{" "}
                  <Link href="/login" className="text-primary font-medium hover:underline">
                    {t.auth.resetPassword.loginLink}
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

function LoadingFallback() {
  const { t } = useLanguage()
  return (
    <main className="min-h-screen bg-[#1A191E]">
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-20 px-4 sm:px-6 md:px-12 lg:px-24 pt-0 backdrop-blur-md bg-transparent">
        <Link href="/" className="flex-shrink-0">
          <img src="/images/hymo-logo.png" alt="HYMO" className="h-8 w-auto" />
        </Link>
        <LanguageSelect />
      </header>
      <div className="absolute inset-0" aria-hidden="true">
        <Image
          src="/images/hero-bg-2.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center rotate-y-180"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/30 to-background/20" />
      </div>
      <section className="relative pt-24 pb-24 px-4 sm:px-6 md:px-12 lg:px-24 min-h-screen flex items-center justify-end overflow-hidden">
        <div className="relative z-10 w-full max-w-md">
          <Card className="login-glass-card relative border-0 bg-transparent shadow-none overflow-hidden rounded-2xl backdrop-blur-sm">
            <CardContent className="space-y-4 pb-8">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordContent />
    </Suspense>
  )
}
