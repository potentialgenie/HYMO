"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiUrl } from "@/lib/api"
import { useLanguage } from "@/lib/language-context"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const { t } = useLanguage()
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch(apiUrl("/api/v1/forget-password"), {
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
          t.auth.forgotPassword.error
        throw new Error(errorMessage)
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : t.auth.forgotPassword.error)
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

      <section className="relative z-10 flex-1 flex items-center">
        <div className="w-full px-6 sm:px-10 lg:px-24 py-16 pt-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10">
            <div className="col-span-1 mx-auto hidden lg:flex justify-start items-center">
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
              <h1 className="text-white font-display text-3xl sm:text-4xl tracking-tight text-center">
                {t.auth.forgotPassword.title}
              </h1>
              <p className="mt-3 text-white/55 text-sm sm:text-base text-center">
                {t.auth.forgotPassword.subtitle}
              </p>

              <form onSubmit={handleSubmit} className="mt-10 space-y-5">
                {success && (
                  <div className="flex items-center gap-2 p-3 rounded-full bg-green-500/10 border border-green-500/20 text-sm text-green-400">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                    <span>{t.auth.forgotPassword.success}</span>
                  </div>
                )}
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-full bg-[#CC00BC]/10 border border-[#CC00BC]/30 text-sm text-[#E800BC] shadow-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 text-[#E800BC]" />
                    <span className="font-medium">{error}</span>
                  </div>
                )}

                {!success && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="forgot-email" className="text-white/80">
                        {t.auth.forgotPassword.email}
                      </Label>
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder={t.auth.forgotPassword.emailPlaceholder}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isSubmitting}
                        className={inputClass}
                        autoComplete="email"
                      />
                      <p className="text-xs text-white/50">{t.auth.forgotPassword.hint}</p>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-11 rounded-full text-[16px] font-display bg-brand-gradient text-white tracking-wide hover:brightness-110"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t.auth.forgotPassword.submitting}
                        </>
                      ) : (
                        t.auth.forgotPassword.submit
                      )}
                    </Button>
                  </>
                )}

                <div className="pt-3 border-t border-white/10 text-center">
                  <p className="text-sm text-white/40">
                    {t.auth.forgotPassword.rememberPassword}{" "}
                    <Link href="/login" className="text-[#CC00BC] hover:text-[#E800BC] transition font-medium">
                      {t.auth.forgotPassword.loginLink}
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
