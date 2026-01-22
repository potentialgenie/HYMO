"use client"

import React from "react"
import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AnimateSection } from "@/components/animate-section"
import { Send } from "lucide-react"

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Form submitted:", formData)
  }

  return (
    <AnimateSection id="contact" className="relative py-24 px-4 sm:px-6 lg:px-24 overflow-hidden">
      {/* Enhanced seamless gradient transition from pricing/FAQ - matches the transition above */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-[#1A191E] via-[#1A191E]/95 via-[#1A191E]/85 via-[#1A191E]/70 via-[#1A191E]/50 to-transparent z-10" />
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/images/contact-bg.jpg"
          alt=""
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority={false}
        />
        {/* Enhanced seamless gradient overlay - blends with transition above */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A191E]/95 via-[#1A191E]/80 via-[#1A191E]/60 via-background/40 to-background/60" />
      </div>

      <div className="relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Text content */}
          <div>
            <h2 className="text-5xl sm:text-6xl font-bold mb-6 font-display">
              Got a question?{" "}
              <span className="text-primary italic">{"We're here to help."}</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Whether you need support with your setups, have questions about our plans, 
              or want to partner with us, our team is ready to assist you.
            </p>
            
            {/* Contact info */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email us at</p>
                  <p className="text-foreground font-medium">support@hymosetups.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Response time</p>
                  <p className="text-foreground font-medium">Within 24 hours</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Contact form */}
          <div className="relative overflow-hidden rounded-sm border border-white/15 bg-card/60 p-6 shadow-2xl shadow-black/25 backdrop-blur-xl sm:p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_32px_oklch(0.65_0.28_328_/_0.1)]">
            <div>
              <h3 className="text-2xl font-semibold tracking-tight">Contact Us</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Fill out the form below and {"we'll"} get back to you soon.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-foreground/90">
                  Your Name
                </Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12 rounded-sm border-white/20 bg-white/5 px-4 placeholder:text-white/40 transition-colors hover:border-white/30 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground/90">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-12 rounded-sm border-white/20 bg-white/5 px-4 placeholder:text-white/40 transition-colors hover:border-white/30 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-medium text-foreground/90">
                  Your Message
                </Label>
                <Textarea
                  id="message"
                  placeholder="Tell us how we can help you..."
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="min-h-[128px] resize-none rounded-sm border-white/20 bg-white/5 px-4 py-3 placeholder:text-white/40 transition-colors hover:border-white/30 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-12 w-full cursor-pointer rounded-sm font-semibold shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/30 active:scale-[0.99]"
              >
                Send Message
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </AnimateSection>
  )
}
