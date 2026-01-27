"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimateSection } from "@/components/animate-section"
import { Check, Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { CrownSvg } from "./svg/CrownSvg"
import { EliteSvg } from "./svg/EliteSvg"
import { RacingCarSvg } from "./svg/RacingCarSvg"

type BillingPeriod = "monthly" | "yearly" | "permanent"

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

type ApiResponse = {
  status: boolean
  message?: string
  data: PlanFromApi[]
}

// Feature lists (not provided by API) – keyed by plan type
const PRO_FEATURES = [
  { name: "Number of Games", value: "1" },
  { name: "Number of Cars", value: "ALL" },
  { name: "Is it Permanent?", included: false },
  { name: "Download Limits", included: false },
  { name: "Includes Future Updates?", included: true },
  { name: "Free Trial?", included: false },
]

const ELITE_FEATURES = [
  { name: "Number of Games", value: "All" },
  { name: "Number of Cars", value: "All" },
  { name: "Is it Permanent?", included: false },
  { name: "Download Limits", included: false },
  { name: "Includes Future Updates?", included: true },
  { name: "Free Trial?", included: true },
]

const CAR_ACCESS_FEATURES = [
  { name: "Number of Games", value: "1" },
  { name: "Number of Cars", value: "1" },
  { name: "Is it Permanent?", included: true },
  { name: "Download Limits", included: true },
  { name: "Includes Future Updates?", included: false },
  { name: "Free Trial?", included: false },
]

function buildSubscriptionPlans(data: PlanFromApi[]) {
  const proMonthly = data.find((p) => p.name === "Pro" && p.interval === "monthly")
  const proYearly = data.find((p) => p.name === "Pro" && p.interval === "yearly")
  const eliteMonthly = data.find((p) => p.name === "Elite" && p.interval === "monthly")
  const eliteYearly = data.find((p) => p.name === "Elite" && p.interval === "yearly")

  return {
    pro: {
      name: "Pro",
      icon: <CrownSvg color="#E127E2" />,
      monthly: proMonthly
        ? {
            price: `${proMonthly.currency_symbol}${proMonthly.price}`,
            stripe_price_id: proMonthly.stripe_price_id,
            description: proMonthly?.description || null,
          }
        : null,
      yearly: proYearly
        ? {
            discount: `-${proYearly.discount}%`,
            effectiveMonthly: `${proYearly.currency_symbol}${(parseFloat(proYearly.price) / 12).toFixed(2)}`,
            total: `${proYearly.currency_symbol}${proYearly.price}`,
            stripe_price_id: proYearly.stripe_price_id,
            description: proYearly?.description || null,
          }
        : null,
      features: PRO_FEATURES,
      popular: false,
    },
    elite: {
      name: "Elite",
      icon: <EliteSvg color="#E127E2" />,
      description: eliteMonthly?.description || eliteYearly?.description || null,
      monthly: eliteMonthly
        ? {
            price: `${eliteMonthly.currency_symbol}${eliteMonthly.price}`,
            stripe_price_id: eliteMonthly.stripe_price_id,
            description: eliteMonthly?.description || null,
          }
        : null,
      yearly: eliteYearly
        ? {
            discount: `-${eliteYearly.discount}%`,
            effectiveMonthly: `${eliteYearly.currency_symbol}${(parseFloat(eliteYearly.price) / 12).toFixed(2)}`,
            total: `${eliteYearly.currency_symbol}${eliteYearly.price}`,
            stripe_price_id: eliteYearly.stripe_price_id,
            description: eliteYearly?.description || null,
          }
        : null,
      features: ELITE_FEATURES,
      popular: true,
    },
  }
}

function buildPermanentPlan(data: PlanFromApi[]) {
  const p = data.find((x) => x.interval === "permanent")
  if (!p) return null
  return {
    name: p.name,
    description: p.description || null,
    price: `${p.currency_symbol}${p.price}`,
    stripe_price_id: p.stripe_price_id,
    icon: <RacingCarSvg color="#E127E2" />,
    features: CAR_ACCESS_FEATURES,
  }
}

export function Pricing({ showHeader = true }: { showHeader?: boolean }) {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly")
  const [plansData, setPlansData] = useState<PlanFromApi[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPlans = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("https://www.hymosetups.com/api/v1/plans")
      const json: ApiResponse = await res.json()
      if (!res.ok || !json.status || !Array.isArray(json.data)) {
        throw new Error(json.message || "Failed to load plans")
      }
      setPlansData(json.data)
      console.log("json.data", json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load plans")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  const subscriptionPlans = useMemo(
    () => (plansData ? buildSubscriptionPlans(plansData) : null),
    [plansData]
  )
  const permanentPlan = useMemo(
    () => (plansData ? buildPermanentPlan(plansData) : null),
    [plansData]
  )

  const periodTabs = useMemo(() => {
    if (loading) return (["monthly", "yearly", "permanent"] as const)
    return (["monthly", "yearly", "permanent"] as const).filter(
      (p) => p !== "permanent" || !!permanentPlan
    )
  }, [loading, permanentPlan])

  const plansToShow =
    subscriptionPlans && billingPeriod !== "permanent"
      ? Object.entries(subscriptionPlans).filter(([, plan]) =>
          billingPeriod === "monthly" ? plan.monthly : plan.yearly
        )
      : []

  return (
    <AnimateSection id="pricing" className="relative overflow-hidden">
      <div className="relative z-10">
        {showHeader && (
          <div className="text-center mb-5">
            <h2 className="text-3xl sm:text-4xl md:text-5xl mb-4 font-display text-white">
              Choose Your Plan
            </h2>
          </div>
        )}

        <div className="relative flex flex-wrap items-center justify-center gap-1 rounded-md bg-muted/50 backdrop-blur-sm w-fit mx-auto mb-8">
          {periodTabs.map((period) => (
            <button
              key={period}
              onClick={() => setBillingPeriod(period)}
              className={cn(
                "relative z-10 px-5 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                billingPeriod === period
                  ? "text-primary-foreground bg-brand-gradient"
                  : "text-white hover:text-foreground bg-[#242529]"
              )}
            >
              {billingPeriod === period && (
                <motion.span
                  layoutId="pricing-pill"
                  className="absolute inset-0 rounded-md bg-brand-gradient shadow-lg shadow-primary/25"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  aria-hidden
                />
              )}
              <span className="relative">
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={billingPeriod}
            className={cn(
              "grid gap-6 max-w-4xl mx-auto",
              billingPeriod === "permanent"
                ? "grid-cols-1 max-w-[420px]"
                : "grid-cols-1 sm:grid-cols-2"
            )}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            {loading ? (
              <div className="col-span-full flex items-center justify-center py-16 text-white/70">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                Loading plans…
              </div>
            ) : error ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-white/80">
                <p className="mb-4">{error}</p>
                <Button onClick={fetchPlans} variant="outline" size="sm">
                  Retry
                </Button>
              </div>
            ) : billingPeriod === "permanent" ? (
              !permanentPlan ? (
                <div className="col-span-full text-center py-16 text-white/70">
                  No permanent plan available.
                </div>
              ) : (
                <Card className="group relative flex flex-col overflow-hidden rounded-md border border-white/10 bg-[#242625] transition-colors duration-200">
                  <CardHeader>
                    <div className="flex items-start justify-start gap-2">
                      <div className="flex flex-col items-start justify-center">
                        <CardTitle className="text-4xl font-bold tracking-tight uppercase">
                          {permanentPlan.name}
                        </CardTitle>
                      </div>
                    </div>
                    <div className="mt-6">
                      <span className="text-6xl font-bold tracking-tight text-foreground">
                        {permanentPlan.price}
                      </span>
                      <span className="ml-2 text-sm font-medium text-white/70">
                        Permanent
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-0 pb-2">
                    {permanentPlan.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-3 text-sm first:pt-0 last:pb-0"
                      >
                        <span className="text-white/70">{feature.name}</span>
                        {feature.value ? (
                          <span className="font-medium text-foreground">
                            {feature.value}
                          </span>
                        ) : feature.included ? (
                          <Check className="h-4 w-4 shrink-0 text-primary" />
                        ) : (
                          <X className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                        )}
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter className="pt-2 pb-8 flex items-center justify-center">
                    <Button
                      className="flex rounded-md cursor-pointer h-12 px-16 transition-all duration-200 bg-brand-gradient text-white hover:brightness-110"
                      size="lg"
                      data-stripe-price-id={permanentPlan.stripe_price_id}
                    >
                      Get Started
                    </Button>
                  </CardFooter>
                </Card>
              )
            ) : plansToShow.length === 0 ? (
              <div className="col-span-full text-center py-16 text-white/70">
                No plans available for this billing period.
              </div>
            ) : (
              plansToShow.map(([key, plan]) => {
                const monthly = plan.monthly
                const yearly = plan.yearly
                return (
                  <Card
                    key={key}
                    className={cn(
                      "group relative flex flex-col overflow-hidden transition-colors duration-200 rounded-md border border-white/10",
                      plan.popular ? "bg-[#2a1b3d]" : "bg-[#242625]"
                    )}
                  >
                    <CardHeader>
                      {plan.popular && (
                        <div className="absolute right-4 top-4 rounded-md border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/90">
                          Popular
                        </div>
                      )}
                      <div className="flex items-center justify-start gap-3">
                        <div className="flex flex-col items-start justify-center">
                          <CardTitle
                            className={cn(
                              "uppercase tracking-tight",
                              "text-4xl font-bold"
                            )}
                          >
                            {plan.name}
                          </CardTitle>
                        </div>
                      </div>

                      {billingPeriod === "yearly" && yearly && (
                        <div className="mt-5 mb-3">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] uppercase tracking-wider font-semibold text-white/90 bg-white/10 border border-white/15">
                            <svg
                              className="w-3 h-3 text-white/90"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-[12px] text-white/70">Save</span>
                            <span className="text-[16px] font-bold text-white">
                              {yearly.discount}
                            </span>
                          </div>
                        </div>
                      )}

                      <div
                        className={cn(
                          "rounded-sm",
                          billingPeriod === "yearly" ? "mt-0" : "mt-6"
                        )}
                      >
                        {billingPeriod === "monthly" && monthly ? (
                          <div className="flex flex-wrap items-baseline justify-left gap-1.5">
                            <span
                              className={cn(
                                "text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight",
                                plan.popular ? "text-white" : "text-foreground"
                              )}
                            >
                              {monthly.price}
                            </span>
                            <span className="text-sm font-medium text-white/70">
                              Monthly
                            </span>
                          </div>
                        ) : yearly ? (
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-baseline justify-start gap-1.5">
                              <span
                                className={cn(
                                  "text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight",
                                  plan.popular ? "text-white" : "text-foreground"
                                )}
                              >
                                {yearly.effectiveMonthly}
                              </span>
                              <span className="text-sm text-white/70">/mo</span>
                            </div>
                            <p className="text-sm text-white/70">
                              {yearly.total} /Yearly
                            </p>
                          </div>
                        ) : null}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-0 pb-2">
                      {plan.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-3 text-sm first:pt-0 last:pb-0"
                        >
                          <span className="text-white/70">
                            {feature.name}
                          </span>
                          {feature.value ? (
                            <span
                              className={cn(
                                "font-medium",
                                plan.popular ? "text-white" : "text-foreground"
                              )}
                            >
                              {feature.value}
                            </span>
                          ) : feature.included ? (
                            <Check
                              className={cn(
                                "h-4 w-4 shrink-0",
                                plan.popular ? "text-white" : "text-primary"
                              )}
                            />
                          ) : (
                            <X className="h-4 w-4 shrink-0 text-white/30" />
                          )}
                        </div>
                      ))}
                    </CardContent>
                    <CardFooter className="pt-2 pb-6 flex items-center justify-center">
                      <Button
                        className="flex cursor-pointer h-12 px-16 rounded-md text-sm font-semibold tracking-wide transition-all duration-200 bg-brand-gradient text-white hover:brightness-110"
                        size="lg"
                        data-stripe-price-id={
                          (billingPeriod === "monthly" ? monthly : yearly)
                            ?.stripe_price_id
                        }
                      >
                        Get Started
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </AnimateSection>
  )
}
