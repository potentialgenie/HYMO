import Image from "next/image"

export function SetupDifference() {
  return (
    <section className="mt-8 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(228,0,188,0.2)_0%,rgba(31,19,41,0.2)_40%,rgba(26,25,30,0)_70%)]" />
      <div className="relative overflow-hidden py-25 w-full">
        <div className="relative z-10 flex flex-col items-start gap-10 lg:flex-row lg:items-center lg:gap-12 w-full">
          <div className="max-w-xl flex flex-col gap-55">
            <div className="flex flex-col gap-4">
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-display text-white w-full">
                The Difference
              </h3>
              <p className="text-3xl sm:text-4xl md:text-5xl font-display">
                <span className="text-white">Behind </span>
                <span className="text-[#E400BC]"><span className="text-[#7000BF]">Our</span> Setups</span>
              </p>
            </div>
            <p className="mt-6 max-w-sm flex flex-col gap-4 text-sm sm:text-[20px] text-white/60 line-">
              <span>Built for confidence, </span>
              <span>consistency, and competitive</span>
              <span>performance</span>
            </p>
          </div>

          <div className="absolute left-35 w-full flex-1 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-5xl aspect-[17/8] mx-auto">
              <Image
                src="/images/ads.png"
                alt="Setup performance preview"
                fill  
                className="object-contain"
                sizes="(max-width: 1024px) 150vw, (max-width: 1440px) 140vw, 130vw"
              />
            </div>

            <div className="pointer-events-none absolute left-2/7 top-1/3 -translate-x-1/3 rounded-[2.5rem] border border-white/15 bg-[linear-gradient(90deg,rgba(17,15,21,0.96)_10%,rgba(38,17,39,0.97)_25%,rgba(40,24,40,0.6)_50%,rgba(34,34,38,0.1)_80%,rgba(17,15,21,0.1)_100%)] px-4 py-2.5 text-[24px] font-display text-white/95 shadow-lg shadow-black/40 backdrop-blur-md whitespace-nowrap tracking-wide">
              Performance &amp; Consistency
            </div>
            <div className="pointer-events-none absolute right-0 top-4/7 -translate-x-1/3 rounded-[2.5rem] border border-white/15 bg-[linear-gradient(90deg,rgba(17,15,21,0.96)_10%,rgba(38,17,39,0.97)_25%,rgba(40,24,40,0.6)_50%,rgba(34,34,38,0.1)_80%,rgba(17,15,21,0.1)_100%)] px-4 py-2.5 text-2xl font-display text-white/95 shadow-lg shadow-black/40 backdrop-blur-md whitespace-nowrap tracking-wide">
              Built by Competitive Drivers
            </div>
            <div className="pointer-events-none absolute left-3/7 bottom-10 -translate-x-1/2 rounded-[2.5rem] border border-white/15 bg-[linear-gradient(90deg,rgba(17,15,21,0.96)_10%,rgba(38,17,39,0.97)_25%,rgba(40,24,40,0.6)_50%,rgba(34,34,38,0.1)_80%,rgba(17,15,21,0.1)_100%)] px-4 py-2.5 text-2xl font-display text-white/95 shadow-lg shadow-black/40 backdrop-blur-md whitespace-nowrap tracking-wide">
              Easy to Use
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
