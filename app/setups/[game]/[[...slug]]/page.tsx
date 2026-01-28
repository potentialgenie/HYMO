import { Suspense } from "react"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { SetupPage } from "@/components/setup-page"

const gameConfig = {
  iracing: {
    title: "iRacing",
    logo: "/images/logos/iRacing.jpg",
    heroImage: "/images/cars/HYMO_Livery_GT3_LMU.png",
    categoryId: 1,
  },
  acc: {
    title: "Assetto Corsa Competizione",
    logo: "/images/logos/Assetto_corsa_competizione_logo_135.png",
    heroImage: "/images/cars/HYMO_Livery_GT3_LMU.png",
    categoryId: 2,
  },
  lmu: {
    title: "Le Mans Ultimate",
    logo: "/images/logos/lmu_horz_primary_white_logo.png",
    heroImage: "/images/cars/HYMO_Livery_GT3_LMU.png",
    categoryId: 3,
  },
} as const

type GameKey = keyof typeof gameConfig

export default async function SetupsGameSlugPage({
  params,
}: {
  params: Promise<{ game: string }>
}) {
  const { game } = await params
  const gameKey = game as GameKey
  const config = gameConfig[gameKey]
  if (!config) {
    notFound()
  }
  return (
    <div className="bg-[#1A191E]">
      <Navbar />
      <Suspense fallback={<div className="min-h-screen bg-[#1A191E]" />}>
        <SetupPage
          game={gameKey}
          title={config.title}
          logo={config.logo}
          heroImage={config.heroImage}
          categoryId={config.categoryId}
          setups={[]}
        />
      </Suspense>
      <Footer />
    </div>
  )
}
