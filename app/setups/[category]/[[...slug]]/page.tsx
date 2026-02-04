import { notFound } from "next/navigation"
import { SetupPage, type CategoryFromApi } from "@/components/setup-page"
import { apiUrl } from "@/lib/api"

export default async function SetupsCategorySlugPage({
  params,
}: {
  params: Promise<{ category: string; slug?: string[] }>
}) {
  const { category: categoryParam } = await params
  const categorySlug = categoryParam.toLowerCase()

  const res = await fetch(apiUrl("/api/v1/products/categories"), {
    next: { revalidate: 60 },
  })
  const json = await res.json()
  const ok = res.ok && (json.success === true || json.status === true)
  const data = Array.isArray(json.data) ? json.data : []

  if (!ok || !data.length) {
    notFound()
  }

  const categories = data as CategoryFromApi[]
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
