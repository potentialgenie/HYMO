"use client"

import { useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsVisible(window.scrollY > 400)
    onScroll()
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={handleClick}
      className={`fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full border border-[#E400BC]/70 bg-[#1a191e]/80 text-white shadow-[0_0_24px_rgba(228,0,188,0.35)] backdrop-blur-md transition-all duration-300 hover:shadow-[0_0_32px_rgba(228,0,188,0.55)] ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
      }`}
    >
      <ArrowUp className="h-6 w-6 mx-auto" />
    </button>
  )
}
