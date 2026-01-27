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
    year?: string
    videoUrl?: string
    trackGuideUrl?: string
    lapTime?: string
    weather?: SetupWeather
  }[]
}

interface SetupWeather {
  airTemp?: number | string
  humidity?: number | string
  windSpeed?: number | string
  windDirection?: string
  trackTemp?: number | string
  sky?: string
  time?: string
  date?: string
}

interface UrlFiltersState {
  class: string
  car: string
  track: string
  variation: string
  season: string
  week: string
  series: string
  year: string
  version: string
}

const parseNumberValue = (value: unknown): number | undefined => {
  if (value === null || value === undefined) return undefined
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined
  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  return undefined
}

const parseStringValue = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

const normalizeWeather = (value: unknown): SetupWeather | undefined => {
  if (!value || typeof value !== "object") return undefined
  const record = value as Record<string, unknown>
  const normalized: SetupWeather = {
    airTemp:
      parseNumberValue(record.air_temp) ??
      parseNumberValue(record.airTemp) ??
      parseNumberValue(record.temp) ??
      parseNumberValue(record.airTemperature),
    humidity:
      parseNumberValue(record.hume) ??
      parseNumberValue(record.humidity) ??
      parseNumberValue(record.humid),
    windSpeed:
      parseNumberValue(record.mph) ??
      parseNumberValue(record.wind_speed) ??
      parseNumberValue(record.windSpeed) ??
      parseNumberValue(record.wind),
    windDirection:
      parseStringValue(record.wind_dir) ??
      parseStringValue(record.windDirection) ??
      parseStringValue(record.wind_dir_label) ??
      parseStringValue(record.windDir) ??
      parseStringValue(record.wind_direction),
    trackTemp:
      parseNumberValue(record.trac) ??
      parseNumberValue(record.track_temp) ??
      parseNumberValue(record.trackTemp) ??
      parseNumberValue(record.track_temperature),
    sky:
      parseStringValue(record.sky) ??
      parseStringValue(record.sky_condition) ??
      parseStringValue(record.conditions) ??
      parseStringValue(record.skyConditions),
    time:
      parseStringValue(record.wdatetime) ??
      parseStringValue(record.wdate_time) ??
      parseStringValue(record.time) ??
      parseStringValue(record.datetime) ??
      parseStringValue(record.date_time),
    date: parseStringValue(record.wdate) ?? parseStringValue(record.date),
  }
  const hasValue = Object.values(normalized).some(
    (entry) => entry !== undefined && entry !== null && String(entry).trim() !== ""
  )
  return hasValue ? normalized : undefined
}

const formatTemperature = (value?: number | string) => {
  if (value === undefined || value === null) return ""
  const text = String(value).trim()
  if (!text) return ""
  if (/[CF]\b/i.test(text)) return text
  return `${text} F`
}

const formatHumidity = (value?: number | string) => {
  if (value === undefined || value === null) return ""
  const text = String(value).trim()
  if (!text) return ""
  const withPercent = text.includes("%") ? text : `${text}%`
  return /rh\b/i.test(withPercent) ? withPercent : `${withPercent} RH`
}

const formatWind = (speed?: number | string, direction?: string) => {
  if (speed === undefined || speed === null) return ""
  const text = String(speed).trim()
  if (!text) return ""
  const withUnit = /mph\b/i.test(text) ? text : `${text} MPH`
  return direction ? `${withUnit} ${direction}` : withUnit
}

