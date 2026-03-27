import Link from "next/link";

export default function LandingCTA() {
  return (
    <section className="relative overflow-hidden bg-[#181D25] py-20 lg:py-28">
      {/* Gradient background */}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-[#4F7CFF]/10 via-transparent to-[#4F7CFF]/5" />
      <div className="pointer-events-none absolute -bottom-20 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#4F7CFF]/10 blur-[120px]" />

      <div className="container relative mx-auto px-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-white/5 bg-[#222B3A] p-12 text-center lg:p-16">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#4F7CFF]/10">
            <svg className="h-8 w-8 text-[#4F7CFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Start Your Learning Journey Today
          </h2>
          <p className="mx-auto mb-10 max-w-lg text-lg text-[#A0A7B5]">
            Join over 50,000 learners worldwide and unlock access to thousands of expert-led courses. Your future starts now.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="#"
              className="rounded-xl bg-[#4F7CFF] px-10 py-4 text-sm font-semibold text-white shadow-lg shadow-[#4F7CFF]/25 transition-all duration-300 hover:scale-105 hover:bg-[#3D6AE8] hover:shadow-xl hover:shadow-[#4F7CFF]/40"
            >
              Join Now — It&apos;s Free
            </Link>
            <Link
              href="#"
              className="rounded-xl border border-white/10 bg-white/5 px-10 py-4 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:border-[#4F7CFF]/50 hover:bg-white/10"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
