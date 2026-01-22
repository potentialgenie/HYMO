"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, X, Sparkles, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { CrownSvg } from "@/components/svg/CrownSvg"
import { EliteSvg } from "@/components/svg/EliteSvg"
import { RacingCarSvg } from "@/components/svg/RacingCarSvg"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

type BillingPeriod = "monthly" | "yearly" | "permanent"

const subscriptionPlans = {
  pro: {
    name: "Pro",
    description: "Perfect for dedicated racers",
    icon: <CrownSvg color="#E127E2" />,
    monthly: { price: "€9.49" },
    yearly: { discount: "-20%", effectiveMonthly: "€7.50", total: "€89.99" },
    popular: false
  },
  elite: {
    name: "Elite",
    description: "For serious competitors",
    icon: <EliteSvg color="#E127E2" />,
    monthly: { price: "€14.99" },
    yearly: { discount: "-33%", effectiveMonthly: "€10.00", total: "€120.00" },
    popular: true
  }
}

const permanentPlan = {
  name: "Car Access",
  description: "Permanent access to car setups",
  icon: <RacingCarSvg color="#E127E2" />,
  price: "€29.99",
  features: [
    { name: "Number of Games", value: "1" },
    { name: "Number of Cars", value: "1" },
    { name: "Is it Permanent?", included: true },
    { name: "Download Limits", included: true },
    { name: "Includes Future Updates?", included: false },
    { name: "Free Trial?", included: false },
  ],
}

