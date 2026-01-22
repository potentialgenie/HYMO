import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { Setups } from "@/components/setups"
import { Pricing } from "@/components/pricing"
import { FAQ } from "@/components/faq"
import { Contact } from "@/components/contact"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background relative">
      <Navbar />
      <Hero />
      <Setups />
      <div className="relative">
        {/* Seamless background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A191E] via-[#1A191E] to-[#1A191E]" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 max-w-8xl mx-auto py-16 px-4 sm:px-6 lg:px-24 relative z-10">
          <Pricing />
          <FAQ />
        </div>
        {/* Enhanced seamless gradient transition to contact - longer and smoother */}
        <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-b from-transparent via-[#1A191E]/50 via-[#1A191E]/70 via-[#1A191E]/85 to-[#1A191E]" />
      </div>
      <Contact />
      <Footer />
    </main>
  )
}