const parseWeatherDate = (value: string): Date | null => {
  const candidate = value.includes(" ") && !value.includes("T") ? value.replace(" ", "T") : value
  const parsed = new Date(candidate)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const formatWeatherDateTime = (value?: string) => {
  if (!value) return { timeLabel: "", dateLabel: "" }
  const parsed = parseWeatherDate(value)
  if (!parsed) {
    return { timeLabel: value, dateLabel: "" }
  }
  return {
    timeLabel: parsed.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    dateLabel: parsed.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
  }
}

export function SetupPage({ game, title, logo, heroImage, categoryId, setups }: SetupPageProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const hasHydratedUrlRef = useRef(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [tableSetups, setTableSetups] = useState(setups)
  const [urlFilters, setUrlFilters] = useState<UrlFiltersState>({
    class: "",
    car: "",
    track: "",
    variation: "",
    season: "",
    week: "",
    series: "",
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
  const removalTriggeredRef = useRef(false)
  const [selectedSetupId, setSelectedSetupId] = useState<string>("")
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
      class: getParam("class"),
      car: getParam("car"),
      track: getParam("track"),
      variation: getParam("variation"),
      season: getParam("season"),
      week: getParam("week"),
      series: getParam("series"),
      year: getParam("year"),
      version: getParam("version"),
    })
    hasHydratedUrlRef.current = true
  }, [searchParams])

  const slugify = useCallback((value: string) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }, [])

  const getWeekNumber = useCallback((value: string) => {
    const match = value.match(/(\d+)/)
    return match ? match[1] : ""
  }, [])

  const resolveSelectionValue = useCallback((options: FilterOption[], urlValue: string): string => {
    if (!urlValue) return ""
    const directMatch = options.find((option) => option.value === urlValue)
    if (directMatch) return directMatch.value
    const labelMatch = options.find(
      (option) => option.label.toLowerCase() === urlValue.toLowerCase()
    )
    if (labelMatch) return labelMatch.value
    const slugMatch = options.find((option) => {
      const labelSlug = slugify(option.label)
      const valueSlug = slugify(option.value)
      return labelSlug === urlValue || valueSlug === urlValue
    })
    if (slugMatch) return slugMatch.value
    return ""
  }, [slugify])

  const resolveWeekSelectionValue = useCallback(
    (options: FilterOption[], urlValue: string): string => {
      if (!urlValue) return ""
      const direct = resolveSelectionValue(options, urlValue)
      if (direct) return direct
      const urlWeek = getWeekNumber(urlValue) || urlValue
      if (!urlWeek) return ""
      const weekMatch = options.find((option) => {
        const optionWeek = getWeekNumber(option.value) || getWeekNumber(option.label)
        return optionWeek === urlWeek
      })
      return weekMatch?.value ?? ""
    },
    [getWeekNumber, resolveSelectionValue]
  )

  const normalizeSelectValue = useCallback((value: string) => {
    return value === clearOptionValue ? "" : value
  }, [clearOptionValue])

  const getLabelFromOptions = useCallback((options: FilterOption[], value: string): string => {
    if (!value) return ""
    const match = options.find((option) => option.value === value)
    return match?.label ?? value
  }, [])

  const getSlugFromOptions = useCallback(
    (options: FilterOption[], value: string): string => {
      if (!value) return ""
      const label = getLabelFromOptions(options, value)
      return slugify(label)
    },
    [getLabelFromOptions, slugify]
  )

  const getWeekSlugFromOptions = useCallback(
    (options: FilterOption[], value: string): string => {
      if (!value) return ""
      const valueWeek = getWeekNumber(value)
      if (valueWeek) return valueWeek
      const label = getLabelFromOptions(options, value)
      const labelWeek = getWeekNumber(label)
      if (labelWeek) return labelWeek
      return slugify(label)
    },
    [getLabelFromOptions, getWeekNumber, slugify]
  )

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

  const getLatestSeasonOption = useCallback((options: FilterOption[]) => {
    if (options.length === 0) return null
    const scored = options
      .map((option) => {
        const raw = `${option.label} ${option.value}`
        const seasonMatch = raw.match(/(\d{4})\s*S(\d+)/i)
        if (seasonMatch) {
          const year = Number(seasonMatch[1])
          const seasonNum = Number(seasonMatch[2])
          return { option, score: year * 10 + seasonNum }
        }
        const yearMatch = raw.match(/(\d{4})/)
        if (yearMatch) {
          return { option, score: Number(yearMatch[1]) * 10 }
        }
        return { option, score: 0 }
      })
      .sort((a, b) => b.score - a.score)
    return scored[0]?.option ?? null
  }, [])

  const handleSelectChange = useCallback(
    (
      field: "class" | "car" | "track" | "season" | "week" | "variation" | "series" | "year" | "version",
      value: string,
      options?: { skipFetch?: boolean }
    ) => {
      const normalized = normalizeSelectValue(value)
      if (!normalized) {
        removalTriggeredRef.current = true
      }
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
    if (game !== "iracing") return
    if (!selectedCar || !selectedTrack) return
    if (urlFilters.season || urlFilters.week) return

    if (!selectedSeason && filterOptions.seasons.length > 0) {
      const latestSeason = getLatestSeasonOption(filterOptions.seasons)
      if (latestSeason) {
        handleSelectChange("season", latestSeason.value)
      }
    }
    if (!selectedWeek && filterOptions.weeks.length === 1) {
      const onlyWeek = filterOptions.weeks[0]
      if (onlyWeek) {
        handleSelectChange("week", onlyWeek.value)
      }
    }
  }, [
    filterOptions.seasons,
    filterOptions.weeks,
    game,
    getLatestSeasonOption,
    handleSelectChange,
    selectedCar,
    selectedSeason,
    selectedTrack,
    selectedWeek,
    urlFilters.season,
    urlFilters.week,
  ])

  useEffect(() => {
    if (!filterOptions.classes.length && !filterOptions.cars.length && !filterOptions.tracks.length) {
      return
    }
    const autoSelect = (field: "class" | "car" | "track" | "season" | "week" | "variation" | "series" | "year" | "version", value: string) => {
      if (!value) return
      handleSelectChange(field, value, { skipFetch: true })
    }
    if (!selectedClass && !urlFilters.class && filterOptions.classes.length === 1) {
      autoSelect("class", filterOptions.classes[0].value)
    }
    if (!selectedCar && !urlFilters.car && filterOptions.cars.length === 1) {
      autoSelect("car", filterOptions.cars[0].value)
    }
    if (!selectedTrack && !urlFilters.track && filterOptions.tracks.length === 1) {
      autoSelect("track", filterOptions.tracks[0].value)
    }
    if (!selectedClass && urlFilters.class) {
      const resolved = resolveSelectionValue(filterOptions.classes, urlFilters.class)
      if (resolved) handleSelectChange("class", resolved)
    }
    if (!selectedCar && urlFilters.car) {
      const resolved = resolveSelectionValue(filterOptions.cars, urlFilters.car)
      if (resolved) handleSelectChange("car", resolved)
    }
    if (!selectedTrack && urlFilters.track) {
      const resolved = resolveSelectionValue(filterOptions.tracks, urlFilters.track)
      if (resolved) handleSelectChange("track", resolved)
    }
    if (game === "iracing") {
      if (!selectedSeason && !urlFilters.season && filterOptions.seasons.length === 1) {
        autoSelect("season", filterOptions.seasons[0].value)
      }
      if (!selectedWeek && !urlFilters.week && filterOptions.weeks.length === 1) {
        autoSelect("week", filterOptions.weeks[0].value)
      }
      if (!selectedVariation && !urlFilters.variation && filterOptions.variations.length === 1) {
        autoSelect("variation", filterOptions.variations[0].value)
      }
      if (!selectedSeries && !urlFilters.series && filterOptions.series.length === 1) {
        autoSelect("series", filterOptions.series[0].value)
      }
      if (!selectedYear && !urlFilters.year && filterOptions.years.length === 1) {
        autoSelect("year", filterOptions.years[0].value)
      }
      if (!selectedVariation && urlFilters.variation) {
        const resolved = resolveSelectionValue(filterOptions.variations, urlFilters.variation)
        if (resolved) handleSelectChange("variation", resolved, { skipFetch: true })
      }
      if (!selectedSeason && urlFilters.season) {
        const resolved = resolveSelectionValue(filterOptions.seasons, urlFilters.season)
        if (resolved) handleSelectChange("season", resolved, { skipFetch: true })
      }
      if (!selectedWeek && urlFilters.week) {
        const resolved = resolveWeekSelectionValue(filterOptions.weeks, urlFilters.week)
        if (resolved) handleSelectChange("week", resolved, { skipFetch: true })
      }
      if (!selectedSeries && urlFilters.series) {
        const resolved = resolveSelectionValue(filterOptions.series, urlFilters.series)
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
    resolveWeekSelectionValue,
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
      const response = await fetch("https://www.hymosetups.com/api/v1/setups/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })
      if (!response.ok) {
        throw new Error(`Search API responded with ${response.status}`)
      }
      const data = await response.json()
      console.log("=== SEARCH API RESPONSE ===", data)
      const payload =
        data && typeof data === "object" && "data" in (data as Record<string, unknown>)
          ? (data as Record<string, unknown>).data
          : data
      if (Array.isArray(payload)) {
        const normalized = payload.map((item) => {
          const entry = item as Record<string, unknown>
          const getName = (value: unknown) => {
            if (!value) return ""
            if (typeof value === "string") return value
            if (typeof value === "object") {
              const record = value as Record<string, unknown>
              if (typeof record.name === "string") return record.name
              if (typeof record.label === "string") return record.label
            }
            return ""
          }
          return {
            id: String(entry.id ?? ""),
            game: getName(entry.category) || String(entry.game ?? game),
            car: getName(entry.car),
            track: getName(entry.track),
            season: getName(entry.season),
            week: entry.week ? String(entry.week) : undefined,
            series: getName(entry.series),
            lapTime: typeof entry.lap_time === "string" ? entry.lap_time : undefined,
            version: getName(entry.version) || undefined,
            year: entry.year ? String(entry.year) : undefined,
            videoUrl: typeof entry.video_url === "string" ? entry.video_url : undefined,
            trackGuideUrl: typeof entry.track_guide_url === "string" ? entry.track_guide_url : undefined,
            weather: normalizeWeather(entry.weather),
          }
        })
        setTableSetups(normalized as SetupPageProps["setups"])
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

  // Removed auto search on selection; use Find Setup button only.

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
    fetch("https://www.hymosetups.com/api/v1/setups/filters", {
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

  const buildUrlSelections = useCallback(() => {
    return {
      category: String(categoryId),
      class: getSlugFromOptions(filterOptions.classes, selectedClass),
      car: getSlugFromOptions(filterOptions.cars, selectedCar),
      track: getSlugFromOptions(filterOptions.tracks, selectedTrack),
      variation: getSlugFromOptions(filterOptions.variations, selectedVariation),
      season: getSlugFromOptions(filterOptions.seasons, selectedSeason),
      week: getWeekSlugFromOptions(filterOptions.weeks, selectedWeek),
      series: getSlugFromOptions(filterOptions.series, selectedSeries),
      year: getSlugFromOptions(filterOptions.years, selectedYear),
      version: getSlugFromOptions(filterOptions.versions, selectedVersion),
    }
  }, [
    categoryId,
    filterOptions,
    getWeekSlugFromOptions,
    getSlugFromOptions,
    selectedCar,
    selectedClass,
    selectedSeason,
    selectedSeries,
    selectedTrack,
    selectedVariation,
    selectedWeek,
    selectedYear,
    selectedVersion,
  ])

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

    const selections = buildUrlSelections()
    setOrDelete("category", selections.category)
    setOrDelete("class", selections.class)
    setOrDelete("car", selections.car)
    setOrDelete("track", selections.track)
    setOrDelete("variation", selections.variation)
    setOrDelete("season", selections.season)
    setOrDelete("week", selections.week)
    setOrDelete("series", selections.series)
    setOrDelete("year", selections.year)
    setOrDelete("version", selections.version)

    const nextQuery = params.toString()
    const currentQuery = searchParams.toString()
    if (nextQuery !== currentQuery) {
      router.replace(`${pathname}${nextQuery ? `?${nextQuery}` : ""}`, { scroll: false })
    }
  }, [buildUrlSelections, pathname, router, searchParams])

  useEffect(() => {
    if (!removalTriggeredRef.current) return
    removalTriggeredRef.current = false
    updateUrlFromSelections()
  }, [
    selectedClass,
    selectedCar,
    selectedTrack,
    selectedSeason,
    selectedWeek,
    selectedVariation,
    selectedSeries,
    selectedYear,
    selectedVersion,
    updateUrlFromSelections,
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
    const seasonText = String(setup.season ?? "")
    if (game === "iracing" && setup.week) {
      // Format: "iRacing Season 1 Week 1 2026"
      const seasonMatch = seasonText.match(/(\d{4})\s*S(\d+)/i)
      const weekValue = String(setup.week ?? "")
      const weekMatch = weekValue.match(/week\s*(\d+)/i) ?? weekValue.match(/(\d+)/)
      if (seasonMatch && weekMatch) {
        const year = seasonMatch[1]
        const seasonNum = seasonMatch[2]
        const weekNum = weekMatch[1]
        return `${setup.game} Season ${seasonNum} Week ${weekNum} ${year}`
      }
      // Fallback format
      return `${seasonText} ${weekValue}`
    }
    return seasonText
  }, [game])

  const filteredSetups = useMemo(() => {
    return tableSetups.filter((setup) => {
      const carText = String(setup.car ?? "")
      const trackText = String(setup.track ?? "")
      const seriesText = String(setup.series ?? "")

      const matchesSearch =
        searchQuery === "" ||
        carText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trackText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        seriesText.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesSearch
    })
  }, [tableSetups, searchQuery])

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
  const bestLapSetupId = useMemo(() => {
    const parseLapTime = (value?: string) => {
      if (!value) return Number.POSITIVE_INFINITY
      const trimmed = value.trim()
      if (trimmed === "—") return Number.POSITIVE_INFINITY
      const parts = trimmed.split(":")
      if (parts.length === 2) {
        const minutes = Number(parts[0])
        const seconds = Number(parts[1])
        if (Number.isFinite(minutes) && Number.isFinite(seconds)) {
          return minutes * 60 + seconds
        }
      }
      const seconds = Number(trimmed)
      return Number.isFinite(seconds) ? seconds : Number.POSITIVE_INFINITY
    }

    let bestId = ""
    let bestTime = Number.POSITIVE_INFINITY
    filteredSetups.forEach((setup) => {
      const current = parseLapTime(setup.lapTime)
      if (current < bestTime) {
        bestTime = current
        bestId = setup.id
      }
    })
    return bestId
  }, [filteredSetups])

  const activeSetupId = selectedSetupId || bestLapSetupId
  const activeSetup = useMemo(() => {
    return filteredSetups.find((setup) => setup.id === activeSetupId) ?? filteredSetups[0]
  }, [activeSetupId, filteredSetups])

  const weatherSummary = useMemo(() => {
    if (!activeSetup) return { cards: [], hasWeather: false }
    const weather = activeSetup.weather ?? {}
    const { timeLabel, dateLabel } = formatWeatherDateTime(weather.time ?? "")
    const timeValue = timeLabel || weather.date || ""
    const timeSubValue = timeLabel ? dateLabel || weather.date || "" : ""
    const cards = [
      {
        id: "air-temp",
        title: "Air Temp",
        value: formatTemperature(weather.airTemp),
      },
      {
        id: "humidity",
        title: "Humidity",
        value: formatHumidity(weather.humidity),
      },
      {
        id: "wind",
        title: "Wind",
        value: formatWind(weather.windSpeed, weather.windDirection),
      },
      {
        id: "track-temp",
        title: "Track Temp",
        value: formatTemperature(weather.trackTemp),
      },
      {
        id: "sky",
        title: "Sky",
        value: weather.sky ?? "",
      },
      {
        id: "time",
        title: "Time",
        value: timeValue,
        subValue: timeSubValue,
      },
    ]
    return { cards, hasWeather: true }
  }, [activeSetup])

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
                <SelectTrigger className="w-[160px] bg-secondary border-border">
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
                console.log("Find Setup slugs", buildUrlSelections())
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
                    onClick={() => setSelectedSetupId(setup.id)}
                    className={`border-b border-border/30 hover:bg-muted/30 transition-colors cursor-pointer ${
                      activeSetupId && setup.id === activeSetupId
                        ? "bg-primary/15 ring-1 ring-primary/40"
                        : bestLapSetupId && setup.id === bestLapSetupId
                          ? "bg-primary/10 ring-1 ring-primary/30"
                          : ""
                    }`}
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
          
          if (activeSetup) {
            const firstSetup = activeSetup
            
            // Extract season, year, week from first setup
            if (game === "iracing" && firstSetup.week) {
              const seasonTextValue = String(firstSetup.season ?? "")
              const weekTextValue = String(firstSetup.week ?? "")
              const seasonMatch =
                seasonTextValue.match(/(\d{4})\s*S(\d+)/i) ??
                seasonTextValue.match(/Season\s*(\d+)\s*(\d{4})/i) ??
                seasonTextValue.match(/(\d{4}).*Season\s*(\d+)/i)
              const weekMatch = weekTextValue.match(/week\s*(\d+)/i) ?? weekTextValue.match(/(\d+)/)
              if (seasonMatch) {
                const maybeYear = seasonMatch[1].length === 4 ? seasonMatch[1] : seasonMatch[2]
                const maybeSeason = seasonMatch[1].length === 4 ? seasonMatch[2] : seasonMatch[1]
                year = maybeYear
                seasonText = `Season ${maybeSeason}`
              }
              if (weekMatch) {
                weekText = weekMatch[1]
              }
              if (!year && firstSetup.year) {
                year = String(firstSetup.year)
              }
            } else if (firstSetup.season) {
              // For non-iRacing games, try to extract year from season
              const seasonTextValue = String(firstSetup.season ?? "")
              const yearMatch = seasonTextValue.match(/(\d{4})/i)
              if (yearMatch) {
                year = yearMatch[1]
              } else if (firstSetup.year) {
                year = String(firstSetup.year)
              }
              seasonText = seasonTextValue
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
            <>
              This setup pack is specifically engineered for <strong>{gameName}{seasonPart}{weekPart}</strong>, optimised for the <strong>{carText}</strong> at <strong>{trackText}</strong> combination to deliver maximum performance in competitive conditions.
            </>,
            <>
              The package includes <strong>Consistent</strong>, <strong>E-Sports</strong>, and <strong>Wet</strong> setup variants, fully optimised for both Qualifying and Race sessions. Consistent setups focus on stability, control, and long-run confidence, E-Sports setups are designed to extract ultimate lap time, while Wet setups are tuned to provide maximum grip, predictability, and confidence in low-traction conditions.
            </>,
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

        {/* {weatherSummary.hasWeather ? (
          <div className="mt-8 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              {weatherSummary.cards.map((card) => (
                <div
                  key={card.id}
                  className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#110e0f]/85 px-4 py-3 shadow-[0_0_30px_rgba(124,58,237,0.15)] backdrop-blur-md game-card"
                >
                  <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-70" />
                  <div className="text-[11px] font-semibold tracking-[0.25em] uppercase text-white/60">
                    {card.title}
                  </div>
                  <div className="mt-3 text-2xl font-display text-white">{card.value}</div>
                  {"subValue" in card && card.subValue ? (
                    <div className="mt-1 text-sm text-white/60">{card.subValue}</div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null} */}

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
            <div className="w-full aspect-video rounded-lg overflow-hidden shadow-lg border border-primary/30 bg-card/50 backdrop-blur-sm">
              <iframe
                className="w-full h-full"
                src={activeSetup?.videoUrl}
                title={`Racing Hotlap | ${activeSetup?.car || "Car"} @ ${activeSetup?.track || "Track"}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ border: 0 }}
              ></iframe>
            </div>
          </div>

        {activeSetup?.trackGuideUrl?.trim() ? (
          <div className="w-full max-w-4xl mx-auto">
            <div className="text-center mb-4">
              <h3 className="text-xl md:text-2xl font-display font-bold text-foreground inline-block relative">
                Track Guide
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></span>
              </h3>
            </div>
            <div className="w-full aspect-video rounded-lg overflow-hidden shadow-lg border border-primary/30 bg-card/50 backdrop-blur-sm">
              <iframe
                className="w-full h-full"
                src={activeSetup?.trackGuideUrl}
                title={`Track Guide | ${activeSetup?.track || "Track"}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ border: 0 }}
              ></iframe>
            </div>
          </div>
        ) : null}
        </div>
      </div>
    </div>
  )
}
