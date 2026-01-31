"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getUser } from "@/lib/auth"

export function AccountTab() {
  const user = getUser()

  return (
    <div className="mt-8 space-y-6">
      {/* Profile Overview Section */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex items-start gap-4">
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-[#2A2A2A] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-2xl font-semibold">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Profile Photo</p>
              <p className="text-sm text-white/60 mt-1 max-w-md">
                Passionate and fearless car racer with a deep love for speed
              </p>
            </div>
          </div>
          <div className="lg:ml-auto rounded-xl border border-white/10 bg-white/5 px-5 py-4">
            <p className="text-sm text-white/80">
              Last Payment:{" "}
              <span className="text-white font-medium">30 Jan, 2026</span>
            </p>
            <p className="text-sm text-white/80 mt-1">
              Member Since:{" "}
              <span className="text-white font-medium">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Two Column: Your Bio & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Your Bio */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-primary font-display text-lg font-medium mb-4">Your Bio</h3>
          <p className="text-white/80 text-sm leading-relaxed">
            {user?.name || "User"} is a dedicated sim racing enthusiast with a passion for competitive racing.
            He focuses on consistency and race craft, spending hours analyzing lap data and
            refining his driving techniques to improve performance across various racing
            disciplines.
          </p>
          <Button
            asChild
            className="mt-4 h-9 px-5 rounded-full text-sm font-medium bg-brand-gradient text-white hover:brightness-110"
          >
            <Link href="/profile">Edit Profile</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-primary font-display text-lg font-medium mb-4">
            {user?.name || "User"}&apos;s Stats
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">No. of Setup:</span>
              <span className="text-white font-medium">0</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">No. of Session:</span>
              <span className="text-white font-medium">0</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Most Played Game:</span>
              <span className="text-white font-medium">Le Mans Ultimate</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Most Driven Track:</span>
              <span className="text-white font-medium">Monza Circuit</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Most Driven Car:</span>
              <span className="text-white font-medium">Corvette Z06 GT3.R</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">No of Achievements:</span>
              <span className="text-white font-medium">0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
