import Image from "next/image"
import { Star } from "lucide-react"

const testimonials = [
  {
    quote: "Shaved seconds off my lap times. Night and day difference.",
    name: "Jane Smith",
    avatar: "/placeholder-user.jpg",
    rating: 5,
    featured: true,
  },
  {
    quote: "Incredible balance. The car feels planted every stint.",
    name: "Tom Williams",
    avatar: "/placeholder-user.jpg",
    rating: 4,
  },
  {
    quote: "Lets me focus on racing, not tinkering.",
    name: "Michael Brown",
    avatar: "/placeholder-user.jpg",
    rating: 4,
  },
  {
    quote: "Pro-level balance without guesswork. Easy to dial in.",
    name: "Emily Carter",
    avatar: "/placeholder-user.jpg",
    rating: 5,
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
              {"Don't just take out word for it - see what actual users of our service have to say."}
            </p>
          </div>
          <div className="text-sm text-white/60">
            4.8 average rating from 2,300+ drivers
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.name}
              className="relative overflow-hidden rounded-2xl border border-white/8 bg-[linear-gradient(160deg,#1f1329_0%,#241027_45%,#1a191e_100%)] p-6 flex h-full flex-col items-center text-center"
            >
              <div className="min-h-[96px] flex items-center">
                <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                  “{testimonial.quote}”
                </p>
              </div>

              <div className="mt-5 flex h-5 items-center justify-center gap-1 text-[#F5B431]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={`${testimonial.name}-star-${index}`}
                    className="h-4 w-4"
                    fill={index < testimonial.rating ? "currentColor" : "none"}
                    stroke="currentColor"
                  />
                ))}
              </div>

              <div className="mt-5 flex min-h-[84px] flex-col items-center gap-2">
                <div className="relative h-12 w-12 overflow-hidden rounded-full border border-white/15">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-white/90 font-medium">{testimonial.name}</p>
                  <p className="text-xs text-white/40">Verified Customer</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
