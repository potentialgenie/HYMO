"use client"

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
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
import Image from "next/image"

interface FilterOption {
  value: string
  label: string
}

interface FiltersState {
  classes: FilterOption[]
  cars: FilterOption[]
  tracks: FilterOption[]
  seasons: FilterOption[]
  weeks: FilterOption[]
  variations: FilterOption[]
  series: FilterOption[]
  years: FilterOption[]
  versions: FilterOption[]
}

interface SetupPageProps {
  game: "iracing" | "acc" | "lmu"
  title: string
  logo: string
  heroImage: string
  categoryId: number
  setups: {
    id: string
    game: string
    car: string
    track: string
    season: string
    week?: string // Optional week for iRacing
    series: string
    version?: string
    lapTime?: string
  }[]
}

interface UrlFiltersState {
  class_id: string
  car_id: string
  track_id: string
  variation_id: string
  season_id: string
  week: string
  series_id: string
  year: string
  version: string
}

export function SetupPage({ game, title, logo, heroImage, categoryId, setups }: SetupPageProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const hasHydratedUrlRef = useRef(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [tableSetups, setTableSetups] = useState(setups)
  const [urlFilters, setUrlFilters] = useState<UrlFiltersState>({
    class_id: "",
    car_id: "",
    track_id: "",
    variation_id: "",
    season_id: "",
    week: "",
    series_id: "",
    year: "",
    version: "",
  })
  const [filtersLoading, setFiltersLoading] = useState(true)
  const [filterOptions, setFilterOptions] = useState<FiltersState>({
    classes: [],
    cars: [],
    tracks: [],
    seasons: [],
    weeks: [],
    variations: [],
    series: [],
    years: [],
    versions: [],
  })
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedCar, setSelectedCar] = useState("")
  const [selectedTrack, setSelectedTrack] = useState("")
  const [selectedSeason, setSelectedSeason] = useState("")
  const [selectedWeek, setSelectedWeek] = useState("")
  const [selectedVariation, setSelectedVariation] = useState("")
  const [selectedSeries, setSelectedSeries] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedVersion, setSelectedVersion] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [showMoreFilters, setShowMoreFilters] = useState(false)
  const clearOptionValue = "__all__"
  const skipNextFiltersFetchRef = useRef(false)
  const selectionOrderRef = useRef<Array<
    "class" | "car" | "track" | "season" | "week" | "variation" | "series" | "year" | "version"
  >>([])

  const mapOptions = useCallback((arr: unknown): FilterOption[] => {
    if (!Array.isArray(arr)) {
      return []
    }
    const result = arr
      .map((item, index) => {
        // Handle primitive values (strings, numbers)
        if (typeof item === "string" || typeof item === "number") {
          const value = String(item)
          return { value, label: value }
        }
        
        // Skip null/undefined
        if (!item || typeof item !== "object") return null
        
        const entry = item as Record<string, unknown>
        
        // Try different property combinations
        // 1. value + label (both present)
        if (typeof entry.value === "string" && typeof entry.label === "string") {
          return { value: entry.value, label: entry.label }
        }
        
        // 2. value only (use as both value and label)
        if (typeof entry.value === "string") {
          return { value: entry.value, label: entry.value }
        }
        
        // 3. label only (use as both value and label)
        if (typeof entry.label === "string") {
          return { value: entry.label, label: entry.label }
        }
        
        // 4. id + name
        if (typeof entry.id !== "undefined" && typeof entry.name === "string") {
          return { value: String(entry.id), label: entry.name }
        }
        
        // 5. id + label
        if (typeof entry.id !== "undefined" && typeof entry.label === "string") {
          return { value: String(entry.id), label: entry.label }
        }
        
        // 6. id + variation (for variations field)
        if (typeof entry.id !== "undefined" && typeof entry.variation === "string") {
          return { value: String(entry.id), label: entry.variation }
        }
        
        // 7. id + series/serie (for series field)
        if (typeof entry.id !== "undefined" && typeof entry.series === "string") {
          return { value: String(entry.id), label: entry.series }
        }
        if (typeof entry.id !== "undefined" && typeof entry.serie === "string") {
          return { value: String(entry.id), label: entry.serie }
        }

        if (typeof entry.id !== "undefined" && typeof entry.version === "string") {
          return { value: String(entry.id), label: entry.version }
        }
        
        // 8. name only
        if (typeof entry.name === "string") {
          return { value: entry.name, label: entry.name }
        }
        
        // 9. variation only
        if (typeof entry.variation === "string") {
          return { value: entry.variation, label: entry.variation }
        }
        
        // 10. title only
        if (typeof entry.title === "string") {
          return { value: entry.title, label: entry.title }
        }

        if (typeof entry.version === "string") {
          return { value: entry.version, label: entry.version }
        }
        
        // Log unhandled cases
        console.warn(`mapOptions: Could not map item at index ${index}`, item);
        return null
      })
      .filter((item): item is FilterOption => item !== null)
    
    return result
  }, [])

  useEffect(() => {
    const getParam = (key: keyof UrlFiltersState) => searchParams.get(key) ?? ""
    setUrlFilters({
      class_id: getParam("class_id"),
      car_id: getParam("car_id"),
      track_id: getParam("track_id"),
      variation_id: getParam("variation_id"),
      season_id: getParam("season_id"),
      week: getParam("week"),
      series_id: getParam("series_id"),
      year: getParam("year"),
      version: getParam("version"),
    })
    hasHydratedUrlRef.current = true
  }, [searchParams])

  const resolveSelectionValue = useCallback((options: FilterOption[], urlValue: string): string => {
    if (!urlValue) return ""
    const directMatch = options.find((option) => option.value === urlValue)
    if (directMatch) return directMatch.value
    const labelMatch = options.find(
      (option) => option.label.toLowerCase() === urlValue.toLowerCase()
    )
    if (labelMatch) return labelMatch.value
    return ""
  }, [])

  const normalizeSelectValue = useCallback((value: string) => {
    return value === clearOptionValue ? "" : value
  }, [clearOptionValue])

  const formatWeekLabel = useCallback((label: string) => {
    const trimmed = label.trim()
    if (/^week\s*\d+$/i.test(trimmed)) {
      const weekNum = trimmed.match(/(\d+)/)?.[1]
      return weekNum ? `Week ${weekNum}` : trimmed
    }
    if (/^\d+$/.test(trimmed)) {
      return `Week ${trimmed}`
    }
    return trimmed
  }, [])

  const handleSelectChange = useCallback(
    (
      field: "class" | "car" | "track" | "season" | "week" | "variation" | "series" | "year" | "version",
      value: string,
      options?: { skipFetch?: boolean }
    ) => {
      const normalized = normalizeSelectValue(value)
      if (options?.skipFetch) {
        skipNextFiltersFetchRef.current = true
      }

      const fieldSetters = {
        class: setSelectedClass,
        car: setSelectedCar,
        track: setSelectedTrack,
        season: setSelectedSeason,
        week: setSelectedWeek,
        variation: setSelectedVariation,
        series: setSelectedSeries,
        year: setSelectedYear,
        version: setSelectedVersion,
      }

      const fieldToOptionsKey: Record<keyof typeof fieldSetters, keyof FiltersState> = {
        class: "classes",
        car: "cars",
        track: "tracks",
        season: "seasons",
        week: "weeks",
        variation: "variations",
        series: "series",
        year: "years",
        version: "versions",
      }

      const prevOrder = selectionOrderRef.current
      const prevIndex = prevOrder.indexOf(field)
      const fieldsToClear =
        normalized === ""
          ? prevIndex === -1
            ? []
            : prevOrder.slice(prevIndex)
          : prevIndex === -1
            ? []
            : prevOrder.slice(prevIndex + 1)

      if (fieldsToClear.length > 0) {
        setFilterOptions((prev) => {
          const next = { ...prev }
          fieldsToClear.forEach((fieldKey) => {
            const key = fieldToOptionsKey[fieldKey]
            next[key] = []
          })
          return next
        })
        fieldsToClear.forEach((fieldKey) => {
          fieldSetters[fieldKey]("")
        })
      }

      fieldSetters[field](normalized)

      const nextOrder = prevOrder.filter(
        (fieldKey) => !fieldsToClear.includes(fieldKey) && fieldKey !== field
      )
      if (normalized) {
        nextOrder.push(field)
      }
      selectionOrderRef.current = nextOrder
    },
    [normalizeSelectValue]
  )

  const getLabelFromOptions = useCallback((options: FilterOption[], value: string): string => {
    if (!value) return ""
    const match = options.find((option) => option.value === value)
    return match?.label ?? value
  }, [])

  const toRequestValue = useCallback((value: string): string | number => {
    const num = Number(value)
    return Number.isFinite(num) ? num : value
  }, [])

  const buildRequestBody = useCallback(() => {
    const body: Record<string, string | number> = {
      category_id: categoryId,
    }
    if (selectedClass) body.class_id = toRequestValue(selectedClass)
    if (selectedCar) body.car_id = toRequestValue(selectedCar)
    if (selectedTrack) body.track_id = toRequestValue(selectedTrack)
    if (selectedVariation) body.variation_id = toRequestValue(selectedVariation)
    if (selectedSeason) body.season_id = toRequestValue(selectedSeason)
    if (selectedWeek) {
      const weekNum = selectedWeek.match(/(\d+)/)?.[1]
      body.week = weekNum ? toRequestValue(weekNum) : toRequestValue(selectedWeek)
    }
    if (selectedSeries) body.series_id = toRequestValue(selectedSeries)
    if (selectedYear) body.year = toRequestValue(selectedYear)
    if (selectedVersion) body.version_id = toRequestValue(selectedVersion)
    return body
  }, [
    categoryId,
    selectedClass,
    selectedCar,
    selectedTrack,
    selectedVariation,
    selectedSeason,
    selectedWeek,
    selectedSeries,
    selectedYear,
    selectedVersion,
    toRequestValue,
  ])

  useEffect(() => {
    setTableSetups(setups)
  }, [setups])

  useEffect(() => {
    if (game !== "iracing") {
      setSelectedSeason("")
      setSelectedWeek("")
      setSelectedVariation("")
      setSelectedSeries("")
      setSelectedYear("")
    } else {
      setSelectedVersion("")
    }
    selectionOrderRef.current = []
  }, [game])

  useEffect(() => {
    if (!filterOptions.classes.length && !filterOptions.cars.length && !filterOptions.tracks.length) {
      return
    }
    const autoSelect = (field: "class" | "car" | "track" | "season" | "week" | "variation" | "series" | "year" | "version", value: string) => {
      if (!value) return
      handleSelectChange(field, value, { skipFetch: true })
    }
    if (!selectedClass && filterOptions.classes.length === 1) {
      autoSelect("class", filterOptions.classes[0].value)
    }
    if (!selectedCar && filterOptions.cars.length === 1) {
      autoSelect("car", filterOptions.cars[0].value)
    }
    if (!selectedTrack && filterOptions.tracks.length === 1) {
      autoSelect("track", filterOptions.tracks[0].value)
    }
    if (!selectedClass && urlFilters.class_id) {
      const resolved = resolveSelectionValue(filterOptions.classes, urlFilters.class_id)
      if (resolved) handleSelectChange("class", resolved, { skipFetch: true })
    }
    if (!selectedCar && urlFilters.car_id) {
      const resolved = resolveSelectionValue(filterOptions.cars, urlFilters.car_id)
      if (resolved) handleSelectChange("car", resolved, { skipFetch: true })
    }
    if (!selectedTrack && urlFilters.track_id) {
      const resolved = resolveSelectionValue(filterOptions.tracks, urlFilters.track_id)
      if (resolved) handleSelectChange("track", resolved, { skipFetch: true })
    }
    if (game === "iracing") {
      if (!selectedSeason && filterOptions.seasons.length === 1) {
        autoSelect("season", filterOptions.seasons[0].value)
      }
      if (!selectedWeek && filterOptions.weeks.length === 1) {
        autoSelect("week", filterOptions.weeks[0].value)
      }
      if (!selectedVariation && filterOptions.variations.length === 1) {
        autoSelect("variation", filterOptions.variations[0].value)
      }
      if (!selectedSeries && filterOptions.series.length === 1) {
        autoSelect("series", filterOptions.series[0].value)
      }
      if (!selectedYear && filterOptions.years.length === 1) {
        autoSelect("year", filterOptions.years[0].value)
      }
      if (!selectedVariation && urlFilters.variation_id) {
        const resolved = resolveSelectionValue(filterOptions.variations, urlFilters.variation_id)
        if (resolved) handleSelectChange("variation", resolved, { skipFetch: true })
      }
      if (!selectedSeason && urlFilters.season_id) {
        const resolved = resolveSelectionValue(filterOptions.seasons, urlFilters.season_id)
        if (resolved) handleSelectChange("season", resolved, { skipFetch: true })
      }
      if (!selectedWeek && urlFilters.week) {
        const resolved = resolveSelectionValue(filterOptions.weeks, urlFilters.week)
        if (resolved) handleSelectChange("week", resolved, { skipFetch: true })
      }
      if (!selectedSeries && urlFilters.series_id) {
        const resolved = resolveSelectionValue(filterOptions.series, urlFilters.series_id)
        if (resolved) handleSelectChange("series", resolved, { skipFetch: true })
      }
      if (!selectedYear && urlFilters.year) {
        const resolved = resolveSelectionValue(filterOptions.years, urlFilters.year)
        if (resolved) handleSelectChange("year", resolved, { skipFetch: true })
      }
    } else if (!selectedVersion && urlFilters.version) {
      const resolved = resolveSelectionValue(filterOptions.versions, urlFilters.version)
      if (resolved) handleSelectChange("version", resolved, { skipFetch: true })
    } else if (!selectedVersion && filterOptions.versions.length === 1) {
      autoSelect("version", filterOptions.versions[0].value)
    }
  }, [
    filterOptions,
    game,
    handleSelectChange,
    resolveSelectionValue,
    selectedCar,
    selectedClass,
    selectedSeason,
    selectedSeries,
    selectedTrack,
    selectedVariation,
    selectedWeek,
    selectedYear,
    selectedVersion,
    urlFilters,
  ])

  const fetchSetups = useCallback(async () => {
    const requestBody = buildRequestBody()
    setSearchLoading(true)
    console.log("=== SEARCH REQUEST BODY ===", requestBody)
    try {
      const response = await fetch("/api/setups/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })
      if (!response.ok) {
        throw new Error(`Search API responded with ${response.status}`)
      }
      const data = await response.json()
      const payload =
        data && typeof data === "object" && "data" in (data as Record<string, unknown>)
          ? (data as Record<string, unknown>).data
          : data
      if (Array.isArray(payload)) {
        setTableSetups(payload as SetupPageProps["setups"])
      } else {
        console.warn("Search API payload is not an array", payload)
        setTableSetups([])
      }
    } catch (error) {
      console.error("Failed to fetch setups", error)
      setTableSetups([])
    } finally {
      setSearchLoading(false)
    }
  }, [buildRequestBody])

  useEffect(() => {
    const hasUrlFilters = Object.values(urlFilters).some(Boolean)
    const hasSelection =
      selectedClass ||
      selectedCar ||
      selectedTrack ||
      selectedVariation ||
      selectedSeason ||
      selectedWeek ||
      selectedSeries ||
      selectedYear ||
      selectedVersion
    if (hasUrlFilters && hasSelection) {
      fetchSetups()
    }
  }, [
    fetchSetups,
    selectedCar,
    selectedClass,
    selectedSeason,
    selectedSeries,
    selectedTrack,
    selectedVariation,
    selectedWeek,
    selectedYear,
    selectedVersion,
    urlFilters,
  ])

  useEffect(() => {
    let cancelled = false
    const requestBody = buildRequestBody()
    setFiltersLoading(true)
    if (skipNextFiltersFetchRef.current) {
      skipNextFiltersFetchRef.current = false
      setFiltersLoading(false)
      return
    }
    console.log("=== FILTERS REQUEST BODY ===", requestBody)
    console.log("=== FILTERS SELECTIONS ===", {
      class: selectedClass,
      car: selectedCar,
      track: selectedTrack,
      season: selectedSeason,
      week: selectedWeek,
      variation: selectedVariation,
      series: selectedSeries,
      year: selectedYear,
      version: selectedVersion,
      game,
    })
    fetch("/api/setups/filters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        const payload =
          data && typeof data === "object" && "data" in (data as Record<string, unknown>)
            ? (data as Record<string, unknown>).data
            : data
        const source = (payload ?? {}) as Record<string, unknown>
        console.log("=== FILTERS RESPONSE KEYS ===", Object.keys(source))
        
        const hasClasses = "classes" in source || "class" in source
        const hasCars = "cars" in source || "car" in source
        const hasTracks = "tracks" in source || "track" in source
        const hasSeasons = "seasons" in source || "season" in source || "conditions" in source
        const hasWeeks = "weeks" in source || "week" in source
        const hasVariations =
          "variations" in source ||
          "variation" in source ||
          "track_variations" in source ||
          "trackVariations" in source
        const hasSeries =
          "serieses" in source || "series" in source || "type" in source || "types" in source || "serie" in source
        const hasYears = "years" in source || "year" in source
        const hasVersions = "versions" in source || "version" in source

        setFilterOptions((prev) => ({
          classes: hasClasses ? mapOptions(source.classes ?? source.class) : prev.classes,
          cars: hasCars ? mapOptions(source.cars ?? source.car) : prev.cars,
          tracks: hasTracks ? mapOptions(source.tracks ?? source.track) : prev.tracks,
          seasons: hasSeasons ? mapOptions(source.seasons ?? source.season ?? source.conditions) : prev.seasons,
          weeks: hasWeeks
            ? mapOptions(source.weeks ?? source.week)
                .map((option) => ({
                  ...option,
                  label: formatWeekLabel(option.label),
                }))
                .sort((a, b) => {
                  const aNum = Number(a.value.match(/(\d+)/)?.[1] ?? a.label.match(/(\d+)/)?.[1] ?? 0)
                  const bNum = Number(b.value.match(/(\d+)/)?.[1] ?? b.label.match(/(\d+)/)?.[1] ?? 0)
                  return bNum - aNum
                })
            : prev.weeks,
          variations: hasVariations
            ? mapOptions(source.variations ?? source.variation ?? source.track_variations ?? source.trackVariations)
            : prev.variations,
          series: hasSeries ? mapOptions(source.serieses ?? source.series ?? source.type ?? source.types ?? source.serie) : prev.series,
          years: hasYears ? mapOptions(source.years ?? source.year) : prev.years,
          versions: hasVersions ? mapOptions(source.versions ?? source.version) : prev.versions,
        }))
      })
      .catch(() => {
        if (!cancelled) {
          setFilterOptions({
            classes: [],
            cars: [],
            tracks: [],
            seasons: [],
            weeks: [],
            variations: [],
            series: [],
            years: [],
            versions: [],
          })
        }
      })
      .finally(() => {
        if (!cancelled) setFiltersLoading(false)
      })
    return () => { cancelled = true }
  }, [buildRequestBody])

  const updateUrlFromSelections = useCallback(() => {
    if (!hasHydratedUrlRef.current) return
    const params = new URLSearchParams(searchParams.toString())
    const setOrDelete = (key: string, value: string) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    }

    setOrDelete("category_id", String(categoryId))
    setOrDelete(
      "class_id",
      getLabelFromOptions(filterOptions.classes, selectedClass || urlFilters.class_id)
    )
    setOrDelete(
      "car_id",
      getLabelFromOptions(filterOptions.cars, selectedCar || urlFilters.car_id)
    )
    setOrDelete(
      "track_id",
      getLabelFromOptions(filterOptions.tracks, selectedTrack || urlFilters.track_id)
    )
    setOrDelete(
      "variation_id",
      getLabelFromOptions(filterOptions.variations, selectedVariation || urlFilters.variation_id)
    )
    setOrDelete(
      "season_id",
      getLabelFromOptions(filterOptions.seasons, selectedSeason || urlFilters.season_id)
    )
    setOrDelete(
      "week",
      getLabelFromOptions(filterOptions.weeks, selectedWeek || urlFilters.week)
    )
    setOrDelete(
      "series_id",
      getLabelFromOptions(filterOptions.series, selectedSeries || urlFilters.series_id)
    )
    setOrDelete(
      "year",
      getLabelFromOptions(filterOptions.years, selectedYear || urlFilters.year)
    )
    setOrDelete(
      "version",
      getLabelFromOptions(filterOptions.versions, selectedVersion || urlFilters.version)
    )

    const nextQuery = params.toString()
    const currentQuery = searchParams.toString()
    if (nextQuery !== currentQuery) {
      router.replace(`${pathname}${nextQuery ? `?${nextQuery}` : ""}`, { scroll: false })
    }
  }, [
    categoryId,
    filterOptions,
    getLabelFromOptions,
    pathname,
    router,
    searchParams,
    selectedClass,
    selectedCar,
    selectedSeason,
    selectedSeries,
    selectedTrack,
    selectedVariation,
    selectedWeek,
    selectedYear,
    selectedVersion,
    urlFilters,
  ])

  useEffect(() => {
    if (filterOptions.tracks.length === 1 && !selectedTrack) {
      const onlyTrack = filterOptions.tracks[0].value
      console.log("Auto-selecting single track:", onlyTrack)
      setSelectedTrack(onlyTrack)
    }
  }, [filterOptions.tracks, selectedTrack])

  useEffect(() => {
    const ensureValidSelection = (
      value: string,
      options: FilterOption[],
      setter: React.Dispatch<React.SetStateAction<string>>
    ) => {
      if (!value) return
      if (options.length > 0 && !options.some((option) => option.value === value)) {
        setter("")
      }
    }

    ensureValidSelection(selectedClass, filterOptions.classes, setSelectedClass)
    ensureValidSelection(selectedCar, filterOptions.cars, setSelectedCar)
    ensureValidSelection(selectedTrack, filterOptions.tracks, setSelectedTrack)
    ensureValidSelection(selectedVariation, filterOptions.variations, setSelectedVariation)
    ensureValidSelection(selectedSeason, filterOptions.seasons, setSelectedSeason)
    ensureValidSelection(selectedWeek, filterOptions.weeks, setSelectedWeek)
    ensureValidSelection(selectedSeries, filterOptions.series, setSelectedSeries)
    ensureValidSelection(selectedYear, filterOptions.years, setSelectedYear)
    ensureValidSelection(selectedVersion, filterOptions.versions, setSelectedVersion)
  }, [
    filterOptions,
    selectedClass,
    selectedCar,
    selectedTrack,
    selectedVariation,
    selectedSeason,
    selectedWeek,
    selectedSeries,
    selectedYear,
    selectedVersion,
  ])

  const clearAllFilters = useCallback(() => {
    setSelectedClass("")
    setSelectedCar("")
    setSelectedTrack("")
    setSelectedSeason("")
    setSelectedWeek("")
    setSelectedVariation("")
    setSelectedSeries("")
    setSelectedYear("")
    setSelectedVersion("")
    setSearchQuery("")
    selectionOrderRef.current = []
  }, [])

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
    return tableSetups.filter((setup) => {
      const matchesSearch = searchQuery === "" || 
        setup.car.toLowerCase().includes(searchQuery.toLowerCase()) ||
        setup.track.toLowerCase().includes(searchQuery.toLowerCase()) ||
        setup.series.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesClass = selectedClass === "" || setup.car.toLowerCase().includes(selectedClass.toLowerCase())
      const matchesCar = selectedCar === "" || setup.car.toLowerCase().includes(selectedCar.toLowerCase())
      const matchesTrack = selectedTrack === "" || setup.track.toLowerCase().includes(selectedTrack.toLowerCase())
    
    // For iRacing: season + week; for ACC/LMU: season + series
    let matchesFilter4 = true
    if (selectedSeason !== "") {
      if (game === "iracing") {
        const seasonMatch = setup.season.match(/(\d{4})\s*S(\d+)/i)
        const normalized = seasonMatch ? `${seasonMatch[1]}s${seasonMatch[2]}` : ""
        matchesFilter4 = normalized ? selectedSeason.toLowerCase() === normalized.toLowerCase() : setup.season.toLowerCase().includes(selectedSeason.toLowerCase())
      } else {
        matchesFilter4 = setup.season.toLowerCase().includes(selectedSeason.toLowerCase())
      }
    }

    let matchesFilter5 = true
    if (game === "iracing") {
      if (selectedWeek !== "") {
        const weekNum = setup.week?.match(/(\d+)/)?.[0]
        const normalized = weekNum ? `week${weekNum}` : ""
        matchesFilter5 = normalized ? selectedWeek.toLowerCase() === normalized.toLowerCase() : !!(setup.week && setup.week.toLowerCase().includes(selectedWeek.toLowerCase()))
      }
    }

    const matchesVariation =
      selectedVariation === "" || setup.track.toLowerCase().includes(selectedVariation.toLowerCase())
    const matchesYear =
      selectedYear === "" || setup.season.toLowerCase().includes(selectedYear.toLowerCase())
    const matchesSeries =
      selectedSeries === "" || setup.series.toLowerCase().includes(selectedSeries.toLowerCase())
    const matchesVersion =
      selectedVersion === "" || (setup.version ?? "").toLowerCase().includes(selectedVersion.toLowerCase())
      
      return (
        matchesSearch &&
        matchesClass &&
        matchesCar &&
        matchesTrack &&
        matchesFilter4 &&
        matchesFilter5 &&
        matchesVariation &&
        matchesYear &&
        matchesSeries &&
        matchesVersion
      )
    })
  }, [
    tableSetups,
    searchQuery,
    selectedClass,
    selectedCar,
    selectedTrack,
    selectedSeason,
    selectedWeek,
    selectedVariation,
    selectedSeries,
    selectedYear,
    selectedVersion,
    game,
  ])

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

  return (
    <div className="min-h-screen pt-16 z-10">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-24 py-8">
        {/* Header with Logo and Title - Centered */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 text-center sm:text-left">
          <Image src={logo as string} alt={title} width={100} height={100} className="shrink-0" />
          <h1 className="text-4xl md:text-5xl font-bold italic font-display text-white">{title}</h1>
        </div>

        {/* Filters Row - Centered */}
        <div className="flex flex-col items-center gap-4 mb-8 relative z-20">
          {/* Main Filter Group - Centered */}
          <div className="flex flex-wrap items-center justify-center gap-3 w-full">
            <Select
              value={selectedClass}
              onValueChange={(value) => handleSelectChange("class", value)}
              disabled={filtersLoading}
            >
              <SelectTrigger className="w-[140px] bg-secondary border-border">
                <SelectValue placeholder="Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={clearOptionValue}>Classes</SelectItem>
                {filterOptions.classes.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedCar}
              onValueChange={(value) => handleSelectChange("car", value)}
              disabled={filtersLoading}
            >
              <SelectTrigger className="w-[140px] bg-secondary border-border">
                <SelectValue placeholder="Cars" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={clearOptionValue}>Cars</SelectItem>
                {filterOptions.cars.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedTrack}
              onValueChange={(value) => handleSelectChange("track", value)}
              disabled={filtersLoading}
            >
              <SelectTrigger className="w-[140px] bg-secondary border-border">
                <SelectValue placeholder="Tracks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={clearOptionValue}>Tracks</SelectItem>
                {filterOptions.tracks.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Season filter (and Week for iRacing) */}
            {game === "iracing" && (
              <Select
                value={selectedSeason}
                onValueChange={(value) => handleSelectChange("season", value)}
                disabled={filtersLoading}
              >
                <SelectTrigger className="w-[140px] bg-secondary border-border">
                  <SelectValue placeholder="Season" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={clearOptionValue}>Season</SelectItem>
                  {filterOptions.seasons.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Week filter: only for iRacing, to the right of Season */}
            {game === "iracing" && (
              <Select
                value={selectedWeek}
                onValueChange={(value) => handleSelectChange("week", value)}
                disabled={filtersLoading}
              >
                <SelectTrigger className="w-[140px] bg-secondary border-border">
                  <SelectValue placeholder="Week" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={clearOptionValue}>Week</SelectItem>
                  {filterOptions.weeks.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* filter5 (e.g. Type/Series) for ACC/LMU – not used for iRacing where filter5 is Week */}

            <Button
              onClick={() => {
                updateUrlFromSelections()
                fetchSetups()
              }}
              disabled={filtersLoading || searchLoading}
              className="transition-all duration-200 hover:scale-105 shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]"
            >
              {searchLoading ? "Finding..." : "Find Setup"}
            </Button>

            <Button 
              variant="outline" 
              onClick={clearAllFilters}
              className="border border-white/30 text-white hover:bg-white/10 transition-colors duration-200"
            >
              Clear All
            </Button>

            {/* More Filters Button */}
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setShowMoreFilters(!showMoreFilters)}
                className={`border border-white/15 bg-[#1d1b23] text-white hover:bg-[#24222b] transition-all duration-200 shadow-[0_12px_30px_rgba(0,0,0,0.35)] ${
                  showMoreFilters ? "border-primary/40" : ""
                }`}
              >
                <Filter className="h-4 w-4 mr-2" />
                MORE FILTERS
              </Button>
            </div>
          </div>

          {showMoreFilters && (
            <div className="flex flex-wrap items-center justify-center gap-3 w-full">
              {game === "iracing" ? (
                <>
                  <Select
                    value={selectedVariation}
                    onValueChange={(value) => handleSelectChange("variation", value)}
                    disabled={filtersLoading}
                  >
                    <SelectTrigger className="w-[140px] bg-secondary border-border">
                      <SelectValue placeholder="Track Variation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={clearOptionValue}>Track Variation</SelectItem>
                      {filterOptions.variations.length === 0 ? (
                        <SelectItem value="_none" disabled>No variations available</SelectItem>
                      ) : (
                        filterOptions.variations.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <Select
                    value={selectedSeries}
                    onValueChange={(value) => handleSelectChange("series", value)}
                    disabled={filtersLoading}
                  >
                    <SelectTrigger className="w-[140px] bg-secondary border-border">
                      <SelectValue placeholder="Series" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={clearOptionValue}>Series</SelectItem>
                      {filterOptions.series.length === 0 ? (
                        <SelectItem value="_none" disabled>No series available</SelectItem>
                      ) : (
                        filterOptions.series.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <Select
                    value={selectedYear}
                    onValueChange={(value) => handleSelectChange("year", value)}
                    disabled={filtersLoading}
                  >
                    <SelectTrigger className="w-[140px] bg-secondary border-border">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={clearOptionValue}>Year</SelectItem>
                      {filterOptions.years.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              ) : (
                <Select
                  value={selectedVersion}
                  onValueChange={(value) => handleSelectChange("version", value)}
                  disabled={filtersLoading}
                >
                  <SelectTrigger className="w-[140px] bg-secondary border-border">
                    <SelectValue placeholder="Version" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={clearOptionValue}>Version</SelectItem>
                    {filterOptions.versions.length === 0 ? (
                      <SelectItem value="_none" disabled>No versions available</SelectItem>
                    ) : (
                      filterOptions.versions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
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
              <col style={{ width: "16%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "8%" }} />
            </colgroup>
            <thead>
              <tr className="border-b border-border/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-primary uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-primary uppercase tracking-wider">Game</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-primary uppercase tracking-wider">Car</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-primary uppercase tracking-wider">Track</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-primary uppercase tracking-wider">Season</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-primary uppercase tracking-wider">Series</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-primary uppercase tracking-wider">Lap Time</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-primary uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSetups.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
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
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {setup.lapTime || "—"}
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
                <h2 className="text-2xl md:text-3xl font-bold font-display text-white mb-2">
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
