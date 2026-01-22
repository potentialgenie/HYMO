"use client"

import React from "react"
import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AnimateSection } from "@/components/animate-section"
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

interface FormErrors {
  name?: string
  email?: string
  message?: string
}

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Name is required"
        if (value.trim().length < 2) return "Name must be at least 2 characters"
        return undefined
      case "email":
        if (!value.trim()) return "Email is required"
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) return "Please enter a valid email address"
        return undefined
      case "message":
        if (!value.trim()) return "Message is required"
        if (value.trim().length < 10) return "Message must be at least 10 characters"
        return undefined
      default:
        return undefined
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors({ ...errors, [name]: undefined })
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const error = validateField(name, value)
    if (error) {
      setErrors({ ...errors, [name]: error })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all fields
    const newErrors: FormErrors = {}
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof typeof formData])
      if (error) {
        newErrors[key as keyof FormErrors] = error
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      // TODO: Replace with actual API call
      // await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // })
      
      setIsSuccess(true)
      setFormData({ name: "", email: "", message: "" })
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setIsSuccess(false)
      }, 5000)
    } catch (error) {
      setErrors({ message: "Failed to send message. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimateSection id="contact" className="relative py-24 px-4 sm:px-6 lg:px-24 overflow-hidden">
      {/* Enhanced seamless gradient transition from pricing/FAQ - matches the transition above */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-[#1A191E] via-[#1A191E]/95 via-[#1A191E]/85 via-[#1A191E]/70 via-[#1A191E]/50 to-transparent z-10" />
      {/* Background image */}
      <div className="absolute inset-0" aria-hidden="true">
        <Image
          src="/images/contact-bg.jpg"
          alt=""
          fill
          className="object-cover object-left"
          sizes="100vw"
          loading="lazy"
        />
        {/* Enhanced seamless gradient overlay - blends with transition above */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A191E]/95 via-[#1A191E]/80 via-[#1A191E]/60 via-background/40 to-background/60" />
      </div>

      <div className="relative z-10">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Left side - Text content */}
          <div className="relative">
            <div className="relative rounded-2xl border border-white/10 bg-black/35 p-8 backdrop-blur-md shadow-lg shadow-black/30">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-70" />
              <div className="relative">
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 font-display">
                  Got a question?{" "}
                  <span className="text-brand-gradient italic">{"We're here to help."}</span>
                </h2>
                <p className="text-foreground/80 text-lg mb-8">
                  Whether you need support with your setups, have questions about our plans, 
                  or want to partner with us, our team is ready to assist you.
                </p>
                
                {/* Contact info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center">
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
                    <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center">
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
            </div>
          </div>

          {/* Right side - Contact form */}
          <div className="relative overflow-hidden rounded-md border border-white/15 bg-card/60 p-6 shadow-2xl shadow-black/25 backdrop-blur-xl sm:p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_32px_oklch(0.65_0.28_328_/_0.1)]">
            <div>
              <h3 className="text-2xl font-semibold tracking-tight">Contact Us</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Fill out the form below and {"we'll"} get back to you soon.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {/* Success Message */}
              {isSuccess && (
                <div className="rounded-md bg-green-500/10 border border-green-500/30 p-4 flex items-center gap-3 animate-in fade-in-0 slide-in-from-top-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  <p className="text-sm text-green-400 font-medium">
                    Message sent successfully! We'll get back to you soon.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-foreground/90">
                  Your Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={errors.name ? "true" : "false"}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  className={`h-12 rounded-md border-white/20 bg-white/5 px-4 placeholder:text-white/40 transition-colors hover:border-white/30 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 ${
                    errors.name ? "border-red-500/50 focus-visible:border-red-500 focus-visible:ring-red-500/25" : ""
                  }`}
                />
                {errors.name && (
                  <p id="name-error" className="text-xs text-red-400 flex items-center gap-1.5 mt-1 animate-in fade-in-0 slide-in-from-top-1">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {errors.name}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground/90">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={errors.email ? "true" : "false"}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={`h-12 rounded-md border-white/20 bg-white/5 px-4 placeholder:text-white/40 transition-colors hover:border-white/30 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 ${
                    errors.email ? "border-red-500/50 focus-visible:border-red-500 focus-visible:ring-red-500/25" : ""
                  }`}
                />
                {errors.email && (
                  <p id="email-error" className="text-xs text-red-400 flex items-center gap-1.5 mt-1 animate-in fade-in-0 slide-in-from-top-1">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {errors.email}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-medium text-foreground/90">
                  Your Message
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Tell us how we can help you..."
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={errors.message ? "true" : "false"}
                  aria-describedby={errors.message ? "message-error" : undefined}
                  className={`min-h-[128px] resize-none rounded-md border-white/20 bg-white/5 px-4 py-3 placeholder:text-white/40 transition-colors hover:border-white/30 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 ${
                    errors.message ? "border-red-500/50 focus-visible:border-red-500 focus-visible:ring-red-500/25" : ""
                  }`}
                />
                {errors.message && (
                  <p id="message-error" className="text-xs text-red-400 flex items-center gap-1.5 mt-1 animate-in fade-in-0 slide-in-from-top-1">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {errors.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="h-12 w-full cursor-pointer rounded-md font-semibold shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/30 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <Send className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </AnimateSection>
  )
}
