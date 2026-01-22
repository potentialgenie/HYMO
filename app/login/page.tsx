"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LanguageSelect } from "@/components/language-select"
import { useLanguage } from "@/lib/language-context"

export default function LoginPage() {
  const { t } = useLanguage()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: wire to auth API
  }

  return (
    <main className="min-h-screen bg-[#1A191E]">
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-6 lg:px-36 pt-12 backdrop-blur-md">
        <Link href="/">
          <img src="/images/hymo-logo.png" alt="HYMO" className="h-8 w-auto" />
        </Link>
        <LanguageSelect />
      </header>
      <div className="absolute inset-0">
        <Image
          src="/images/hero-bg-2.png"
          alt="Racing Car"
          fill
          priority
          className="object-cover object-center rotate-y-180"
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/30 to-background/20" />
      </div>
      <section className="relative pt-32 pb-24 px-6 sm:px-12 lg:px-36 min-h-[calc(100vh-5rem)] flex items-center justify-end overflow-hidden">
        <div className="absolute inset-0 bg-circuit opacity-[0.4]" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-transparent" aria-hidden />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[420px] rounded-full bg-primary/10 blur-[100px] pointer-events-none" aria-hidden />
        <div className="relative z-10 w-full max-w-md">
          <Card className="login-glass-card relative border-0 bg-transparent shadow-none overflow-hidden rounded-2xl backdrop-blur-sm">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/80 to-transparent shadow-[0_0_12px_oklch(0.65_0.28_328_/_0.6)]" />
            <CardHeader className="text-center pb-2 items-center">
              <div className="flex flex-row items-center justify-center mt-12">
                <Image src="/images/hymo-logo1.png" alt="HYMO" width={100} height={100} className="h-16 w-auto" />
              </div>
              <CardTitle className="font-[family-name:var(--font-display)] text-3xl text-foreground/95 uppercase mt-2">
                {t.auth.login.title}
              </CardTitle>
              <CardDescription className="text-muted-foreground/90">{t.auth.login.subtitle}</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 pb-2">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-foreground/90">{t.auth.login.email}</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder={t.auth.login.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input-neon bg-white/[0.06] border-white/20 placeholder:text-muted-foreground/70 h-10 focus-visible:border-primary/50 focus-visible:ring-0"
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-foreground/90">{t.auth.login.password}</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="input-neon bg-white/[0.06] border-white/20 placeholder:text-muted-foreground/70 h-10 focus-visible:border-primary/50 focus-visible:ring-0"
                    autoComplete="current-password"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4 pt-2">
                <Button type="submit" className="w-full h-10 glow-primary shadow-[0_0_20px_oklch(0.65_0.28_328_/_0.35)] hover:shadow-[0_0_28px_oklch(0.65_0.28_328_/_0.5)]" size="lg">
                  {t.auth.login.submit}
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  {t.auth.login.noAccount}{" "}
                  <Link href="/register" className="text-primary font-medium hover:underline">
                    {t.auth.login.registerLink}
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </section>
    </main>
  )
}
