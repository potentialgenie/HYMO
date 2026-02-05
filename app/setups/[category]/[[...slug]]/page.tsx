import { Suspense } from "react"
import { notFound } from "next/navigation"
import { SetupPage, type CategoryFromApi } from "@/components/setup-page"
import { apiUrl } from "@/lib/api"

function SetupPageLoading() {
  return (
    <div className="min-h-screen bg-[#151515] pt-24 pb-16 flex items-center justify-center">
      <div className="animate-pulse text-white/50">Loading...</div>
    </div>
  )
}

export default async function SetupsCategorySlugPage({
  params,
}: {
  params: Promise<{ category: string; slug?: string[] }>
}) {
  const { category: categoryParam } = await params
  const categorySlug = categoryParam.toLowerCase()

  const FALLBACK_CATEGORIES: CategoryFromApi[] = [
    { id: 1, name: "iRacing", slug: "iRacing", image_url: "https://www.hymosetups.com/uploads/categories/1751544028.jpg" },
    { id: 2, name: "Assetto Corsa Competizione", slug: "assetto-corsa-competizione", image_url: "https://www.hymosetups.com/uploads/categories/1751544101.jpg" },
    { id: 3, name: "Le Mans Ultimate", slug: "le-mans-ultimate", image_url: "https://www.hymosetups.com/uploads/categories/1751544176.jpg" },
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
    <Suspense fallback={<SetupPageLoading />}>
      <SetupPage
        categoryId={currentCategory.id}
        categorySlug={currentCategory.slug}
        categoryImageUrl={currentCategory.image_url}
        categoryName={currentCategory.name}
        setups={[]}
      />
    </Suspense>
  )
}
