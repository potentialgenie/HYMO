"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"
import { Loader2, User, Shield } from "lucide-react"
import { SettingsTab } from "./settings-tab"
import { AccountPasswordTab } from "./account-password-tab"

type TabType = "settings" | "password"

export default function ProfilePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>("settings")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login")
      return
    }
    setIsLoading(false)
  }, [router])

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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-white font-display text-3xl sm:text-4xl tracking-tight">
            My Profile
          </h1>
          <p className="mt-2 text-white/40 text-sm sm:text-base">
            Manage your profile and settings in this page.
          </p>

          {/* Navigation Tabs */}
          <div className="mt-6 flex items-center gap-4 pb-6 border-b border-white/10">
            <button
              onClick={() => setActiveTab("settings")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium tracking-wide transition-all duration-200 ${
                activeTab === "settings"
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <User className="h-4 w-4" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium tracking-wide transition-all duration-200 ${
                activeTab === "password"
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Shield className="h-4 w-4" />
              Account Password
            </button>
          </div>

          {activeTab === "settings" && <SettingsTab />}
          {activeTab === "password" && <AccountPasswordTab />}
        </div>
      </section>
    </main>
  )
}
