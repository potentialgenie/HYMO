"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/navbar"
import { apiUrl } from "@/lib/api"
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

  useEffect(() => {
    const emailParam = searchParams.get("email") || ""
    setEmail(emailParam)
    const timer = setTimeout(() => setIsCheckingParams(false), 100)
    return () => clearTimeout(timer)
  }, [searchParams])

  const verifyT = t.auth.verifyEmail

  const inputClass =
    "input-dark h-11 rounded-full bg-[#1B1B1B] border-white/10 text-white placeholder:text-white/50 focus-visible:ring-0 focus-visible:border-primary/50"

  const handleResendEmail = async () => {
    if (!email) {
      setResendError(verifyT.resendError)
      return
    }
    setIsResending(true)
    setResendError(null)
    setResendSuccess(false)
    try {
      const response = await fetch(apiUrl("/api/v1/email/resend"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
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
          verifyT.resendError
        throw new Error(errorMessage)
      }
      setResendSuccess(true)
      setTimeout(() => setResendSuccess(false), 5000)
    } catch (err) {
      setResendError(err instanceof Error ? err.message : verifyT.resendError)
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
        const res = await fetch(apiUrl("/api/v1/email/verify"), {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            id: verificationParams.id,
            hash: verificationParams.hash,
            expires: verificationParams.expires,
            signature: verificationParams.signature,
          }),
        })
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
    return () => { isMounted = false }
  }, [allPresent, verificationParams, verifyT.error])

  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => router.push("/login"), 2000)
      return () => clearTimeout(timer)
    }
  }, [status, router])

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
                {verifyT.title}
              </h1>
              <p className="mt-3 text-white/55 text-sm sm:text-base text-center">
                {verifyT.subtitle}
              </p>

              <div className="mt-10 space-y-5">
                {isCheckingParams && (
                  <div className="flex items-center justify-center gap-2 text-sm text-white/55">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{verifyT.checking}</span>
                  </div>
                )}

                {!isCheckingParams && !allPresent && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 text-sm text-white/80">
                      <AlertCircle className="h-4 w-4" />
                      <span>{verifyT.checkEmail}</span>
                    </div>
                    <p className="text-xs text-white/50 text-center">
                      {verifyT.noEmailHint}
                    </p>
                    {!email && (
                      <div className="space-y-2">
                        <Label htmlFor="resend-email" className="text-white/80">
                          {verifyT.email}
                        </Label>
                        <Input
                          id="resend-email"
                          type="email"
                          placeholder={verifyT.emailPlaceholder}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isResending}
                          className={inputClass}
                          autoComplete="email"
                        />
                      </div>
                    )}
                    {resendSuccess && (
                      <div className="flex items-center gap-2 p-3 rounded-full bg-green-500/10 border border-green-500/20 text-sm text-green-400">
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                        <span>{verifyT.resendSuccess}</span>
                      </div>
                    )}
                    {resendError && (
                      <div className="flex items-center gap-2 p-3 rounded-full bg-[#CC00BC]/10 border border-[#CC00BC]/30 text-sm text-[#E800BC] shadow-sm">
                        <AlertCircle className="h-4 w-4 flex-shrink-0 text-[#E800BC]" />
                        <span className="font-medium">{resendError}</span>
                      </div>
                    )}
                    <Button
                      onClick={handleResendEmail}
                      disabled={isResending || !email}
                      className="w-full h-11 rounded-full text-[16px] font-display bg-brand-gradient text-white tracking-wide hover:brightness-110"
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
                  <div className="flex items-center justify-center gap-2 text-sm text-white/55">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{verifyT.verifying}</span>
                  </div>
                )}

                {!isCheckingParams && allPresent && status === "success" && (
                  <div className="flex items-center gap-2 p-3 rounded-full bg-green-500/10 border border-green-500/20 text-sm text-green-400">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                    <span>{verifyT.success}</span>
                  </div>
                )}

                {!isCheckingParams && allPresent && status === "error" && (
                  <div className="flex items-center gap-2 p-3 rounded-full bg-[#CC00BC]/10 border border-[#CC00BC]/30 text-sm text-[#E800BC] shadow-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 text-[#E800BC]" />
                    <span className="font-medium">{errorMessage ?? verifyT.error}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-white/10 text-center">
                  <p className="text-sm text-white/40">
                    {verifyT.hasAccount}{" "}
                    <Link href="/login" className="text-[#CC00BC] hover:text-[#E800BC] transition font-medium">
                      {verifyT.loginLink}
                    </Link>
                  </p>
                </div>
              </div>
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

function LoadingFallback() {
  const { t } = useLanguage()
  const verifyT = t.auth.verifyEmail

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
            <div className="col-span-1 mx-auto w-full max-w-md">
              <h1 className="text-white font-display text-4xl sm:text-5xl tracking-tight text-center">
                {verifyT.title}
              </h1>
              <p className="mt-3 text-white/55 text-sm sm:text-base text-center">
                {verifyT.subtitle}
              </p>
              <div className="mt-10 flex items-center justify-center gap-2 text-sm text-white/55">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{verifyT.checking}</span>
              </div>
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

export default function EmailVerifyPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <EmailVerifyContent />
    </Suspense>
  )
}
