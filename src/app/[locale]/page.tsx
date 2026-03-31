import { Cairo, Playfair_Display } from "next/font/google";
import "@/features/landing/landing.css";

import {
  LandingNavbar,
  HeroSection,
  StatsSection,
  FeaturesSection,
  StepsSection,
  TestimonialsSection,
  FAQSection,
  BottomCTA,
  LandingFooter,
} from "@/features/landing";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-cairo",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  weight: ["700"],
  style: ["italic"],
});

export default function HomePage() {
  return (
    <div
      className={`${cairo.variable} ${playfair.variable} font-[family-name:var(--font-cairo)] noise-overlay bg-[#060D18] text-[#E2EAF4] min-h-screen overflow-x-hidden`}
    >
      <LandingNavbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <StepsSection />
      <TestimonialsSection />
      <FAQSection />
      <BottomCTA />
      <LandingFooter />
    </div>
  );
}
