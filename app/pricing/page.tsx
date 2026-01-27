"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Pricing } from "@/components/pricing"

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
              Choose Your Plan
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

            <div className="overflow-hidden rounded-md border border-white/10 bg-card/50">
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
                src="/images/contact-1.webp"
                alt=""
                width={1024}
                height={1024}
                className="w-full xl:translate-y-[-48%] lg:translate-y-[-33%] md:translate-y-[-30%]"
                sizes="(max-width: 768px) 100vw, 1024px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-black/20" />
            </div>
            <div className="relative py-14 px-6 sm:px-10 text-left">
              <h3 className={cn("font-display text-2xl sm:text-3xl font-bold mb-2")}>
                Not sure which plan fits you?
              </h3>
              <p className="text-white/80 mb-6 ">
                Get in touch and we&apos;ll help you choose the right setup for your racing goals.
              </p>
              <Link href="/#contact">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="rounded-md font-medium border-white/40 text-white hover:bg-white/10 transition-colors duration-200"
                >
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
