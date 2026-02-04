"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"
import { Loader2, User, Clock, FileText, Diamond } from "lucide-react"
import { AccountTab } from "./account-tab"
import { DownloadHistoryTab } from "./download-history-tab"
import { PaymentHistoryTab } from "./payment-history-tab"
import { ManageSubscriptionsTab } from "./manage-subscriptions-tab"

type TabType = "account" | "downloads" | "payments" | "subscriptions"

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>("account")

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login")
      return
    }
    setIsLoading(false)
  }, [router])

  const tabs = [
    { id: "account" as TabType, label: "Account", icon: User },
    { id: "downloads" as TabType, label: "Download History", icon: Clock },
    { id: "payments" as TabType, label: "Payment History", icon: FileText },
    { id: "subscriptions" as TabType, label: "Manage Subscriptions", icon: Diamond },
  ]

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#151515]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#151515] relative overflow-hidden">
      <section className="relative z-10 flex-1 px-6 sm:px-10 lg:px-24 py-16 pt-32">
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <h1 className="text-white font-display text-3xl sm:text-4xl tracking-tight">
            My Dashboard
          </h1>
          <p className="mt-2 text-white/40 text-sm sm:text-base max-w-3xl">
            Manage your account, access your setups, review downloads, and keep track of your subscriptions and payments all in one place.
          </p>

          {/* Navigation Tabs */}
          <div className="mt-8 flex flex-wrap items-center gap-3 pb-6 border-b border-white/10">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium tracking-wide transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {activeTab === "account" && <AccountTab />}
          {activeTab === "downloads" && <DownloadHistoryTab />}
          {activeTab === "payments" && <PaymentHistoryTab />}
          {activeTab === "subscriptions" && <ManageSubscriptionsTab />}
        </div>
      </section>
    </main>
  )
}
