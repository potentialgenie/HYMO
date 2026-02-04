"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { apiUrl, IMAGE_BASE } from "@/lib/api"
import { apiFetch, isAuthenticated } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { Loader2, ArrowLeft } from "lucide-react"

type CategoryFromApi = { id: number; name: string; slug: string; description: string; image: string }

type PlanFromApi = {
  id: number
  name: string
  stripe_price_id: string
  price: string
  interval: "monthly" | "yearly" | "permanent"
  currency: string
  discount: number
  description: string | null
  currency_symbol: string
}

type ClassOption = { id: number; name: string }
type CarOption = { id: number; name: string; image?: string }

function normalizeClasses(raw: unknown): ClassOption[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null
      const o = item as Record<string, unknown>
      const id = typeof o.id === "number" ? o.id : typeof o.id === "string" ? parseInt(o.id, 10) : NaN
      const name = [o.name, o.label].find((x) => typeof x === "string") as string | undefined
      if (Number.isNaN(id) || !name) return null
      return { id, name }
    })
    .filter((x): x is ClassOption => x !== null)
}

function normalizeCars(raw: unknown): CarOption[] {
  if (!Array.isArray(raw)) return []
  const out: CarOption[] = []
  for (const item of raw) {
    if (!item || typeof item !== "object") continue
    const o = item as Record<string, unknown>
    const id = typeof o.id === "number" ? o.id : typeof o.id === "string" ? parseInt(o.id, 10) : NaN
    const name = [o.name, o.label].find((x) => typeof x === "string") as string | undefined
    const img = typeof o.image === "string" ? o.image : undefined
    if (Number.isNaN(id) || !name) continue
    out.push({ id, name, image: img })
  }
  return out
}

