"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { apiUrl } from "@/lib/api"
import { apiFetch } from "@/lib/auth"
import { CheckCircle2, Loader2 } from "lucide-react"

type VerifyResponse = {
  success?: boolean
  status?: boolean
  plan_type?: "monthly" | "yearly"
  message?: string
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get("session_id")

  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying")
  const [planType, setPlanType] = useState<"monthly" | "yearly" | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) {
      setStatus("error")
      setErrorMessage("Invalid session. Missing session_id.")
      return
    }

    let cancelled = false

    const verifyAndShow = async () => {
      try {
        const res = await apiFetch(apiUrl("/api/v1/checkout/verify-session"), {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ session_id: sessionId }),
        })
        const json = (await res.json().catch(() => ({}))) as VerifyResponse
        const ok = res.ok && (json.success === true || json.status === true)

        if (cancelled) return

        if (ok && (json.plan_type === "monthly" || json.plan_type === "yearly")) {
          setPlanType(json.plan_type)
        } else if (ok) {
          setPlanType("yearly")
        }
        setStatus(ok ? "success" : "error")
        if (!ok) setErrorMessage(json.message ?? "Verification failed")
      } catch (e) {
        if (!cancelled) {
          setStatus("error")
          setErrorMessage(e instanceof Error ? e.message : "Verification failed")
        }
      }
    }

    void verifyAndShow()
    return () => { cancelled = true }
  }, [sessionId])

  useEffect(() => {
    if (status !== "success") return

    const timer = setTimeout(() => {
      router.replace("/pricing")
    }, 3000)

    return () => clearTimeout(timer)
  }, [status, router])

  const planLabel = planType === "monthly" ? "Pro plan monthly" : planType === "yearly" ? "Pro plan yearly" : "Pro plan monthly/yearly"

  return (
    <div className="min-h-screen bg-[#1A191E]">
      <Navbar />

      <main className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-24">
        <div className="max-w-md mx-auto text-center">
          {status === "verifying" && (
            <div className="flex flex-col items-center gap-4 py-16">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-white/70">Verifying payment…</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-4 py-16 animate-in fade-in duration-300">
              <div className="rounded-full bg-green-500/20 p-4">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <p className="text-white text-xl font-semibold">
                Payment is verified. You can use {planLabel}.
              </p>
              <p className="text-white/55 text-sm">
                Redirecting in 3 seconds…
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-4 py-16">
              <p className="text-red-400">{errorMessage ?? "Something went wrong."}</p>
              <a
                href="/pricing"
                className="text-primary hover:underline text-sm font-medium"
              >
                Back to Pricing
              </a>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

function SuccessFallback() {
  return (
    <div className="min-h-screen bg-[#1A191E]">
      <Navbar />
      <main className="pt-24 pb-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
      <Footer />
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<SuccessFallback />}>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
