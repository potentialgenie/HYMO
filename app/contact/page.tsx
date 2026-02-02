"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

interface FormErrors {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  message?: string
}

const inputClass =
  "input-dark h-12 rounded-full bg-[#151515] border-white/10 text-white px-4 placeholder:text-white/50 focus-visible:ring-0 focus-visible:border-primary/50"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const validateField = (name: keyof FormErrors, value: string): string | undefined => {
    switch (name) {
      case "firstName":
        if (!value.trim()) return "First name is required"
        return undefined
      case "lastName":
        if (!value.trim()) return "Last name is required"
        return undefined
      case "email":
        if (!value.trim()) return "Email is required"
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) return "Please enter a valid email address"
        return undefined
      case "phone":
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
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const error = validateField(name as keyof FormErrors, value)
    if (error) setErrors((prev) => ({ ...prev, [name]: error }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: FormErrors = {}
    ;(Object.keys(formData) as (keyof typeof formData)[]).forEach((key) => {
      const error = validateField(key, formData[key])
      if (error) newErrors[key] = error
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setIsSuccess(true)
      setFormData({ firstName: "", lastName: "", email: "", phone: "", message: "" })
      setTimeout(() => setIsSuccess(false), 5000)
    } catch {
      setErrors({ message: "Failed to send message. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#151515] relative overflow-hidden pt-20">
      {/* Purple gradient from top */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(228,0,188,0.32)_0%,rgba(31,19,41,0.3)_40%,rgba(21,21,21,0)_60%)]"/>

      <Navbar />

      <section className="relative pb-20 px-6 sm:px-12 lg:px-24 overflow-hidden">
        <div className="w-full max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display tracking-tight mb-4 text-white">
              Get in Touch with{" "}
              <span className="text-brand-gradient">Our Team</span>
            </h1>
            <p className="mt-4 text-white/60 text-sm sm:text-base max-w-xl mx-auto">
              Have a question about setups, pricing, or support? We&apos;re here to help you get race-ready.
            </p>
          </div>

          {/* Form container */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {isSuccess && (
                <div className="rounded-full bg-green-500/10 border border-green-500/30 p-4 flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
                  <p className="text-sm text-green-400 font-medium">
                    Message sent successfully! We&apos;ll get back to you soon.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-white/80">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Your Name"
                  value={formData.firstName || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${inputClass} ${errors.firstName ? "border-[#CC00BC]/50" : ""}`}
                />
                {errors.firstName && (
                  <p className="text-xs text-[#E800BC] flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${inputClass} ${errors.email ? "border-[#CC00BC]/50" : ""}`}
                />
                {errors.email && (
                  <p className="text-xs text-[#E800BC] flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-white/80">
                  Message
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Write your message here..."
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`input-dark min-h-[120px] resize-none rounded-2xl bg-[#151515] border-white/10 text-white px-4 py-3 placeholder:text-white/50 focus-visible:ring-0 focus-visible:border-primary/50 ${
                    errors.message ? "border-[#CC00BC]/50" : ""
                  }`}
                />
                {errors.message && (
                  <p className="text-xs text-[#E800BC] flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-full font-display font-semibold tracking-wide bg-brand-gradient text-white hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
