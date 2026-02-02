"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { cn } from "@/lib/utils"

const management = [
  {
    name: "Charlie Crossland",
    avatar: "/team/1752964948.jpg",
    role: "Chief Executive Officer",
    description: "meow meow meow",
  },
  {
    name: "Dáire McCormack",
    avatar: "/team/1753053438.jpg",
    role: "Head of Engineering",
    description: "Irish Sim Racer who loves getting fit because he will have to fit in a radical",
  },
  {
    name: "William Chadwick",
    avatar: "/team/1752964761.jpg",
    role: "Chief Operating Officer & Engineer",
    description: "uhhhhhh I think I could beat Josh Rogers in a GT4",
  },
]

const drivers = [
  { name: "Alessandro Bico", role: "iRacing Engineer", game: "iRacing", avatar: "/team/1753285287.png" },
  { name: "Andrew McWilliam", role: "ACC & Le Mans Ultimate Engineer", game: "ACC", avatar: "/team/avatar5.png" },
  { name: "Atte Kauppinen", role: "iRacing Engineer", game: "iRacing", avatar: "/team/1753285298.png" },
  { name: "Carl Jansson", role: "iRacing Engineer", game: "iRacing", avatar: "/team/1753285315.png" },
  { name: "Dáire McCormack", role: "Head of Engineering", game: "iRacing", avatar: "/team/1753053438.jpg" },
  { name: "Dario Iemmulo", role: "Le Mans Ultimate", game: "LMU", avatar: "/team/avatar5.png" },
  { name: "Dawid Mroczek", role: "Le Mans Ultimate Engineer", game: "LMU", avatar: "/team/avatar5.png" },
  { name: "Dennis Schoniger", role: "ACC Engineer", game: "ACC", avatar: "/team/avatar5.png" },
  { name: "Dominik Blajer", role: "ACC & Le Mans Ultimate Engineer", game: "ACC", avatar: "/team/avatar5.png" },
  { name: "Dominik Hofmann", role: "iRacing Engineer", game: "iRacing", avatar: "/team/1753285333.png" },
  { name: "Enzo Bonito", role: "iRacing Engineer", game: "iRacing", avatar: "/team/avatar5.png" },
  { name: "Gustavo Ariel", role: "iRacing Engineer", game: "iRacing", avatar: "/team/1753285360.png" },
  { name: "Josh Thompson", role: "iRacing Engineer", game: "iRacing", avatar: "/team/1753285388.png" },
  { name: "Kevin Ellis Jr", role: "iRacing Engineer", game: "iRacing", avatar: "/team/1753285399.png" },
  { name: "Luke McKeown", role: "iRacing Engineer", game: "iRacing", avatar: "/team/avatar5.png" },
  { name: "Maciej Malinowski", role: "ACC & Le Mans Ultimate Engineer", game: "ACC", avatar: "/team/avatar5.png" },
  { name: "Marin Bessiere", role: "Le Mans Ultimate Engineer", game: "LMU", avatar: "/team/avatar5.png" },
  { name: "Max Wojtyna", role: "ACC Engineer", game: "ACC", avatar: "/team/avatar5.png" },
  { name: "Mike", role: "Tester", game: "All", avatar: "/team/avatar5.png" },
  { name: "Sebastian Job", role: "iRacing Engineer", game: "iRacing", avatar: "/team/1753285428.png" },
  { name: "Sota Muto", role: "iRacing Engineer", game: "iRacing", avatar: "/team/1753285413.png" },
  { name: "Timotej Andonovski", role: "Le Mans Ultimate Engineer", game: "LMU", avatar: "/team/avatar5.png" },
  { name: "Tinko van der Velde", role: "ACC & Le Mans Ultimate Engineer", game: "ACC", avatar: "/team/avatar5.png" },
  { name: "Tom Burns", role: "iRacing Engineer", game: "iRacing", avatar: "/team/1753285439.png" },
  { name: "William Chadwick", role: "Chief Operating Officer & Engineer", game: "iRacing", avatar: "/team/avatar5.png" },
]

