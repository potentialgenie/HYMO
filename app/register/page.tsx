"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LanguageSelect } from "@/components/language-select"
import { useLanguage } from "@/lib/language-context"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"

export default function RegisterPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const passwordsMatch = !confirmPassword || password === confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) return
    
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch("https://www.hymosetups.com/api/v1/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: firstName,
          lastname: lastName,
          email,
          password,
          password_confirmation: confirmPassword,
        }),
      })

      const contentType = response.headers.get("content-type") || ""
      const data = contentType.includes("application/json")
        ? await response.json().catch(() => null)
        : await response.text().catch(() => "")

      if (!response.ok) {
        // Handle validation errors or other API errors
        const errorMessage =
          (typeof data === "object" && data && "message" in data && typeof data.message === "string" && data.message) ||
          (typeof data === "object" && data && "error" in data && typeof data.error === "string" && data.error) ||
          (typeof data === "string" && data) ||
          "Registration failed. Please try again."
        throw new Error(errorMessage)
      }

      // Success - show success message
      setSuccess(true)
      // Redirect to verify-email page with email parameter
      setTimeout(() => {
        router.push(`/verify-email?email=${encodeURIComponent(email)}`)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.")
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
                {t.auth.register.title}
              </CardTitle>
              <CardDescription className="text-muted-foreground/90">{t.auth.register.subtitle}</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 pb-2">
                {success && (
                  <div className="flex items-center gap-2 p-3 rounded-md bg-green-500/10 border border-green-500/20 text-sm text-green-400">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                    <span>Registration successful! Please check your email to verify your account.</span>
                  </div>
                )}
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="register-firstname" className="text-foreground/90">{t.auth.register.firstName}</Label>
                  <Input
                    id="register-firstname"
                    type="text"
                    placeholder={t.auth.register.firstNamePlaceholder}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    disabled={isSubmitting || success}
                    className="input-neon bg-white/[0.06] border-white/20 placeholder:text-muted-foreground/70 h-10 focus-visible:border-primary/50 focus-visible:ring-0"
                    autoComplete="given-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-lastname" className="text-foreground/90">{t.auth.register.lastName}</Label>
                  <Input
                    id="register-lastname"
                    type="text"
                    placeholder={t.auth.register.lastNamePlaceholder}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    disabled={isSubmitting || success}
                    className="input-neon bg-white/[0.06] border-white/20 placeholder:text-muted-foreground/70 h-10 focus-visible:border-primary/50 focus-visible:ring-0"
                    autoComplete="family-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-foreground/90">{t.auth.register.email}</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder={t.auth.register.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting || success}
                    className="input-neon bg-white/[0.06] border-white/20 placeholder:text-muted-foreground/70 h-10 focus-visible:border-primary/50 focus-visible:ring-0"
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-foreground/90">{t.auth.register.password}</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    disabled={isSubmitting || success}
                    className="input-neon bg-white/[0.06] border-white/20 placeholder:text-muted-foreground/70 h-10 focus-visible:border-primary/50 focus-visible:ring-0"
                    autoComplete="new-password"
                  />
                  <p className="text-xs text-muted-foreground">{t.auth.register.passwordHint}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-confirm" className="text-foreground/90">{t.auth.register.confirmPassword}</Label>
                  <Input
                    id="register-confirm"
                    type="password"
                    placeholder="********"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    disabled={isSubmitting || success}
                    className={`input-neon bg-white/[0.06] border-white/20 placeholder:text-muted-foreground/70 h-10 focus-visible:border-primary/50 focus-visible:ring-0 ${!passwordsMatch ? "border-destructive" : ""}`}
                    autoComplete="new-password"
                    aria-invalid={!passwordsMatch}
                  />
                  {!passwordsMatch && (
                    <p className="text-xs text-destructive">{t.auth.register.passwordMismatch}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4 pt-2">
                <Button
                  type="submit"
                  className="w-full h-10 glow-primary shadow-[0_0_20px_oklch(0.65_0.28_328_/_0.35)] hover:shadow-[0_0_28px_oklch(0.65_0.28_328_/_0.5)]"
                  size="lg"
                  disabled={!passwordsMatch || isSubmitting || success}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    t.auth.register.submit
                  )}
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  {t.auth.register.hasAccount}{" "}
                  <Link href="/login" className="text-primary font-medium hover:underline">
                    {t.auth.register.loginLink}
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
