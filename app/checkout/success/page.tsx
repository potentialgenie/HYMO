"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CheckCircle2, LayoutDashboard } from "lucide-react"

export default function CheckoutSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/dashboard")
    }, 3000)
    return () => clearTimeout(timer)
  }, [router])

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
          aria-labelledby="payment-success-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#151515] shadow-2xl shadow-black/40 p-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center gap-5 text-center">
              <div className="rounded-full bg-green-500/20 p-4 ring-2 ring-green-500/30">
                <CheckCircle2 className="h-14 w-14 text-green-400" />
              </div>
              <div className="space-y-1">
                <h2
                  id="payment-success-title"
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
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
