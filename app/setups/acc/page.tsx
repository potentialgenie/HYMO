import { Suspense } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { SetupPage } from "@/components/setup-page"

export default function ACCPage() {
  return (
    <div className="bg-[#1A191E]">
      <Navbar />
      <Suspense fallback={<div className="min-h-screen bg-[#1A191E]" />}>
        <SetupPage
          game="acc"
          title="Assetto Corsa Competizione"
          logo="/images/logos/Assetto_corsa_competizione_logo_135.png"
          heroImage="/images/cars/HYMO_Livery_GT3_LMU.png"
          categoryId={2}
          setups={[]}
        />
      </Suspense>
      <Footer />
    </div>
  )
}
