import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { Setups } from "@/components/setups"
import { Pricing } from "@/components/pricing"
import { Contact } from "@/components/contact"
import { Footer } from "@/components/footer"
import { BrandingMarquee } from "@/components/branding-marquee"
import { TrustedPerformance } from "@/components/trusted-performance"
import { SetupDifference } from "@/components/setup-difference"
import { Testimonials } from "@/components/testimonials"
import { BackToTop } from "@/components/back-to-top"

export default function Home() {
  return (
    <main className="min-h-screen relative bg-[#1a191e]">
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <div className="px-14 sm:px-16 lg:px-28">
          <Setups />
        </div>
        <BrandingMarquee />
        <div className="px-14 sm:px-16 lg:px-28">
          <TrustedPerformance />
          <SetupDifference />
          <Testimonials />
          <Pricing />
        </div>
        <Contact />
        <Footer />
        <BackToTop />
      </div>
    </main>
  )
}
