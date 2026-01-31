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
    <AnimateSection id="contact" className="relative py-24 px-16 sm:px-30 lg:px-46 overflow-hidden">
      {/* Seamless gradient transition from pricing/FAQ */}
      <div className="absolute top-0 left-0 right-0 h-80 bg-[linear-gradient(180deg,#151515_0%,rgba(31,19,41,0.8)_35%,rgba(31,19,41,0.35)_70%,rgba(31,19,41,0)_100%)] z-10" />
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
        {/* Enhanced seamless gradient overlay - blends with page background */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#151515_0%,rgba(31,19,41,0.55)_45%,rgba(21,21,21,0.65)_100%)]" />
      </div>

      <div className="relative z-10">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Left side - Text content */}
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl mb-6 font-display text-white tracking-tight">
              Got a question?{" "}
              <span className="text-brand-gradient">{"We're here to help."}</span>
            </h2>
            <p className="text-white/80 text-lg mb-8">
              Whether you need support with your setups, have questions about our plans, 
              or want to partner with us, our team is ready to assist you.
            </p>
            
            {/* Contact info */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition-colors hover:border-primary/20">
                <div className="w-11 h-11 rounded-full border border-white/20 bg-white/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs uppercase tracking-wider text-white/60">Email us</p>
                  <a href="mailto:support@hymosetups.com" className="text-white font-medium hover:text-[#E800BC] transition-colors">
                    support@hymosetups.com
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition-colors hover:border-primary/20">
                <div className="w-11 h-11 rounded-full border border-white/20 bg-white/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs uppercase tracking-wider text-white/60">Response time</p>
                  <p className="text-white font-medium">Within 24 hours</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Contact form */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 sm:p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_32px_rgba(232,0,188,0.15)]">
            <div>
              <h3 className="text-2xl font-display font-semibold tracking-tight text-white">Contact Us</h3>
              <p className="mt-1.5 text-sm text-white/60">
                Fill out the form below and {"we'll"} get back to you soon.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {/* Success Message */}
              {isSuccess && (
                <div className="rounded-full bg-green-500/10 border border-green-500/30 p-4 flex items-center gap-3 animate-in fade-in-0 slide-in-from-top-2">
                  <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
                  <p className="text-sm text-green-400 font-medium">
                    Message sent successfully! We'll get back to you soon.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-white/80">
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
                  className={`input-dark h-12 rounded-full bg-[#151515] border-white/10 text-white px-4 placeholder:text-white/50 transition-colors focus-visible:ring-0 focus-visible:border-primary/50 ${
                    errors.name ? "border-[#CC00BC]/50 focus-visible:border-[#CC00BC]" : ""
                  }`}
                />
                {errors.name && (
                  <p id="name-error" className="text-xs text-[#E800BC] flex items-center gap-1.5 mt-1 animate-in fade-in-0 slide-in-from-top-1">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {errors.name}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-white/80">
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
                  className={`input-dark h-12 rounded-full bg-[#151515] border-white/10 text-white px-4 placeholder:text-white/50 transition-colors focus-visible:ring-0 focus-visible:border-primary/50 ${
                    errors.email ? "border-[#CC00BC]/50 focus-visible:border-[#CC00BC]" : ""
                  }`}
                />
                {errors.email && (
                  <p id="email-error" className="text-xs text-[#E800BC] flex items-center gap-1.5 mt-1 animate-in fade-in-0 slide-in-from-top-1">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {errors.email}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-medium text-white/80">
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
                  className={`input-dark min-h-[128px] resize-none rounded-2xl bg-[#151515] border-white/10 text-white px-4 py-3 placeholder:text-white/50 transition-colors focus-visible:ring-0 focus-visible:border-primary/50 ${
                    errors.message ? "border-[#CC00BC]/50 focus-visible:border-[#CC00BC]" : ""
                  }`}
                />
                {errors.message && (
                  <p id="message-error" className="text-xs text-[#E800BC] flex items-center gap-1.5 mt-1 animate-in fade-in-0 slide-in-from-top-1">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {errors.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="h-12 w-full cursor-pointer rounded-full font-display font-semibold tracking-wide transition-all duration-200 bg-brand-gradient text-white hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
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
