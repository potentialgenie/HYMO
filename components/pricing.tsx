"use client"

import { useState } from "react"
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

export function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly")

  return (
    <AnimateSection id="pricing" className="relative overflow-hidden">
      {/* Seamless gradient transition from setups */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#1A191E] via-[#1A191E]/80 to-transparent -z-10" />
      <div className="relative z-10">
        {/* Section Header */}
        <div className="text-left mb-5">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 font-display">
            Choose Your Plan
          </h2>
        </div>

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
                <span 
                  className="absolute inset-0 rounded-md bg-primary shadow-lg shadow-primary/25"
                  aria-hidden
                />
              )}
              <span className="relative">{period.charAt(0).toUpperCase() + period.slice(1)}</span>
            </button>
          ))}
        </div>

        {/* Pricing Cards */}
        <div className={cn(
          "grid gap-6 max-w-4xl",
          billingPeriod === "permanent" ? "grid-cols-1 max-w-[420px]" : "grid-cols-1 sm:grid-cols-2"
        )}>
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
                <Button className="flex rounded-md cursor-pointer bg-primary h-12 px-16" variant="outline" size="lg">
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
                  <div className="mt-6 rounded-sm">
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
                        <span className={cn(
                          "inline-block rounded-md px-2 py-0.5 text-xs font-semibold",
                          plan.popular ? "bg-white/15 text-white" : "bg-primary/20 text-primary"
                        )}>
                          {plan.yearly.discount}
                        </span>
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
                      "flex cursor-pointer h-12 px-16 rounded-full text-sm font-semibold tracking-wide",
                      plan.popular
                        ? "bg-fuchsia-700 text-primary-foreground hover:bg-primary/90"
                        : "bg-fuchsia-700 text-primary-foreground hover:bg-primary/90"
                    )}
                    variant={plan.popular ? "default" : "default"}
                    size="lg"
                  >
                    Get Started
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>

      </div>
    </AnimateSection>
  )
}
