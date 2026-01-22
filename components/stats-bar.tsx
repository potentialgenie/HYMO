"use client"

import { motion } from "framer-motion"
import { Zap, Trophy, Gamepad2 } from "lucide-react"

const stats = [
  { icon: Zap, value: "50K+", label: "Pro Setups", color: "text-primary" },
  { icon: Trophy, value: "Champions", label: "Tuned by Esport Pros", color: "text-primary" },
  { icon: Gamepad2, value: "iRacing · ACC · LMU", label: "Supported Games", color: "text-muted-foreground" },
]

export function StatsBar() {
  return (
    <motion.section
      className="relative py-6 px-4 sm:px-6 lg:px-8 border-y border-border/60 bg-card/40"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4 }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" aria-hidden />

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-16 lg:gap-24">
          {stats.map(({ icon: Icon, value, label, color }, i) => (
            <motion.div
              key={label}
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-primary/30 bg-primary/5 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className={`font-bold text-foreground font-mono text-lg ${color}`}>{value}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" aria-hidden />
    </motion.section>
  )
}
