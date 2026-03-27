const features = [
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    title: "Expert-Led Courses",
    description:
      "Learn from industry professionals with years of real-world experience. Every course is carefully curated and peer-reviewed.",
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: "Interactive Learning",
    description:
      "Hands-on projects, quizzes, and coding challenges keep you engaged while building practical skills you can use immediately.",
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Learn at Your Pace",
    description:
      "Access content anytime, anywhere. Our flexible platform adapts to your schedule so you never miss a lesson.",
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    title: "Verified Certificates",
    description:
      "Earn recognized certificates upon completion. Showcase your achievements to employers and boost your career prospects.",
  },
];

export default function Features() {
  return (
    <section id="features" className="bg-[#181D25] py-20 lg:py-28">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="mb-4 inline-block rounded-full border border-[#4F7CFF]/30 bg-[#4F7CFF]/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-[#4F7CFF]">
            Why Choose Us
          </span>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Everything You Need to{" "}
            <span className="bg-linear-to-r from-[#4F7CFF] to-[#7B9FFF] bg-clip-text text-transparent">
              Succeed
            </span>
          </h2>
          <p className="text-lg text-[#A0A7B5]">
            Our platform provides all the tools and resources you need to master new skills and advance your career.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group rounded-2xl border border-white/5 bg-[#222B3A] p-7 transition-all duration-300 hover:-translate-y-2 hover:border-[#4F7CFF]/30 hover:shadow-xl hover:shadow-[#4F7CFF]/5"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[#4F7CFF]/10 text-[#4F7CFF] transition-all duration-300 group-hover:bg-[#4F7CFF] group-hover:text-white group-hover:shadow-lg group-hover:shadow-[#4F7CFF]/25">
                {feature.icon}
              </div>
              <h3 className="mb-3 text-lg font-semibold text-white">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-[#A0A7B5]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
