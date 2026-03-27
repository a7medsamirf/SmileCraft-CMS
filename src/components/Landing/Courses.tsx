import Image from "next/image";
import Link from "next/link";

const courses = [
  {
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=250&fit=crop",
    title: "Full-Stack Web Development",
    description: "Build modern web applications from scratch using React, Node.js, and databases.",
    lessons: 48,
    level: "Intermediate",
  },
  {
    image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=250&fit=crop",
    title: "Python for Data Science",
    description: "Master Python, pandas, and machine learning fundamentals with real datasets.",
    lessons: 36,
    level: "Beginner",
  },
  {
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=250&fit=crop",
    title: "Cloud & DevOps Mastery",
    description: "Learn AWS, Docker, Kubernetes, and CI/CD pipelines for scalable infrastructure.",
    lessons: 42,
    level: "Advanced",
  },
  {
    image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=250&fit=crop",
    title: "UI/UX Design Bootcamp",
    description: "Create stunning user interfaces and seamless user experiences with Figma and more.",
    lessons: 30,
    level: "Beginner",
  },
];

const levelColors: Record<string, string> = {
  Beginner: "bg-green-500/15 text-green-400",
  Intermediate: "bg-yellow-500/15 text-yellow-400",
  Advanced: "bg-red-500/15 text-red-400",
};

export default function Courses() {
  return (
    <section id="courses" className="bg-[#1A1F2B] py-20 lg:py-28">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="mb-4 inline-block rounded-full border border-[#4F7CFF]/30 bg-[#4F7CFF]/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-[#4F7CFF]">
            Popular Courses
          </span>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Explore Our{" "}
            <span className="bg-linear-to-r from-[#4F7CFF] to-[#7B9FFF] bg-clip-text text-transparent">
              Top Courses
            </span>
          </h2>
          <p className="text-lg text-[#A0A7B5]">
            Curated courses designed by industry experts to help you achieve your goals faster.
          </p>
        </div>

        {/* Course Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((course, idx) => (
            <div
              key={idx}
              className="group overflow-hidden rounded-2xl border border-white/5 bg-[#222B3A] transition-all duration-300 hover:-translate-y-2 hover:border-[#4F7CFF]/30 hover:shadow-xl hover:shadow-[#4F7CFF]/5"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#222B3A]/60 to-transparent" />
                <span className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${levelColors[course.level]}`}>
                  {course.level}
                </span>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="mb-2 text-lg font-semibold text-white transition-colors duration-300 group-hover:text-[#4F7CFF]">
                  {course.title}
                </h3>
                <p className="mb-5 text-sm leading-relaxed text-[#A0A7B5]">
                  {course.description}
                </p>
                <div className="mb-5 flex items-center gap-2 text-xs text-[#A0A7B5]">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{course.lessons} Lessons</span>
                </div>
                <Link
                  href="#"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-[#4F7CFF]/10 py-2.5 text-sm font-semibold text-[#4F7CFF] transition-all duration-300 hover:bg-[#4F7CFF] hover:text-white hover:shadow-lg hover:shadow-[#4F7CFF]/25"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
