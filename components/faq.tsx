"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { AnimateSection } from "@/components/animate-section"

const faqs = [
  {
    question: "What games do you support?",
    answer: "We offer professional setups for iRacing, Assetto Corsa Competizione (ACC), and Le Mans Ultimate (LMU). Our Elite plan includes access to all games, while the Pro plan lets you choose one game.",
  },
  {
    question: "How do I use the setups?",
    answer: "After purchasing a plan, you can browse and download setups for your chosen game. Each setup includes installation instructions. For iRacing and ACC, you'll import the setup file into the game's setup menu. LMU setups work similarly with the game's native format.",
  },
  {
    question: "Are the setups updated for new tracks and cars?",
    answer: "Yes. We regularly update our setup library when new content is released. All plans include access to future updates. Elite members receive priority updates when new cars or tracks are added.",
  },
  {
    question: "Can I try before I buy?",
    answer: "Yes, we offer a free trial on both Pro and Elite plans. This lets you experience the quality of our setups and see the improvement in your lap times before committing to a subscription.",
  },
  {
    question: "What if a setup doesn't work for my driving style?",
    answer: "Our setups are tuned to be stable and fast out of the box, but every driver is different. We provide baseline settings that you can fine-tune. Elite members can also request custom setups tailored to their preferences.",
  },
  {
    question: "Do you offer refunds?",
    answer: "We want you to be fully satisfied. If you're not happy with your purchase within the first 7 days, contact our support team and we'll work with you to make it right. Refund eligibility may vary for permanent plans.",
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <AnimateSection id="faq" className="relative overflow-hidden">
      {/* Seamless gradient transition from setups */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#1A191E] via-[#1A191E]/80 to-transparent -z-10" />
      <div className="max-w-8xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-left mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 font-display">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-left">
            Everything you need to know about our setups and plans
          </p>
        </div>

        {/* FAQ List - tech / HUD style */}
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={cn(
                "bg-[#25262A] border rounded-sm overflow-hidden transition-all duration-200 cursor-pointer",
                "hover:shadow-[0_0_16px_oklch(0.65_0.28_328_/_0.06)]",
                openIndex === index ? "shadow-[0_0_12px_oklch(0.65_0.28_328_/_0.08)]" : "border-border"
              )}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left group/btn cursor-pointer"
              >
                <span className="font-medium text-foreground group-hover/btn:text-primary/90 transition-colors">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-white flex-shrink-0 transition-transform",
                    openIndex === index && "rotate-180"
                  )}
                />
              </button>
              <div
                className={cn(
                  "grid transition-all duration-200 ease-in-out",
                  openIndex === index ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
              >
                <div className="overflow-hidden">
                  <div className="px-6 pb-4 pt-0">
                    <p className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AnimateSection>
  )
}
