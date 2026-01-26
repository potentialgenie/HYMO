import { Suspense } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { SetupPage } from "@/components/setup-page"

export default function LMUPage() {
  return (
    <div className="bg-[#1A191E]">
      <Navbar />
      <Suspense fallback={<div className="min-h-screen bg-[#1A191E]" />}>
        <SetupPage
          game="lmu"
          title="Le Mans Ultimate"
          logo="/images/logos/lmu_horz_primary_white_logo.png"
          heroImage="/images/cars/HYMO_Livery_GT3_LMU.png"
          categoryId={3}
          setups={[]}
        />
      </Suspense>
      <Footer />
    </div>
  )
}
