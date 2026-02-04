"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Pricing } from "@/components/pricing"
import { Contact } from "@/components/contact"

const features = [
  { name: "Access Scope", car: true, pro: true, elite: true },
  { name: "Number of Games", car: "1", pro: "1", elite: "All" },
  { name: "Number of Cars", car: "1", pro: "All", elite: "All" },
  { name: "Is it Permanent?", car: true, pro: false, elite: false },
  { name: "Download Limits", car: true, pro: false, elite: false },
  { name: "Includes Future Updates?", car: false, pro: true, elite: true },
  { name: "Free Trial?", car: false, pro: false, elite: true },
]

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#151515] relative overflow-hidden pt-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_5%,rgba(228,0,188,0.32)_0%,rgba(31,19,41,0.3)_30%,rgba(21,21,21,0)_100%)]"/>

      {/* Main Content */}
      <section className="relative px-16 sm:px-30 lg:px-46 overflow-hidden">
        <div className="relative z-10">
          {/* Page Header */}
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display tracking-tight mb-4 text-white">
              Simple Pricing for <br />
              <span className="text-brand-gradient">Serious Racers</span>
            </h1>
            <p className="text-white/80 text-lg max-w-xl mx-auto">
              Select the perfect plan to accelerate your racing performance
            </p>
          </motion.div>

          <div className="mb-24 flex justify-center">
            <div className="w-full max-w-5xl">
              <Pricing showHeader={false} />
            </div>
          </div>

          {/* Feature Comparison */}
          <motion.section
            className="mb-16"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4 }}
          >
            <h2 className={cn("font-display text-2xl sm:text-3xl font-bold text-center mb-8 text-white")}>
              Feature Comparison
            </h2>

            <div className="overflow-hidden rounded-md border bg-[#19181f] border-white/10">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/80">
                      <th className="text-left py-5 px-6 text-white font-semibold">Feature</th>
                      <th className="text-center py-5 px-4 text-white font-semibold">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary/80 rounded-lg text-sm">
                          Car Access
                        </span>
                      </th>
                      <th className="text-center py-5 px-4 text-white font-semibold">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary/80 rounded-lg text-sm">
                          Pro
                        </span>
                      </th>
                      <th className="text-center py-5 px-4 text-white font-semibold">
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
                          "border-t border-white/10 transition-colors hover:bg-white/5"
                        )}
                      >
                        <td className="py-4 px-6 text-white/90 font-medium">{feature.name}</td>
                        <td className="py-4 px-4 text-center">
                          {typeof feature.car === "boolean" ? (
                            feature.car ? (
                              <Check className="h-5 w-5 text-white mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-white/30 mx-auto" />
                            )
                          ) : (
                            <span className="text-white/70">{feature.car}</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {typeof feature.pro === "boolean" ? (
                            feature.pro ? (
                              <Check className="h-5 w-5 text-white mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-white/30 mx-auto" />
                            )
                          ) : (
                            <span className="text-white/70">{feature.pro}</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {typeof feature.elite === "boolean" ? (
                            feature.elite ? (
                              <Check className="h-5 w-5 text-white mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-white/30 mx-auto" />
                            )
                          ) : (
                            <span className="text-white/90 font-medium">{feature.elite}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.section>
        </div>
        <Contact />
      </section>

    </main>
  )
}
