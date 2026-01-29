"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LanguageSelect } from "@/components/language-select"
import { useLanguage } from "@/lib/language-context"
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

function EmailVerifyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { t } = useLanguage()
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isCheckingParams, setIsCheckingParams] = useState(true)
  const [email, setEmail] = useState<string>("")
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [resendError, setResendError] = useState<string | null>(null)

  const verificationParams = useMemo(() => {
    const id = searchParams.get("id") || ""
    const hash = searchParams.get("hash") || ""
    const expires = searchParams.get("expires") || ""
    const signature = searchParams.get("signature") || ""
    return { id, hash, expires, signature }
  }, [searchParams])

  const allPresent = verificationParams.id && verificationParams.hash && verificationParams.expires && verificationParams.signature

  // Wait for search params to be available before checking
  useEffect(() => {
    // Get email from URL params if available
    const emailParam = searchParams.get("email") || ""
    setEmail(emailParam)
    
    // Small delay to ensure search params are loaded
    const timer = setTimeout(() => {
      setIsCheckingParams(false)
    }, 100)
    return () => clearTimeout(timer)
  }, [searchParams])
  const verifyT = t.auth.verifyEmail as typeof t.auth.verifyEmail & {
    title: string
    subtitle: string
    missingInfo: string
    verifying: string
    success: string
    error: string
    goToLogin: string
    checkEmail: string
    resendEmail: string
    resending: string
    resendSuccess: string
    resendError: string
  }

  const handleResendEmail = async () => {
    if (!email) {
      setResendError(verifyT.resendError || "Email is required")
      return
    }

    setIsResending(true)
    setResendError(null)
    setResendSuccess(false)

    try {
      const response = await fetch("https://www.hymosetups.com/api/v1/email/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email }),
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
          verifyT.resendError || "Failed to resend email. Please try again."
        throw new Error(errorMessage)
      }

      setResendSuccess(true)
      setTimeout(() => setResendSuccess(false), 5000)
    } catch (err) {
      setResendError(err instanceof Error ? err.message : verifyT.resendError || "Failed to resend email. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    async function run() {
      if (!allPresent) {
        setStatus("idle")
        return
      }

      setStatus("verifying")
      setErrorMessage(null)

      try {
        const qs = new URLSearchParams({
          id: verificationParams.id,
          hash: verificationParams.hash,
          expires: verificationParams.expires,
          signature: verificationParams.signature,
        }).toString()
        const res = await fetch("https://www.hymosetups.com/api/v1/email/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            id: verificationParams.id,
            hash: verificationParams.hash,
            expires: verificationParams.expires,
            signature: verificationParams.signature,
          }),
        });

        const contentType = res.headers.get("content-type") || ""
        const payload = contentType.includes("application/json") ? await res.json().catch(() => null) : await res.text().catch(() => "")

        if (!res.ok) {
          const message =
            (typeof payload === "object" && payload && "message" in payload && typeof (payload as any).message === "string" && (payload as any).message) ||
            (typeof payload === "string" && payload) ||
            verifyT.error
          throw new Error(message)
        }

        if (!isMounted) return
        setStatus("success")
      } catch (err) {
        if (!isMounted) return
        setStatus("error")
        setErrorMessage(err instanceof Error ? err.message : verifyT.error)
      }
    }
    void run()
    return () => {
      isMounted = false
    }
  }, [allPresent, verificationParams, verifyT.error])

  // Redirect to login page after successful verification
  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        router.push("/login")
      }, 2000) // Show success message for 2 seconds before redirecting
      return () => clearTimeout(timer)
    }
  }, [status, router])

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
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[420px] rounded-full bg-primary/10 blur-[100px] pointer-events-none"
          aria-hidden
        />

        <div className="relative z-10 w-full max-w-md">
          <Card className="login-glass-card relative border-0 bg-transparent shadow-none overflow-hidden rounded-2xl backdrop-blur-sm">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/80 to-transparent shadow-[0_0_12px_oklch(0.65_0.28_328_/_0.6)]" />
            <CardHeader className="text-center pb-2 items-center">
              <div className="flex flex-row items-center justify-center mt-12">
                <Image src="/images/hymo-logo1.png" alt="HYMO" width={100} height={100} className="h-16 w-auto" />
              </div>
              <CardTitle className="font-display text-3xl uppercase mt-2 text-brand-gradient">
                {verifyT.title}
              </CardTitle>
              <CardDescription className="text-muted-foreground/90">
                {verifyT.subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pb-8">
              {isCheckingParams && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading...</span>
                </div>
              )}

              {!isCheckingParams && !allPresent && (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    <span>{verifyT.checkEmail || "Please check your email and click the verification link to verify your account."}</span>
                  </div>
                  <p className="text-xs text-muted-foreground/70 text-center">
                    If you didn't receive the email, please check your spam folder or try registering again.
                  </p>
                  {!email && (
                    <div className="space-y-2">
                      <Label htmlFor="resend-email" className="text-foreground/90">Email</Label>
                      <Input
                        id="resend-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isResending}
                        className="input-neon bg-white/[0.06] border-white/20 placeholder:text-muted-foreground/70 h-10 focus-visible:border-primary/50 focus-visible:ring-0"
                        autoComplete="email"
                      />
                    </div>
                  )}
                  {resendSuccess && (
                    <div className="flex items-center justify-center gap-2 text-sm text-green-400">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{verifyT.resendSuccess}</span>
                    </div>
                  )}
                  {resendError && (
                    <div className="flex items-center justify-center gap-2 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span>{resendError}</span>
                    </div>
                  )}
                  <Button
                    onClick={handleResendEmail}
                    disabled={isResending || !email}
                    variant="outline"
                    className="w-full h-10"
                    size="lg"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {verifyT.resending}
                      </>
                    ) : (
                      verifyT.resendEmail
                    )}
                  </Button>
                </div>
              )}

              {!isCheckingParams && allPresent && status === "verifying" && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{verifyT.verifying}</span>
                </div>
              )}

              {!isCheckingParams && allPresent && status === "success" && (
                <div className="flex items-center justify-center gap-2 text-sm text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{verifyT.success}</span>
                </div>
              )}

              {!isCheckingParams && allPresent && status === "error" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errorMessage || verifyT.error}</span>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Link href="/login" className="block">
                  <Button className="w-full h-10 glow-primary shadow-[0_0_20px_oklch(0.65_0.28_328_/_0.35)] hover:shadow-[0_0_28px_oklch(0.65_0.28_328_/_0.5)]" size="lg">
                    {verifyT.goToLogin}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}

