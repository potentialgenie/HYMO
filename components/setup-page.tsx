"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Trash2, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download, Thermometer, Droplets, Wind, Cloud, Clock, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { apiUrl } from "@/lib/api"

type FilterOption = { id: number; name: string }

function normalizeFilterOptions(raw: unknown): FilterOption[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null
      const o = item as Record<string, unknown>
      const id = typeof o.id === "number" ? o.id : typeof o.id === "string" ? parseInt(o.id, 10) : NaN
      const name = [o.name, o.label, o.variation].find((x) => typeof x === "string") as string | undefined
      if (Number.isNaN(id) || !name) return null
      return { id, name }
    })
    .filter((x): x is FilterOption => x !== null)
}

/** API returns weeks as [1, 2, 3, ...] - convert to FilterOption[] */
function normalizeWeeks(raw: unknown): FilterOption[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((x) => typeof x === "number" || (typeof x === "string" && !Number.isNaN(parseInt(x, 10))))
    .map((x) => ({ id: typeof x === "number" ? x : parseInt(x as string, 10), name: String(x) }))
}

/** API returns years as [2026, 2025, ...] - convert to FilterOption[] */
function normalizeYears(raw: unknown): FilterOption[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((x) => typeof x === "number" || (typeof x === "string" && !Number.isNaN(parseInt(x, 10))))
    .map((x) => ({ id: typeof x === "number" ? x : parseInt(x as string, 10), name: String(x) }))
}

export type CategoryFromApi = {
  id: number
  name: string
  slug: string
  description?: string
  image?: string
  image_url?: string
}

const ITEMS_PER_PAGE = 10

type FilterKey =
  | "class"
  | "car"
  | "track"
  | "season"
  | "week"
  | "variation"
  | "series"
  | "year"
  | "version"

const FIXED_ORDER_IRACING: FilterKey[] = [
  "class",
  "car",
  "track",
  "season",
  "week",
  "variation",
  "series",
  "year",
]

const FIXED_ORDER_ACC_LMU: FilterKey[] = ["class", "car", "track", "version"]

const ACC_LMU_SLUGS = ["assetto-corsa-competizione", "le-mans-ultimate"]

