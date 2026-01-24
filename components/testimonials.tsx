import Image from "next/image"

const testimonials = [
  {
    quote:
      "The setup felt stable right away. I spent less time tweaking and more time focusing on race pace and consistency.",
    name: "Cameron Williamson",
    role: "iRacing Competitive Driver",
    logo: "/images/sublogo-1.png",
  },
  {
    quote:
      "These setups are race-ready out of the box. My lap times improved and the car felt predictable over long stints.",
    name: "Albert Flores",
    role: "Formula Series Driver",
    logo: "/images/sublogo-3.png",
    featured: true,
  },
  {
    quote:
      "As a non-pro driver, the setups helped me understand car balance better. The difference was noticeable from the first session.",
    name: "Eleanor Pena",
    role: "Sim Racing Enthusiast",
    logo: "/images/sublogo-2.png",
  },
  {
    quote:
      "Pro-level balance without the guesswork. Easy to dial in and consistent across sessions.",
    name: "Courtney Henry",
    role: "GT Series Driver",
    logo: "/images/sublogo-1.png",
  },
]

export function Testimonials() {
  return (
    <section className="py-16">
      <div className="max-w-8xl mx-auto">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-display text-white">
              Testimonials
            </h3>
            <p className="mt-3 text-white/70 text-sm sm:text-base">
              {"Don't just take our word for it - see what actual users of our service have to say."}
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3 xl:grid-cols-4">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.name}
              className={`relative overflow-hidden rounded-2xl border border-white/10 p-6 flex h-full flex-col text-left ${
                testimonial.featured
                  ? "bg-[linear-gradient(160deg,#3b0a50_0%,#6d0aa0_45%,#3b0a50_100%)]"
                  : "bg-[linear-gradient(160deg,#1f1329_0%,#241027_45%,#1a191e_100%)]"
              }`}
            >
              <div className="flex items-start justify-between">
                <Image
                  src={testimonial.logo}
                  alt={`${testimonial.name} series logo`}
                  width={120}
                  height={32}
                  className="h-6 w-auto opacity-40"
                />
              </div>

              <div className="mt-6 min-h-[120px]">
                <p className="text-sm sm:text-base text-white/75 leading-relaxed">
                  “{testimonial.quote}”
                </p>
              </div>

              <div className="mt-auto pt-6">
                <p className="text-white/90 font-medium">{testimonial.name}</p>
                <p className="text-xs text-white/50">{testimonial.role}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
