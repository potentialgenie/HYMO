import { notFound } from "next/navigation"
import { SetupPage, type CategoryFromApi } from "@/components/setup-page"
import { apiUrl } from "@/lib/api"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export default async function SetupsCategorySlugPage({
  params,
}: {
  params: Promise<{ category: string; slug?: string[] }>
}) {
  const { category: categoryParam } = await params
  const categorySlug = categoryParam.toLowerCase()

  const FALLBACK_CATEGORIES: CategoryFromApi[] = [
    { id: 1, name: "iRacing", slug: "iRacing" },
    { id: 2, name: "Assetto Corsa Competizione", slug: "assetto-corsa-competizione" },
    { id: 3, name: "Le Mans Ultimate", slug: "le-mans-ultimate" },
  ]

  let categories: CategoryFromApi[]
  try {
    const res = await fetch(apiUrl("/api/v1/products/categories"), {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
      next: { revalidate: 0 },
    })
    const json = await res.json()
    const ok = res.ok && (json.success === true || json.status === true)
    const data = Array.isArray(json?.data) ? json.data : []
    categories = ok && data.length ? (data as CategoryFromApi[]) : FALLBACK_CATEGORIES
  } catch {
    categories = FALLBACK_CATEGORIES
  }

  const currentCategory = categories.find((c) => c.slug.toLowerCase() === categorySlug)
  if (!currentCategory) {
    notFound()
  }

  return (
    <div className="bg-[#151515]">
      <SetupPage
        categoryId={currentCategory.id}
        categorySlug={currentCategory.slug}
        setups={[]}
      />
    </div>
  )
}