export function SetupPage({
  categoryId,
  categorySlug = "",
  categoryImageUrl,
  categoryName,
  setups = [],
}: {
  categoryId: number
  categorySlug?: string
  categoryImageUrl?: string
  categoryName?: string
  categories?: CategoryFromApi[]
  setups?: Array<Record<string, unknown>>
}) {
  const isAccOrLmu = ACC_LMU_SLUGS.includes(categorySlug.toLowerCase())
  const FIXED_ORDER = isAccOrLmu ? FIXED_ORDER_ACC_LMU : FIXED_ORDER_IRACING

  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedCar, setSelectedCar] = useState<string>("")
  const [selectedTrack, setSelectedTrack] = useState<string>("")
  const [selectedSeason, setSelectedSeason] = useState<string>("")
  const [selectedWeek, setSelectedWeek] = useState<string>("")
  const [selectedTrackVariation, setSelectedTrackVariation] = useState<string>("")
  const [selectedSeries, setSelectedSeries] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [selectedVersion, setSelectedVersion] = useState<string>("")
  const [showMoreFilters, setShowMoreFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const [classes, setClasses] = useState<FilterOption[]>([])
  const [cars, setCars] = useState<FilterOption[]>([])
  const [tracks, setTracks] = useState<FilterOption[]>([])
  const [seasons, setSeasons] = useState<FilterOption[]>([])
  const [weeks, setWeeks] = useState<FilterOption[]>([])
  const [trackVariations, setTrackVariations] = useState<FilterOption[]>([])
  const [series, setSeries] = useState<FilterOption[]>([])
  const [years, setYears] = useState<FilterOption[]>([])
  const [versions, setVersions] = useState<FilterOption[]>([])
  const [filtersLoading, setFiltersLoading] = useState(false)
  const skipNextFetchRef = useRef(false)
  const requestAnchorIndexRef = useRef<number | null>(null)
  const [selectionOrder, setSelectionOrder] = useState<FilterKey[]>([])
  const [extraSelectionOrder, setExtraSelectionOrder] = useState<FilterKey[]>([])
  const [searchResults, setSearchResults] = useState<Array<Record<string, unknown>>>(setups)
  const [searchLoading, setSearchLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedSetup, setSelectedSetup] = useState<Record<string, unknown> | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const hasUrlParamsRef = useRef(false)
  const urlAppliedRef = useRef(false)
  const fixedRankingActiveRef = useRef(false)
  const fixedSelectedRef = useRef<Set<FilterKey>>(new Set())
  const lockedKeysRef = useRef<Set<FilterKey>>(new Set())
  const urlSelectedNamesRef = useRef<Partial<Record<FilterKey, string>>>({})
  const didUrlSearchRef = useRef(false)
  const skipUrlApplyRef = useRef(false)

  const setSelectedByKey = (key: FilterKey, value: string) => {
    switch (key) {
      case "class":
        setSelectedClass(value)
        break
      case "car":
        setSelectedCar(value)
        break
      case "track":
        setSelectedTrack(value)
        break
      case "season":
        setSelectedSeason(value)
        break
      case "week":
        setSelectedWeek(value)
        break
      case "variation":
        setSelectedTrackVariation(value)
        break
      case "series":
        setSelectedSeries(value)
        break
      case "year":
        setSelectedYear(value)
        break
      case "version":
        setSelectedVersion(value)
        break
    }
  }

  const clearSelections = (keys: FilterKey[]) => {
    keys.forEach((key) => {
      lockedKeysRef.current.delete(key)
      setSelectedByKey(key, "")
    })
  }

  const applyFixedRanking = (nextFixed: Set<FilterKey>, nextExtra: FilterKey[]) => {
    const base = FIXED_ORDER.filter((key) => nextFixed.has(key))
    const extras = nextExtra.filter((key) => !nextFixed.has(key))
    setExtraSelectionOrder(extras)
    setSelectionOrder([...base, ...extras])
  }

  const setOptionsByKey = (key: FilterKey, options: FilterOption[]) => {
    switch (key) {
      case "class":
        setClasses(options)
        break
      case "car":
        setCars(options)
        break
      case "track":
        setTracks(options)
        break
      case "season":
        setSeasons(options)
        break
      case "week":
        setWeeks(options)
        break
      case "variation":
        setTrackVariations(options)
        break
      case "series":
        setSeries(options)
        break
      case "year":
        setYears(options)
        break
      case "version":
        setVersions(options)
        break
    }
  }

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")

  const getStoredIdByName = (key: FilterKey, name: string) => {
    if (!name) return ""
    try {
      const raw = localStorage.getItem(`setupFilters:${key}`)
      if (!raw) return ""
      const map = JSON.parse(raw) as Record<string, number>
      const decoded = decodeURIComponent(name)
      const id =
        map[name.toLowerCase()] ??
        map[decoded.toLowerCase()] ??
        map[slugify(decoded)]
      return typeof id === "number" ? String(id) : ""
    } catch {
      return ""
    }
  }

  const storeOptionsByName = (key: FilterKey, options: FilterOption[]) => {
    try {
      const map: Record<string, number> = {}
      options.forEach((opt) => {
        const lower = opt.name.toLowerCase()
        map[lower] = opt.id
        const slug = slugify(opt.name)
        if (slug) map[slug] = opt.id
      })
      localStorage.setItem(`setupFilters:${key}`, JSON.stringify(map))
    } catch {
      // ignore storage errors
    }
  }

  // Store variation options by ID for reverse lookup (ID -> name)
  const storeVariationById = (options: FilterOption[]) => {
    try {
      const map: Record<string, string> = {}
      options.forEach((opt) => {
        map[String(opt.id)] = opt.name
      })
      localStorage.setItem("setupFilters:variationById", JSON.stringify(map))
    } catch {
      // ignore storage errors
    }
  }

  // Get variation name by ID from localStorage
  const getVariationNameById = (id: string): string => {
    if (!id) return ""
    try {
      const raw = localStorage.getItem("setupFilters:variationById")
      if (!raw) return ""
      const map = JSON.parse(raw) as Record<string, string>
      return map[id] || ""
    } catch {
      return ""
    }
  }

  const updateOrderForAuto = (key: FilterKey, value: string) => {
    if (fixedRankingActiveRef.current) {
      const nextFixed = new Set(fixedSelectedRef.current)
      let nextExtra = extraSelectionOrder
      if (value) {
        if (!nextFixed.has(key)) {
          if (!nextExtra.includes(key)) nextExtra = [...nextExtra, key]
        }
      } else {
        nextFixed.delete(key)
        nextExtra = nextExtra.filter((k) => k !== key)
      }
      fixedSelectedRef.current = nextFixed
      applyFixedRanking(nextFixed, nextExtra)
      return
    }
    setSelectionOrder((prev) => {
      const exists = prev.includes(key)
      if (value) {
        return exists ? prev : [...prev, key]
      }
      return exists ? prev.filter((k) => k !== key) : prev
    })
  }

  const handleUserChange = (key: FilterKey, value: string) => {
    const nextValue = value === "__clear__" ? "" : value
    const prevOrder = selectionOrder
    const prevIndex = prevOrder.indexOf(key)
    const anchorIndex = prevIndex === -1 ? prevOrder.length : prevIndex

    requestAnchorIndexRef.current = anchorIndex
    lockedKeysRef.current.delete(key)

    if (fixedRankingActiveRef.current && key === "class" && !nextValue) {
      const toClear = prevOrder.filter((k) => k !== "class")
      if (toClear.length) clearSelections(toClear)
      fixedSelectedRef.current = new Set()
      applyFixedRanking(fixedSelectedRef.current, [])
    }

    if (fixedRankingActiveRef.current) {
      const nextFixed = new Set(fixedSelectedRef.current)
      let nextExtra = extraSelectionOrder
      if (nextValue) {
        if (!nextFixed.has(key)) {
          if (!nextExtra.includes(key)) nextExtra = [...nextExtra, key]
        }
      } else {
        nextFixed.delete(key)
        nextExtra = nextExtra.filter((k) => k !== key)
      }
      fixedSelectedRef.current = nextFixed
      applyFixedRanking(nextFixed, nextExtra)
    }

    if (nextValue) {
      const baseOrder = prevIndex === -1 ? [...prevOrder, key] : prevOrder
      const removedKeys = baseOrder.slice(anchorIndex + 1)
      if (removedKeys.length) clearSelections(removedKeys)
      setSelectionOrder(baseOrder.slice(0, anchorIndex + 1))
    } else {
      const removedKeys = prevIndex === -1 ? [] : prevOrder.slice(prevIndex)
      if (removedKeys.length) clearSelections(removedKeys)
      setSelectionOrder(prevOrder.slice(0, anchorIndex))
    }

    setSelectedByKey(key, nextValue)
    setCurrentPage(1)
  }

  useEffect(() => {
    if (skipUrlApplyRef.current) {
      skipUrlApplyRef.current = false
      return
    }
    const entries = Array.from(searchParams.entries())
    const segments = pathname.split("/").filter(Boolean)
    const carFromPath = segments[2] ? decodeURIComponent(segments[2]) : ""
    const trackFromPath = segments[3] ? decodeURIComponent(segments[3]) : ""
    if (!entries.length && !carFromPath && !trackFromPath) {
      hasUrlParamsRef.current = false
      fixedRankingActiveRef.current = false
      fixedSelectedRef.current = new Set()
      urlAppliedRef.current = true
      return
    }

    const desiredByKey: Partial<Record<FilterKey, string>> = {}
    const order: FilterKey[] = []
    if (carFromPath) {
      desiredByKey.car = carFromPath
      order.push("car")
    }
    if (trackFromPath) {
      desiredByKey.track = trackFromPath
      if (!order.includes("track")) order.push("track")
    }
    entries.forEach(([key, value]) => {
      const normalized = key.toLowerCase()
      const mapKey =
        normalized === "class"
          ? "class"
          : normalized === "car"
            ? "car"
            : normalized === "track"
              ? "track"
              : normalized === "season"
                ? "season"
                : normalized === "week"
                  ? "week"
                  : normalized === "variation"
                    ? "variation"
                    : normalized === "series"
                      ? "series"
                      : normalized === "year"
                        ? "year"
                        : normalized === "version"
                          ? "version"
                          : null
      if (!mapKey) return
      if (isAccOrLmu && !FIXED_ORDER_ACC_LMU.includes(mapKey)) return
      if (!isAccOrLmu && mapKey === "version") return
      desiredByKey[mapKey] = value
      if (!order.includes(mapKey)) order.push(mapKey)
    })

    if (!order.length) {
      hasUrlParamsRef.current = false
      urlAppliedRef.current = true
      return
    }

    const sortedOrder = [...order].sort(
      (a, b) => FIXED_ORDER.indexOf(a) - FIXED_ORDER.indexOf(b)
    )

    hasUrlParamsRef.current = true
    fixedRankingActiveRef.current = true
    urlSelectedNamesRef.current = desiredByKey

    const resolvedOrder: FilterKey[] = []
    sortedOrder.forEach((key) => {
      const value = desiredByKey[key]
      if (!value) return
      
      // For variation, the URL contains the ID directly
      if (key === "variation") {
        const variationId = value
        const variationName = getVariationNameById(variationId)
        // If name not found in cache, it will be updated when cascading filter loads
        const displayName = variationName || `Variation ${variationId}`
        setSelectedByKey(key, variationId)
        setOptionsByKey(key, [{ id: parseInt(variationId, 10), name: displayName }])
        resolvedOrder.push(key)
        return
      }
      
      const id = getStoredIdByName(key, value)
      if (!id) return
      setSelectedByKey(key, id)
      setOptionsByKey(key, [{ id: parseInt(id, 10), name: value }])
      resolvedOrder.push(key)
    })

    if (resolvedOrder.length) {
      const fixedSelected = new Set(resolvedOrder)
      fixedSelectedRef.current = fixedSelected
      applyFixedRanking(fixedSelected, [])
      lockedKeysRef.current = new Set(resolvedOrder)
    }
    urlAppliedRef.current = true
  }, [searchParams, pathname])

  useEffect(() => {
    if (categoryId == null) return
    if (hasUrlParamsRef.current && !urlAppliedRef.current) return
    if (skipNextFetchRef.current) {
      skipNextFetchRef.current = false
      return
    }
    let cancelled = false
    setFiltersLoading(true)
    const body: Record<string, number> = { category_id: categoryId }
    const anchorIndex = requestAnchorIndexRef.current
    const limitIndex = anchorIndex == null ? selectionOrder.length - 1 : anchorIndex
    const orderedKeys = selectionOrder
      .filter((k) => FIXED_ORDER.includes(k))
      .slice(0, Math.max(0, limitIndex + 1))
    const addIfSelected = (value: string, field: string) => {
      if (value) body[field] = parseInt(value, 10)
    }
    orderedKeys.forEach((key) => {
      switch (key) {
        case "class":
          addIfSelected(selectedClass, "class_id")
          break
        case "car":
          addIfSelected(selectedCar, "car_id")
          break
        case "track":
          addIfSelected(selectedTrack, "track_id")
          break
        case "season":
          addIfSelected(selectedSeason, "season_id")
          break
        case "week":
          addIfSelected(selectedWeek, "week")
          break
        case "variation":
          addIfSelected(selectedTrackVariation, "variation_id")
          break
        case "series":
          addIfSelected(selectedSeries, "series_id")
          break
        case "year":
          addIfSelected(selectedYear, "year")
          break
        case "version":
          addIfSelected(selectedVersion, "version_id")
          break
      }
    })

    const syncSelection = (
      key: FilterKey,
      options: FilterOption[],
      selected: string,
      setSelected: (value: string) => void
    ) => {
      if (lockedKeysRef.current.has(key) && selected) {
        const match = options.find((opt) => String(opt.id) === selected)
        if (match) {
          setOptionsByKey(key, [match])
          return
        }
        const fallbackName = urlSelectedNamesRef.current[key]
        if (fallbackName) {
          setOptionsByKey(key, [{ id: parseInt(selected, 10), name: fallbackName }])
          return
        }
      }
      if (options.length === 1) {
        const only = String(options[0].id)
        if (selected !== only) {
          skipNextFetchRef.current = true
          setSelected(only)
          updateOrderForAuto(key, only)
        }
        return
      }
      if (selected && !options.some((opt) => String(opt.id) === selected)) {
        skipNextFetchRef.current = true
        setSelected("")
        updateOrderForAuto(key, "")
      }
    }

    fetch(apiUrl("/api/v1/products/cascading-filters"), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    })
      .then(async (res) => {
        const json = await res.json()
        return { res, json }
      })
      .then(({ res, json }) => {
        if (cancelled) return
        const ok = res.ok && (json.success === true || json.status === true)
        const data = (json.data ?? json) as Record<string, unknown>
        if (ok) {
          if ("classes" in data || "class" in data) {
            const next = normalizeFilterOptions(data.classes ?? data.class)
            if (!lockedKeysRef.current.has("class")) setClasses(next)
            storeOptionsByName("class", next)
            syncSelection("class", next, selectedClass, setSelectedClass)
          }
          if ("cars" in data || "car" in data) {
            const next = normalizeFilterOptions(data.cars ?? data.car)
            if (!lockedKeysRef.current.has("car")) setCars(next)
            storeOptionsByName("car", next)
            syncSelection("car", next, selectedCar, setSelectedCar)
          }
          if ("tracks" in data || "track" in data) {
            const next = normalizeFilterOptions(data.tracks ?? data.track)
            if (!lockedKeysRef.current.has("track")) setTracks(next)
            storeOptionsByName("track", next)
            syncSelection("track", next, selectedTrack, setSelectedTrack)
          }
          if (!isAccOrLmu) {
            if ("seasons" in data || "season" in data) {
              const next = normalizeFilterOptions(data.seasons ?? data.season)
              if (!lockedKeysRef.current.has("season")) setSeasons(next)
              storeOptionsByName("season", next)
              syncSelection("season", next, selectedSeason, setSelectedSeason)
            }
            if ("weeks" in data || "week" in data) {
              const next = normalizeWeeks(data.weeks ?? data.week)
              if (!lockedKeysRef.current.has("week")) setWeeks(next)
              storeOptionsByName("week", next)
              syncSelection("week", next, selectedWeek, setSelectedWeek)
            }
            if ("variations" in data || "track_variations" in data || "track_variation" in data) {
              const next = normalizeFilterOptions(data.variations ?? data.track_variations ?? data.track_variation)
              // Always update track variations to get proper names (even when locked from URL)
              // The selection is maintained via syncSelection
              setTrackVariations(next)
              storeOptionsByName("variation", next)
              storeVariationById(next)
              syncSelection("variation", next, selectedTrackVariation, setSelectedTrackVariation)
            }
            if ("serieses" in data || "series" in data) {
              const next = normalizeFilterOptions(data.serieses ?? data.series)
              if (!lockedKeysRef.current.has("series")) setSeries(next)
              storeOptionsByName("series", next)
              syncSelection("series", next, selectedSeries, setSelectedSeries)
            }
            if ("years" in data || "year" in data) {
              const next = normalizeYears(data.years ?? data.year)
              if (!lockedKeysRef.current.has("year")) setYears(next)
              storeOptionsByName("year", next)
              syncSelection("year", next, selectedYear, setSelectedYear)
            }
          }
          if (isAccOrLmu && ("versions" in data || "version" in data)) {
            const next = normalizeFilterOptions(data.versions ?? data.version)
            if (!lockedKeysRef.current.has("version")) setVersions(next)
            storeOptionsByName("version", next)
            syncSelection("version", next, selectedVersion, setSelectedVersion)
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          setClasses([])
          setCars([])
          setTracks([])
          setSeasons([])
          setWeeks([])
          setTrackVariations([])
          setSeries([])
          setYears([])
          setVersions([])
        }
      })
      .finally(() => {
        if (!cancelled) setFiltersLoading(false)
      })
    return () => { cancelled = true }
  }, [
    categoryId,
    selectedClass,
    selectedCar,
    selectedTrack,
    selectedSeason,
    selectedWeek,
    selectedTrackVariation,
    selectedSeries,
    selectedYear,
    selectedVersion,
  ])

  const parseLapTimeMs = (setup: Record<string, unknown>) => {
    const ms = setup.lap_time_ms
    if (typeof ms === "number") return ms
    const str = getDisplayValue(setup.lap_time ?? setup.lapTime)
    if (!str || str === "-") return Infinity
    const m1 = str.match(/^(\d+):(\d+)\.(\d+)$/)
    if (m1) return parseInt(m1[1], 10) * 60000 + parseInt(m1[2], 10) * 1000 + parseInt(m1[3], 10)
    const m2 = str.match(/^(\d+):(\d+)$/)
    if (m2) return parseInt(m2[1], 10) * 60000 + parseInt(m2[2], 10) * 1000
    return Infinity
  }

  const displaySetups = hasSearched
    ? [...searchResults].sort((a, b) => parseLapTimeMs(a as Record<string, unknown>) - parseLapTimeMs(b as Record<string, unknown>))
    : []
  const totalItems = displaySetups.length
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE))
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedSetups = displaySetups.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  useEffect(() => {
    if (!hasSearched || searchResults.length === 0) {
      setSelectedSetup(null)
      return
    }
    const sorted = [...searchResults].sort(
      (a, b) => parseLapTimeMs(a as Record<string, unknown>) - parseLapTimeMs(b as Record<string, unknown>)
    )
    setSelectedSetup(sorted[0] as Record<string, unknown>)
  }, [hasSearched, searchResults])

  const clearFilters = () => {
    setSelectedClass("")
    setSelectedCar("")
    setSelectedTrack("")
    setSelectedSeason("")
    setSelectedWeek("")
    setSelectedTrackVariation("")
    setSelectedSeries("")
    setSelectedYear("")
    setSelectedVersion("")
    setSelectionOrder([])
    setExtraSelectionOrder([])
    requestAnchorIndexRef.current = null
    hasUrlParamsRef.current = false
    fixedRankingActiveRef.current = false
    fixedSelectedRef.current = new Set()
    lockedKeysRef.current = new Set()
    setCurrentPage(1)
  }

  const getSelectedName = (options: FilterOption[], selected: string) => {
    if (!selected) return ""
    return options.find((opt) => String(opt.id) === selected)?.name ?? selected
  }

  const buildSearchBody = () => {
    const body: Record<string, number> = { category_id: categoryId }
    const orderedKeys = selectionOrder.filter((k) => FIXED_ORDER.includes(k))
    const addIfSelected = (value: string, field: string) => {
      if (value) body[field] = parseInt(value, 10)
    }
    orderedKeys.forEach((key) => {
      switch (key) {
        case "class":
          addIfSelected(selectedClass, "class_id")
          break
        case "car":
          addIfSelected(selectedCar, "car_id")
          break
        case "track":
          addIfSelected(selectedTrack, "track_id")
          break
        case "season":
          addIfSelected(selectedSeason, "season_id")
          break
        case "week":
          addIfSelected(selectedWeek, "week")
          break
        case "variation":
          addIfSelected(selectedTrackVariation, "variation_id")
          break
        case "series":
          addIfSelected(selectedSeries, "series_id")
          break
        case "year":
          addIfSelected(selectedYear, "year")
          break
        case "version":
          addIfSelected(selectedVersion, "version_id")
          break
      }
    })
    return body
  }

  const buildSearchQuery = () => {
    const params = new URLSearchParams()
    if (selectedClass) params.set("class", getSelectedName(classes, selectedClass))
    if (!isAccOrLmu) {
      if (selectedSeason) params.set("season", getSelectedName(seasons, selectedSeason))
      if (selectedWeek) params.set("week", getSelectedName(weeks, selectedWeek))
      if (selectedTrackVariation) {
        // Use ID for variation instead of name
        params.set("variation", selectedTrackVariation)
      }
      if (selectedSeries) params.set("series", getSelectedName(series, selectedSeries))
      if (selectedYear) params.set("year", getSelectedName(years, selectedYear))
    }
    if (isAccOrLmu && selectedVersion) {
      params.set("version", getSelectedName(versions, selectedVersion))
    }
    if (!selectedCar && selectedTrack) {
      params.set("track", getSelectedName(tracks, selectedTrack))
    }
    return params
  }

  const buildSearchPath = () => {
    const segments = pathname.split("/").filter(Boolean)
    const basePath =
      segments[0] === "setups" && segments[1] ? `/setups/${segments[1]}` : pathname
    if (selectedCar) {
      const carName = getSelectedName(cars, selectedCar)
      const carSlug = slugify(carName)
      if (selectedTrack) {
        const trackName = getSelectedName(tracks, selectedTrack)
        const trackSlug = slugify(trackName)
        return `${basePath}/${carSlug}/${trackSlug}`
      }
      return `${basePath}/${carSlug}`
    }
    return basePath
  }

  const executeSearch = async (updateUrl: boolean) => {
    if (updateUrl) {
      const params = buildSearchQuery()
      const queryString = params.toString()
      const nextPath = buildSearchPath()
      skipUrlApplyRef.current = true
      const nextUrl = queryString ? `${nextPath}?${queryString}` : nextPath
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", nextUrl)
      } else {
        router.replace(nextUrl)
      }
    }

    setHasSearched(true)
    setSearchLoading(true)
    try {
      const res = await fetch(apiUrl("/api/v1/products/search"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(buildSearchBody()),
      })
      const json = await res.json()
      const ok = res.ok && (json.success === true || json.status === true)
      const data = (json.data ?? json) as unknown
      setSearchResults(ok && Array.isArray(data) ? data : [])
      setCurrentPage(1)
    } catch {
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  const handleSearch = async () => {
    didUrlSearchRef.current = true
    await executeSearch(true)
  }

  useEffect(() => {
    if (!hasUrlParamsRef.current || !urlAppliedRef.current) return
    if (didUrlSearchRef.current || hasSearched) return
    if (selectionOrder.length === 0) return
    didUrlSearchRef.current = true
    void executeSearch(false)
  }, [
    selectionOrder,
    selectedClass,
    selectedCar,
    selectedTrack,
    selectedSeason,
    selectedWeek,
    selectedTrackVariation,
    selectedSeries,
    selectedYear,
    selectedVersion,
  ])

  const getDisplayValue = (value: unknown, fallback = "-") => {
    if (typeof value === "string" || typeof value === "number") return String(value)
    if (value && typeof value === "object") {
      const v = value as Record<string, unknown>
      const label = [v.name, v.title, v.label, v.slug].find(
        (item) => typeof item === "string" || typeof item === "number"
      )
      if (label != null) return String(label)
    }
    return fallback
  }

  const getSetupField = (setup: Record<string, unknown>, key: string, fallback = "-") => {
    if (key in setup) return getDisplayValue(setup[key], fallback)
    return fallback
  }

  return (
    <main className="min-h-screen bg-[#151515] pt-24 pb-16">
      {/* <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_5%,rgba(228,0,188,0.12)_0%,rgba(31,19,41,0.2)_30%,rgba(21,21,21,0)_100%)]" /> */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category Image */}
        {categoryImageUrl && (
          <div className="flex justify-center items-center mb-12">
            <img
              src={categoryImageUrl}
              alt={categorySlug || "Category"}
              className="max-h-24 w-auto object-contain"
            />
            {categoryName && (
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white ml-6">
                {categoryName}
              </h1>
            )}
          </div>
        )}

        {/* Filter Bar */}
        <div className="min-h-[90px] mb-6">
        <div className="flex flex-wrap items-center gap-3 mb-4 justify-center">
          <Select value={selectedClass} onValueChange={(v) => handleUserChange("class", v)} disabled={filtersLoading}>
            <SelectTrigger className="w-[120px] sm:w-[140px] bg-[#1e1e1e] border-[#333] text-white h-11">
              <SelectValue placeholder={filtersLoading ? "Loading..." : "Classes"} />
            </SelectTrigger>
            <SelectContent className="bg-[#1e1e1e] border-[#333] rounded-xl">
              <SelectItem value="__clear__" className="text-white/70 focus:bg-primary/20 focus:text-white">
                Classes
              </SelectItem>
              {classes.map((opt) => (
                <SelectItem key={opt.id} value={String(opt.id)} className="text-white focus:bg-primary/20 focus:text-white">
                  {opt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedCar} onValueChange={(v) => handleUserChange("car", v)} disabled={filtersLoading}>
            <SelectTrigger className="w-[120px] sm:w-[140px] bg-[#1e1e1e] border-[#333] text-white h-11">
              <SelectValue placeholder={filtersLoading ? "Loading..." : "Cars"} />
            </SelectTrigger>
            <SelectContent className="bg-[#1e1e1e] border-[#333] rounded-xl">
              <SelectItem value="__clear__" className="text-white/70 focus:bg-primary/20 focus:text-white">
                Cars
              </SelectItem>
              {cars.map((opt) => (
                <SelectItem key={opt.id} value={String(opt.id)} className="text-white focus:bg-primary/20 focus:text-white">
                  {opt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedTrack} onValueChange={(v) => handleUserChange("track", v)} disabled={filtersLoading}>
            <SelectTrigger className="w-[120px] sm:w-[140px] bg-[#1e1e1e] border-[#333] text-white h-11">
              <SelectValue placeholder={filtersLoading ? "Loading..." : "Tracks"} />
            </SelectTrigger>
            <SelectContent className="bg-[#1e1e1e] border-[#333] rounded-xl">
              <SelectItem value="__clear__" className="text-white/70 focus:bg-primary/20 focus:text-white">
                Tracks
              </SelectItem>
              {tracks.map((opt) => (
                <SelectItem key={opt.id} value={String(opt.id)} className="text-white focus:bg-primary/20 focus:text-white">
                  {opt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!isAccOrLmu && (
          <Select value={selectedSeason} onValueChange={(v) => handleUserChange("season", v)} disabled={filtersLoading}>
            <SelectTrigger className="w-[120px] sm:w-[140px] bg-[#1e1e1e] border-[#333] text-white h-11">
              <SelectValue placeholder={filtersLoading ? "Loading..." : "Season"} />
            </SelectTrigger>
            <SelectContent className="bg-[#1e1e1e] border-[#333] rounded-xl">
              <SelectItem value="__clear__" className="text-white/70 focus:bg-primary/20 focus:text-white">
                Season
              </SelectItem>
              {seasons.map((opt) => (
                <SelectItem key={opt.id} value={String(opt.id)} className="text-white focus:bg-primary/20 focus:text-white">
                  {opt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          )}
          {!isAccOrLmu && (
          <Select value={selectedWeek} onValueChange={(v) => handleUserChange("week", v)} disabled={filtersLoading}>
            <SelectTrigger className="w-[120px] sm:w-[140px] bg-[#1e1e1e] border-[#333] text-white h-11">
              <SelectValue placeholder={filtersLoading ? "Loading..." : "Week"} />
            </SelectTrigger>
            <SelectContent className="bg-[#1e1e1e] border-[#333] rounded-xl">
              <SelectItem value="__clear__" className="text-white/70 focus:bg-primary/20 focus:text-white">
                Week
              </SelectItem>
              {weeks.map((opt) => (
                <SelectItem key={opt.id} value={String(opt.id)} className="text-white focus:bg-primary/20 focus:text-white">
                  {opt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          )}
          <Button
            type="button"
            className="bg-brand-gradient hover:opacity-90 text-white border-0 px-6 font-medium"
            onClick={handleSearch}
            disabled={filtersLoading || searchLoading}
          >
            {searchLoading ? "Searching..." : "Find Setup"}
          </Button>
          <Button
            type="button"
            onClick={clearFilters}
            className="px-6 bg-[#0d0d0d] border border-white/20 text-white font-medium hover:bg-[#1a1a1a] transition-colors"
            aria-label="Clear all filters"
          >
            Clear All
          </Button>
          <Button
            type="button"
            onClick={() => setShowMoreFilters(!showMoreFilters)}
            className="px-5 bg-[#0d0d0d] border border-white/20 text-white font-medium hover:bg-[#1a1a1a] transition-colors flex items-center gap-2"
            aria-label="Show more filter options"
            aria-expanded={showMoreFilters}
          >
            <Filter className="h-4 w-4" />
            <span>MORE FILTERS</span>
          </Button>
        </div>

        {/* More selection fields - shown when filter button is active */}
      {showMoreFilters && (
        <div className="flex flex-wrap items-center gap-3 justify-center">
          {!isAccOrLmu && (
            <>
              <Select value={selectedTrackVariation} onValueChange={(v) => handleUserChange("variation", v)} disabled={filtersLoading}>
                <SelectTrigger className="w-[140px] sm:w-[160px] bg-[#1e1e1e] border-[#333] text-white h-11">
                  <SelectValue placeholder="Track Variation" />
                </SelectTrigger>
                <SelectContent className="bg-[#1e1e1e] border-[#333] rounded-xl">
                  <SelectItem value="__clear__" className="text-white/70 focus:bg-primary/20 focus:text-white">
                    Track Variation
                  </SelectItem>
                  {trackVariations.map((opt) => (
                    <SelectItem key={opt.id} value={String(opt.id)} className="text-white focus:bg-primary/20 focus:text-white">
                      {opt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedSeries} onValueChange={(v) => handleUserChange("series", v)} disabled={filtersLoading}>
                <SelectTrigger className="w-[120px] sm:w-[140px] bg-[#1e1e1e] border-[#333] text-white h-11">
                  <SelectValue placeholder="Series" />
                </SelectTrigger>
                <SelectContent className="bg-[#1e1e1e] border-[#333] rounded-xl">
                  <SelectItem value="__clear__" className="text-white/70 focus:bg-primary/20 focus:text-white">
                    Series
                  </SelectItem>
                  {series.map((opt) => (
                    <SelectItem key={opt.id} value={String(opt.id)} className="text-white focus:bg-primary/20 focus:text-white">
                      {opt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={(v) => handleUserChange("year", v)} disabled={filtersLoading}>
                <SelectTrigger className="w-[100px] sm:w-[120px] bg-[#1e1e1e] border-[#333] text-white h-11">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent className="bg-[#1e1e1e] border-[#333] rounded-xl">
                  <SelectItem value="__clear__" className="text-white/70 focus:bg-primary/20 focus:text-white">
                    Year
                  </SelectItem>
                  {years.map((opt) => (
                    <SelectItem key={opt.id} value={String(opt.id)} className="text-white focus:bg-primary/20 focus:text-white">
                      {opt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
          {isAccOrLmu && (
            <Select value={selectedVersion} onValueChange={(v) => handleUserChange("version", v)} disabled={filtersLoading}>
              <SelectTrigger className="w-[120px] sm:w-[140px] bg-[#1e1e1e] border-[#333] text-white h-11">
                <SelectValue placeholder="Version" />
              </SelectTrigger>
              <SelectContent className="bg-[#1e1e1e] border-[#333] rounded-xl">
                <SelectItem value="__clear__" className="text-white/70 focus:bg-primary/20 focus:text-white">
                  Version
                </SelectItem>
                {versions.map((opt) => (
                  <SelectItem key={opt.id} value={String(opt.id)} className="text-white focus:bg-primary/20 focus:text-white">
                    {opt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}
      </div>

      <div className="flex justify-center items-center py-16">
        <img
          src="/images/setup.png"
          alt="Setup"
          className="max-w-full h-auto object-contain"
        />
      </div>

        
          {/* Results Header + Pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-3xl font-display text-white">
            Find your setup
          </h2>
        </div>
        <div className="flex items-center justify-end gap-1">
        <span className="text-sm text-white/60 mr-4">
          {totalItems} AVAILABLE
        </span>
        <button
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-md bg-[#1a1a1a] border border-white/10 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
          aria-label="First page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="p-2 rounded-md bg-[#1a1a1a] border border-white/10 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-1 px-2">
          {Array.from({ length: Math.min(6, totalPages) }, (_, i) => {
            let pageNum: number
            if (totalPages <= 6) {
              pageNum = i + 1
            } else if (currentPage <= 3) {
              pageNum = i + 1
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 5 + i
            } else {
              pageNum = currentPage - 2 + i
            }
            const isActive = pageNum === currentPage
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={cn(
                  "min-w-[32px] h-8 rounded-full text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-white"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                {pageNum}
              </button>
            )
          })}
          {totalPages > 6 && (
            <>
              <span className="text-white/50 px-1">...</span>
              <button
                onClick={() => setCurrentPage(totalPages)}
                className={cn(
                  "min-w-[32px] h-8 rounded-full text-sm font-medium text-white/80 hover:text-white",
                  currentPage === totalPages && "bg-primary text-white"
                )}
              >
                {totalPages}
              </button>
            </>
          )}
        </div>
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md bg-[#1a1a1a] border border-white/10 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md bg-[#1a1a1a] border border-white/10 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
          aria-label="Last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
        </div>
      </div>

          {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#2a2a2a] bg-[#18171c]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2a2a2a] bg-[#131313]">
              <th className="text-left py-4 px-4 text-xs font-semibold uppercase tracking-wider text-primary w-12">
                #
              </th>
              <th className="text-left py-4 px-4 text-xs font-semibold uppercase tracking-wider text-primary">
                Game
              </th>
              <th className="text-left py-4 px-4 text-xs font-semibold uppercase tracking-wider text-primary">
                Car
              </th>
              <th className="text-left py-4 px-4 text-xs font-semibold uppercase tracking-wider text-primary">
                Track
              </th>
              {!isAccOrLmu && (
                <>
                  <th className="text-left py-4 px-4 text-xs font-semibold uppercase tracking-wider text-primary">
                    Season
                  </th>
                  <th className="text-left py-4 px-4 text-xs font-semibold uppercase tracking-wider text-primary">
                    Series
                  </th>
                </>
              )}
              {isAccOrLmu && (
                <th className="text-left py-4 px-4 text-xs font-semibold uppercase tracking-wider text-primary">
                  Version
                </th>
              )}
              <th className="text-left py-4 px-4 text-xs font-semibold uppercase tracking-wider text-primary">
                Lap Time
              </th>
              <th className="text-left py-4 px-4 text-xs font-semibold uppercase tracking-wider text-primary">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedSetups.length === 0 ? (
              <tr>
                <td colSpan={isAccOrLmu ? 7 : 8} className="py-16 text-center">
                  <div className="text-white text-lg font-medium mb-2">No setups found</div>
                  <div className="text-white/60 text-sm">Try adjusting your filters</div>
                </td>
              </tr>
            ) : (
              paginatedSetups.map((setup, index) => {
                const isSmallest = displaySetups[0] && (setup as { id?: number }).id === (displaySetups[0] as { id?: number }).id
                const isSelected = (selectedSetup as { id?: number })?.id === (setup as { id?: number }).id
                const rowNumber = (currentPage - 1) * ITEMS_PER_PAGE + index + 1
                return (
                <tr
                  key={(setup as { id?: number }).id ?? index}
                  onClick={() => setSelectedSetup(setup as Record<string, unknown>)}
                  className={cn(
                    "border-t border-[#2a2a2a] cursor-pointer",
                    isSmallest && "bg-primary/30",
                    isSelected && "ring-2 ring-primary"
                  )}
                >
                  <td className="py-4 px-4 text-white/60 text-sm">
                    {rowNumber}
                  </td>
                  <td className="py-4 px-4 text-white text-sm">
                    {getDisplayValue(
                      (setup as Record<string, unknown>).category ??
                        (setup as Record<string, unknown>).game,
                      "iRacing"
                    )}
                  </td>
                  <td className="py-4 px-4 text-white text-sm">
                    {getSetupField(setup as Record<string, unknown>, "car")}
                  </td>
                  <td className="py-4 px-4 text-white text-sm">
                    {getSetupField(setup as Record<string, unknown>, "track")}
                  </td>
                  {!isAccOrLmu && (
                    <>
                      <td className="py-4 px-4 text-white text-sm">
                        {getSetupField(setup as Record<string, unknown>, "season")}
                      </td>
                      <td className="py-4 px-4 text-white text-sm">
                        {getSetupField(setup as Record<string, unknown>, "series")}
                      </td>
                    </>
                  )}
                  {isAccOrLmu && (
                    <td className="py-4 px-4 text-white text-sm">
                      {getSetupField(setup as Record<string, unknown>, "version")}
                    </td>
                  )}
                  <td className="py-4 px-4 text-white text-sm font-mono font-digital">
                    {getDisplayValue(
                      (setup as Record<string, unknown>).lap_time ??
                        (setup as Record<string, unknown>).lapTime
                    )}
                  </td>
                  <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                    <Button 
                      size="sm" 
                      className="px-3 py-1.5 h-auto cursor-pointer transition-all duration-200 hover:scale-105 shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)]" 
                      aria-label="Download setup"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              )})
            )}
          </tbody>
        </table>
      </div>

      {/* Setup Details - shown for selected row (default: smallest lap time) */}
        {/* About This Setup Pack */}
        <div className="mt-20">
          <h3 className="text-4xl font-display text-white text-center mb-2">About This Setup Pack</h3>
          <div className="flex justify-center mb-8">
            <div className="w-16 h-1 bg-primary rounded-full" />
          </div>
          
          <div className="rounded-2xl border border-[#2a2a2a] bg-[#16151a] p-8">
            <div className="space-y-6 text-white/80 text-[18px] leading-relaxed">
              <p>
                Experience the ultimate in-game performance with professional car setups developed by elite E-Sports drivers.
              </p>
              <p>
                This setup pack is specifically engineered for <span className="font-bold text-white">{getDisplayValue(selectedSetup?.category, "iRacing")}</span>, optimised for the <span className="font-bold text-white">{getDisplayValue(selectedSetup?.car, "your car")}</span> at <span className="font-bold text-white">{getDisplayValue(selectedSetup?.track, "the track")}</span> combination to deliver maximum performance in competitive conditions.
              </p>
              <p>
                The package includes <span className="font-bold text-white">Consistent</span>, <span className="font-bold text-white">E-Sports</span>, and <span className="font-bold text-white">Wet</span> setup variants, fully optimised for both Qualifying and Race sessions. Consistent setups focus on stability, control, and long-run confidence, E-Sports setups are designed to extract ultimate lap time, while Wet setups are tuned to provide maximum grip, predictability, and confidence in low-traction conditions.
              </p>
              <p>
                Whether you are racing in official events or pushing for personal bests, these professionally developed setups help you achieve faster lap times, improved tyre management, and greater overall race consistency across all conditions.
              </p>
            </div>
          </div>
        </div>
        
        {/* Weather Conditions */}
        <div className="mt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {(() => {
              const w = (selectedSetup?.weather as Record<string, unknown>) ?? {}
              const temp = typeof w.temp === "number" ? w.temp : (typeof w.air_temp === "number" ? w.air_temp : "-")
              const hume = typeof w.hume === "number" ? w.hume : "-"
              const mph = typeof w.mph === "number" ? w.mph : "-"
              const trac = typeof w.trac === "number" ? w.trac : (typeof w.trac_temp === "number" ? w.trac_temp : "-")
              const sky = (typeof w.weather === "string" ? w.weather : (typeof w.sky === "string" ? w.sky : "-"))
              const wdatetime = typeof w.wdatetime === "string" ? w.wdatetime : null
              let timeStr = "-"
              let dateStr = "-"
              if (wdatetime) {
                const [datePart, timePart] = wdatetime.split(" ")
                // e.g. "17:55"
                if (timePart) {
                  let [hour, minute] = timePart.split(":")
                  if (hour && minute) {
                    timeStr = `${hour}:${minute}pm`
                  } else {
                    timeStr = "-"
                  }
                }
                dateStr = datePart ? new Date(datePart).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "-"
              }

              // Helper for bolding numerical values and different font styles
              const valueClass = "text-white text-2xl"
              const labelClass = "text-[10px] text-white/80 uppercase tracking-wider"
              const cardClass =
                "rounded-xl bg-[#140e15] border border-[#232027] shadow-[0_1px_8px_rgba(0,0,0,0.18)] py-8 px-5 flex flex-col justify-between min-h-[92px]"

              return (
                <>
                  {/* Air Temp */}
                  <div className={cardClass}>
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-6 w-6 text-amber-300" />
                      <span className={labelClass}>Air Temp</span>
                    </div>
                    <div className={valueClass}>
                      {temp !== "-" ? `${temp}°F` : "-"}
                    </div>
                  </div>
                  {/* Humidity */}
                  <div className={cardClass}>
                    <div className="flex items-center gap-2">
                      <Droplets className="h-6 w-6 text-sky-300" />
                      <span className={labelClass}>Humidity</span>
                    </div>
                    <div className={valueClass}>
                      {hume !== "-" ? `${hume}% RH` : "-"}
                    </div>
                  </div>
                  {/* Wind */}
                  <div className={cardClass}>
                    <div className="flex items-center gap-2">
                      <Wind className="h-6 w-6 text-emerald-300" />
                      <span className={labelClass}>Wind</span>
                    </div>
                    <div className={valueClass}>
                      {mph !== "-" ? (
                        <span>
                          <span className="text-primary">{mph}</span> MPH
                        </span>
                      ) : (
                        "-"
                      )}
                    </div>
                  </div>
                  {/* Track Temp */}
                  <div className={cardClass}>
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-6 w-6 text-pink-400" />
                      <span className={labelClass}>Track Temp</span>
                    </div>
                    <div className={valueClass}>
                      {trac !== "-" ? `${trac}°F` : "-"}
                    </div>
                  </div>
                  {/* Sky */}
                  <div className={cardClass}>
                    <div className="flex items-center gap-2">
                      <Cloud className="h-6 w-6 text-gray-100" />
                      <span className={labelClass}>Sky</span>
                    </div>
                    <div className={valueClass}>{String(sky)}</div>
                  </div>
                  {/* Time */}
                  <div className={cardClass}>
                    <div className="flex items-center gap-2">
                      <Clock className="h-6 w-6 text-yellow-400" />
                      <span className={labelClass}>Time</span>
                    </div>
                    <div className={`${valueClass} mb-0 leading-tight`}>{timeStr}</div>
                    {dateStr !== "-" && (
                      <div className="text-white/40 text-xs leading-tight mt-0">{dateStr}</div>
                    )}
                  </div>
                </>
              )
            })()}
          </div>
        </div>
        
        {/* Hotlap Video */}
        <div className="mt-16">
          <h3 className="text-4xl font-display text-white text-center mb-2">Hotlap</h3>
          <div className="flex justify-center mb-6">
            <div className="w-16 h-1 bg-primary rounded-full" />
          </div>
          
          <div className="rounded-2xl overflow-hidden border border-[#2a2a2a] bg-[#0d0d0d] relative aspect-video">
            <iframe
              width="100%"
              height="100%"
              className="absolute inset-0 w-full h-full"
              src={typeof selectedSetup?.video_url === "string" ? selectedSetup?.video_url : "https://www.youtube.com/embed/dQw4w9WgXcQ"}
              title={`${getDisplayValue(selectedSetup?.car, "Setup")} Hotlap Video`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
        
        {/* Track Guide Video */}
        {typeof selectedSetup?.track_guide_url === "string" && selectedSetup?.track_guide_url && (
        <div className="mt-8">
          <h3 className="text-3xl font-display italic text-white text-center mb-2">Track Guide</h3>
          <div className="flex justify-center mb-6">
            <div className="w-16 h-1 bg-primary rounded-full" />
          </div>
          
          <div className="rounded-2xl overflow-hidden border border-[#2a2a2a] border-b-4 border-b-primary bg-[#0d0d0d] relative aspect-video">
            <iframe
              width="100%"
              height="100%"
              className="absolute inset-0 w-full h-full"
              src={selectedSetup.track_guide_url}
              title={`${getDisplayValue(selectedSetup?.track, "Track")} Guide Video`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
        )}
    </div>
  </main>
)
}
