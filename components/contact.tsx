"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function Contact() {
  return (
    <section id="contact" className="relative pt-40 px-16 sm:px-30 lg:px-46 overflow-hidden">
      <motion.div
        className="relative overflow-hidden rounded-2xl"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.4 }}
      >
        <div className="absolute inset-0">
          <Image
            src="/images/contact-bg.jpg"
            alt=""
            width={2000}
            height={2000}
            className="w-full xl:translate-y-[-40%] lg:translate-y-[-20%] md:translate-y-[-20%]"
            sizes="(max-width: 768px) 100vw, 1024px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-black/20" />
        </div>
        <div className="relative py-28 px-6 sm:px-10 text-left">
          <h3 className={cn("font-display text-3xl sm:text-4xl md:text-5xl mb-2")}>
            Not sure which plan fits you?
          </h3>
          <p className="text-white/80 mb-6 ">
            Get in touch and we&apos;ll help you choose the right setup for your racing goals.
          </p>
          <Link href="/contact" className="inline-block">
            <Button
              size="lg"
              className="flex cursor-pointer h-12 px-16 rounded-full text-sm font-semibold tracking-wide transition-all duration-200 bg-brand-gradient text-white hover:brightness-110"
            >
              Contact Us
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  )
}
