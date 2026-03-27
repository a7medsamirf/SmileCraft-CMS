import Link from "next/link";
import Image from "next/image";
import Button from '../SharesComponent/Button';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white dark:bg-[#181D25] py-20 lg:py-32">
      {/* Background gradient glow */}
      <div className="pointer-events-none absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-[#4F7CFF]/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-[#4F7CFF]/5 blur-[100px]" />

      <div className="container relative mx-auto grid items-center gap-12 px-6 lg:grid-cols-2 lg:gap-20">
        {/* Left Column */}
        <div className="max-w-xl">
          <span className="mb-6 inline-block rounded-full border border-[#4F7CFF]/30 bg-[#4F7CFF]/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-[#4F7CFF]">
            🚀 &nbsp;#1 Online Learning Platform
          </span>
          <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
            Master New Skills
            <br />
            <span className="bg-linear-to-r from-[#4F7CFF] to-[#7B9FFF] bg-clip-text text-transparent">
              Unlock Your Future
            </span>
          </h1>
          <p className="mb-10 max-w-md text-lg leading-relaxed text-[#A0A7B5]">
            Explore thousands of expert-led courses designed to help you grow.
            Learn at your own pace with interactive lessons and real-world projects.
          </p>
          <div className="flex flex-wrap gap-4">
              <Button label="Start Learning" variant="brand" size="xl" href="#" />
              <Button label="Explore Courses" variant="glass" size="xl" href="#courses" />
          </div>

          {/* Social proof */}
          <div className="mt-12 flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-10 w-10 overflow-hidden rounded-full border-2 border-[#181D25]"
                >
                  <Image
                    src={`https://i.pravatar.cc/80?img=${i + 10}`}
                    alt={`Student ${i}`}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">10,000+ Students</p>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-3.5 w-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-1 text-xs text-[#A0A7B5]">4.9/5 rating</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column — Illustration */}
        <div className="relative flex items-center justify-center">
          <div className="absolute h-72 w-72 rounded-full bg-[#4F7CFF]/20 blur-[80px] lg:h-96 lg:w-96" />
          <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-[#4F7CFF]/10">
            <Image
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=450&fit=crop"
              alt="Students collaborating"
              width={600}
              height={450}
              className="h-auto w-full object-cover"
              priority
            />
            {/* Floating card overlay */}
            <div className="absolute bottom-6 left-6 right-6 rounded-xl border border-white/10 bg-[#222B3A]/90 p-4 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#A0A7B5]">Active Learners</p>
                  <p className="text-lg font-bold text-white">2,847 Online</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
                  <div className="h-3 w-3 animate-pulse rounded-full bg-green-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
