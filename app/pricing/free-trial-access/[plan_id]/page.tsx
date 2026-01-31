"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { apiUrl } from "@/lib/api"
import { isAuthenticated } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { Loader2, ArrowLeft } from "lucide-react"

type PlanFromApi = {
  id: number
  name: string
  stripe_price_id: string
  price: string
  interval: "monthly" | "yearly" | "permanent"
  currency: string
  discount: number
  description: string | null
  currency_symbol: string
}

export default function FreeTrialAccessPage() {
  const params = useParams()
  const router = useRouter()
  const planId = params?.plan_id as string | undefined

  const [plan, setPlan] = useState<PlanFromApi | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthed, setIsAuthed] = useState(false)
  const [startTrialLoading, setStartTrialLoading] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)

  const fetchPlan = useCallback(async () => {
    if (!planId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(apiUrl("/api/v1/plans"))
      const json = await res.json()
      if (!res.ok || !json.status || !Array.isArray(json.data)) {
        throw new Error(json.message || "Failed to load plans")
      }
      const match = (json.data as PlanFromApi[]).find(
        (p) =>
          String(p.id) === String(planId) &&
          p.name === "Elite" &&
          (p.interval === "monthly" || p.interval === "yearly")
      )
      if (!match) {
        setError("Plan not found")
        setPlan(null)
      } else {
        setPlan(match)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load plan")
      setPlan(null)
    } finally {
      setLoading(false)
    }
  }, [planId])

  useEffect(() => {
    const refresh = () => setIsAuthed(isAuthenticated())
    refresh()
    window.addEventListener("storage", refresh)
    return () => window.removeEventListener("storage", refresh)
  }, [])

  useEffect(() => {
    if (!planId) {
      setLoading(false)
      setError("Invalid plan")
      return
    }
    fetchPlan()
  }, [planId, fetchPlan])

  const handleStartTrial = async () => {
    if (!plan || !isAuthed) return
    setStartTrialLoading(true)
    try {
      // Placeholder: wire to free-trial subscribe API
      console.log("Start 7-day free trial", { planId, stripe_price_id: plan.stripe_price_id })
    } finally {
      setStartTrialLoading(false)
    }
  }

  const handleContinuePayment = async () => {
    if (!plan) return
    if (!isAuthed) {
      router.push("/login")
      return
    }
    setPaymentLoading(true)
    try {
      // Placeholder: wire to Stripe checkout
      console.log("Continue with payment", { planId, stripe_price_id: plan.stripe_price_id })
    } finally {
      setPaymentLoading(false)
    }
  }

  const continuePaymentDisabled = isAuthed && paymentLoading

  const intervalLabel = plan?.interval === "yearly" ? "Yearly" : "Monthly"
  const priceLabel = plan
    ? `${plan.currency_symbol}${plan.price}`
    : "—"

  if (!planId) {
    return (
      <div className="min-h-screen bg-[#151515]">
        <Navbar />
        <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-24">
          <p className="text-white/80">Invalid plan.</p>
          <Link href="/pricing" className="text-primary hover:underline mt-4 inline-block">
            Back to Pricing
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#151515]">
      <Navbar />

      <main className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-24">
        <div className="max-w-lg mx-auto">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Pricing
          </Link>
          <div className="text-center"> 
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">
              Elite: Free Trial
            </h1>
            <p className="text-white/70 text-sm mb-6">
              Access your free trial for 5 setups total for the entire 7 days.
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl border border-white/10 bg-[#242625] p-6 sm:p-8"
          >
            {loading ? (
              <div className="flex items-center justify-center py-12 text-white/70">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                Loading…
              </div>
            ) : error || !plan ? (
              <div className="py-8">
                <p className="text-white/80 mb-4">{error || "Plan not found."}</p>
                <Link href="/pricing" className="text-primary hover:underline">
                  Back to Pricing
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-2 mb-6">
                  <p className="text-white font-semibold">
                    Elite ({intervalLabel}): {priceLabel} Free Trial
                  </p>
                  {!isAuthed && (
                    <p className="text-red-400 text-sm pt-1">
                      Please{" "}
                      <Link href="/login" className="text-primary hover:underline font-medium">
                        log in
                      </Link>{" "}
                      to subscribe your free trial.
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleStartTrial}
                    disabled={!isAuthed || startTrialLoading}
                    className={cn(
                      "flex-1 h-12 rounded-md text-sm font-semibold bg-brand-gradient text-white hover:brightness-110",
                      "disabled:opacity-50 disabled:pointer-events-none"
                    )}
                  >
                    {startTrialLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Starting…
                      </>
                    ) : (
                      "Start 7-Day Free Trial"
                    )}
                  </Button>
                  <Button
                    onClick={handleContinuePayment}
                    disabled={continuePaymentDisabled}
                    className={cn(
                      "flex-1 h-12 rounded-md text-sm font-semibold",
                      "bg-primary text-primary-foreground hover:bg-primary/90",
                      "disabled:opacity-50 disabled:pointer-events-none"
                    )}
                  >
                    {paymentLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Continuing…
                      </>
                    ) : (
                      "Continue with Payment"
                    )}
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
