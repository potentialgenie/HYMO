"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { SetupPage, type CategoryFromApi } from "@/components/setup-page"
import { apiUrl } from "@/lib/api"
import { Loader2 } from "lucide-react"

const FALLBACK_CATEGORIES: CategoryFromApi[] = [
  { id: 1, name: "iRacing", slug: "iRacing", image_url: "https://www.hymosetups.com/uploads/categories/1751544028.jpg" },
  { id: 2, name: "Assetto Corsa Competizione", slug: "assetto-corsa-competizione", image_url: "https://www.hymosetups.com/uploads/categories/1751544101.jpg" },
  { id: 3, name: "Le Mans Ultimate", slug: "le-mans-ultimate", image_url: "https://www.hymosetups.com/uploads/categories/1751544176.jpg" },
]

export default function SetupsCategorySlugPage() {
  const params = useParams()
  const categoryParam = params?.category as string | undefined
  const categorySlug = categoryParam?.toLowerCase() ?? ""

  const [currentCategory, setCurrentCategory] = useState<CategoryFromApi | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function loadCategory() {
      setIsLoading(true)
      let categories: CategoryFromApi[] = FALLBACK_CATEGORIES

      try {
        const res = await fetch(apiUrl("/api/v1/products/categories"))
        const json = await res.json()
        if (res.ok && (json.success === true || json.status === true) && Array.isArray(json?.data) && json.data.length > 0) {
          categories = json.data as CategoryFromApi[]
        }
      } catch {
        // Use fallback
      }

      const found = categories.find((c) => c.slug.toLowerCase() === categorySlug)
      if (found) {
        setCurrentCategory(found)
      } else {
        setNotFound(true)
      }
      setIsLoading(false)
    }

    if (categorySlug) {
      loadCategory()
    } else {
      setNotFound(true)
      setIsLoading(false)
    }
  }, [categorySlug])

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#151515]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    )
  }

  if (notFound || !currentCategory) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#151515]">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">404</h1>
          <p className="text-white/60">Category not found</p>
        </div>
      </main>
    )
  }

  return (
    <SetupPage
      categoryId={currentCategory.id}
      categorySlug={currentCategory.slug}
      categoryImageUrl={currentCategory.image_url}
      categoryName={currentCategory.name}
      setups={[]}
    />
  )
}
