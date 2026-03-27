"use client";

import { useState } from "react";
import LanguageSwitcher from "../Settings/LocaleSwitcher";
import ThemeSwitcher from "../Settings/ThemeSwitcher";
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';



export default function LandingNavbar({ locale }: { locale: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = useTranslations('Navbar');
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;


  const navLinks: { href: '/' | '/Product' | '/Pages' | '/Integrations' | '/Blog' | '/Pricing' ; label: string }[] = [
    { href: '/', label: 'link.home' },
    { href: '/Product', label: 'link.Product' },
    { href: '/Pages', label: 'link.Pages' },
    { href: '/Integrations', label: 'link.Integrations' },
    { href: '/Blog', label: 'link.Blog' },
    { href: '/Pricing', label: 'link.Pricing' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-white dark:bg-[#181D25]/90 backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#4F7CFF]">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-white">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">LearnHub</span>
        </Link>

        {/* Desktop Links */}
        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="text-sm font-medium text-[#A0A7B5] transition-colors duration-300 hover:text-white"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
             <LanguageSwitcher currentLocale={locale} />
              <ThemeSwitcher />
          <Link
            href="/"
            className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-[#A0A7B5] transition-all duration-300 hover:border-[#4F7CFF] hover:text-white"
          >
            Login
          </Link>
          <Link
            href="/"
            className="rounded-xl bg-[#4F7CFF] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#4F7CFF]/25 transition-all duration-300 hover:bg-[#3D6AE8] hover:shadow-[#4F7CFF]/40"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-white transition-colors duration-300 hover:bg-white/5 md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#181D25] px-6 pb-6 pt-4 md:hidden">
          <ul className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block text-sm font-medium text-[#A0A7B5] transition-colors duration-300 hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/"
              className="rounded-xl border border-white/10 px-5 py-2.5 text-center text-sm font-medium text-[#A0A7B5] transition-all duration-300 hover:border-[#4F7CFF] hover:text-white"
            >
              Login
            </Link>
            <Link
              href="/"
              className="rounded-xl bg-[#4F7CFF] px-5 py-2.5 text-center text-sm font-semibold text-white shadow-lg shadow-[#4F7CFF]/25 transition-all duration-300 hover:bg-[#3D6AE8]"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