function getGameColor(game: string) {
  switch (game) {
    case "iRacing":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    case "ACC":
      return "bg-green-500/20 text-green-400 border-green-500/30"
    case "LMU":
      return "bg-orange-500/20 text-orange-400 border-orange-500/30"
    default:
      return "bg-primary/20 text-primary border-primary/30"
  }
}

function getGameAccent(game: string) {
  switch (game) {
    case "iRacing":
      return { border: "border-l-blue-500/60", ring: "ring-blue-500/40" }
    case "ACC":
      return { border: "border-l-green-500/60", ring: "ring-green-500/40" }
    case "LMU":
      return { border: "border-l-orange-500/60", ring: "ring-orange-500/40" }
    default:
      return { border: "border-l-primary/60", ring: "ring-primary/40" }
  }
}

export default function TeamPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all")

  // Filter drivers based on selected platform
  const filteredDrivers = selectedPlatform === "all"
    ? drivers
    : drivers.filter((driver) => driver.game === selectedPlatform || driver.game === "All")

  const handlePlatformClick = (platform: string) => {
    setSelectedPlatform(platform)
    // Smooth scroll to drivers section when filtering
    setTimeout(() => {
      const driversSection = document.getElementById('drivers-section')
      if (driversSection && platform !== "all") {
        driversSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  return (
    <main className="min-h-screen bg-[#151515] relative overflow-hidden pt-20 px-16 sm:px-30 lg:px-46">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_5%,rgba(228,0,188,0.32)_0%,rgba(31,19,41,0.3)_20%,rgba(21,21,21,0)_100%)]"/>

      <Navbar />

      <section className="relative b-20 px-6 sm:px-12 lg:px-24 overflow-hidden">
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display tracking-tight mb-4 text-white">
            The People Behind
            <br />
            <span className="text-brand-gradient">Our Setups</span>
          </h1>
          
          <p className="text-lg text-white/80 max-w-2xl font-sans mx-auto">
            The passionate sim racers and engineers behind HYMO. Our team of champions and professionals
            work tirelessly to bring you the best racing setups in the world.
          </p>
        </div>
      </section>

      {/* Management Section */}
      <section className="py-16">
        <div>
          <div className="flex items-center justify-center gap-4 mb-2">
            <h2 className="text-2xl md:text-3xl font-bold font-display text-white">
              Management & Founders
            </h2>
          </div>
          <div className="section-slash w-[50%] mx-auto mb-6" />
          <div className="w-24 mb-10" />
          <div className="grid md:grid-cols-8 gap-8">
            <div className="col-span-1"></div>
            {management.map((member) => (
              <Card
                key={member.name}
                className="group relative overflow-hidden col-span-2 aspect-square rounded-2xl border border-white/[0.06] bg-[#16151a] shadow-lg shadow-black/20 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.5)] hover:shadow-primary/10 flex flex-col justify-end"
              >
                {/* Top gradient bar */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-60 z-10" />
                
                {/* Image and overlay */}
                <div className="absolute inset-0 w-full h-full z-0">
                  <Image
                    src={member.avatar}
                    alt={member.name}
                    fill
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#16151a]/80 via-[#16151a]/50 to-transparent" />
                </div>

                {/* Bottom blurred overlay for name/role */}
                <div className="absolute left-0 right-0 bottom-0 z-20 p-4">
                  <div className="w-full rounded-xl bg-black/30 backdrop-blur-xs px-5 py-3 flex flex-col gap-1 border border-white/10">
                    <h3 className="font-sans text-xl font-bold italic tracking-tight text-white">
                      {member.name}
                    </h3>
                    <p className="text-sm text-white/80 font-sans">{member.role}</p>
                  </div>
                </div>
              </Card>
            ))}
            <div className="col-span-1"></div>
          </div>
        </div>
      </section>

      {/* Drivers Section */}
      <section id="drivers-section" className="py-16 px-6 sm:px-12 lg:px-24">
        <div>
          <div className="flex items-center justify-center gap-4 mb-2">
            <h2 className="text-2xl md:text-3xl font-bold font-display text-white">
              Drivers & Engineers
            </h2>
          </div>
          <div className="section-slash w-[50%] mx-auto mb-6" />
          {/* Filter bar - centered platform filters */}
          <div className="p-4 mb-10">
            <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-white/50 font-semibold font-sans mr-1">
                  Filter by Platform
                </span>
                <button
                  onClick={() => handlePlatformClick("all")}
                  className={cn(
                    "h-9 px-4 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200",
                    selectedPlatform === "all"
                      ? "bg-brand-gradient text-white"
                      : "bg-[#252525] border border-white/10 text-white/70 hover:border-[#E800BC]/40 hover:text-white"
                  )}
                  aria-label="Show all team members"
                >
                  All
                </button>
                <button
                  onClick={() => handlePlatformClick("iRacing")}
                  className={cn(
                    "h-9 px-4 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200",
                    selectedPlatform === "iRacing"
                      ? "bg-brand-gradient text-white"
                      : "bg-[#252525] border border-white/10 text-blue-400/90 hover:border-blue-500/40"
                  )}
                  aria-label="Filter by iRacing"
                >
                  iRacing
                </button>
                <button
                  onClick={() => handlePlatformClick("ACC")}
                  className={cn(
                    "h-9 px-4 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200",
                    selectedPlatform === "ACC"
                      ? "bg-brand-gradient text-white"
                      : "bg-[#252525] border border-white/10 text-green-400/90 hover:border-green-500/40"
                  )}
                  aria-label="Filter by Assetto Corsa Competizione"
                >
                  Assetto Corsa Competizione
                </button>
                <button
                  onClick={() => handlePlatformClick("LMU")}
                  className={cn(
                    "h-9 px-4 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200",
                    selectedPlatform === "LMU"
                      ? "bg-brand-gradient text-white"
                      : "bg-[#252525] border border-white/10 text-orange-400/90 hover:border-orange-500/40"
                  )}
                  aria-label="Filter by Le Mans Ultimate"
                >
                  Le Mans Ultimate
                </button>
            </div>
          </div>

          {/* Pagination logic */}
          {(() => {
            // Pagination logic
            const DRIVERS_PER_PAGE = 8;
            const [driverPage, setDriverPage] = typeof window !== "undefined" && useState ? useState(1) : [1, () => {}]; // SSR fallback
            const totalPages = Math.ceil(filteredDrivers.length / DRIVERS_PER_PAGE);

            function handleNextPage() {
              setDriverPage((page: number) => Math.min(page + 1, totalPages));
            }
            function handlePrevPage() {
              setDriverPage((page: number) => Math.max(page - 1, 1));
            }
            function handleSetPage(page: number) {
              setDriverPage(() => Math.min(Math.max(page, 1), totalPages));
            }

            const paginatedDrivers = filteredDrivers.slice(
              (driverPage - 1) * DRIVERS_PER_PAGE,
              driverPage * DRIVERS_PER_PAGE
            );

            if (filteredDrivers.length === 0) {
              return (
                <div className="text-center py-16 px-6">
                  <p className="text-muted-foreground text-lg mb-2">No team members found</p>
                  <p className="text-muted-foreground/70 text-sm mb-6">
                    Try selecting a different platform filter
                  </p>
                  <Button
                    onClick={() => handlePlatformClick("all")}
                    variant="outline"
                    size="sm"
                    className="mt-4"
                  >
                    Show All Members
                  </Button>
                </div>
              );
            }

            return (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
                  {paginatedDrivers.map((driver, idx) => {
                    const accent = getGameAccent(driver.game);
                    return (
                      <Card
                        key={driver.name}
                        className={cn(
                          "group relative overflow-hidden col-span-1 aspect-square rounded-lg border border-white/[0.06] bg-[#16151a] shadow-md shadow-black/15 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_8px_32px_-10px_rgba(0,0,0,0.4)] hover:shadow-primary/10 flex flex-col justify-end",
                          "opacity-100 motion-safe:opacity-0"
                        )}
                        style={{
                          animation: `fadeInUp 0.5s ease-out ${idx * 30}ms forwards`
                        }}
                      >
                        {/* Top gradient bar */}
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-50 z-10" />

                        {/* Image and overlay */}
                        <div className="absolute inset-0 w-full h-full z-0">
                          <Image
                            src={driver.avatar}
                            alt={driver.name}
                            fill
                            className="object-cover w-full h-full"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#16151a]/90 via-[#16151a]/60 to-transparent" />
                        </div>

                        {/* Bottom blurred overlay for name/role */}
                        <div className="absolute left-0 right-0 bottom-0 z-20 p-1 md:p-1.5 pb-1.5">
                          <div className="w-full rounded-md bg-black/30 backdrop-blur-xs px-2 py-1 flex flex-col gap-0.5 border border-white/10">
                            <h3 className="font-sans text-xs md:text-sm font-bold italic tracking-tight text-white truncate">
                              {driver.name}
                            </h3>
                            <p className="text-[10px] md:text-[11px] text-white/80 font-sans line-clamp-2">{driver.role}</p>
                            <Badge
                              variant="outline"
                              className={cn(
                                "mt-0.5 w-fit px-1 py-0.5 text-[8px] uppercase tracking-wider font-semibold",
                                getGameColor(driver.game)
                              )}
                            >
                              {driver.game}
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
                {/* Pagination Bar with member count */}
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-10">
                  {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevPage}
                        disabled={driverPage === 1}
                        className="rounded-full px-2 py-1"
                        aria-label="Previous page"
                      >
                        &larr;
                      </Button>
                      {Array.from({ length: totalPages }).map((_, idx) => (
                        <button
                          key={idx}
                          className={cn(
                            "w-8 h-8 flex items-center justify-center rounded-full mx-1 text-sm font-semibold transition",
                            driverPage === idx + 1
                              ? "bg-primary/60 text-white shadow"
                              : "bg-white/10 text-white/50 hover:bg-primary/30 hover:text-primary"
                          )}
                          onClick={() => handleSetPage(idx + 1)}
                          aria-current={driverPage === idx + 1 ? "page" : undefined}
                          aria-label={`Go to page ${idx + 1}`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={driverPage === totalPages}
                        className="rounded-full px-2 py-1"
                        aria-label="Next page"
                      >
                        &rarr;
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm font-sans">
                    <span className="text-white/50">Showing</span>
                    <span className="text-[#E800BC] font-semibold">
                      {filteredDrivers.length} {filteredDrivers.length === 1 ? "member" : "members"}
                    </span>
                    {selectedPlatform !== "all" && (
                      <>
                        <span className="text-white/50">for</span>
                        <span className="text-white/90 font-medium capitalize">
                          {selectedPlatform === "ACC" ? "Assetto Corsa Competizione" : selectedPlatform}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </section>

      {/* Join CTA */}
      <section className="py-20 px-6 sm:px-12 lg:px-24">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4 text-white">
            Want to Join the Team?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto font-sans">
            We&apos;re always looking for talented sim racers and engineers to join our growing team.
            Get in touch if you think you have what it takes.
          </p>
          <Button 
            asChild 
            size="lg" 
            className="rounded-full uppercase text-sm font-semibold px-8 py-6 bg-brand-gradient text-white hover:brightness-110 shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all duration-200 hover:scale-105"
          >
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </main>
  )
}
