import Image from "next/image";

const testimonials = [
  {
    avatar: "https://i.pravatar.cc/80?img=32",
    name: "Sarah Johnson",
    role: "Software Engineer",
    text: "LearnHub completely transformed my career. The courses are incredibly well-structured and the instructors are world-class. I landed my dream job within 3 months!",
    rating: 5,
  },
  {
    avatar: "https://i.pravatar.cc/80?img=44",
    name: "Michael Chen",
    role: "Data Scientist",
    text: "The hands-on projects made all the difference. I went from knowing nothing about data science to building real ML models. The community support is amazing too.",
    rating: 5,
  },
  {
    avatar: "https://i.pravatar.cc/80?img=47",
    name: "Emily Rodriguez",
    role: "UX Designer",
    text: "Best investment I've ever made in my education. The UI/UX bootcamp gave me practical skills I use every day. Highly recommend to anyone looking to level up.",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="bg-[#1A1F2B] py-20 lg:py-28">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="mb-4 inline-block rounded-full border border-[#4F7CFF]/30 bg-[#4F7CFF]/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-[#4F7CFF]">
            Testimonials
          </span>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
            What Our{" "}
            <span className="bg-linear-to-r from-[#4F7CFF] to-[#7B9FFF] bg-clip-text text-transparent">
              Students Say
            </span>
          </h2>
          <p className="text-lg text-[#A0A7B5]">
            Join thousands of satisfied learners who have transformed their careers through our platform.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="group rounded-2xl border border-white/5 bg-[#222B3A] p-7 transition-all duration-300 hover:-translate-y-2 hover:border-[#4F7CFF]/30 hover:shadow-xl hover:shadow-[#4F7CFF]/5"
            >
              {/* Stars */}
              <div className="mb-5 flex gap-1">
                {[...Array(t.rating)].map((_, i) => (
                  <svg key={i} className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="mb-6 text-sm leading-relaxed text-[#A0A7B5]">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-[#4F7CFF]/30">
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-[#A0A7B5]">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