function carImageSrc(car: CarOption): string {
  if (!car.image) return "/images/cars/HYMO_Livery_GT3_LMU.png"
  if (car.image.startsWith("http")) return car.image
  const base = IMAGE_BASE.endsWith("/") ? IMAGE_BASE : `${IMAGE_BASE}/`
  return base + car.image.replace(/^\//, "")
}

export default function CarAccessPage() {
  const params = useParams()
  const router = useRouter()
  const planId = params?.plan_id as string | undefined

  const [plan, setPlan] = useState<PlanFromApi | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [games, setGames] = useState<CategoryFromApi[]>([])
  const [gamesLoading, setGamesLoading] = useState(true)
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [classesLoading, setClassesLoading] = useState(false)
  const [cars, setCars] = useState<CarOption[]>([])
  const [carsLoading, setCarsLoading] = useState(false)
  const [game, setGame] = useState<string>("")
  const [carClass, setCarClass] = useState<string>("")
  const [car, setCar] = useState<string>("")
  const [searchedCar, setSearchedCar] = useState<CarOption | null>(null)
  const [unlockLoading, setUnlockLoading] = useState(false)
  const [unlockError, setUnlockError] = useState<string | null>(null)

  const fetchPlan = useCallback(async () => {
    if (!planId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(apiUrl("/api/v1/plans"))
      const json = await res.json()
      if (!res.ok || !json.status || !Array.isArray(json.data)) {
        throw new Error(json.message || "Failed to load plans")
      }
      const match = (json.data as PlanFromApi[]).find(
        (p) => String(p.id) === String(planId) && p.interval === "permanent"
      )
      if (!match) {
        setError("Plan not found")
        setPlan(null)
      } else {
        setPlan(match)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load plan")
      setPlan(null)
    } finally {
      setLoading(false)
    }
  }, [planId])

  const fetchCategories = useCallback(async () => {
    setGamesLoading(true)
    try {
      const res = await fetch(apiUrl("/api/v1/products/categories"))
      const json = await res.json()
      const ok = res.ok && (json.success === true || json.status === true)
      const data = Array.isArray(json.data) ? json.data : []
      if (!ok || !data.length) throw new Error(json.message || "Failed to load games")
      setGames(data as CategoryFromApi[])
    } catch {
      setGames([])
    } finally {
      setGamesLoading(false)
    }
  }, [])

  const fetchCascading = useCallback(
    async (categoryId: number, classId?: number) => {
      const body: Record<string, number> = { category_id: categoryId }
      if (classId != null) body.class_id = classId

      if (classId == null) {
        setClassesLoading(true)
        setClasses([])
        setCars([])
      } else {
        setCarsLoading(true)
        setCars([])
      }

      try {
        const res = await fetch(apiUrl("/api/v1/products/car-cascading-filters"), {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(body),
        })
        const json = await res.json()
        const ok = res.ok && (json.success === true || json.status === true)
        const data = (json.data ?? json) as Record<string, unknown>
        const rawClasses = data.classes ?? data.class
        const rawCars = data.cars ?? data.car

        if (classId == null) {
          setClasses(ok ? normalizeClasses(rawClasses) : [])
          setCars([])
        } else {
          setCars(ok ? normalizeCars(rawCars) : [])
        }
      } catch {
        if (classId == null) setClasses([])
        else setCars([])
      } finally {
        if (classId == null) setClassesLoading(false)
        else setCarsLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!isAuthenticated()) {
      router.replace("/login")
      return
    }
  }, [router])

  useEffect(() => {
    if (!planId) {
      setLoading(false)
      setError("Invalid plan")
      return
    }
    if (typeof window !== "undefined" && !isAuthenticated()) return
    fetchPlan()
  }, [planId, fetchPlan])

  useEffect(() => {
    if (typeof window !== "undefined" && !isAuthenticated()) return
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    if (!game) {
      setClasses([])
      setCars([])
      setCarClass("")
      setCar("")
      setSearchedCar(null)
      return
    }
    setCarClass("")
    setCar("")
    setSearchedCar(null)
    const cid = parseInt(game, 10)
    if (Number.isNaN(cid)) return
    fetchCascading(cid)
  }, [game, fetchCascading])

  useEffect(() => {
    if (!game || !carClass) {
      setCars([])
      setCar("")
      setSearchedCar(null)
      return
    }
    setCar("")
    setSearchedCar(null)
    const cid = parseInt(game, 10)
    const clid = parseInt(carClass, 10)
    if (Number.isNaN(cid) || Number.isNaN(clid)) return
    fetchCascading(cid, clid)
  }, [game, carClass, fetchCascading])

  useEffect(() => {
    if (!car || !cars.some((c) => String(c.id) === car)) setCar("")
  }, [cars, car])

  useEffect(() => {
    setSearchedCar(null)
  }, [game, carClass, car])

  const handleSearch = () => {
    if (!game || !carClass || !car) return
    const found = cars.find((c) => String(c.id) === car) ?? null
    setSearchedCar(found)
  }

  const handleUnlock = async () => {
    if (!plan || !planId || !searchedCar || !game || !carClass) return
    setUnlockLoading(true)
    setUnlockError(null)
    try {
      const res = await apiFetch(apiUrl("/api/v1/checkout/create-session"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          plan_id: Number(planId),
          category_id: Number(game),
          class_id: Number(carClass),
          car_id: searchedCar.id,
        }),
      })
      const json = (await res.json().catch(() => ({}))) as {
        status?: boolean
        success?: boolean
        message?: string
        data?: { url?: string }
        url?: string
      }
      const ok = res.ok && (json.status === true || json.success === true)
      const url = json.data?.url ?? json.url
      if (ok && typeof url === "string" && url) {
        window.location.href = url
        return
      }
      setUnlockError(json.message ?? "Checkout failed")
    } catch (e) {
      setUnlockError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setUnlockLoading(false)
    }
  }

  const priceLabel = plan ? `${plan.currency_symbol}${plan.price}` : "—"

  if (!planId) {
    return (
      <div className="min-h-screen bg-[#151515]">
        <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-24">
          <p className="text-white/80">Invalid plan.</p>
          <Link href="/pricing" className="text-primary hover:underline mt-4 inline-block">
            Back to Pricing
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#151515]">

      <main className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-24">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Pricing
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white uppercase tracking-tight mb-2">
                Unlock Your Car Access
              </h1>
              <p className="text-white/70 text-sm sm:text-base">
                Choose your exact game and car to unlock permanent access.
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 rounded-xl border border-white/10 bg-[#242625] text-white/70">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                Loading…
              </div>
            ) : error || !plan ? (
              <div className="rounded-xl border border-white/10 bg-[#242625] p-6 sm:p-8">
                <p className="text-white/80 mb-4">{error || "Plan not found."}</p>
                <Link href="/pricing" className="text-primary hover:underline">
                  Back to Pricing
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-xl border border-white/10 bg-[#242625] p-6 sm:p-8 space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-white/90">
                      Game
                    </label>
                    <Select
                      value={game}
                      onValueChange={setGame}
                      disabled={gamesLoading || games.length === 0}
                    >
                      <SelectTrigger className="w-full h-11 bg-[#151515] border-white/10 text-white data-[placeholder]:text-white/50 disabled:opacity-50">
                        <SelectValue
                          placeholder={
                            gamesLoading
                              ? "Loading games…"
                              : games.length === 0
                                ? "No games available"
                                : "Select Game"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="bg-[#242625] border-white/10">
                        {games.map((g) => (
                          <SelectItem
                            key={g.id}
                            value={String(g.id)}
                            className="text-white focus:bg-white/10 focus:text-white"
                          >
                            {g.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-white/90">
                      Class
                    </label>
                    <Select
                      value={carClass}
                      onValueChange={setCarClass}
                      disabled={!game || classesLoading || classes.length === 0}
                    >
                      <SelectTrigger className="w-full h-11 bg-[#151515] border-white/10 text-white data-[placeholder]:text-white/50 disabled:opacity-50">
                        <SelectValue
                          placeholder={
                            !game
                              ? "Select Game first"
                              : classesLoading
                                ? "Loading…"
                                : classes.length === 0
                                  ? "No classes"
                                  : "Select Class"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="bg-[#242625] border-white/10">
                        {classes.map((c) => (
                          <SelectItem
                            key={c.id}
                            value={String(c.id)}
                            className="text-white focus:bg-white/10 focus:text-white"
                          >
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-white/90">
                      Car
                    </label>
                    <Select
                      value={car}
                      onValueChange={setCar}
                      disabled={!game || !carClass || carsLoading || cars.length === 0}
                    >
                      <SelectTrigger className="w-full h-11 bg-[#151515] border-white/10 text-white data-[placeholder]:text-white/50 disabled:opacity-50">
                        <SelectValue
                          placeholder={
                            !carClass
                              ? "Select Class first"
                              : carsLoading
                                ? "Loading…"
                                : cars.length === 0
                                  ? "No cars"
                                  : "Select Car"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="bg-[#242625] border-white/10">
                        {cars.map((c) => (
                          <SelectItem
                            key={c.id}
                            value={String(c.id)}
                            className="text-white focus:bg-white/10 focus:text-white"
                          >
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleSearch}
                    disabled={!game || !carClass || !car || carsLoading}
                    className={cn(
                      "w-full h-12 rounded-md text-sm font-semibold uppercase tracking-wide bg-brand-gradient text-white hover:brightness-110",
                      "disabled:opacity-50 disabled:pointer-events-none"
                    )}
                  >
                    Search
                  </Button>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#242625] p-6 sm:p-8 flex flex-col">
                  <p className="text-white font-semibold text-lg mb-4">
                    Car Access (Permanent): {priceLabel}
                  </p>
                  {searchedCar ? (
                    <>
                      <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-[#151515] mb-4">
                        <Image
                          src={carImageSrc(searchedCar)}
                          alt={searchedCar.name}
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                      <p className="text-white/70 text-sm mb-6 flex-1">
                        Unlock lifetime access to all setups for this car, including future updates.
                      </p>
                      {unlockError && (
                        <p className="text-red-400 text-sm mb-4">{unlockError}</p>
                      )}
                      <Button
                        onClick={handleUnlock}
                        disabled={unlockLoading}
                        className={cn(
                          "w-full h-12 rounded-md text-sm font-semibold uppercase tracking-wide bg-brand-gradient text-white hover:brightness-110",
                          "disabled:opacity-50 disabled:pointer-events-none"
                        )}
                      >
                        {unlockLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Unlocking…
                          </>
                        ) : (
                          "Unlock This Car"
                        )}
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex-1 flex items-center justify-center min-h-[200px] rounded-lg bg-[#151515] border border-white/5 mb-4">
                        <p className="text-white/50 text-sm text-center px-4">
                          Select game, class, and car, then click Search.
                        </p>
                      </div>
                      <p className="text-white/70 text-sm mb-6">
                        Unlock lifetime access to all setups for this car, including future updates.
                      </p>
                      <Button
                        disabled
                        className="w-full h-12 rounded-md text-sm font-semibold uppercase tracking-wide bg-white/10 text-white/50 cursor-not-allowed"
                      >
                        Unlock This Car
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>

    </div>
  )
}
