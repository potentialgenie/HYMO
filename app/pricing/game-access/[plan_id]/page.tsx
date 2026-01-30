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
import { cn } from "@/lib/utils"
import { Loader2, ArrowLeft } from "lucide-react"

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
    try {
      const res = await apiFetch(apiUrl("/api/v1/checkout/create-session"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          plan_id: Number(planId),
          category_id: Number(game),
        }),
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
      const msg = json.message ?? (res.ok ? "No checkout URL returned" : "Checkout failed")
      setCheckoutError(msg)
    } catch (e) {
      setCheckoutError(e instanceof Error ? e.message : "Checkout failed")
    } finally {
      setSubmitting(false)
    }
  }

  if (!planId) {
    return (
      <div className="min-h-screen bg-[#1A191E]">
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
    <div className="min-h-screen bg-[#1A191E]">
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
                      className="w-full h-12 bg-[#1B1B1B] border-white/10 text-white data-[placeholder]:text-white/50 disabled:opacity-50"
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

      <Footer />
    </div>
  )
}
