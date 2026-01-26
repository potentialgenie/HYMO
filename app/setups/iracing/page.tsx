import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { SetupPage } from "@/components/setup-page"

export default function IRacingPage() {
  return (
    <div className="bg-[#1A191E]">
      <Navbar />
      <SetupPage
        game="iracing"
        title="iRacing"
        logo="/images/logos/iRacing.jpg"
        heroImage="/images/cars/HYMO_Livery_GT3_LMU.png"
        categoryId={1}
        setups={[]}
      />
      <Footer />
    </div>
  )
}
