/**
 * Subscription helpers for plan pages.
 */

import { apiFetch } from "@/lib/auth"
import { apiUrl } from "@/lib/api"

export type SubscriptionFromApi = {
  id: number
  plan: { id: number; name: string; price: string; interval: string; currency: string }
  is_active: boolean
}

export type SubscriptionsApiResponse = {
  status: boolean
  message?: string
  data: SubscriptionFromApi[]
}

const PLAN_5_ID = 5 // Car Access / permanent - excluded from "active plan" check

/**
 * Returns true if the user has any active subscription except plan 5 (Car Access).
 */
export async function hasActivePlanExceptPlan5(): Promise<boolean> {
  const res = await apiFetch(apiUrl("/api/v1/subscriptions"))
  const json: SubscriptionsApiResponse = await res.json()
  if (!res.ok || !json.status || !Array.isArray(json.data)) return false
  return json.data.some((s) => s.is_active && s.plan?.id && s.plan.id !== PLAN_5_ID)
}
