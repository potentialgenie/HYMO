"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
}

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-end overflow-hidden pt-16">
      {/* Background image - car on left, object-left for composition */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-bg.jpg"
          alt="Racing Car"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Dark overlay for better text readability */}
        {/* <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/30 to-background/20" /> */}
        {/* Seamless gradient transition to next section */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-b from-transparent via-[#1A191E]/30 to-[#1A191E]" />
      </div>

      {/* Right-aligned content block */}
      <div className="relative z-10 w-full max-w-8xl mx-auto px-4 sm:px-6 md:px-12 lg:px-24 flex justify-end">
        <motion.div
          className="max-w-5xl text-right"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={item}>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-bold tracking-tight uppercase mb-4">
              <span className="text-foreground">Race Like a{" "}
              <span className="text-primary">Pro</span></span>
              <span className="block text-foreground text-3xl sm:text-4xl md:text-4xl lg:text-5xl mt-2 font-bold normal-case">Esport setups tuned by champions</span>
            </h1>
          </motion.div>

          {/* Red separator line */}
          <motion.div
            className="h-0.5 w-80 bg-pink-500 ml-auto mb-6"
            aria-hidden
            variants={item}
          />

          {/* Description */}
          <motion.p
            className="text-foreground/90 text-base sm:text-lg mb-10"
            variants={item}
          >
            Get access to the exact car setups used by professional esports racers. Dominate every track with precision-tuned configurations.
          </motion.p>

          {/* CTA Buttons - BUY NOW filled, BOOK NOW outlined */}
          <motion.div
            className="flex flex-col sm:flex-row items-end justify-end gap-4"
            variants={item}
          >
            <Button
              size="lg"
              className="uppercase text-sm font-semibold px-8 py-6 rounded-md border border-primary transition-transform duration-200 hover:scale-105"
              asChild
            >
              <Link href="/pricing">Buy Now</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="uppercase text-sm font-semibold px-8 py-6 rounded-md bg-transparent border border-white text-white hover:bg-white/10 hover:text-white transition-transform duration-200 hover:scale-105"
              asChild
            >
              <Link href="/#contact">Book Now</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
