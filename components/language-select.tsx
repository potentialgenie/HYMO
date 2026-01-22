"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import type { Language } from "@/lib/translations"

const languages: { code: Language; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "/images/flags/gb.svg" },
  { code: "de", label: "Deutsch", flag: "/images/flags/de.svg" },
]

export function LanguageSelect() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { language, setLanguage } = useLanguage()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const current = languages.find((l) => l.code === language)

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {current && (
          <img src={current.flag} alt="" className="w-5 h-3.5 object-cover rounded-sm shrink-0" aria-hidden />
        )}
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          className="absolute top-full right-0 mt-2 w-40 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50"
          role="listbox"
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              role="option"
              aria-selected={language === lang.code}
              onClick={() => {
                setLanguage(lang.code)
                setOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors text-left ${
                language === lang.code
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <img src={lang.flag} alt="" className="w-5 h-3.5 object-cover rounded-sm shrink-0" aria-hidden />
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
