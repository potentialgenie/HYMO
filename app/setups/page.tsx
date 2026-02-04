import { redirect } from "next/navigation"
import { apiUrl } from "@/lib/api"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function SetupsIndexPage() {
  try {
    const res = await fetch(apiUrl("/api/v1/products/categories"), {
      cache: "no-store",
      headers: { Accept: "application/json" },
    })
    const json = await res.json()
    const data = Array.isArray(json?.data) ? json.data : []
    const first = data.sort((a: { id: number }, b: { id: number }) => a.id - b.id)[0]
    const slug = first?.slug ?? "iRacing"
    redirect(`/setups/${slug}`)
  } catch {
    redirect("/setups/iRacing")
  }
}
