"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimateSection } from "@/components/animate-section"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { CrownSvg } from "./svg/CrownSvg"
import { EliteSvg } from "./svg/EliteSvg"
import { RacingCarSvg } from "./svg/RacingCarSvg"

type BillingPeriod = "monthly" | "yearly" | "permanent"

const subscriptionPlans = {
  pro: {
    name: "Pro",
    icon: <CrownSvg color="#E127E2" />,
    description: "Perfect for dedicated racers",
    monthly: { price: "€9.49" },
    yearly: { discount: "-20%", effectiveMonthly: "€7.50", total: "€89.99" },
    features: [
      { name: "Number of Games", value: "1" },
      { name: "Number of Cars", value: "ALL" },
      { name: "Is it Permanent?", included: false },
      { name: "Download Limits", included: false },
      { name: "Includes Future Updates?", included: true },
      { name: "Free Trial?", included: false },
    ],
    popular: false
  },
  elite: {
    name: "Elite",
    icon: <EliteSvg color="#E127E2" />,
    description: "For serious competitors",
    monthly: { price: "€14.99" },
    yearly: { discount: "-33%", effectiveMonthly: "€10.00", total: "€120.00" },
    features: [
      { name: "Number of Games", value: "All" },
      { name: "Number of Cars", value: "All" },
      { name: "Is it Permanent?", included: false },
      { name: "Download Limits", included: false },
      { name: "Includes Future Updates?", included: true },
      { name: "Free Trial?", included: true },
    ],
    popular: true
  }
}

const permanentPlan = {
  name: "Car Access",
  icon: <RacingCarSvg color="#E127E2" />,
  description: "Permanent access to car setups",
  features: [
    { name: "Number of Games", value: "1" },
    { name: "Number of Cars", value: "1" },
    { name: "Is it Permanent?", included: true },
    { name: "Download Limits", included: true },
    { name: "Includes Future Updates?", included: false },
    { name: "Free Trial?", included: false },
  ],
  price: "€29.99",
}

