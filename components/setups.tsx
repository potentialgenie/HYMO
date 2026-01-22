"use client"

import { useState, useCallback, useEffect } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { defaultViewport, defaultTransition } from "@/components/animate-section"
import { Download, Star, Share2, ChevronRight, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

const games = [
  { id: "all", name: "All Games" },
  { id: "acc", name: "ACC" },
  { id: "iracing", name: "iRacing" },
  { id: "f1", name: "F1 24" },
  { id: "gt7", name: "Gran Turismo 7" },
]

// Helper function to check if it's the start of a week (Monday) or month (1st of month)
const isNewPeriod = () => {
  const now = new Date()
  const dayOfWeek = now.getDay() // 0 = Sunday, 1 = Monday
  const dayOfMonth = now.getDate()
  
  // Check if it's Monday (start of week) or 1st of month
  return dayOfWeek === 1 || dayOfMonth === 1
}

// Helper function to parse download count (handles "12.4K" format)
const parseDownloads = (downloads: string): number => {
  const num = parseFloat(downloads.replace('K', ''))
  return downloads.includes('K') ? num * 1000 : num
}

const allSetups = [
  { id: 1, game: "acc", gameName: "Assetto Corsa Competizione", car: "Ferrari 296 GT3", track: "Spa-Francorchamps", lapTime: "2:16.847", downloads: "12.4K", rating: 4.9, champion: "Max Benecke", image: "/images/acc-hero.jpg" },
  { id: 2, game: "iracing", gameName: "iRacing", car: "Porsche 911 GT3 R", track: "Nürburgring GP", lapTime: "1:54.231", downloads: "8.7K", rating: 4.8, champion: "Joshua Rogers", image: "/images/contact-bg.jpg" },
  { id: 3, game: "f1", gameName: "F1 24", car: "Red Bull RB20", track: "Monaco", lapTime: "1:10.456", downloads: "15.2K", rating: 4.9, champion: "Jarno Opmeer", image: "/images/hero-bg.jpg" },
  { id: 4, game: "acc", gameName: "Assetto Corsa Competizione", car: "BMW M4 GT3", track: "Monza", lapTime: "1:46.123", downloads: "10.1K", rating: 4.7, champion: "Nils Naujoks", image: "/images/lmu-hero.jpg" },
  { id: 5, game: "gt7", gameName: "Gran Turismo 7", car: "Toyota GR010 Hybrid", track: "Le Mans", lapTime: "3:24.567", downloads: "6.3K", rating: 4.8, champion: "Takuma Miyazono", image: "/images/hero-bg-1.jpg" },
  { id: 6, game: "iracing", gameName: "iRacing", car: "McLaren MP4-30", track: "Suzuka", lapTime: "1:29.847", downloads: "9.5K", rating: 4.9, champion: "Bono Huis", image: "/images/cta.jpg" },
]

// Automatically determine popular/featured setups at start of week/month
const getFeaturedSetups = () => {
  // Calculate popularity score: (downloads * 0.4) + (rating * 0.6 * 1000)
  const setupsWithScore = allSetups.map(setup => ({
    ...setup,
    popularityScore: parseDownloads(setup.downloads) * 0.4 + setup.rating * 0.6 * 1000
  }))
  
  // Sort by popularity score and get top 3-5 as featured
  const sorted = [...setupsWithScore].sort((a, b) => b.popularityScore - a.popularityScore)
  const topPopular = sorted.slice(0, 3).map(s => s.id)
  
  // Mark as featured
  return allSetups.map(setup => ({
    ...setup,
    featured: topPopular.includes(setup.id)
  }))
}

const setups = getFeaturedSetups()

export function Setups() {
  const [activeGame, setActiveGame] = useState("all")
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    containScroll: "trimSnaps",
    slidesToScroll: 1,
  })
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
    return () => {
      emblaApi.off("select", onSelect)
      emblaApi.off("reInit", onSelect)
    }
  }, [emblaApi, onSelect])

  // Reinit when game filter changes
  useEffect(() => {
    emblaApi?.reInit()
  }, [activeGame, emblaApi])

  // Filter setups by game
  const filteredSetups = activeGame === "all" 
    ? setups 
    : setups.filter(s => s.game === activeGame)

  // Sort setups: featured first, then by popularity
  const sortedSetups = [...filteredSetups].sort((a, b) => {
    if (a.featured && !b.featured) return -1
    if (!a.featured && b.featured) return 1
    const aScore = parseDownloads(a.downloads) * 0.4 + a.rating * 0.6 * 1000
    const bScore = parseDownloads(b.downloads) * 0.4 + b.rating * 0.6 * 1000
    return bScore - aScore
  })

  return (
    <section id="setups" className="relative py-24 overflow-hidden">
      {/* Seamless gradient background */}
      <div className="absolute inset-0 bg-[#1A191E]" />
      {/* Gradient transition from hero - seamless blend */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#1A191E] via-[#1A191E] to-transparent" />
      {/* Gradient transition to pricing/FAQ - seamless blend */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-b from-transparent via-[#1A191E] to-[#1A191E]" />
      
      <div className="relative z-10 max-w-8xl mx-auto px-4 sm:px-6 lg:px-24">
        {/* Section Header - Centered */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={defaultViewport}
          transition={defaultTransition}
        >
          <h2 className="text-5xl sm:text-6xl font-bold mb-4 font-display">
            Browse Pro Setups
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-2">
            Explore setups from the {"world's"} top esports racing champions
          </p>
          {isNewPeriod() && (
            <p className="text-primary text-sm font-medium mt-2 inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/30">
              <span>✨</span>
              <span>
                {new Date().getDate() === 1 
                  ? "This month's" 
                  : "This week's"} most popular setups - automatically updated
              </span>
            </p>
          )}
        </motion.div>

       {/* Game Filter - Segmented pill with indicator - Centered */}
        <div className="relative flex flex-wrap items-center justify-center gap-2 rounded-sm bg-muted/50 backdrop-blur-sm w-fit mx-auto mb-14">
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => setActiveGame(game.id)}
              className={cn(
                "relative z-10 px-5 py-2.5 rounded-sm text-sm font-medium transition-all duration-200",
                activeGame === game.id
                  ? "text-primary-foreground bg-primary"
                  : "text-white hover:text-foreground bg-[#242529]"
              )}
            >
              <span className="relative">{game.name}</span>
            </button>
          ))}
        </div>

        {/* Setups Carousel - Centered */}
        <div className="relative max-w-[1400px] mx-auto">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex" style={{ backfaceVisibility: "hidden" }}>
              {sortedSetups.map((setup) => (
                <div
                  key={setup.id}
                  className="flex-[0_0_300px] sm:flex-[0_0_340px] min-w-0 mr-6"
                >
                  <article
                    className={cn(
                      "group/card flex flex-col h-full overflow-hidden rounded-sm bg-[#242625]",
                      "shadow-lg shadow-black/30",
                      "transition-all duration-300 cursor-pointer",
                    )}
                  >
                    {/* Image – text top-left, Featured bottom-left */}
                    <div className="relative w-full aspect-[16/10] flex-shrink-0 overflow-hidden bg-muted">
                      <Image
                        src={setup.image}
                        alt={setup.car}
                        fill
                        className="object-cover transition-transform duration-500 group-hover/card:scale-105"
                        sizes="(max-width: 640px) 300px, 340px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
                      {/* Text overlays top-left – stacked */}
                      <div className="absolute top-3 left-3 right-3 text-white space-y-0.5">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-white/80">Racing</p>
                        <p className="text-xs text-white/95">{setup.gameName}</p>
                        <p className="text-sm font-semibold text-white">{setup.car}</p>
                        <p className="text-xs text-white/85">{setup.track}</p>
                      </div>
                      {setup.featured && (
                        <span className="absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-wider text-primary-foreground bg-primary px-2.5 py-1 rounded">
                          Featured
                        </span>
                      )}
                    </div>

                    {/* Content – dark, stats + tuned by + pink action buttons */}
                    <div className="flex flex-col flex-1 p-4 bg-transparent">

                      <div className="flex justify-end gap-4 mt-1">
                        <div className="text-right space-y-2">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/90">Downloads</p>
                            <p className="flex items-center justify-end gap-1 font-semibold text-foreground mt-0.5">
                              <Download className="h-3.5 w-3.5 text-white" />
                              {setup.downloads}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/90">Rating</p>
                            <p className="flex items-center justify-end gap-1 font-semibold text-foreground mt-0.5">
                              <Star className="h-3.5 w-3.5 fill-white text-white" />
                              {setup.rating}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Tuned by (left) + Download / Share buttons (right) */}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                        <p className="text-[11px] text-muted-foreground">
                          Tuned by <span className="text-foreground font-medium">{setup.champion}</span>
                        </p>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            className="h-9 w-9 rounded-full bg-transparent border border-white cursor-pointer hover:bg-white/10 flex items-center justify-center hover:opacity-90 transition-opacity"
                            aria-label="Download"
                          >
                            <Download className="h-4 w-4 text-white" />
                          </button>
                          <button
                            type="button"
                            className="h-9 w-9 rounded-full bg-transparent border border-white cursor-pointer hover:bg-white/10 flex items-center justify-center hover:opacity-90 transition-opacity"
                            aria-label="Share"
                          >
                            <Share2 className="h-4 w-4 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </div>

          {/* Prev / Next */}
          <button
            type="button"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className={cn(
              "absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full",
              "bg-background/90 border border-border shadow-md flex items-center justify-center",
              "text-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-opacity"
            )}
            aria-label="Previous setups"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            disabled={!canScrollNext}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full",
              "bg-background/90 border border-border shadow-md flex items-center justify-center",
              "text-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-opacity"
            )}
            aria-label="Next setups"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* View All Button - Centered */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="group bg-transparent bg-[#242529]">
            View All Setups
            <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  )
}
