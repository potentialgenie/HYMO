const FILTERS_API_URL = "https://www.hymosetups.com/api/v1/setups/filters"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const categoryId = body.category_id

    if (!categoryId) {
      return Response.json(
        { status: false, message: "category_id is required", data: null },
        { status: 400 }
      )
    }

    const allowedKeys = [
      "class_id",
      "car_id",
      "track_id",
      "variation_id",
      "season_id",
      "week",
      "series_id",
      "year",
      "version_id",
    ]
    const payload: Record<string, unknown> = { category_id: categoryId }
    for (const key of allowedKeys) {
      const value = body[key]
      if (value !== undefined && value !== null && value !== "") {
        payload[key] = value
      }
    }

    const res = await fetch(FILTERS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      next: { revalidate: 60 },
    })
    if (!res.ok) {
      throw new Error(`Filters API responded with ${res.status}`)
    }
    const data = await res.json()
    return Response.json(data)
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch filters"
    return Response.json(
      { status: false, message, data: null },
      { status: 500 }
    )
  }
}
