"use client"

import { useState, useCallback, useEffect } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { defaultViewport, defaultTransition } from "@/components/animate-section"
import { Download, Share2, ChevronRight, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { TrustedPerformance } from "@/components/trusted-performance"
import { SetupDifference } from "@/components/setup-difference"

const games = [
  { id: "all", name: "All Games" },
  { id: "acc", name: "ACC" },
  { id: "iracing", name: "iRacing" },
  { id: "lmu", name: "LMU" },
  { id: "f1", name: "F1 24" },
]


const allSetups = [
  { 
    id: 1, 
    game: "acc", 
    gameName: "Assetto Corsa Competizione", 
    car: "Ferrari 296 GT3", 
    track: "Spa-Francorchamps", 
    lapTime: "2:16.847", 
    version: "1.9.5", 
    season: "2024", 
    week: "Week 5", 
    champion: "Max Benecke", 
    image: "/images/acc-hero.jpg" 
  },
  { 
    id: 2, 
    game: "iracing", 
    gameName: "iRacing", 
    car: "Porsche 911 GT3 R", 
    track: "Nürburgring GP", 
    lapTime: "1:54.231", 
    version: "2025.01", 
    season: "2025 S1", 
    week: "Week 3", 
    champion: "Joshua Rogers", 
    image: "/images/contact-bg.jpg" 
  },
  { 
    id: 3, 
    game: "f1", 
    gameName: "F1 24", 
    car: "Red Bull RB20", 
    track: "Monaco", 
    lapTime: "1:10.456", 
    version: "2024", 
    season: "2024", 
    week: "Monaco GP", 
    champion: "Jarno Opmeer", 
    image: "/images/hero-bg.jpg" 
  },
  { 
    id: 4, 
    game: "acc", 
    gameName: "Assetto Corsa Competizione", 
    car: "BMW M4 GT3", 
    track: "Monza", 
    lapTime: "1:46.123", 
    version: "1.9.5", 
    season: "2024", 
    week: "Week 2", 
    champion: "Nils Naujoks", 
    image: "/images/lmu-hero.jpg" 
  },
  { 
    id: 5, 
    game: "lmu", 
    gameName: "Le Mans Ultimate", 
    car: "Toyota GR010 Hybrid", 
    track: "Le Mans", 
    lapTime: "3:24.567", 
    version: "1.1.0.2", 
    season: "2024", 
    week: "Le Mans 24H", 
    champion: "Takuma Miyazono", 
    image: "/images/hero-bg-1.jpg" 
  },
  { 
    id: 6, 
    game: "iracing", 
    gameName: "iRacing", 
    car: "McLaren MP4-30", 
    track: "Suzuka", 
    lapTime: "1:29.847", 
    version: "2025.01", 
    season: "2025 S1", 
    week: "Week 1", 
    champion: "Bono Huis", 
    image: "/images/cta.jpg" 
  },
]

// Automatically determine featured setups - feature the first 3
const getFeaturedSetups = () => {
  return allSetups.map((setup, index) => ({
    ...setup,
    featured: index < 3 // Mark first 3 as featured
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

  // Auto-scroll carousel for smooth flow
  useEffect(() => {
    if (!emblaApi) return
    const interval = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext()
      } else {
        emblaApi.scrollTo(0)
      }
    }, 4000)
    return () => clearInterval(interval)
  }, [emblaApi])

  // Reinit when game filter changes
  useEffect(() => {
    emblaApi?.reInit()
  }, [activeGame, emblaApi])

  // Filter setups by game
  const filteredSetups = activeGame === "all" 
    ? setups 
    : setups.filter(s => s.game === activeGame)

  // Sort setups: featured first, then maintain original order
  const sortedSetups = [...filteredSetups].sort((a, b) => {
    if (a.featured && !b.featured) return -1
    if (!a.featured && b.featured) return 1
    return 0 // Maintain original order for same featured status
  })

  return (
    <section id="setups" className="relative py-24">
      <div className="relative z-10 w-full">
        {/* Section Header - Centered */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={defaultViewport}
          transition={defaultTransition}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl mb-4 font-display text-white w-full">
            Browse Pro Setups
          </h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto w-full">
            Explore setups from the {"world's"} top esports racing champions
          </p>
        </motion.div>

       {/* Game Filter - Segmented pill with indicator - Centered */}
        <div className="relative flex flex-wrap items-center justify-center gap-2 rounded-md bg-muted/50 backdrop-blur-sm w-fit mx-auto mb-12">
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => setActiveGame(game.id)}
              className={cn(
                "relative z-10 px-5 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                activeGame === game.id
                  ? "text-primary-foreground bg-brand-gradient"
                  : "text-white hover:text-foreground bg-[#242529]"
              )}
            >
              <span className="relative">{game.name}</span>
            </button>
          ))}
        </div>

        {/* Setups Carousel - Centered */}
        <div className="relative mx-auto w-full">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex" style={{ backfaceVisibility: "hidden" }}>
              {sortedSetups.map((setup) => (
                <div
                  key={setup.id}
                  className="flex-[0_0_300px] sm:flex-[0_0_340px] min-w-0 mr-6"
                >
                  <article
                    className={cn(
                      "group/card flex flex-col h-full overflow-hidden rounded-md bg-[#242625] border border-white/10",
                      "transition-colors duration-200 cursor-pointer",
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
                        <p className="text-[11px] font-medium uppercase tracking-wider text-white/90">Racing</p>
                        <p className="text-xs text-white">{setup.gameName}</p>
                        <p className="text-sm font-semibold text-white">{setup.car}</p>
                        <p className="text-xs text-white/90">{setup.track}</p>
                      </div>
                      {setup.featured && (
                        <span className="absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-wider text-primary-foreground bg-brand-gradient px-2.5 py-1 rounded">
                          Featured
                        </span>
                      )}
                    </div>

                    {/* Content – Setup Info + Action Buttons */}
                    <div className="flex flex-col flex-1 p-4 bg-transparent text-white">
                      {/* Top row: Season/Version (left) + Lap Time (right) */}
                      <div className="flex items-start justify-between gap-4 pb-3 border-b border-white/10">
                        <div className="space-y-2">
                          {setup.game === "iracing" && setup.season && setup.week && (
                            <div>
                              <p className="text-[11px] uppercase tracking-wider text-white/70 mb-1">Season & Week</p>
                              <p className="text-sm font-semibold text-white">
                                {setup.season} <span className="text-white/60 mx-1">•</span> {setup.week}
                              </p>
                            </div>
                          )}
                          {(setup.game === "acc" || setup.game === "lmu") && setup.version && (
                            <div>
                              <p className="text-[11px] uppercase tracking-wider text-white/70 mb-1">Version</p>
                              <p className="text-sm font-semibold text-white">{setup.version}</p>
                            </div>
                          )}
                        </div>
                        {setup.lapTime && (
                          <div className="text-right">
                            <p className="text-[11px] uppercase tracking-wider text-white/70 mb-1">Lap Time</p>
                            <p className="text-lg font-semibold text-white">{setup.lapTime}</p>
                          </div>
                        )}
                      </div>

                      {/* Bottom row: Setup made by (left) + actions (right) */}
                      <div className="flex items-center justify-between pt-3 mt-auto">
                        <div>
                          <p className="text-[11px] uppercase tracking-wider text-white/70 mb-1">Setup Made By</p>
                          <p className="text-sm font-semibold text-white">{setup.champion}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="h-9 w-9 rounded-full bg-transparent border border-white/70 text-white cursor-pointer flex items-center justify-center hover:bg-white/10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#242625]"
                            aria-label="Download setup"
                          >
                            <Download className="h-4 w-4 text-white" />
                          </button>
                          <button
                            type="button"
                            className="h-9 w-9 rounded-full bg-transparent border border-white/70 text-white cursor-pointer flex items-center justify-center hover:bg-white/10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#242625]"
                            aria-label="Share setup"
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
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                scrollPrev()
              }
            }}
            disabled={!canScrollPrev}
            className={cn(
              "absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full",
              "bg-background/90 border border-border shadow-md flex items-center justify-center",
              "text-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-opacity",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            )}
            aria-label="Previous setups"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                scrollNext()
              }
            }}
            disabled={!canScrollNext}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full",
              "bg-background/90 border border-border shadow-md flex items-center justify-center",
              "text-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-opacity",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            )}
            aria-label="Next setups"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* View All Button - Centered */}
        <div className="text-center mt-8">
          <Button 
            size="lg" 
            className="group bg-[#2a2b2f] text-white hover:bg-[#34353a] transition-colors duration-200"
          >
            View All Setups
            <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  )
}
