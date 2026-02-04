import { notFound } from "next/navigation"
import { SetupPage, type CategoryFromApi } from "@/components/setup-page"
import { apiUrl } from "@/lib/api"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function SetupsCategorySlugPage({
  params,
}: {
  params: Promise<{ category: string; slug?: string[] }>
}) {
  const { category: categoryParam } = await params
  const categorySlug = categoryParam.toLowerCase()

  let categories: CategoryFromApi[] = []
  try {
    const res = await fetch(apiUrl("/api/v1/products/categories"), {
      cache: "no-store",
      headers: { Accept: "application/json" },
      next: { revalidate: 0 },
    })
    const json = await res.json()
    const ok = res.ok && (json.success === true || json.status === true)
    categories = Array.isArray(json.data) ? (json.data as CategoryFromApi[]) : []
    if (!ok || !categories.length) {
      notFound()
    }
  } catch {
    notFound()
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
