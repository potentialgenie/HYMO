"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { apiUrl } from "@/lib/api"
import { isAuthenticated, apiFetch } from "@/lib/auth"
import { hasActivePlanExceptPlan5 } from "@/lib/subscriptions"
import { cn } from "@/lib/utils"
import { Loader2, ArrowLeft, CheckCircle2, CreditCard } from "lucide-react"

type CategoryFromApi = {
  id: number
  name: string
  slug: string
  description: string
  image: string
}

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

export default function GameAccessPage() {
  const params = useParams()
  const router = useRouter()
  const planId = params?.plan_id as string | undefined

  const [plan, setPlan] = useState<PlanFromApi | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [games, setGames] = useState<CategoryFromApi[]>([])
  const [gamesLoading, setGamesLoading] = useState(true)
  const [game, setGame] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [modal, setModal] = useState<{
    type: "success" | "error"
    planName?: string
    effectiveAt?: string
    endDate?: string
  } | null>(null)
  const [manageCardLoading, setManageCardLoading] = useState(false)

  const fetchCategories = useCallback(async () => {
    setGamesLoading(true)
    try {
      const res = await fetch(apiUrl("/api/v1/products/categories"))
      const json = await res.json()
      const ok = res.ok && (json.success === true || json.status === true)
      const data = Array.isArray(json.data) ? json.data : []
      if (!ok || !data.length) {
        throw new Error(json.message || "Failed to load games")
      }
      setGames(data as CategoryFromApi[])
    } catch (e) {
      setGames([])
    } finally {
      setGamesLoading(false)
    }
  }, [])

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
        (p) => String(p.id) === String(planId) && p.name === "Pro" && (p.interval === "monthly" || p.interval === "yearly")
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
    if (typeof window === "undefined") return
    if (!isAuthenticated()) {
      router.replace("/login")
      return
    }
  }, [router])

  useEffect(() => {
    if (!planId) {
      setLoading(false)
      setError("Invalid plan")
      return
    }
    if (typeof window !== "undefined" && !isAuthenticated()) return
    fetchPlan()
  }, [planId, fetchPlan])

  useEffect(() => {
    if (!planId || (typeof window !== "undefined" && !isAuthenticated())) return
    fetchCategories()
  }, [planId, fetchCategories])

  const handleSubscribe = async () => {
    if (!game || !plan || !planId) return
    setSubmitting(true)
    setCheckoutError(null)
    setModal(null)
    try {
      const hasActive = await hasActivePlanExceptPlan5()
      const categoryId = Number(game)

      if (hasActive) {
        // Subscription change: monthly = 1, yearly = 3
        const newPlanId = plan.interval === "monthly" ? 1 : 3
        const res = await apiFetch(apiUrl("/api/v1/subscription/change"), {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ new_plan_id: newPlanId, category_id: categoryId }),
        })
        const json = (await res.json().catch(() => ({}))) as {
          status?: boolean
          success?: boolean
          message?: string
          data?: { effective_at?: string }
          effective_at?: string
        }
        const ok = res.ok && (json.status === true || json.success === true)
        const effectiveAt = json.data?.effective_at ?? json.effective_at
        if (ok) {
          setModal({
            type: "success",
            planName: plan.interval === "monthly" ? "Pro (Monthly)" : "Pro (Yearly)",
            effectiveAt: effectiveAt ?? undefined,
          })
        } else {
          setModal({ type: "error" })
        }
      } else {
        // New subscription: create checkout session
        const res = await apiFetch(apiUrl("/api/v1/checkout/create-session"), {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            plan_id: Number(planId),
            category_id: categoryId,
          }),
        })
        const json = (await res.json().catch(() => ({}))) as {
          status?: boolean
          success?: boolean
          message?: string
          data?: { url?: string; end_date?: string; expires_at?: string }
          url?: string
          end_date?: string
          expires_at?: string
        }
        const ok = res.ok && (json.status === true || json.success === true)
        const url = json.data?.url ?? json.url
        const endDate = json.data?.end_date ?? json.data?.expires_at ?? json.end_date ?? json.expires_at

        if (ok && typeof url === "string" && url) {
          window.location.href = url
          return
        }
        if (ok && endDate) {
          setModal({
            type: "success",
            endDate,
          })
        } else {
          setModal({ type: "error" })
        }
      }
    } catch {
      setModal({ type: "error" })
    } finally {
      setSubmitting(false)
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
                Subscribe to Pro
              </h1>
              <p className="text-white/70 text-sm mb-6">
                Choose one game to access with your Pro plan.
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
                {checkoutError && (
                  <p className="text-red-400 text-sm mb-4">{checkoutError}</p>
                )}
                <div className="space-y-2 mb-6">
                  <label htmlFor="game-select" className="text-sm font-medium text-white/90">
                    Game
                  </label>
                  <Select
                    value={game}
                    onValueChange={(v) => {
                      setGame(v)
                      setCheckoutError(null)
                    }}
                    disabled={gamesLoading || games.length === 0}
                  >
                    <SelectTrigger
                      id="game-select"
                      className="w-full h-12 bg-[#151515] border-white/10 text-white data-[placeholder]:text-white/50 disabled:opacity-50"
                    >
                      <SelectValue
                        placeholder={
                          gamesLoading ? "Loading games…" : games.length === 0 ? "No games available" : "Choose a game"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-[#242625] border-white/10">
                      {games.map((g) => (
                        <SelectItem
                          key={g.id}
                          value={String(g.id)}
                          className="text-white focus:bg-white/10 focus:text-white"
                        >
                          {g.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleSubscribe}
                  disabled={!game || submitting || gamesLoading || games.length === 0}
                  className={cn(
                    "w-full h-12 rounded-md text-sm font-semibold bg-brand-gradient text-white hover:brightness-110",
                    "disabled:opacity-50 disabled:pointer-events-none"
                  )}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Subscribing…
                    </>
                  ) : (
                    "Subscribe to Pro"
                  )}
                </Button>
              </>
            )}
          </motion.div>
        </div>
      </main>

      {/* Success / Error Modal */}
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
            aria-labelledby="subscribe-modal-title"
          >
            <div
              className="w-full max-w-md rounded-2xl border border-white/10 bg-[#151515] shadow-2xl shadow-black/40 p-8"
              onClick={(e) => e.stopPropagation()}
            >
              {modal.type === "success" ? (
                <>
                  <div className="flex justify-center mb-4">
                    <div className="rounded-full bg-green-500/20 p-4 ring-2 ring-green-500/30">
                      <CheckCircle2 className="h-14 w-14 text-green-400" />
                    </div>
                  </div>
                  <h2 id="subscribe-modal-title" className="text-xl font-display font-semibold text-white text-center mb-2">
                    Success
                  </h2>
                  <p className="text-white/70 text-sm text-center mb-6">
                    {modal.effectiveAt
                      ? `Your ${modal.planName ?? "Pro"} subscription is scheduled at ${new Date(modal.effectiveAt).toLocaleString()}`
                      : modal.endDate
                        ? `You can use this plan until ${modal.endDate}`
                        : "Your subscription has been updated successfully."}
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
                  <h2 id="subscribe-modal-title" className="text-xl font-display font-semibold text-white text-center mb-2">
                    Payment Issue
                  </h2>
                  <p className="text-white/70 text-sm text-center mb-6">
                    You did not add the card or you do not have enough money. If you want to manage your card, please
                    click below.
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
                        "Manage Card"
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
              )}
            </div>
          </div>
        </>
      )}

      <Footer />
    </div>
  )
}
