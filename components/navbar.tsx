"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Menu, X, ChevronDown, Globe } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import type { Language } from "@/lib/translations"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [setupsDropdownOpen, setSetupsDropdownOpen] = useState(false)
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false)
  const [mobileSetupsOpen, setMobileSetupsOpen] = useState(false)
  const [mobileLanguageOpen, setMobileLanguageOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const languageDropdownRef = useRef<HTMLDivElement>(null)

  const { language, setLanguage, t } = useLanguage()
  const pathname = usePathname()

  const isActive = (href: string, prefix?: boolean) => {
    if (prefix) return pathname.startsWith(href)
    if (href === "/#contact") return pathname === "/"
    return pathname === href
  }
  const linkCls = (href: string, prefix?: boolean) =>
    `transition-colors text-sm ${isActive(href, prefix) ? "text-primary font-bold" : "text-white hover:text-primary font-medium"}`

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSetupsDropdownOpen(false)
      }
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setLanguageDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener("scroll", handleScroll)
    // Check initial scroll position
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const setupsLinks = [
    { href: "/setups/iracing", label: "iRacing" },
    { href: "/setups/acc", label: "Assetto Corsa Competizione" },
    { href: "/setups/lmu", label: "Le Mans Ultimate" },
  ]

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: "en", label: "English", flag: "/images/flags/gb.svg" },
    { code: "de", label: "Deutsch", flag: "/images/flags/de.svg" },
  ]

  const currentLanguage = languages.find((l) => l.code === language)

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md"
      style={{ backgroundColor: isScrolled ? "#1A191E" : "transparent" }}
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="px-4 sm:px-6 lg:px-24">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <img
              src="/images/hymo-logo.png"
              alt="HYMO"
              className="h-8 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/pricing" className={linkCls("/pricing")}>
              {t.nav.pricing}
            </Link>
            
            {/* Setups Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setSetupsDropdownOpen(!setupsDropdownOpen)}
                className={`flex items-center gap-1 ${linkCls("/setups", true)}`}
              >
                {t.nav.setups}
                <ChevronDown className={`h-4 w-4 transition-transform ${setupsDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              
              {setupsDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
                  {setupsLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setSetupsDropdownOpen(false)}
                      className={`block px-4 py-3 text-sm transition-colors hover:bg-muted ${
                        pathname === link.href ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/team" className={linkCls("/team")}>
              {t.nav.team}
            </Link>
            <Link href="/#contact" className={linkCls("/#contact")}>
              {t.nav.contact}
            </Link>

            {/* Language Dropdown */}
            <div className="relative" ref={languageDropdownRef}>
              <button
                onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
              >
                {currentLanguage && (
                  <img src={currentLanguage.flag} alt="" className="w-5 h-3.5 object-cover rounded-sm shrink-0" aria-hidden />
                )}
                <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${languageDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              
              {languageDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-40 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code)
                        setLanguageDropdownOpen(false)
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
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

            <Button variant="outline" size="sm" asChild className={"px-4 py-2 bg-transparent rounded-sm" + (pathname === "/login" ? "border-primary text-primary" : " border-primary text-white hover:text-primary hover:bg-primary/10")}>
              <Link href="/login">{t.nav.login}</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <Link 
                href="/pricing" 
                onClick={() => setIsOpen(false)}
                className={linkCls("/pricing")}
              >
                {t.nav.pricing}
              </Link>
              
              {/* Mobile Setups Dropdown */}
              <div>
                <button
                  onClick={() => setMobileSetupsOpen(!mobileSetupsOpen)}
                  className={`flex items-center gap-1 w-full ${linkCls("/setups", true)}`}
                >
                  {t.nav.setups}
                  <ChevronDown className={`h-4 w-4 transition-transform ${mobileSetupsOpen ? "rotate-180" : ""}`} />
                </button>
                {mobileSetupsOpen && (
                  <div className="mt-2 ml-4 flex flex-col gap-2">
                    {setupsLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => {
                          setMobileSetupsOpen(false)
                          setIsOpen(false)
                        }}
                        className={`text-sm transition-colors ${
                          pathname === link.href ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link 
                href="/team" 
                onClick={() => setIsOpen(false)}
                className={linkCls("/team")}
              >
                {t.nav.team}
              </Link>
              <Link 
                href="/#contact" 
                onClick={() => setIsOpen(false)}
                className={linkCls("/#contact")}
              >
                {t.nav.contact}
              </Link>

              {/* Mobile Language Dropdown */}
              <div>
                <button
                  onClick={() => setMobileLanguageOpen(!mobileLanguageOpen)}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium w-full"
                >
                  {currentLanguage && (
                    <img src={currentLanguage.flag} alt="" className="w-5 h-3.5 object-cover rounded-sm shrink-0" aria-hidden />
                  )}
                  {currentLanguage?.label}
                  <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${mobileLanguageOpen ? "rotate-180" : ""}`} />
                </button>
                {mobileLanguageOpen && (
                  <div className="mt-2 ml-4 flex flex-col gap-2">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code)
                          setMobileLanguageOpen(false)
                        }}
                        className={`flex items-center gap-2 text-sm transition-colors ${
                          language === lang.code
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <img src={lang.flag} alt="" className="w-5 h-3.5 object-cover rounded-sm shrink-0" aria-hidden />
                        <span>{lang.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button variant="outline" size="sm" className={`w-full justify-center ${pathname === "/login" ? "border-primary text-primary" : ""}`} asChild>
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  {t.nav.login}
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.nav>
  )
}
