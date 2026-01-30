"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/navbar"
import { apiUrl } from "@/lib/api"
import { useLanguage } from "@/lib/language-context"
import { Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react"

export default function RegisterPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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
      const response = await fetch(apiUrl("/api/v1/signup"), {
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
        const errorMessage =
          (typeof data === "object" && data && "message" in data && typeof data.message === "string" && data.message) ||
          (typeof data === "object" && data && "error" in data && typeof data.error === "string" && data.error) ||
          (typeof data === "string" && data) ||
          "Registration failed. Please try again."
        throw new Error(errorMessage)
      }

      setSuccess(true)
      setTimeout(() => {
        router.push(`/verify-email?email=${encodeURIComponent(email)}`)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClass =
    "input-dark h-11 rounded-full bg-[#1B1B1B] border-white/10 text-white placeholder:text-white/50 focus-visible:ring-0 focus-visible:border-primary/50"

  return (
    <main className="min-h-screen flex flex-col bg-[#1A191E] relative overflow-hidden">
      {/* background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/4 -translate-y-1/2 pointer-events-none"
          style={{
            width: "640px",
            height: "640px",
            borderRadius: "50%",
            background: "radial-gradient(circle at 60% 54%, #E800BC 0%, rgba(232,0,188,0.30) 60%, rgba(0,0,0,0) 100%)",
            filter: "blur(200px)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A191E]/10 via-[#1A191E]/40 to-[#1A191E]" />
      </div>

      <Navbar />

      <section className="relative z-10 flex-1 flex items-center">
        <div className="w-full px-6 sm:px-10 lg:px-24 py-16 pt-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10">
            {/* Left: form */}
            <div className="col-span-1 mx-auto w-full max-w-md">
              <h1 className="text-white font-display text-4xl sm:text-5xl tracking-tight text-center">
                {t.auth.register.title}
              </h1>
              <p className="mt-3 text-white/55 text-sm sm:text-base text-center">
                {t.auth.register.subtitle}
              </p>

              <form onSubmit={handleSubmit} className="mt-10 space-y-5">
                {success && (
                  <div className="flex items-center gap-2 p-3 rounded-full bg-[#CC00BC]/10 border border-[#CC00BC]/30 text-sm text-[#E800BC] shadow-sm">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#E800BC]" />
                    <span>{t.auth.register.success}</span>
                  </div>
                )}
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-full bg-[#CC00BC]/10 border border-[#CC00BC]/30 text-sm text-[#E800BC] shadow-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 text-[#E800BC]" />
                    <span className="font-medium">{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="register-firstname" className="text-white/80">
                      {t.auth.register.firstName}
                    </Label>
                    <Input
                      id="register-firstname"
                      type="text"
                      placeholder={t.auth.register.firstNamePlaceholder}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      disabled={isSubmitting || success}
                      className={inputClass}
                      autoComplete="given-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-lastname" className="text-white/80">
                      {t.auth.register.lastName}
                    </Label>
                    <Input
                      id="register-lastname"
                      type="text"
                      placeholder={t.auth.register.lastNamePlaceholder}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      disabled={isSubmitting || success}
                      className={inputClass}
                      autoComplete="family-name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-white/80">
                    {t.auth.register.email}
                  </Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder={t.auth.register.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting || success}
                    className={inputClass}
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-white/80">
                    {t.auth.register.password}
                  </Label>
                  <div className="relative">
                    <Input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      disabled={isSubmitting || success}
                      className={`${inputClass} pr-12`}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      disabled={isSubmitting || success}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-white/50">{t.auth.register.passwordHint}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-confirm" className="text-white/80">
                    {t.auth.register.confirmPassword}
                  </Label>
                  <div className="relative">
                    <Input
                      id="register-confirm"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      disabled={isSubmitting || success}
                      className={`${inputClass} pr-12 ${!passwordsMatch ? "border-destructive" : ""}`}
                      autoComplete="new-password"
                      aria-invalid={!passwordsMatch}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      disabled={isSubmitting || success}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {!passwordsMatch && (
                    <p className="text-xs text-destructive">{t.auth.register.passwordMismatch}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={!passwordsMatch || isSubmitting || success}
                  className="w-full h-11 rounded-full text-[16px] font-display bg-brand-gradient text-white tracking-wide hover:brightness-110"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t.auth.register.submitting}
                    </>
                  ) : (
                    t.auth.register.submit
                  )}
                </Button>

                <div className="pt-3 border-t border-white/10 text-center">
                  <p className="text-sm text-white/40">
                    {t.auth.register.hasAccount}{" "}
                    <Link href="/login" className="text-[#CC00BC] hover:text-[#E800BC] transition font-medium">
                      {t.auth.register.loginLink}
                    </Link>
                  </p>
                </div>
              </form>
            </div>

            {/* Right: car image */}
            <div className="col-span-1 mx-auto hidden lg:flex justify-end items-center">
              <Image
                src="/images/hymo-login.png"
                alt="HYMO car"
                width={1200}
                height={700}
                priority
                className="w-full h-auto object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.65)]"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
