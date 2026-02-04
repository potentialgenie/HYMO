"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Contact } from "@/components/contact"

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
      return "text-blue-400 border-blue-500/30"
    case "ACC":
      return "text-green-400 border-green-500/30"
    case "LMU":
      return "text-orange-400 border-orange-500/30"
    default:
      return "text-primary border-primary/30"
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
    <main className="min-h-screen bg-[#151515] relative overflow-hidden pt-20 ">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_5%,rgba(228,0,188,0.32)_0%,rgba(31,19,41,0.3)_20%,rgba(21,21,21,0)_100%)]"/>

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
      <section id="drivers-section" className="py-20 px-6 sm:px-12 lg:px-24">
        <div>
          <div className="flex items-center justify-center gap-4 mb-2">
            <h2 className="text-2xl md:text-3xl font-bold font-display text-white">
              Drivers & Engineers
            </h2>
          </div>
          <div className="section-slash w-[50%] mx-auto mb-6" />
          {/* Filter bar - matches pricing/setups pill style */}
          <div className="relative flex flex-wrap items-center justify-center gap-1 rounded-md backdrop-blur-sm w-fit mx-auto mb-10">
            {[
              { id: "all", label: "All", ariaLabel: "Show all team members" },
              { id: "iRacing", label: "iRacing", ariaLabel: "Filter by iRacing" },
              { id: "ACC", label: "Assetto Corsa Competizione", ariaLabel: "Filter by Assetto Corsa Competizione" },
              { id: "LMU", label: "Le Mans Ultimate", ariaLabel: "Filter by Le Mans Ultimate" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handlePlatformClick(item.id)}
                className={cn(
                  "relative z-10 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#151515]",
                  selectedPlatform === item.id
                    ? "text-primary-foreground bg-brand-gradient"
                    : "text-white hover:text-foreground bg-[#242529]"
                )}
                aria-label={item.ariaLabel}
              >
                {selectedPlatform === item.id && (
                  <motion.span
                    layoutId="team-filter-pill"
                    className="absolute inset-0 rounded-full bg-brand-gradient shadow-lg shadow-primary/25"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    aria-hidden
                  />
                )}
                <span className="relative">{item.label}</span>
              </button>
            ))}
          </div>

          {filteredDrivers.length === 0 ? (
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
          ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5 max-w-6xl mx-auto">
                  {filteredDrivers.map((driver, idx) => {
                    const accent = getGameAccent(driver.game);
                    return (
                      <Card
                        key={driver.name}
                        className={cn(
                          "group relative overflow-hidden col-span-1 aspect-square rounded-xl border border-white/[0.06] bg-[#16151a] shadow-md shadow-black/15 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_8px_32px_-10px_rgba(0,0,0,0.4)] hover:shadow-primary/10 flex flex-col justify-end",
                          "opacity-100 motion-safe:opacity-0"
                        )}
                        style={{
                          animation: `fadeInUp 0.5s ease-out ${idx * 30}ms forwards`
                        }}
                      >
                        {/* Top gradient bar */}
                        <div className="absolute top-3 left-3 z-10 w-fit py-1 px-2 rounded-full text-[12px] uppercase tracking-wider font-semibold shadow-md bg-black/80 backdrop-blur-xl">
                          {driver.game}
                        </div>
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
                        <div className="absolute left-0 right-0 bottom-0 z-20 p-2 md:p-2.5 pb-2.5">
                          <div className="w-full rounded-lg bg-[#2A2A2A]/30 backdrop-blur-xs px-3 py-2 flex flex-col gap-0.5 border border-white/10">
                            <h3 className="font-display text-base md:text-lg tracking-tight text-white truncate text-center">
                              {driver.name}
                            </h3>
                            <p className="text-xs md:text-sm text-white/40 font-sans line-clamp-2 text-center">{driver.role}</p>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
                {/* Member count */}
                <div className="flex justify-center items-center mt-10">
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
          )}
        </div>
      </section>
      <div className="px-16 sm:px-30 lg:px-46">
        <Contact />
      </div>
    </main>
  )
}
