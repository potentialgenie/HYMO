"use client"

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { Search, Filter, Download, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import styles from "./setup-table.module.css"
import Image from "next/image"

interface FilterOption {
  value: string
  label: string
}

interface SetupPageProps {
  game: "iracing" | "acc" | "lmu"
  title: string
  logo: string
  heroImage: string
  filters: {
    filter1: { label: string; options: FilterOption[] }
    filter2: { label: string; options: FilterOption[] }
    filter3: { label: string; options: FilterOption[] }
    filter4: { label: string; options: FilterOption[] }
    filter5: { label: string; options: FilterOption[] }
  }
  setups: {
    id: string
    game: string
    car: string
    track: string
    season: string
    week?: string // Optional week for iRacing
    series: string
    lapTime?: string
  }[]
}

export function SetupPage({ game, title, logo, heroImage, filters, setups }: SetupPageProps) {
  const [filter1, setFilter1] = useState("")
  const [filter2, setFilter2] = useState("")
  const [filter3, setFilter3] = useState("")
  const [filter4, setFilter4] = useState("")
  const [filter5, setFilter5] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [showMoreFilters, setShowMoreFilters] = useState(false)
  const moreFiltersRef = useRef<HTMLDivElement>(null)

  const clearAllFilters = useCallback(() => {
    setFilter1("")
    setFilter2("")
    setFilter3("")
    setFilter4("")
    if (game !== "iracing") {
      setFilter5("")
    }
    setSearchQuery("")
  }, [game])

  // Helper function to format season display (combines season and week for iRacing)
  const formatSeasonDisplay = useCallback((setup: { season: string; week?: string; game: string }) => {
    if (game === "iracing" && setup.week) {
      // Format: "iRacing Season 1 Week 1 2026"
      const seasonMatch = setup.season.match(/(\d{4})\s*S(\d+)/i)
      const weekMatch = setup.week.match(/week\s*(\d+)/i)
      if (seasonMatch && weekMatch) {
        const year = seasonMatch[1]
        const seasonNum = seasonMatch[2]
        const weekNum = weekMatch[1]
        return `${setup.game} Season ${seasonNum} Week ${weekNum} ${year}`
      }
      // Fallback format
      return `${setup.season} ${setup.week}`
    }
    return setup.season
  }, [game])

  const filteredSetups = useMemo(() => {
    return setups.filter((setup) => {
      const matchesSearch = searchQuery === "" || 
        setup.car.toLowerCase().includes(searchQuery.toLowerCase()) ||
        setup.track.toLowerCase().includes(searchQuery.toLowerCase()) ||
        setup.series.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesFilter1 = filter1 === "" || setup.car.toLowerCase().includes(filter1.toLowerCase())
      const matchesFilter2 = filter2 === "" || setup.car.toLowerCase().includes(filter2.toLowerCase())
      const matchesFilter3 = filter3 === "" || setup.track.toLowerCase().includes(filter3.toLowerCase())
    
    // For iRacing: filter4 combines season and week, so check both
    let matchesFilter4 = true
    if (filter4 !== "" && game === "iracing") {
      // Filter value format: "2025s1w1" (season + week combined)
      const seasonMatch = setup.season.match(/(\d{4})\s*S(\d+)/i)
      const weekMatch = setup.week?.match(/week\s*(\d+)/i)
      if (seasonMatch && weekMatch) {
        const year = seasonMatch[1]
        const seasonNum = seasonMatch[2]
        const weekNum = weekMatch[1]
        const combinedValue = `${year}s${seasonNum}w${weekNum}`
        matchesFilter4 = filter4.toLowerCase() === combinedValue.toLowerCase()
      } else {
        // Fallback: check if season matches
        matchesFilter4 = setup.season.toLowerCase().includes(filter4.toLowerCase())
      }
    } else if (filter4 !== "") {
      matchesFilter4 = setup.season.toLowerCase().includes(filter4.toLowerCase())
    }
    
      const matchesFilter5 = filter5 === "" || setup.series.toLowerCase().includes(filter5.toLowerCase())
      
      return matchesSearch && matchesFilter1 && matchesFilter2 && matchesFilter3 && matchesFilter4 && matchesFilter5
    })
  }, [setups, searchQuery, filter1, filter2, filter3, filter4, filter5, game])

  const [currentPage, setCurrentPage] = useState(0)
  const rowLimit = 10 // Fixed to 10 items per page
  const tableContainerRef = useRef<HTMLDivElement>(null)

  const prevLengthRef = useRef(filteredSetups.length)
  useEffect(() => {
    const pages = Math.max(1, Math.ceil(filteredSetups.length / rowLimit))
    const lengthChanged = prevLengthRef.current !== filteredSetups.length
    prevLengthRef.current = filteredSetups.length

    if (lengthChanged) {
      setCurrentPage(0)
    } else if (currentPage >= pages) {
      setCurrentPage(pages - 1)
    }
  }, [filteredSetups.length, rowLimit])

  const totalPages = Math.max(1, Math.ceil(filteredSetups.length / rowLimit))
  const paginatedSetups = filteredSetups.slice(
    currentPage * rowLimit,
    (currentPage + 1) * rowLimit
  )

  const getPaginationTransform = useCallback((pageIndex: number, total: number): number => {
    const BTN_WIDTH = 4
    if (total <= 5) return 0
    if (pageIndex <= 1) return 0
    if (pageIndex >= total - 2) return (-total + 5) * BTN_WIDTH
    return (2 - pageIndex) * BTN_WIDTH
  }, [])

  const switchPage = useCallback((index: number) => {
    setCurrentPage(Math.max(0, Math.min(index, totalPages - 1)))
  }, [totalPages])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    const direction = e.deltaY < 0
    const canGoPrev = direction && currentPage > 0
    const canGoNext = !direction && currentPage < totalPages - 1
    if (canGoPrev || canGoNext) {
      e.preventDefault()
      switchPage(canGoPrev ? currentPage - 1 : currentPage + 1)
    }
  }, [currentPage, totalPages, switchPage])

  const displayFrom = filteredSetups.length === 0 ? 0 : currentPage * rowLimit + 1
  const displayTo = Math.min((currentPage + 1) * rowLimit, filteredSetups.length)

  // Handle click outside for more filters dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreFiltersRef.current && !moreFiltersRef.current.contains(event.target as Node)) {
        setShowMoreFilters(false)
      }
    }
    if (showMoreFilters) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showMoreFilters])

  return (
    <div className="min-h-screen pt-16 z-10">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-24 py-8">
        {/* Header with Logo and Title - Centered */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 text-center sm:text-left">
          <Image src={logo as string} alt={title} width={100} height={100} className="shrink-0" />
          <h1 className="text-4xl md:text-5xl font-bold italic font-display text-brand-gradient">{title}</h1>
        </div>

        {/* Filters Row - Centered */}
        <div className="flex flex-col items-center gap-4 mb-8 relative z-20">
          {/* Main Filter Group - Centered */}
          <div className="flex flex-wrap items-center justify-center gap-3 w-full">
            <Select value={filter1} onValueChange={setFilter1}>
              <SelectTrigger className="w-[140px] bg-secondary border-border">
                <SelectValue placeholder={filters.filter1.label} />
              </SelectTrigger>
              <SelectContent>
                {filters.filter1.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filter2} onValueChange={setFilter2}>
              <SelectTrigger className="w-[140px] bg-secondary border-border">
                <SelectValue placeholder={filters.filter2.label} />
              </SelectTrigger>
              <SelectContent>
                {filters.filter2.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filter3} onValueChange={setFilter3}>
              <SelectTrigger className="w-[140px] bg-secondary border-border">
                <SelectValue placeholder={filters.filter3.label} />
              </SelectTrigger>
              <SelectContent>
                {filters.filter3.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Combined Season filter for iRacing, or separate filters for other games */}
            {game === "iracing" ? (
              <Select value={filter4} onValueChange={setFilter4}>
                <SelectTrigger className="w-[200px] bg-secondary border-border">
                  <SelectValue placeholder="Season" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {(() => {
                    // Generate combined season+week options
                    const seasonOptions = filters.filter4.options
                    const weekOptions = filters.filter5.options
                    const combinedOptions: FilterOption[] = []
                    
                    seasonOptions.forEach(season => {
                      weekOptions.forEach(week => {
                        // Extract year and season number from season value like "2025s1"
                        const seasonValueMatch = season.value.match(/(\d{4})s(\d+)/i)
                        const weekValueMatch = week.value.match(/week(\d+)/i)
                        if (seasonValueMatch && weekValueMatch) {
                          const year = seasonValueMatch[1]
                          const seasonNum = seasonValueMatch[2]
                          const weekNum = weekValueMatch[1]
                          combinedOptions.push({
                            value: `${year}s${seasonNum}w${weekNum}`,
                            label: `${season.label} ${week.label}`
                          })
                        }
                      })
                    })
                    
                    return combinedOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))
                  })()}
                </SelectContent>
              </Select>
            ) : (
              <>
                <Select value={filter4} onValueChange={setFilter4}>
                  <SelectTrigger className="w-[140px] bg-secondary border-border">
                    <SelectValue placeholder={filters.filter4.label} />
                  </SelectTrigger>
                  <SelectContent>
                    {filters.filter4.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filter5} onValueChange={setFilter5}>
                  <SelectTrigger className="w-[140px] bg-secondary border-border">
                    <SelectValue placeholder={filters.filter5.label} />
                  </SelectTrigger>
                  <SelectContent>
                    {filters.filter5.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}

            <Button className="transition-all duration-200 hover:scale-105 shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]">
              Find Setup
            </Button>

            <Button 
              variant="outline" 
              onClick={clearAllFilters}
              className="btn-gradient-outline transition-all duration-200 hover:scale-105"
            >
              Clear All
            </Button>
          </div>

          {/* More Filters Button - Centered */}
          <div className="relative" ref={moreFiltersRef}>
            <Button
              variant="outline"
              onClick={() => setShowMoreFilters(!showMoreFilters)}
              className={`border-border bg-transparent text-foreground hover:bg-secondary transition-all duration-200 ${
                showMoreFilters ? "bg-secondary border-primary/50" : ""
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              MORE FILTERS
            </Button>

            {/* More Filters Dropdown */}
            {showMoreFilters && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[90vw] max-w-[600px] bg-card border border-border rounded-lg shadow-xl overflow-hidden z-[100] animate-in fade-in-0 zoom-in-95 duration-200">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Additional Filters</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Weather</label>
                      <Select>
                        <SelectTrigger className="bg-secondary border-border w-full">
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dry">Dry</SelectItem>
                          <SelectItem value="wet">Wet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Setup Type</label>
                      <Select>
                        <SelectTrigger className="bg-secondary border-border w-full">
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="race">Race</SelectItem>
                          <SelectItem value="quali">Qualifying</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Driver</label>
                      <Select>
                        <SelectTrigger className="bg-secondary border-border w-full">
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pro">Pro Drivers</SelectItem>
                          <SelectItem value="all">All Drivers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Rating</label>
                      <Select>
                        <SelectTrigger className="bg-secondary border-border w-full">
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 Stars</SelectItem>
                          <SelectItem value="4">4+ Stars</SelectItem>
                          <SelectItem value="3">3+ Stars</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hero Image */}
        <div className="relative w-full h-[300px] md:h-[450px] mb-8 rounded-lg overflow-hidden">
          <Image
            src={heroImage || "/placeholder.svg"}
            alt={`${title} Setup`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw"
            className="object-contain"
            priority={false}
          />
        </div>

        {/* Search Box and Table */}
        <div className="flex justify-center mb-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden />
            <Input
              type="search"
              placeholder="Search car, track, series..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/20"
            />
          </div>
        </div>

        <div
          ref={tableContainerRef}
          className="relative w-full border border-primary/30 rounded-lg bg-card/50 backdrop-blur-sm overflow-hidden shadow-lg"
          onWheel={handleWheel}
        >
          <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-transparent">
            <colgroup>
              <col style={{ width: "4rem" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "22%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: "12%" }} />
            </colgroup>
            <thead>
              <tr className="border-b border-border/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-primary uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-primary uppercase tracking-wider">Game</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-primary uppercase tracking-wider">Car</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-primary uppercase tracking-wider">Track</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-primary uppercase tracking-wider">Season</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-primary uppercase tracking-wider">Series</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-primary uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSetups.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-muted-foreground text-lg font-medium">No setups found</p>
                      <p className="text-muted-foreground/70 text-sm">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedSetups.map((setup, i) => (
                  <tr 
                    key={setup.id} 
                    className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {currentPage * rowLimit + i + 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground font-medium">
                      {setup.game}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground" title={setup.car}>
                      {setup.car}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground" title={setup.track}>
                      {setup.track}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatSeasonDisplay(setup)}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground" title={setup.series}>
                      {setup.series}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button 
                        size="sm" 
                        className="px-3 py-1.5 h-auto cursor-pointer transition-all duration-200 hover:scale-105 shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)]" 
                        aria-label="Download setup"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>

        {filteredSetups.length > 0 && (
          <div className="flex flex-col items-center gap-4 py-6">
            {/* Simplified pagination info */}
            <div className="text-sm text-muted-foreground">
              Showing <span className="text-primary font-semibold">{displayFrom}-{displayTo}</span> of <span className="text-primary font-semibold">{filteredSetups.length}</span> setups
            </div>
            
            {/* Simplified pagination controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => switchPage(0)}
                disabled={currentPage === 0}
                className="p-2 rounded-md border border-border bg-secondary hover:bg-secondary/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                aria-label="First page"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => switchPage(currentPage - 1)}
                disabled={currentPage === 0}
                className="p-2 rounded-md border border-border bg-secondary hover:bg-secondary/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <div className="flex items-center gap-1">
                {(() => {
                  const maxVisible = 7
                  const pages: number[] = []
                  
                  if (totalPages <= maxVisible) {
                    // Show all pages if total is less than max
                    for (let i = 0; i < totalPages; i++) {
                      pages.push(i)
                    }
                  } else {
                    // Show pages around current page
                    let start = Math.max(0, currentPage - Math.floor(maxVisible / 2))
                    let end = Math.min(totalPages, start + maxVisible)
                    
                    if (end - start < maxVisible) {
                      start = Math.max(0, end - maxVisible)
                    }
                    
                    for (let i = start; i < end; i++) {
                      pages.push(i)
                    }
                  }
                  
                  return pages.map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => switchPage(pageNum)}
                      className={`min-w-[2.5rem] h-10 px-3 rounded-md border transition-all ${
                        currentPage === pageNum
                          ? "bg-primary border-primary text-primary-foreground font-semibold"
                          : "border-border bg-secondary hover:bg-secondary/80 text-foreground"
                      }`}
                      aria-label={`Page ${pageNum + 1}`}
                    >
                      {pageNum + 1}
                    </button>
                  ))
                })()}
              </div>
              
              <button
                type="button"
                onClick={() => switchPage(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="p-2 rounded-md border border-border bg-secondary hover:bg-secondary/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => switchPage(totalPages - 1)}
                disabled={currentPage >= totalPages - 1}
                className="p-2 rounded-md border border-border bg-secondary hover:bg-secondary/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                aria-label="Last page"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Description Section */}
        {(() => {
          // Get game name
          const gameName = game === "iracing" ? "iRacing" : game === "acc" ? "Assetto Corsa Competizione" : "Le Mans Ultimate"
          
          // Get values from first filtered setup or use defaults
          let seasonText = ""
          let year = ""
          let weekText = ""
          let carText = "your car"
          let trackText = "the track"
          
          if (filteredSetups.length > 0) {
            const firstSetup = filteredSetups[0]
            
            // Extract season, year, week from first setup
            if (game === "iracing" && firstSetup.week) {
              const seasonMatch = firstSetup.season.match(/(\d{4})\s*S(\d+)/i)
              const weekMatch = firstSetup.week.match(/week\s*(\d+)/i)
              if (seasonMatch && weekMatch) {
                year = seasonMatch[1]
                const seasonNum = seasonMatch[2]
                weekText = weekMatch[1]
                seasonText = `Season ${seasonNum}`
              }
            } else if (firstSetup.season) {
              // For non-iRacing games, try to extract year from season
              const yearMatch = firstSetup.season.match(/(\d{4})/i)
              if (yearMatch) {
                year = yearMatch[1]
              }
              seasonText = firstSetup.season
            }
            
            carText = firstSetup.car || carText
            trackText = firstSetup.track || trackText
          }
          
          // Build description with dynamic values
          const seasonPart = seasonText && year ? ` – ${seasonText} ${year}` : seasonText ? ` – ${seasonText}` : ""
          const weekPart = weekText ? `, Week ${weekText}` : ""
          
          // Split description into paragraphs for better readability
          const descriptionParts = [
            `Experience the ultimate in-game performance with professional car setups developed by elite E-Sports drivers.`,
            `This setup pack is specifically engineered for ${gameName}${seasonPart}${weekPart}, optimised for the ${carText} at ${trackText} combination to deliver maximum performance in competitive conditions.`,
            `The package includes Consistent, E-Sports, and Wet setup variants, fully optimised for both Qualifying and Race sessions. Consistent setups focus on stability, control, and long-run confidence, E-Sports setups are designed to extract ultimate lap time, while Wet setups are tuned to provide maximum grip, predictability, and confidence in low-traction conditions.`,
            `Whether you are racing in official events or pushing for personal bests, these professionally developed setups help you achieve faster lap times, improved tyre management, and greater overall race consistency across all conditions.`
          ]
          
          return (
            <div className="mt-12 mb-8 max-w-5xl mx-auto">
              {/* Section Header */}
              <div className="mb-6 text-center">
                <h2 className="text-2xl md:text-3xl font-bold font-display text-brand-gradient mb-2">
                  About This Setup Pack
                </h2>
                <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-primary/60 to-transparent mx-auto"></div>
              </div>
              
              {/* Description Card */}
              <div className="relative group bg-[#16151a] border border-white/[0.08] rounded-xl p-8 md:p-10 shadow-xl shadow-black/20 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.5)] hover:shadow-primary/10">
                {/* Top gradient accent */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-60"></div>
                
                {/* Content */}
                <div className="space-y-5">
                  {descriptionParts.map((paragraph, index) => (
                    <p 
                      key={index}
                      className="text-muted-foreground/90 leading-relaxed font-sans text-base md:text-lg"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
                
                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent mt-6"></div>
              </div>
            </div>
          )
        })()}

        {/* YouTube Video Players Section */}
        <div className="mt-8 space-y-8">
          {/* Hotlap Video */}
          <div className="w-full max-w-4xl mx-auto">
            <div className="text-center mb-4">
              <h3 className="text-xl md:text-2xl font-display font-bold text-foreground inline-block relative">
                Hotlap
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></span>
              </h3>
            </div>
            <div className="w-full aspect-video max-h-[400px] rounded-lg overflow-hidden shadow-lg border border-primary/30 bg-card/50 backdrop-blur-sm">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="Racing Hotlap | Ford Mustang GT3 @ Mexico City | IMSA | 2026 S1 Week 1"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>

          {/* Track Guide Video */}
          <div className="w-full max-w-4xl mx-auto">
            <div className="text-center mb-4">
              <h3 className="text-xl md:text-2xl font-display font-bold text-foreground inline-block relative">
                Track Guide
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></span>
              </h3>
            </div>
            <div className="w-full aspect-video max-h-[400px] rounded-lg overflow-hidden shadow-lg border border-primary/30 bg-card/50 backdrop-blur-sm">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="HOW TO DO MEXICO IN iRacing | GT3 Track Guide & Tips"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
