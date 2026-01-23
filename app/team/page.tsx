"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
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
    <main className="min-h-screen bg-[#1A191E]">
      {/* Header */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 sm:px-12 lg:px-24 overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display tracking-tight mb-4 text-white">
            Meet the <span className="text-white">Team</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl font-sans">
            The passionate sim racers and engineers behind HYMO. Our team of champions and professionals
            work tirelessly to bring you the best racing setups in the world.
          </p>
        </div>
      </section>

      {/* Management Section */}
      <section className="py-16 px-6 sm:px-12 lg:px-24">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h2 className="text-2xl md:text-3xl font-bold font-display text-white">
              Management & Founders
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
          </div>
          <div className="w-24 mb-10" />
          <div className="grid md:grid-cols-3 gap-8">
            {management.map((member) => (
              <Card
                key={member.name}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#16151a] py-0 shadow-lg shadow-black/20 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.5)] hover:shadow-primary/10"
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-60" />
                <CardContent className="p-8">
                  <div className="flex flex-row gap-6 items-center">
                    <div className="relative mb-5">
                      <div className="w-28 h-28 rounded-2xl overflow-hidden ring-2 ring-white/15 ring-offset-2 ring-offset-[#16151a] transition-all duration-300 group-hover:ring-primary/40">
                        <Image src={member.avatar} alt={member.name} width={112} height={112} className="h-full w-full object-cover" />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <h3 className="font-sans text-2xl font-semibold tracking-tight mb-2">{member.name}</h3>
                      <p className="text-lg font-medium text-primary/90 mb-4 font-sans">{member.role}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground/90 italic leading-relaxed font-sans">&quot;{member.description}&quot;</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Drivers Section */}
      <section id="drivers-section" className="py-16 px-6 sm:px-12 lg:px-24">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h2 className="text-2xl md:text-3xl font-bold font-display text-white">
              Drivers & Engineers
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
          </div>
          <div className="section-slash w-24 mb-6" />
          <div className="mb-6">
            <p className="text-muted-foreground max-w-xl mb-4 font-sans">
              Our team of professional sim racers and setup engineers across multiple platforms.
            </p>
            <div className="flex items-center gap-2 text-sm font-sans">
              <span className="text-muted-foreground/70">
                Showing
              </span>
              <span className="text-primary font-semibold">
                {filteredDrivers.length} {filteredDrivers.length === 1 ? 'member' : 'members'}
              </span>
              {selectedPlatform !== "all" && (
                <>
                  <span className="text-muted-foreground/70">for</span>
                  <span className="text-foreground font-medium capitalize">
                    {selectedPlatform === "ACC" ? "Assetto Corsa Competizione" : selectedPlatform}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Platform legend - clickable filters */}
          <div className="flex flex-wrap items-center gap-3 mb-10">
            <span className="text-xs uppercase tracking-wider text-muted-foreground/70 font-semibold font-sans">Filter by Platform:</span>
            <button
              onClick={() => handlePlatformClick("all")}
              className={cn(
                "transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-[#1A191E] rounded-md",
                selectedPlatform === "all"
                  ? "scale-105 ring-2 ring-offset-2 ring-offset-[#1A191E] ring-primary/60"
                  : "hover:scale-105"
              )}
              aria-label="Show all team members"
            >
              <Badge 
                variant="outline" 
                className={cn(
                  "text-[11px] font-medium transition-all duration-300 px-3 py-1.5",
                  selectedPlatform === "all"
                    ? "bg-primary/30 border-primary/60 text-primary shadow-lg shadow-primary/20"
                    : "bg-muted/30 border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}
              >
                All
              </Badge>
            </button>
            <button
              onClick={() => handlePlatformClick("iRacing")}
              className={cn(
                "transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-[#1A191E] rounded-md",
                selectedPlatform === "iRacing"
                  ? "scale-105 ring-2 ring-offset-2 ring-offset-[#1A191E] ring-blue-500/60"
                  : "hover:scale-105"
              )}
              aria-label="Filter by iRacing"
            >
              <Badge 
                variant="outline" 
                className={cn(
                  "text-[11px] font-medium transition-all duration-300 px-3 py-1.5",
                  getGameColor("iRacing"),
                  selectedPlatform === "iRacing" && "bg-blue-500/30 border-blue-500/60 shadow-lg shadow-blue-500/20"
                )}
              >
                iRacing
              </Badge>
            </button>
            <button
              onClick={() => handlePlatformClick("ACC")}
              className={cn(
                "transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:ring-offset-2 focus:ring-offset-[#1A191E] rounded-md",
                selectedPlatform === "ACC"
                  ? "scale-105 ring-2 ring-offset-2 ring-offset-[#1A191E] ring-green-500/60"
                  : "hover:scale-105"
              )}
              aria-label="Filter by Assetto Corsa Competizione"
            >
              <Badge 
                variant="outline" 
                className={cn(
                  "text-[11px] font-medium transition-all duration-300 px-3 py-1.5",
                  getGameColor("ACC"),
                  selectedPlatform === "ACC" && "bg-green-500/30 border-green-500/60 shadow-lg shadow-green-500/20"
                )}
              >
                Assetto Corsa Competizione
              </Badge>
            </button>
            <button
              onClick={() => handlePlatformClick("LMU")}
              className={cn(
                "transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2 focus:ring-offset-[#1A191E] rounded-md",
                selectedPlatform === "LMU"
                  ? "scale-105 ring-2 ring-offset-2 ring-offset-[#1A191E] ring-orange-500/60"
                  : "hover:scale-105"
              )}
              aria-label="Filter by Le Mans Ultimate"
            >
              <Badge 
                variant="outline" 
                className={cn(
                  "text-[11px] font-medium transition-all duration-300 px-3 py-1.5",
                  getGameColor("LMU"),
                  selectedPlatform === "LMU" && "bg-orange-500/30 border-orange-500/60 shadow-lg shadow-orange-500/20"
                )}
              >
                Le Mans Ultimate
              </Badge>
            </button>
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
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredDrivers.map((driver) => {
                const accent = getGameAccent(driver.game)
                return (
                  <Card
                    key={driver.name}
                    className={cn(
                      "group relative overflow-hidden rounded-xl border border-white/[0.06] border-l-4 bg-[#16151a] py-0 shadow-md shadow-black/10 transition-all duration-500 hover:border-white/10 hover:shadow-xl hover:shadow-black/20",
                      "opacity-100 motion-safe:opacity-0"
                    )}
                    style={{
                      animation: `fadeInUp 0.5s ease-out ${filteredDrivers.indexOf(driver) * 30}ms forwards`
                    }}
                  >
                    <CardContent className="p-5 flex flex-col">
                      <div className="flex flex-row gap-6 items-center">
                        <div className={`relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 ring-2 ring-offset-2 ring-offset-[#16151a] ${accent.ring} transition-all duration-300 group-hover:ring-opacity-60`}>
                          <Image src={driver.avatar} alt={driver.name} width={72} height={72} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <h3 className="font-sans font-semibold text-[15px] tracking-tight mb-1.5 leading-tight truncate">{driver.name}</h3>
                          <p className="text-[13px] text-muted-foreground line-clamp-2 leading-snug mb-4 font-sans">
                            {driver.role}
                          </p>
                          <Badge variant="outline" className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 w-fit ${getGameColor(driver.game)}`}>
                            {driver.game}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
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
            className="shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all duration-200 hover:scale-105"
          >
            <Link href="/#contact">Contact Us</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 sm:px-12 lg:px-24">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Image
              src="/images/hymo-logo.png"
              alt="HYMO"
              width={140}
              height={46}
              className="h-9 w-auto"
            />
            <p className="text-sm text-muted-foreground font-sans">
              Copyright © 2025 HymoSetups | All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
