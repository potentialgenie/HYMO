"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiFetch } from "@/lib/auth"
import { apiUrl } from "@/lib/api"
import { Loader2, AlertCircle, Eye, EyeOff, Info } from "lucide-react"

const inputClass =
  "input-dark h-12 rounded-full bg-[#252525] border-white/10 text-white/90 placeholder:text-white/40 focus-visible:ring-0 focus-visible:border-white/30"

export function AccountPasswordTab() {
  const [passwordData, setPasswordData] = useState({ newPassword: "", confirmPassword: "" })
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false)
  const [showPasswordConfirmDialog, setShowPasswordConfirmDialog] = useState(false)

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
    setPasswordError(null)
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long")
      return
    }
    setShowPasswordConfirmDialog(true)
  }

  const handlePasswordChange = async () => {
    setShowPasswordConfirmDialog(false)
    setIsPasswordSubmitting(true)
    setPasswordError(null)
    setPasswordSuccess(null)

    try {
      const response = await apiFetch(apiUrl("/api/v1/profile/change-password"), {
        method: "PUT",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          password: passwordData.newPassword,
          password_confirmation: passwordData.confirmPassword,
        }),
      })

      const contentType = response.headers.get("content-type") || ""
      const data = contentType.includes("application/json")
        ? await response.json().catch(() => null)
        : await response.text().catch(() => "")

      if (!response.ok) {
        const errorMessage =
          (typeof data === "object" && data && "message" in data && typeof data.message === "string" && data.message) ||
          (typeof data === "string" && data) ||
          "Failed to change password. Please try again."
        throw new Error(errorMessage)
      }

      setPasswordSuccess("Password changed successfully!")
      setPasswordData({ newPassword: "", confirmPassword: "" })
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Failed to change password. Please try again.")
    } finally {
      setIsPasswordSubmitting(false)
    }
  }

  return (
    <>
      <div className="mt-10">
        {passwordError && (
          <div className="mb-6 flex items-center gap-2 p-4 rounded-full bg-[#CC00BC]/10 border border-[#CC00BC]/30 text-sm text-[#E800BC]">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="font-medium">{passwordError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit}>
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-white/80">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordInputChange}
                    required
                    disabled={isPasswordSubmitting}
                    className={`${inputClass} pr-12`}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition"
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                    disabled={isPasswordSubmitting}
                  >
                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-xs text-white/40">At least 8 characters</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white/80">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordInputChange}
                    required
                    disabled={isPasswordSubmitting}
                    className={`${inputClass} pr-12`}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    disabled={isPasswordSubmitting}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            {passwordSuccess ? (
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
                  disabled={isPasswordSubmitting}
                  onClick={() => {
                    setPasswordData({ newPassword: "", confirmPassword: "" })
                    setPasswordError(null)
                  }}
                  className="h-9 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPasswordSubmitting}
                  className="h-9 rounded-full px-5 text-[14px] font-display bg-brand-gradient text-white tracking-wide hover:brightness-110"
                >
                  {isPasswordSubmitting ? (
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

      {/* Password Confirmation Dialog */}
      {showPasswordConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md mx-4 rounded-2xl bg-[#151515] border border-white/10 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)] animate-in fade-in-0 zoom-in-95 duration-200">
            <h3 className="text-white font-display text-2xl tracking-tight mb-3">
              Change password?
            </h3>
            <p className="text-white/60 text-sm mb-6">
              Are you sure you want to update your password?
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                onClick={() => setShowPasswordConfirmDialog(false)}
                className="h-9 rounded-full bg-white/10 border border-white/15 text-white/80 hover:text-white hover:bg-white/15 transition-all duration-200 font-display tracking-wide"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handlePasswordChange}
                className="h-9 rounded-full px-5 text-[14px] font-display bg-brand-gradient text-white tracking-wide hover:brightness-110"
              >
                Change Password
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
