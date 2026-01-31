"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Menu, X, ChevronDown, Globe, Loader2, User, LayoutDashboard, LogOut } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import type { Language } from "@/lib/translations"
import { Button } from "@/components/ui/button"
import { clearAuthData, getUser, hasSession, isAuthenticated, isTokenExpired, logout, refreshAccessToken } from "@/lib/auth"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [setupsDropdownOpen, setSetupsDropdownOpen] = useState(false)
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false)
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false)
  const [mobileSetupsOpen, setMobileSetupsOpen] = useState(false)
  const [mobileLanguageOpen, setMobileLanguageOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeAnchor, setActiveAnchor] = useState("")
  const [isAuthed, setIsAuthed] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const languageDropdownRef = useRef<HTMLDivElement>(null)
  const accountDropdownRef = useRef<HTMLDivElement>(null)

  const { language, setLanguage, t } = useLanguage()
  const pathname = usePathname()
  const router = useRouter()

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
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target as Node)) {
        setAccountDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    let cancelled = false

    const refreshAuth = async () => {
      // If access token is expired but we still have a refresh token, try refreshing once
      if (!isAuthenticated() && hasSession() && isTokenExpired()) {
        try {
          await refreshAccessToken()
        } catch {
          clearAuthData()
        }
      }

      if (cancelled) return
      const authed = isAuthenticated()
      setIsAuthed(authed)
      const u = getUser()
      setUserName(u ? u.name : null)
    }

    const checkAndUpdateAuth = async () => {
      if (cancelled) return
      
      // Check if token is expired
      if (isTokenExpired()) {
        // Try to refresh the token if we have a refresh token
        if (hasSession()) {
          try {
            await refreshAccessToken()
            if (!cancelled) {
              setIsAuthed(isAuthenticated())
              const u = getUser()
              setUserName(u ? u.name : null)
            }
          } catch {
            // Refresh failed, clear auth and update UI
            clearAuthData()
            if (!cancelled) {
              setIsAuthed(false)
              setUserName(null)
              setAccountDropdownOpen(false)
            }
          }
        } else {
          // No session data, clear auth
          clearAuthData()
          if (!cancelled) {
            setIsAuthed(false)
            setUserName(null)
            setAccountDropdownOpen(false)
          }
        }
      }
    }

    void refreshAuth()
    
    const onStorage = () => void refreshAuth()
    window.addEventListener("storage", onStorage)

    // Check when tab becomes visible again (user returns to the tab)
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void checkAndUpdateAuth()
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange)

    // Check when window regains focus
    const onFocus = () => void checkAndUpdateAuth()
    window.addEventListener("focus", onFocus)

    // Periodic check for session expiration (every 30 seconds)
    const checkSession = setInterval(() => {
      void checkAndUpdateAuth()
    }, 30000)

    return () => {
      cancelled = true
      window.removeEventListener("storage", onStorage)
      document.removeEventListener("visibilitychange", onVisibilityChange)
      window.removeEventListener("focus", onFocus)
      clearInterval(checkSession)
    }
  }, [])

  useEffect(() => {
    // Re-check auth state on route change
    const authed = isAuthenticated()
    setIsAuthed(authed)
    const u = getUser()
    setUserName(u ? u.name : null)
  }, [pathname])

  const handleLogout = async () => {
    if (logoutLoading) return
    setLogoutLoading(true)
    try {
      await logout()
      setIsAuthed(false)
      setUserName(null)
      setAccountDropdownOpen(false)
      setIsOpen(false)
      router.push("/")
    } finally {
      setLogoutLoading(false)
    }
  }

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

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${
        isScrolled
          ? "bg-[#151515]/50 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.25)] border-white/10"
          : "bg-transparent backdrop-blur-0"
      }`}
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="px-4 sm:px-6 lg:px-24">
        <div className="flex items-center justify-between h-22">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <img
              src="/images/hymo-logo1.png"
              alt="HYMO"
              className="h-6 w-auto"
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
                onClick={() => {
                  setSetupsDropdownOpen(!setupsDropdownOpen)
                  setActiveAnchor("")
                }}
                className={`inline-flex cursor-pointer items-center h-8 gap-1 ${linkCls("/setups", true)}`}
              >
                {t.nav.setups}
                <ChevronDown className={`h-4 w-4 mt-px transition-transform ${setupsDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              
              {setupsDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-[#151515]/95 backdrop-blur-md border border-white/10 rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.4)] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
                  {setupsLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
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
                className="flex items-center gap-2 text-white hover:text-primary transition-all duration-200 text-xs tracking-wide"
              >
                {currentLanguage && (
                  <img src={currentLanguage.flag} alt="" className="w-5 h-3.5 object-cover rounded-sm shrink-0" aria-hidden />
                )}
                <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${languageDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              
              {languageDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-44 bg-[#151515]/95 backdrop-blur-md border border-white/10 rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.4)] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
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

            {/* Auth Button / Account Dropdown */}
            {!isAuthed ? (
              <Button
                asChild
                size="sm"
                className="px-5 py-2.5 rounded-full font-medium text-sm tracking-wide transition-all duration-200 bg-brand-gradient text-white hover:brightness-110 focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#151515] shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]"
              >
                <Link href="/login">
                  {t.nav.login}
                </Link>
              </Button>
            ) : (
              <div className="relative" ref={accountDropdownRef}>
                <button
                  onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                  className="inline-flex items-center gap-3 h-10 px-4 rounded-full bg-white/5 border border-white/10 text-white/90 hover:text-white hover:border-white/20 shadow-[0_8px_18px_rgba(0,0,0,0.35)] transition-all duration-200"
                >
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#C85BFF] text-white text-xs font-semibold shrink-0">
                    {userName ? userName.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                  </div>
                  <span className="text-sm font-medium max-w-[160px] truncate">
                    {userName || "Account"}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 transition-transform ${accountDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {accountDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-full origin-top bg-[#1E1E1E]/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.4)] overflow-hidden animate-in fade-in-0 slide-in-from-top-2 duration-200">
                    {/* User Info Header */}
                    <div className="flex items-center gap-3 p-3 bg-white/5 border-b border-white/10">
                      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#C85BFF] text-white text-xs font-semibold shrink-0">
                        {userName ? userName.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white/90 truncate">
                          {userName || "Account"}
                        </p>
                      </div>
                      <ChevronDown className="h-4 w-4 text-white/50 shrink-0" />
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        href="/profile"
                        onClick={() => setAccountDropdownOpen(false)}
                        className={`mx-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm tracking-wide transition-all duration-200 ${
                          pathname === "/profile"
                            ? "bg-white/10 text-white"
                            : "text-white/90 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <User className="h-4 w-4 shrink-0" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        href="/dashboard"
                        onClick={() => setAccountDropdownOpen(false)}
                        className={`mx-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm tracking-wide transition-all duration-200 ${
                          pathname === "/dashboard"
                            ? "bg-white/10 text-white"
                            : "text-white/90 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <LayoutDashboard className="h-4 w-4 shrink-0" />
                        <span>Dashboard</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        disabled={logoutLoading}
                        className="mx-2 w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm tracking-wide transition-all duration-200 text-white/90 hover:bg-white/10 hover:text-white disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {logoutLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                            <span>Signing out...</span>
                          </>
                        ) : (
                          <>
                            <LogOut className="h-4 w-4 shrink-0" />
                            <span>Sign out</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
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
                  <div className="mt-2 ml-4 flex flex-col gap-1">
                    {setupsLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => {
                          setMobileSetupsOpen(false)
                          setIsOpen(false)
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
                size="sm"
                className="w-full px-5 py-3 rounded-full font-medium text-sm tracking-wide transition-all duration-200 bg-brand-gradient text-white hover:brightness-110 focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#151515]"
              >
                {!isAuthed ? (
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full"
                  >
                    {t.nav.login}
                  </Link>
                ) : (
                  <button
                    onClick={handleLogout}
                    disabled={logoutLoading}
                    className="w-full flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {logoutLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                        {t.nav.logout}
                      </>
                    ) : (
                      t.nav.logout
                    )}
                  </button>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.nav>
  )
}
