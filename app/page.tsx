import { Hero } from "@/components/hero"
import { Setups } from "@/components/setups"
import { Pricing } from "@/components/pricing"
import { Contact } from "@/components/contact"
import { BrandingMarquee } from "@/components/branding-marquee"
import { TrustedPerformance } from "@/components/trusted-performance"
import { SetupDifference } from "@/components/setup-difference"
import { Testimonials } from "@/components/testimonials"
import { BackToTop } from "@/components/back-to-top"

export default function Home() {
  return (
    <main className="min-h-screen relative bg-[#151515]">
      {/* <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(228,0,188,0.18)_0%,rgba(31,19,41,0.25)_35%,rgba(21,21,21,0)_70%)] [mask-image:linear-gradient(180deg,transparent_0%,#000_20%,#000_80%,transparent_100%)]" /> */}
      <div className="relative z-10">
        <Hero />
        {/* <BrandingMarquee /> */}
        <div className="px-16 sm:px-30 lg:px-46 w-full">
          <Setups />
          <TrustedPerformance />
          <SetupDifference />
          <Testimonials />
          <Pricing />
          <Contact />
        </div>
        <BackToTop />
      </div>
    </main>
  )
}
