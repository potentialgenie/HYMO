"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CheckCircle2, XCircle, LayoutDashboard, Loader2 } from "lucide-react"
import { apiFetch } from "@/lib/auth"
import { apiUrl } from "@/lib/api"

type VerifyStatus = "loading" | "success" | "failed"

function CheckoutSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<VerifyStatus>("loading")

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get("session_id")
      
      if (!sessionId) {
        setStatus("failed")
        return
      }

      try {
        const res = await apiFetch(apiUrl("/api/v1/checkout/verify"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ session_id: sessionId }),
        })

        const data = await res.json().catch(() => null)

        if (res.ok && data?.status) {
          setStatus("success")
        } else {
          setStatus("failed")
        }
      } catch {
        setStatus("failed")
      }
    }

    verifyPayment()
  }, [searchParams])

  useEffect(() => {
    if (status === "loading") return

    const timer = setTimeout(() => {
      router.replace("/dashboard")
    }, 3000)
    return () => clearTimeout(timer)
  }, [status, router])

  return (
    <div className="min-h-screen bg-[#151515]">
      <Navbar />

      <main className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-24">
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
          aria-hidden
        />
        {/* Modal */}
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="payment-status-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#151515] shadow-2xl shadow-black/40 p-8 animate-in fade-in zoom-in-95 duration-300">
            {status === "loading" && (
              <div className="flex flex-col items-center gap-5 text-center">
                <div className="rounded-full bg-primary/20 p-4 ring-2 ring-primary/30">
                  <Loader2 className="h-14 w-14 text-primary animate-spin" />
                </div>
                <div className="space-y-1">
                  <h2
                    id="payment-status-title"
                    className="text-xl sm:text-3xl font-display font-semibold text-white tracking-tight"
                  >
                    Verifying payment
                  </h2>
                  <p className="text-white/70 text-sm sm:text-base">
                    Please wait while we confirm your payment…
                  </p>
                </div>
              </div>
            )}

            {status === "success" && (
              <div className="flex flex-col items-center gap-5 text-center">
                <div className="rounded-full bg-green-500/20 p-4 ring-2 ring-green-500/30">
                  <CheckCircle2 className="h-14 w-14 text-green-400" />
                </div>
                <div className="space-y-1">
                  <h2
                    id="payment-status-title"
                    className="text-xl sm:text-3xl font-display font-semibold text-white tracking-tight"
                  >
                    Payment successful
                  </h2>
                  <p className="text-white/70 text-sm sm:text-base">
                    You can now use your subscription. Redirecting to Dashboard…
                  </p>
                </div>
                <p className="text-white/50 text-xs">
                  Redirecting in 3 seconds…
                </p>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-3 text-white font-semibold tracking-wide transition-all duration-200 hover:brightness-110"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Go to Dashboard
                </Link>
              </div>
            )}

            {status === "failed" && (
              <div className="flex flex-col items-center gap-5 text-center">
                <div className="rounded-full bg-red-500/20 p-4 ring-2 ring-red-500/30">
                  <XCircle className="h-14 w-14 text-red-400" />
                </div>
                <div className="space-y-1">
                  <h2
                    id="payment-status-title"
                    className="text-xl sm:text-3xl font-display font-semibold text-white tracking-tight"
                  >
                    Payment failed
                  </h2>
                  <p className="text-white/70 text-sm sm:text-base">
                    Something went wrong with your payment. Redirecting to Dashboard…
                  </p>
                </div>
                <p className="text-white/50 text-xs">
                  Redirecting in 3 seconds…
                </p>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-3 text-white font-semibold tracking-wide transition-all duration-200 hover:brightness-110"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Go to Dashboard
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function CheckoutSuccessFallback() {
  return (
    <div className="min-h-screen bg-[#151515]">
      <Navbar />
      <main className="relative pt-24 pb-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#E800BC]" />
      </main>
      <Footer />
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<CheckoutSuccessFallback />}>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