function LoadingFallback() {
  const { t } = useLanguage()
  const verifyT = t.auth.verifyEmail as typeof t.auth.verifyEmail & {
    title: string
    subtitle: string
    verifying: string
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
        <div className="absolute inset-0 bg-circuit opacity-[0.4]" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-transparent" aria-hidden />
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[420px] rounded-full bg-primary/10 blur-[100px] pointer-events-none"
          aria-hidden
        />

        <div className="relative z-10 w-full max-w-md">
          <Card className="login-glass-card relative border-0 bg-transparent shadow-none overflow-hidden rounded-2xl backdrop-blur-sm">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/80 to-transparent shadow-[0_0_12px_oklch(0.65_0.28_328_/_0.6)]" />
            <CardHeader className="text-center pb-2 items-center">
              <div className="flex flex-row items-center justify-center mt-12">
                <Image src="/images/hymo-logo1.png" alt="HYMO" width={100} height={100} className="h-16 w-auto" />
              </div>
              <CardTitle className="font-display text-3xl uppercase mt-2 text-brand-gradient">
                {verifyT.title}
              </CardTitle>
              <CardDescription className="text-muted-foreground/90">
                {verifyT.subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pb-8">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{verifyT.verifying}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}

export default function EmailVerifyPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <EmailVerifyContent />
    </Suspense>
  )
}