export function Pricing({ showHeader = true }: { showHeader?: boolean }) {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly")

  return (
    <AnimateSection id="pricing" className="relative overflow-hidden">
      {/* Seamless gradient transition from setups */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#1A191E] via-[#1A191E]/80 to-transparent -z-10" />
      <div className="relative z-10">
        {/* Section Header */}
        {showHeader && (
          <div className="text-left mb-5">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 font-display text-brand-gradient">
              Choose Your Plan
            </h2>
          </div>
        )}

        {/* Billing Toggle */}
        <div className="relative flex flex-wrap items-center justify-left gap-1 rounded-md bg-muted/50 backdrop-blur-sm w-fit mx-left mb-8">
          {(["monthly", "yearly", "permanent"] as const).map((period) => (
            <button
              key={period}
              onClick={() => setBillingPeriod(period)}
              className={cn(
                "relative z-10 px-5 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                billingPeriod === period
                  ? "text-primary-foreground bg-primary"
                  : "text-white hover:text-foreground bg-[#242529]"
              )}
            >
              {billingPeriod === period && (
                <motion.span 
                  layoutId="pricing-pill"
                  className="absolute inset-0 rounded-md bg-primary shadow-lg shadow-primary/25"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  aria-hidden
                />
              )}
              <span className="relative">{period.charAt(0).toUpperCase() + period.slice(1)}</span>
            </button>
          ))}
        </div>

        {/* Pricing Cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={billingPeriod}
            className={cn(
              "grid gap-6 max-w-4xl",
              billingPeriod === "permanent" ? "grid-cols-1 max-w-[420px]" : "grid-cols-1 sm:grid-cols-2"
            )}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
          {billingPeriod === "permanent" ? (
            <Card className="group relative flex flex-col overflow-hidden rounded-2xl border border-0 bg-[#242625] transition-all duration-300 hover:border-primary/60 hover:shadow-[0_18px_45px_rgba(0,0,0,0.55)]">
              <CardHeader>
                <div className="flex items-start justify-start gap-2">
                  <div className="flex flex-col items-start justify-center">
                    <CardTitle className="text-4xl font-bold tracking-tight uppercase">{permanentPlan.name}</CardTitle>
                    <CardDescription className="mt-1.5 text-sm">
                      {permanentPlan.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="mt-6">
                  <span className="text-6xl font-bold tracking-tight text-foreground">
                    {permanentPlan.price}
                  </span>
                  <span className="ml-2 text-sm font-medium text-muted-foreground">Permanent</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-0 pb-2">
                {permanentPlan.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3 text-sm first:pt-0 last:pb-0"
                  >
                    <span className="text-muted-foreground">{feature.name}</span>
                    {feature.value ? (
                      <span className="font-medium text-foreground">{feature.value}</span>
                    ) : feature.included ? (
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                    ) : (
                      <X className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                    )}
                  </div>
                ))}
              </CardContent>
              <CardFooter className="pt-2 pb-8 flex items-center justify-center">
                <Button className="flex rounded-md cursor-pointer h-12 px-16 shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all duration-200 hover:scale-105" size="lg">
                  Get Started
                </Button>
              </CardFooter>
            </Card>
          ) : (
            Object.entries(subscriptionPlans).map(([key, plan]) => (
              <Card
                key={key}
                className={cn(
                  "group relative flex flex-col overflow-hidden transition-all duration-300 rounded-2xl",
                  plan.popular
                    ? "border-0 bg-gradient-to-b from-[#7000BF] via-[#560193] to-[#35005b]"
                    : "border-0 border-white/10 bg-[#242625]"
                )}
              >
                <CardHeader>
                  {plan.popular && (
                    <div className="absolute right-4 top-4 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
                      Popular
                    </div>
                  )}
                  <div className="flex items-center justify-start gap-3">
                    <div className="flex flex-col items-start justify-center">
                      <CardTitle className={cn(
                        "uppercase tracking-tight",
                        "text-4xl font-bold"
                      )}>
                        {plan.name}
                      </CardTitle>
                      <CardDescription className={cn(
                        "mt-1.5 text-sm",
                        plan.popular ? "text-white/90" : ""
                      )}>
                        {plan.description}
                      </CardDescription>
                    </div>
                  </div>
                  
                  {/* Enhanced Discount Tag - Only show for yearly billing */}
                  {billingPeriod === "yearly" && (
                    <div className="mt-6 mb-4">
                      <div 
                        className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm overflow-hidden group/badge"
                        style={{
                          background: 'linear-gradient(135deg, rgb(168 85 247), rgb(236 72 153))',
                          boxShadow: '0 4px 20px rgba(168, 85, 247, 0.4), 0 0 40px rgba(236, 72, 153, 0.2)'
                        }}
                      >
                        {/* Animated shine effect */}
                        <span 
                          className="absolute inset-0 opacity-0 group-hover/badge:opacity-100 transition-opacity duration-500"
                          style={{
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                            animation: 'shine 2s ease-in-out infinite'
                          }}
                        />
                        
                        {/* Sparkle icon */}
                        <svg className="w-4 h-4 text-white relative z-10" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        
                        <span className="text-white font-bold text-base tracking-wide relative z-10">
                          Save {plan.yearly.discount}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className={cn("rounded-sm", billingPeriod === "yearly" ? "mt-0" : "mt-6")}>
                    {billingPeriod === "monthly" ? (
                      <div className="flex flex-wrap items-baseline justify-left gap-1.5">
                        <span className={cn(
                          "text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight",
                          plan.popular ? "text-white" : "text-foreground"
                        )}>
                          {plan.monthly.price}
                        </span>
                        <span className={cn(
                          "text-sm font-medium",
                          plan.popular ? "text-white/90" : "text-muted-foreground"
                        )}>
                          Monthly
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-baseline justify-start gap-1.5">
                          <span className={cn(
                            "text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight",
                            plan.popular ? "text-white" : "text-foreground"
                          )}>
                            {plan.yearly.effectiveMonthly}
                          </span>
                          <span className={cn(
                            "text-sm",
                            plan.popular ? "text-white/90" : "text-muted-foreground"
                          )}>
                            /mo
                          </span>
                        </div>
                        <p className={cn(
                          "text-sm",
                          plan.popular ? "text-white/90" : "text-muted-foreground"
                        )}>
                          {plan.yearly.total} /Yearly
                        </p>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-0 pb-2">
                  {plan.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-3 text-sm first:pt-0 last:pb-0"
                    >
                      <span className={cn(
                        "text-muted-foreground",
                        plan.popular ? "text-white/90" : ""
                      )}>
                        {feature.name}
                      </span>
                      {feature.value ? (
                        <span className={cn(
                          "font-medium",
                          plan.popular ? "text-white" : "text-foreground"
                        )}>
                          {feature.value}
                        </span>
                      ) : feature.included ? (
                        <Check className={cn(
                          "h-4 w-4 shrink-0",
                          plan.popular ? "text-white" : "text-primary"
                        )} />
                      ) : (
                        <X className={cn(
                          "h-4 w-4 shrink-0",
                          plan.popular ? "text-white/40" : "text-muted-foreground/40"
                        )} />
                      )}
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="pt-2 pb-6 flex items-center justify-center">
                  <Button
                    className={cn(
                      "flex cursor-pointer h-12 px-16 rounded-full text-sm font-semibold tracking-wide transition-all duration-200 hover:scale-105",
                      plan.popular
                        ? "shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)]"
                        : "shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]"
                    )}
                    size="lg"
                  >
                    Get Started
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
          </motion.div>
        </AnimatePresence>

      </div>
    </AnimateSection>
  )
}
