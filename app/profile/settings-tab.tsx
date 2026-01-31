"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getUser, apiFetch } from "@/lib/auth"
import { apiUrl } from "@/lib/api"
import { Loader2, AlertCircle, CheckCircle2, ChevronDown, Info } from "lucide-react"

const inputClass =
  "input-dark h-12 rounded-full bg-[#252525] border-white/10 text-white/90 placeholder:text-white/40 focus-visible:ring-0 focus-visible:border-white/30"

export function SettingsTab() {
  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    email: "",
    phone: "",
    address: "",
    address2: "",
    country: "",
    state: "",
    city: "",
    zip: "",
    bio: "",
  })
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const user = getUser()
    if (user) {
      setFormData({
        name: user.name || "",
        lastname: user.lastname || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        address2: user.address2 || "",
        country: user.country || "",
        state: user.state || "",
        city: user.city || "",
        zip: user.zip || "",
        bio: (user as { bio?: string }).bio || "",
      })
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setProfilePicture(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await apiFetch(apiUrl("/api/v1/profile/update"), {
        method: "PUT",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(formData),
      })

      const contentType = response.headers.get("content-type") || ""
      const data = contentType.includes("application/json")
        ? await response.json().catch(() => null)
        : await response.text().catch(() => "")

      if (!response.ok) {
        const errorMessage =
          (typeof data === "object" && data && "message" in data && typeof data.message === "string" && data.message) ||
          (typeof data === "string" && data) ||
          "Failed to update profile. Please try again."
        throw new Error(errorMessage)
      }

      setSuccess("Profile updated successfully!")
      if (typeof data === "object" && data && "user" in data) {
        localStorage.setItem("hymo_user", JSON.stringify(data.user))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mt-8">
      {error && (
        <div className="mb-6 flex items-center gap-2 p-4 rounded-full bg-[#CC00BC]/10 border border-[#CC00BC]/30 text-sm text-[#E800BC]">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 flex items-center gap-2 p-4 rounded-full bg-green-500/10 border border-green-500/30 text-sm text-green-400">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          <span className="font-medium">{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div>
          {/* Profile Photo Row */}
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-[#2A2A2A] flex items-center justify-center flex-shrink-0">
              {profilePicture ? (
                <Image src={profilePicture} alt="Profile" fill className="object-cover" />
              ) : (
                <span className="text-white text-xl font-semibold">
                  {formData.name ? formData.name.charAt(0).toUpperCase() : "U"}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-base font-semibold text-white">Profile Photo</p>
                <p className="text-xs text-white/40 mt-1">PNG, JPEG (Less than 5MB)</p>
              </div>
              <label htmlFor="profile-picture">
                <input
                  id="profile-picture"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  onClick={() => document.getElementById("profile-picture")?.click()}
                  className="h-7 rounded-full bg-white/2 border border-white/15 text-white/80 hover:text-white hover:bg-white/15 transition-all duration-200"
                >
                  Change Picture
                </Button>
              </label>
            </div>
          </div>

          {/* Form Fields */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-7">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white/80">First Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="First name"
                value={formData.name}
                onChange={handleInputChange}
                className={inputClass}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastname" className="text-white/80">Last Name</Label>
              <Input
                id="lastname"
                name="lastname"
                type="text"
                placeholder="Last name"
                value={formData.lastname}
                onChange={handleInputChange}
                className={inputClass}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                className={inputClass}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white/80">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleInputChange}
                className={inputClass}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address" className="text-white/80">Address</Label>
              <Input
                id="address"
                name="address"
                type="text"
                placeholder="Address"
                value={formData.address}
                onChange={handleInputChange}
                className={inputClass}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address2" className="text-white/80">Address 2</Label>
              <Input
                id="address2"
                name="address2"
                type="text"
                placeholder="Apartment or suite"
                value={formData.address2}
                onChange={handleInputChange}
                className={inputClass}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country" className="text-white/80">Country</Label>
              <div className="relative">
                <Input
                  id="country"
                  name="country"
                  type="text"
                  placeholder="Country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className={`${inputClass} pr-10`}
                  disabled={isSubmitting}
                />
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="state" className="text-white/80">State</Label>
              <div className="relative">
                <Input
                  id="state"
                  name="state"
                  type="text"
                  placeholder="State"
                  value={formData.state}
                  onChange={handleInputChange}
                  className={`${inputClass} pr-10`}
                  disabled={isSubmitting}
                />
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="city" className="text-white/80">City</Label>
              <div className="relative">
                <Input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={`${inputClass} pr-10`}
                  disabled={isSubmitting}
                />
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip" className="text-white/80">Zip</Label>
              <div className="relative">
                <Input
                  id="zip"
                  name="zip"
                  type="text"
                  placeholder="Zip"
                  value={formData.zip}
                  onChange={handleInputChange}
                  className={`${inputClass} pr-10`}
                  disabled={isSubmitting}
                />
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              </div>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="bio" className="text-white/80">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                placeholder="Write your message here..."
                value={formData.bio}
                onChange={handleInputChange}
                className="input-dark min-h-[140px] rounded-2xl bg-[#151515] border-white/10 text-white/90 placeholder:text-white/40 focus-visible:ring-0 focus-visible:border-white/30"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Footer Actions */}
          {success ? (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-white/50">
                <Info className="h-4 w-4" />
                <span>Your changes will be saved.</span>
              </div>
            </div>
          ) : (
            <div className="mt-8 flex items-center justify-end gap-3">
              <Button
                type="button"
                disabled={isSubmitting}
                className="h-9 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-9 rounded-full px-5 text-[14px] font-display bg-brand-gradient text-white tracking-wide hover:brightness-110"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
