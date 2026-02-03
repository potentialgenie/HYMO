"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { apiUrl } from "@/lib/api"
import { apiFetch, isAuthenticated } from "@/lib/auth"
import { hasActivePlanExceptPlan5 } from "@/lib/subscriptions"
import { cn } from "@/lib/utils"
import { Loader2, ArrowLeft, CheckCircle2, CreditCard } from "lucide-react"

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
  const [actionError, setActionError] = useState<string | null>(null)
  const [isAuthed, setIsAuthed] = useState(false)
  const [startTrialLoading, setStartTrialLoading] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [modal, setModal] = useState<{
    type: "free_trial_success" | "free_trial_error" | "payment_success" | "payment_error"
    planName?: string
    effectiveAt?: string
    immediate?: boolean
  } | null>(null)
  const [manageCardLoading, setManageCardLoading] = useState(false)

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
    if (!plan || !planId || !isAuthed) return
    setStartTrialLoading(true)
    setActionError(null)
    setModal(null)
    try {
      const hasActive = await hasActivePlanExceptPlan5()
      const planIdNum = Number(planId)
      const body = { plan_id: planIdNum }

      if (hasActive) {
        const res = await apiFetch(apiUrl("/api/v1/subscription/change"), {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(body),
        })
        const json = await res.json().catch(() => ({}))
        if (res.ok && (json.status === true || json.success === true)) {
          setModal({ type: "free_trial_success" })
        } else {
          setModal({ type: "free_trial_error" })
        }
      } else {
        const res = await apiFetch(apiUrl("/api/v1/trial/start"), {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(body),
        })
        const json = await res.json().catch(() => ({}))
        if (res.ok && (json.status === true || json.success === true)) {
          setModal({ type: "free_trial_success" })
        } else {
          setModal({ type: "free_trial_error" })
        }
      }
    } catch {
      setModal({ type: "free_trial_error" })
    } finally {
      setStartTrialLoading(false)
    }
  }

  const handleContinuePayment = async () => {
    if (!plan || !planId) return
    if (!isAuthed) {
      router.push("/login")
      return
    }
    setPaymentLoading(true)
    setActionError(null)
    setModal(null)
    try {
      const hasActive = await hasActivePlanExceptPlan5()
      const planIdNum = Number(planId)
      const body = { plan_id: planIdNum }

      if (hasActive) {
        const res = await apiFetch(apiUrl("/api/v1/subscription/change"), {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ new_plan_id: body.plan_id }),
        })
        const json = (await res.json().catch(() => ({}))) as {
          status?: boolean
          success?: boolean
          data?: { effective_at?: string }
          effective_at?: string
        }
        const ok = res.ok && (json.status === true || json.success === true)
        const effectiveAt = json.data?.effective_at ?? json.effective_at

        if (ok) {
          const planName = plan.interval === "monthly" ? "Elite (Monthly)" : "Elite (Yearly)"
          setModal({
            type: "payment_success",
            planName,
            effectiveAt: effectiveAt ?? undefined,
            immediate: !effectiveAt,
          })
        } else {
          setModal({ type: "payment_error" })
        }
      } else {
        const res = await apiFetch(apiUrl("/api/v1/checkout/create-session"), {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(body),
        })
        const json = (await res.json().catch(() => ({}))) as {
          status?: boolean
          success?: boolean
          message?: string
          data?: { url?: string }
          url?: string
        }
        const ok = res.ok && (json.status === true || json.success === true)
        const url = json.data?.url ?? json.url
        if (ok && typeof url === "string" && url) {
          window.location.href = url
          return
        }
        setModal({ type: "payment_error" })
      }
    } catch {
      setModal({ type: "payment_error" })
    } finally {
      setPaymentLoading(false)
    }
  }

  const handleManageCard = async () => {
    setManageCardLoading(true)
    try {
      const res = await apiFetch(apiUrl("/api/v1/billing-portal/session"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({}),
      })
      const json = (await res.json().catch(() => ({}))) as {
        status?: boolean
        data?: { url?: string }
        url?: string
      }
      const url = json.data?.url ?? json.url
      if (typeof url === "string" && url) {
        window.location.href = url
      }
    } catch {
      setModal(null)
    } finally {
      setManageCardLoading(false)
    }
  }

  const continuePaymentDisabled = isAuthed && (paymentLoading || startTrialLoading)

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

                {actionError && (
                  <p className="text-red-400 text-sm mb-4">{actionError}</p>
                )}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleStartTrial}
                    disabled={!isAuthed || startTrialLoading || paymentLoading}
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

      {/* Modals */}
      {modal && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            aria-hidden
            onClick={() => setModal(null)}
          />
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="elite-modal-title"
          >
            <div
              className="w-full max-w-md rounded-2xl border border-white/10 bg-[#151515] shadow-2xl shadow-black/40 p-8"
              onClick={(e) => e.stopPropagation()}
            >
              {modal.type === "free_trial_success" ? (
                <>
                  <div className="flex justify-center mb-4">
                    <div className="rounded-full bg-green-500/20 p-4 ring-2 ring-green-500/30">
                      <CheckCircle2 className="h-14 w-14 text-green-400" />
                    </div>
                  </div>
                  <h2 id="elite-modal-title" className="text-xl font-display font-semibold text-white text-center mb-2">
                    Success
                  </h2>
                  <p className="text-white/70 text-sm text-center mb-6">
                    You can experience the FREETRIAL for one week from now.
                  </p>
                  <Button
                    onClick={() => setModal(null)}
                    className="w-full h-12 rounded-full bg-brand-gradient text-white font-semibold hover:brightness-110"
                  >
                    OK
                  </Button>
                </>
              ) : modal.type === "free_trial_error" ? (
                <>
                  <div className="flex justify-center mb-4">
                    <div className="rounded-full bg-red-500/20 p-4 ring-2 ring-red-500/30">
                      <CreditCard className="h-14 w-14 text-red-400" />
                    </div>
                  </div>
                  <h2 id="elite-modal-title" className="text-xl font-display font-semibold text-white text-center mb-2">
                    Add Card
                  </h2>
                  <p className="text-white/70 text-sm text-center mb-6">
                    Please add your card.
                  </p>
                  <div className="flex flex-col gap-3">
                    <Button
                      onClick={handleManageCard}
                      disabled={manageCardLoading}
                      className="w-full h-12 rounded-full bg-brand-gradient text-white font-semibold hover:brightness-110 disabled:opacity-50"
                    >
                      {manageCardLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Loading…
                        </>
                      ) : (
                        "Manage your Card"
                      )}
                    </Button>
                    <Button
                      onClick={() => setModal(null)}
                      variant="outline"
                      className="w-full h-12 rounded-full border-white/20 text-white/80 hover:bg-white/10"
                    >
                      Close
                    </Button>
                  </div>
                </>
              ) : modal.type === "payment_success" ? (
                <>
                  <div className="flex justify-center mb-4">
                    <div className="rounded-full bg-green-500/20 p-4 ring-2 ring-green-500/30">
                      <CheckCircle2 className="h-14 w-14 text-green-400" />
                    </div>
                  </div>
                  <h2 id="elite-modal-title" className="text-xl font-display font-semibold text-white text-center mb-2">
                    Success
                  </h2>
                  <p className="text-white/70 text-sm text-center mb-6">
                    {modal.immediate
                      ? `You can use ${modal.planName ?? "your plan"} from now.`
                      : `Your ${modal.planName ?? "plan"} is scheduled at ${modal.effectiveAt}.`}
                  </p>
                  <Button
                    onClick={() => setModal(null)}
                    className="w-full h-12 rounded-full bg-brand-gradient text-white font-semibold hover:brightness-110"
                  >
                    OK
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex justify-center mb-4">
                    <div className="rounded-full bg-red-500/20 p-4 ring-2 ring-red-500/30">
                      <CreditCard className="h-14 w-14 text-red-400" />
                    </div>
                  </div>
                  <h2 id="elite-modal-title" className="text-xl font-display font-semibold text-white text-center mb-2">
                    Payment Issue
                  </h2>
                  <p className="text-white/70 text-sm text-center mb-6">
                    You did not add the card or you do not have enough money. If you want to manage your card, please{" "}
                    <button
                      onClick={handleManageCard}
                      disabled={manageCardLoading}
                      className="text-[#E800BC] font-semibold hover:underline underline-offset-2 disabled:opacity-50"
                    >
                      {manageCardLoading ? "loading…" : "click here"}
                    </button>
                  </p>
                  <Button
                    onClick={() => setModal(null)}
                    variant="outline"
                    className="w-full h-12 rounded-full border-white/20 text-white/80 hover:bg-white/10"
                  >
                    Close
                  </Button>
                </>
              )}
            </div>
          </div>
        </>
      )}

      <Footer />
    </div>
  )
}
