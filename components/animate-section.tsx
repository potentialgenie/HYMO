"use client"

import { motion, type HTMLMotionProps } from "framer-motion"

export const defaultViewport = { once: true, amount: 0.1 }
export const defaultTransition = { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }

export function AnimateSection({
  children,
  className,
  delay = 0,
  y = 24,
  ...props
}: {
  delay?: number
  y?: number
} & Omit<HTMLMotionProps<"section">, "initial" | "animate" | "whileInView" | "viewport" | "transition">) {
  return (
    <motion.section
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={defaultViewport}
      transition={{ ...defaultTransition, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.section>
  )
}

export function AnimateStagger({
  children,
  className,
  staggerDelay = 0.08,
  ...props
}: {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
} & HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={defaultViewport}
      variants={{
        visible: {
          transition: { staggerChildren: staggerDelay, delayChildren: 0.1 },
        },
        hidden: {},
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function AnimateItem({
  children,
  className,
  y = 20,
  ...props
}: {
  children: React.ReactNode
  className?: string
  y?: number
} & HTMLMotionProps<"div">) {
  return (
    <motion.div
      variants={{
        visible: { opacity: 1, y: 0 },
        hidden: { opacity: 0, y },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}
