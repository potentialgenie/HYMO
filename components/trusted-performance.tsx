import Image from "next/image"

export function TrustedPerformance() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(228,0,188,0.22)_0%,rgba(31,19,41,0.2)_40%,rgba(26,25,30,0)_70%)]" />
      <div className="relative z-10 w-full">
        <div className="text-center mb-10">
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-display text-white">
            Trusted Performance
          </h3>
          <p className="text-3xl sm:text-4xl md:text-5xl font-display text-brand-gradient bg-clip-text text-transparent">
            Proven Results
          </p>
        </div>
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="grid grid-cols-1 md:grid-cols-8 gap-4 items-center w-full">
            <div className="md:col-span-2 rounded-full border border-white/10 bg-[#110e0f]/80 h-[136px] flex items-center justify-center shadow-[0_0_40px_rgba(124,58,237,0.12)]">
              <Image
                src="/images/hymo-logo.png"
                alt="HYMO Setups"
                width={140}
                height={48}
                className="h-10 w-auto opacity-90"
              />
            </div>
            <div className="md:col-span-4 rounded-full border border-white/10 bg-[#27102be6]/90 h-[136px] flex items-center justify-center gap-4 shadow-[0_0_40px_rgba(124,58,237,0.16)]">
              <span className="text-4xl sm:text-[48px] text-purple-400">5,000+</span>
              <span className="text-sm sm:text-xl text-white/80 tracking-wide">
                Worldwide Setup Downloads
              </span>
            </div>
            <div className="md:col-span-2 rounded-full border border-white/10 bg-[#110e0f]/80 h-[136px] flex items-center justify-center shadow-[0_0_40px_rgba(124,58,237,0.12)]">
              <Image
                src="/images/hymo-logo.png"
                alt="HYMO Setups"
                width={140}
                height={48}
                className="h-10 w-auto opacity-90"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-8 gap-4 items-center w-full">
            <div className="md:col-span-3 rounded-full border border-white/10 bg-[#27102be6]/80 h-[136px] flex items-center justify-center gap-4 shadow-[0_0_40px_rgba(124,58,237,0.12)]">
              <span className="text-purple-400 text-2xl sm:text-[26px] pb-1 ">↑</span> <span className="text-3xl sm:text-4xl text-purple-400"> 70%</span>
              <span className="text-sm sm:text-[20px] text-white/80 tracking-wide">
                <span className="block">Used in Competitive</span>
                <span className="block">Racing</span>
              </span>
            </div>
            <div className="md:col-span-2 rounded-full border border-white/10 bg-[#110e0f]/80 h-[136px] flex items-center justify-center shadow-[0_0_40px_rgba(124,58,237,0.12)]">
              <Image
                src="/images/hymo-logo.png"
                alt="HYMO Setups"
                width={140}
                height={48}
                className="h-10 w-auto opacity-90"
              />
            </div>
            <div className="md:col-span-3 rounded-full bg-linear-to-r from-[#7000BF] to-[#E400BC] h-[136px] flex items-center justify-center gap-4 shadow-[0_0_50px_rgba(177,0,214,0.35)]">
              <span className="text-4xl sm:text-5xl text-white">0.3 - 0.8s</span>
              <span className="text-sm sm:text-[20px] text-white/90 tracking-wide">
                <span className="block">Average Lap</span>
                <span className="block">Time Gain</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