const features = [
  { name: "Access Scope", car: true, pro: true, elite: true },
  { name: "Number of Games", car: "1", pro: "1", elite: "All" },
  { name: "Number of Cars", car: "1", pro: "All", elite: "All" },
  { name: "Is it Permanent?", car: true, pro: false, elite: false },
  { name: "Download Limits", car: true, pro: false, elite: false },
  { name: "Includes Future Updates?", car: false, pro: true, elite: true },
  { name: "Free Trial?", car: false, pro: false, elite: true },
]

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
}

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly")

  return (
    <div className="min-h-screen bg-background">
      <Navbar/>

      {/* Main Content */}
      <main className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-24 bg-[#1A191E]">
        <div className="relative z-10">
          {/* Page Header */}
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-primary font-medium text-sm uppercase tracking-wider mb-3">
              Pricing
            </p>
            <h1 className={cn("font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4")}>
              Choose Your <span className="text-primary italic">Plan</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Select the perfect plan to accelerate your racing performance
            </p>
          </motion.div>

          {/* Billing Toggle - Segmented control */}
          <motion.div
            className="flex justify-center mb-14"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="inline-flex p-1.5 rounded-xl bg-secondary/80 border border-border/60 shadow-inner">
              {(["monthly", "yearly", "permanent"] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setBillingPeriod(period)}
                  className={cn(
                    "relative px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                    billingPeriod === period
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {billingPeriod === period && (
                    <motion.span
                      layoutId="billing-pill"
                      className="absolute inset-0 bg-primary rounded-lg shadow-lg shadow-primary/25"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  <span className="relative z-10">
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Pricing Cards */}
          <motion.div
            className={cn(
              "grid gap-6 max-w-4xl mx-auto mb-24",
              billingPeriod === "permanent" ? "grid-cols-1 max-w-md" : "md:grid-cols-2"
            )}
            variants={container}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence mode="sync">
              {billingPeriod === "permanent" ? (
                <motion.div
                  key="permanent"
                  variants={item}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <Card className="relative overflow-hidden bg-card/95 border border-border/80 transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="text-center pb-2 pt-10 relative">
                      <div className="mx-auto mb-3 flex h-16 w-16 p-2 items-center justify-center rounded-xl bg-primary/15 text-primary">
                        {permanentPlan.icon}
                      </div>
                      <CardTitle className={cn("font-display text-2xl font-bold")}>
                        {permanentPlan.name}
                      </CardTitle>
                      <p className="text-muted-foreground text-sm mt-1">{permanentPlan.description}</p>
                    </CardHeader>
                    <CardContent className="text-center pb-4 relative">
                      <div className="mb-1">
                        <span className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
                          {permanentPlan.price}
                        </span>
                      </div>
                      <span className="text-muted-foreground text-sm">Permanent</span>
                    </CardContent>
                    <CardFooter className="pt-2 pb-10 relative">
                      <Button className="w-full rounded-lg h-11 font-medium" variant="outline" size="lg">
                        Get Started
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ) : (
                Object.entries(subscriptionPlans).map(([key, plan]) => {
                  return (
                    <motion.div key={key} variants={item} initial="hidden" animate="visible" exit="exit">
                      <Card
                        className={cn(
                          "relative overflow-hidden transition-all duration-300 group",
                          "bg-card/95 border border-border/80",
                          "hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5",
                          plan.popular && "border-primary/60 shadow-lg shadow-primary/10 md:-mt-1 md:mb-1 md:scale-[1.02]"
                        )}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        {plan.popular && (
                          <div
                            className="best-ribbon absolute -right-15 -top-5 flex h-7 w-34 items-center justify-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-black shadow-md origin-top-left rotate-45"
                            style={{
                              background: "linear-gradient(135deg, #E127E2 0%, #FF58F2 50%, #E127E2 100%)",
                            }}
                            aria-label="Best choice"
                          >
                            <span className="text-white font-bold text-sm">POPULAR</span>
                          </div>
                        )}
                        <CardHeader className="text-center pb-2 pt-10 relative">
                          <div className={cn(
                            "mx-auto mb-3 flex h-16 w-16 p-2 items-center justify-center rounded-xl bg-primary/20 text-primary",
                          )}>
                            {plan.icon}
                          </div>
                          <CardTitle className={cn("font-display text-2xl font-bold")}>
                            {plan.name}
                          </CardTitle>
                          <p className="text-muted-foreground text-sm mt-1">{plan.description}</p>
                        </CardHeader>
                        <CardContent className="text-center pb-4 relative">
                          {billingPeriod === "monthly" ? (
                            <>
                              <div className="mb-1">
                                <span className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
                                  {plan.monthly.price}
                                </span>
                              </div>
                              <span className="text-muted-foreground text-sm">per month</span>
                            </>
                          ) : (
                            <>
                              <span className="inline-block px-2.5 py-1 text-xs font-bold bg-primary/20 text-primary rounded-md mb-2">
                                {plan.yearly.discount}
                              </span>
                              <div className="mb-1">
                                <span className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
                                  {plan.yearly.effectiveMonthly}
                                </span>
                              </div>
                              <span className="text-muted-foreground text-sm">
                                {plan.yearly.total} billed yearly
                              </span>
                            </>
                          )}
                        </CardContent>
                        <CardFooter className="pt-2 pb-10 relative">
                          <Button
                            className={cn("w-full rounded-lg h-11 font-medium", plan.popular && "shadow-lg shadow-primary/20")}
                            variant={plan.popular ? "default" : "outline"}
                            size="lg"
                          >
                            Get Started
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  )
                })
              )}
            </AnimatePresence>
          </motion.div>

          {/* Feature Comparison */}
          <motion.section
            className="mb-16"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4 }}
          >
            <h2 className={cn("font-display text-2xl sm:text-3xl font-bold text-center mb-8")}>
              Feature Comparison
            </h2>

            <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/50 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/80">
                      <th className="text-left py-5 px-6 text-foreground font-semibold">Feature</th>
                      <th className="text-center py-5 px-4 text-foreground font-semibold">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary/80 rounded-lg text-sm">
                          Car Access
                        </span>
                      </th>
                      <th className="text-center py-5 px-4 text-foreground font-semibold">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary/80 rounded-lg text-sm">
                          Pro
                        </span>
                      </th>
                      <th className="text-center py-5 px-4 text-foreground font-semibold">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-sm font-medium">
                          Elite
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {features.map((feature, index) => (
                      <tr
                        key={feature.name}
                        className={cn(
                          "border-t border-border/50 transition-colors hover:bg-muted/20",
                          index % 2 === 1 && "bg-muted/5"
                        )}
                      >
                        <td className="py-4 px-6 text-foreground font-medium">{feature.name}</td>
                        <td className="py-4 px-4 text-center">
                          {typeof feature.car === "boolean" ? (
                            feature.car ? (
                              <Check className="h-5 w-5 text-primary mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />
                            )
                          ) : (
                            <span className="text-muted-foreground">{feature.car}</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {typeof feature.pro === "boolean" ? (
                            feature.pro ? (
                              <Check className="h-5 w-5 text-primary mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />
                            )
                          ) : (
                            <span className="text-muted-foreground">{feature.pro}</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {typeof feature.elite === "boolean" ? (
                            feature.elite ? (
                              <Check className="h-5 w-5 text-primary mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />
                            )
                          ) : (
                            <span className="text-foreground font-medium">{feature.elite}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.section>

          {/* CTA Section */}
          <motion.div
            className="relative overflow-hidden rounded-2xl"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4 }}
          >
            <div className="absolute inset-0">
              <Image
                src="/images/pricing-cta.jpg"
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 1024px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-black/20" />
            </div>
            <div className="relative py-14 px-6 sm:px-10 text-left">
              <h3 className={cn("font-display text-2xl sm:text-3xl font-bold mb-2")}>
                Not sure which plan fits you?
              </h3>
              <p className="text-muted-foreground mb-6 ">
                Get in touch and we&apos;ll help you choose the right setup for your racing goals.
              </p>
              <Link href="/#contact">
                <Button variant="outline" size="lg" className="rounded-sm font-medium bg-black/50 backdrop-blur-sm hover:bg-black/80 hover:scale-105 cursor-pointer">
                  Contact Us
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer/>
    </div>
  )
}
