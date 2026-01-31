"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/navbar"
import { useLanguage } from "@/lib/language-context"
import { apiUrl } from "@/lib/api"
import { storeAuthData, type LoginResponse } from "@/lib/auth"
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(apiUrl("/api/v1/login"), {
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

  const inputClass =
    "input-dark h-11 rounded-full bg-[#151515] border-white/10 text-white placeholder:text-white/50 focus-visible:ring-0 focus-visible:border-primary/50"

  return (
    <main className="min-h-screen flex flex-col bg-[#151515] relative overflow-hidden">
      {/* background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-2/5 top-3/5 -translate-x-1/4 -translate-y-1/2 pointer-events-none"
          style={{
            width: "640px",
            height: "640px",
            borderRadius: "50%",
            background: "radial-gradient(circle at 30% 50%, #E800BC 0%, rgba(232,0,188,0.30) 100%, rgba(0,0,0,0) 100%)",
            filter: "blur(200px)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#151515]/10 via-[#151515]/40 to-[#151515]" />
      </div>

      <Navbar />

      <section className="relative z-10 flex-1 flex items-center">
        <div className="w-full px-6 sm:px-10 lg:px-24 py-16 pt-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10">
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
            <div className="col-span-1 mx-auto w-full max-w-md">
              <h1 className="text-white font-display text-4xl sm:text-5xl tracking-tight text-center">
                {t.auth.login.title}
              </h1>
              <p className="mt-3 text-white/55 text-sm sm:text-base text-center">
                {t.auth.login.subtitle}
              </p>

              <form onSubmit={handleSubmit} className="mt-10 space-y-5">
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-full bg-[#CC00BC]/10 border border-[#CC00BC]/30 text-sm text-[#E800BC] shadow-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 text-[#E800BC]" />
                    <span className="font-medium">{error}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-white/80">
                    {t.auth.login.email}
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className={`${inputClass} text-white`}
                    autoComplete="email"
                    style={{ color: "#fff" }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-white/80">
                    {t.auth.login.password}
                  </Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isSubmitting}
                      className={`${inputClass} pr-12`}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      disabled={isSubmitting}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>

                  <div className="flex justify-end">
                    <Link href="/forgot-password" className="text-sm text-white/40 hover:text-[#E800BC] transition">
                      {t.auth.login.forgotPassword || "Forgot Password?"}
                    </Link>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 rounded-full text-[16px] font-display bg-brand-gradient text-white tracking-wide hover:brightness-110"
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

                <div className="pt-3 border-t border-white/10 text-center">
                  <p className="text-sm text-white/40">
                    {t.auth.login.noAccount}{" "}
                    <Link href="/register" className="text-[#CC00BC] hover:text-[#E800BC] transition font-medium">
                      {t.auth.login.registerLink}
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
