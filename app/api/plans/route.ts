const PLANS_API_URL = "https://www.hymosetups.com/api/v1/plans"

export async function GET() {
  try {
    const res = await fetch(PLANS_API_URL, {
      next: { revalidate: 60 },
      headers: { "Content-Type": "application/json" },
    })
    if (!res.ok) {
      throw new Error(`Plans API responded with ${res.status}`)
    }
    const data = await res.json()
    return Response.json(data)
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch plans"
    return Response.json(
      { status: false, message, data: [] },
      { status: 500 }
    )
  }
}
