import Image from "next/image"

const logos = [
  { src: "/images/sublogo-1.png", alt: "Assetto Corsa Competizione" },
  { src: "/images/sublogo-2.png", alt: "Le Mans Ultimate" },
  { src: "/images/sublogo-3.png", alt: "iRacing" },
]

export function BrandingMarquee() {
  const trackLogos = [...logos, ...logos, ...logos]

  return (
    <section className="pt-8 pb-6">
      <div className="relative overflow-hidden border-white/10 bg-[#120f17]/70 px-6 py-4">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-[linear-gradient(90deg,#1a191e_0%,rgba(26,25,30,0)_100%)]" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-[linear-gradient(270deg,#1a191e_0%,rgba(26,25,30,0)_100%)]" />

        <div className="marquee-track items-center gap-12">
          {trackLogos.map((logo, index) => (
            <Image
              key={`${logo.src}-${index}`}
              src={logo.src}
              alt={logo.alt}
              width={160}
              height={48}
              className="h-8 w-auto opacity-60"
            />
          ))}
          {trackLogos.map((logo, index) => (
            <Image
              key={`${logo.src}-dup-${index}`}
              src={logo.src}
              alt={logo.alt}
              width={160}
              height={48}
              className="h-8 w-auto opacity-60"
              aria-hidden
            />
          ))}
        </div>
      </div>
    </section>
  )
}
