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
  const [activeAnchor, setActiveAnchor] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)
  const languageDropdownRef = useRef<HTMLDivElement>(null)

  const { language, setLanguage, t } = useLanguage()
  const pathname = usePathname()

  const isActive = (href: string, prefix?: boolean) => {
    if (prefix) return pathname.startsWith(href)
    if (href === "/#contact") return pathname === "/" && activeAnchor === "contact"
    return pathname === href
  }
  const linkCls = (href: string, prefix?: boolean) =>
    `relative inline-flex items-center h-8 text-[0.95rem] tracking-wide transition-all duration-200 ${
      isActive(href, prefix)
        ? "text-primary font-semibold"
        : "text-white hover:text-primary font-medium"
    }`

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

  useEffect(() => {
    const updateHash = () => {
      if (typeof window === "undefined") return
      const hash = window.location.hash.replace("#", "")
      setActiveAnchor(hash)
    }
    updateHash()
    window.addEventListener("hashchange", updateHash)
    return () => window.removeEventListener("hashchange", updateHash)
  }, [pathname])

  useEffect(() => {
    if (pathname !== "/") {
      setActiveAnchor("")
    }
  }, [pathname])

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
  const handleNavLinkClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    options?: { closeMenu?: boolean; closeSetups?: boolean; setAnchor?: string }
  ) => {
    event.preventDefault()
    if (options?.closeMenu) setIsOpen(false)
    if (options?.closeSetups) setSetupsDropdownOpen(false)
    if (typeof options?.setAnchor === "string") {
      setActiveAnchor(options.setAnchor)
    } else {
      setActiveAnchor("")
    }
    if (typeof window !== "undefined") {
      window.location.href = href
    }
  }

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${
        isScrolled
          ? "bg-[#1A191E]/50 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.25)] border-white/10"
          : "bg-transparent backdrop-blur-0"
      }`}
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="px-4 sm:px-6 lg:px-24">
        <div className="flex items-center justify-between h-22">
          {/* Logo */}
          <Link
            href="/"
            className="flex-shrink-0"
            onClick={(event) => handleNavLinkClick(event, "/")}
          >
            <img
              src="/images/hymo-logo1.png"
              alt="HYMO"
              className="h-6 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/pricing"
              className={linkCls("/pricing")}
              onClick={(event) => handleNavLinkClick(event, "/pricing")}
            >
              {t.nav.pricing}
            </Link>
            
            {/* Setups Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => {
                  setSetupsDropdownOpen(!setupsDropdownOpen)
                  setActiveAnchor("")
                }}
                className={`inline-flex items-center h-8 gap-1 ${linkCls("/setups", true)}`}
              >
                {t.nav.setups}
                <ChevronDown className={`h-4 w-4 mt-px transition-transform ${setupsDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              
              {setupsDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-[#1A191E]/95 backdrop-blur-md border border-white/10 rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.4)] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
                  {setupsLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={(event) =>
                        handleNavLinkClick(event, link.href, { closeSetups: true })
                      }
                      className={`block px-5 py-3.5 text-sm tracking-wide transition-all duration-200 hover:bg-primary/10 hover:pl-6 ${
                        pathname === link.href
                          ? "text-primary font-semibold bg-primary/5 border-l-2 border-primary"
                          : "text-white hover:text-primary"
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
              className={linkCls("/team")}
              onClick={(event) => handleNavLinkClick(event, "/team")}
            >
              {t.nav.team}
            </Link>
            <Link
              href="/#contact"
              className={linkCls("/#contact")}
              onClick={(event) =>
                handleNavLinkClick(event, "/#contact", { setAnchor: "contact" })
              }
            >
              {t.nav.contact}
            </Link>

            {/* Language Dropdown */}
            <div className="relative" ref={languageDropdownRef}>
              <button
                onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                className="flex items-center gap-2 text-white hover:text-primary transition-all duration-200 text-xs tracking-wide"
              >
                {currentLanguage && (
                  <img src={currentLanguage.flag} alt="" className="w-5 h-3.5 object-cover rounded-sm shrink-0" aria-hidden />
                )}
                <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${languageDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              
              {languageDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-44 bg-[#1A191E]/95 backdrop-blur-md border border-white/10 rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.4)] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code)
                        setLanguageDropdownOpen(false)
                      }}
                      className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm tracking-wide transition-all duration-200 hover:bg-primary/10 hover:pl-6 ${
                        language === lang.code
                          ? "text-primary font-semibold bg-primary/5 border-l-2 border-primary"
                          : "text-white hover:text-primary"
                      }`}
                    >
                      <img src={lang.flag} alt="" className="w-5 h-3.5 object-cover rounded-sm shrink-0" aria-hidden />
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              asChild
              size="sm"
              className="px-5 py-2.5 rounded-md font-medium text-sm tracking-wide transition-all duration-200 bg-brand-gradient text-white hover:brightness-110 focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A191E]"
            >
              <Link href="/login" onClick={(event) => handleNavLinkClick(event, "/login")}>
                {t.nav.login}
              </Link>
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
                onClick={(event) =>
                  handleNavLinkClick(event, "/pricing", { closeMenu: true })
                }
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
                  <div className="mt-2 ml-4 flex flex-col gap-1">
                    {setupsLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={(event) => {
                          setMobileSetupsOpen(false)
                          handleNavLinkClick(event, link.href, { closeMenu: true })
                        }}
                        className={`text-sm font-display tracking-wide transition-all duration-200 py-2 px-3 rounded-md ${
                          pathname === link.href
                            ? "text-primary font-semibold bg-primary/10"
                            : "text-white hover:text-primary hover:bg-primary/5"
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
                onClick={(event) =>
                  handleNavLinkClick(event, "/team", { closeMenu: true })
                }
                className={linkCls("/team")}
              >
                {t.nav.team}
              </Link>
              <Link
                href="/#contact"
                onClick={(event) =>
                  handleNavLinkClick(event, "/#contact", {
                    closeMenu: true,
                    setAnchor: "contact",
                  })
                }
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
                  <div className="mt-2 ml-4 flex flex-col gap-1">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code)
                          setMobileLanguageOpen(false)
                        }}
                        className={`flex items-center gap-3 text-sm font-display tracking-wide transition-all duration-200 py-2 px-3 rounded-md ${
                          language === lang.code
                            ? "text-primary font-semibold bg-primary/10"
                            : "text-white hover:text-primary hover:bg-primary/5"
                        }`}
                      >
                        <img src={lang.flag} alt="" className="w-5 h-3.5 object-cover rounded-sm shrink-0" aria-hidden />
                        <span>{lang.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button
                asChild
                size="sm"
                className="w-full px-5 py-3 rounded-md font-medium text-sm tracking-wide transition-all duration-200 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A191E]"
              >
                <Link
                  href="/login"
                  onClick={(event) =>
                    handleNavLinkClick(event, "/login", { closeMenu: true })
                  }
                >
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
