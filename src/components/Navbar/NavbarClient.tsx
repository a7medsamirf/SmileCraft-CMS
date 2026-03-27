'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';

import LanguageSwitcher from '../Settings/LocaleSwitcher';
import ThemeSwitcher from '../Settings/ThemeSwitcher';
import Logo from '../SharesComponent/Logo';
import Button from '../SharesComponent/Button';

export default function NavbarClient({ locale }: { locale: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations('Navbar');
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  // Navigation items
  const navLinks: { href: '/' | '/Product' | '/Pages' | '/Integrations' | '/Blog' | '/Pricing' ; label: string }[] = [
    { href: '/', label: 'link.home' },
    { href: '/Product', label: 'link.Product' },
    { href: '/Pages', label: 'link.Pages' },
    { href: '/Integrations', label: 'link.Integrations' },
    { href: '/Blog', label: 'link.Blog' },
    { href: '/Pricing', label: 'link.Pricing' },
  ];

  return (
    <>
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-white dark:bg-[#181D25]/90 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="text-xl font-bold text-gray-800">
                {/* Logo */}
                <Logo />
              </Link>
            </div>

            {/* Desktop links */}
            <div className="hidden md:flex space-x-6">
            <ul className="flex space-x-6">
                  {navLinks.map((link) => (
                    <li className='' key={link.href}>
                      <Link
                      key={link.href}
                      href={link.href}
                      className={`transition-colors duration-200 ${ isActive(link.href) ? 'text-primary font-semibold' : 'text-black dark:text-white hover:text-primary'}`}>
                      {t(link.label)}
                    </Link>
              
                    </li>
              ))}
          </ul>
            </div>

            {/* Language & Theme Switcher */}
            <div className="flex gap-4 mt-2">
                  <LanguageSwitcher currentLocale={locale} />
              <ThemeSwitcher />
            <div className="hidden md:block items-center gap-3 md:flex">
                <Button className='px-5 py-2.5' label={t('Login')} variant="glass" size="sm" href="#" />
                <Button className='px-5 py-2.5' label={t('GetStarted')} variant="brand" size="sm" href="#" />

                </div>
          

          

                {/* Mobile toggle */}
            <div className="md:hidden">
              <button onClick={() => setIsOpen(true)} className="text-black dark:text-white hover:text-primary">
                <Menu className="size-5" />
              </button>
            </div>
            </div>

          
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black overlay opacity-50 z-40"
        />
      )}

      {/* Sidebar drawer */}
      <div
        className={`${locale === 'ar' ? 'right-0' : 'left-0'} fixed sidebar top-0 h-full w-64 bg-white dark:bg-gray-950 z-50 transform transition-transform duration-300 ease-in-out  ${
          isOpen
            ? 'translate-x-0'
            : locale === 'ar'
            ? 'translate-x-full'
            : '-translate-x-full'
        }`}
      >

        <div className="p-4 flex items-center justify-between  h-20">
          <Link href="/" className="text-xl font-bold text-gray-800">
            {/* Logo */}
            <Logo />
          </Link>
          <button className='close-icon' onClick={() => setIsOpen(false)}>
            <X className="size-5 text-primary " />
          </button>
        </div>

       {/* Sidebar Links */}
        <nav className="flex flex-col p-4 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`${
                isActive(link.href)
                  ? 'text-primary font-semibold'
                  : ' text-black dark:text-white hover:text-primary'
              }`}
            >
              {t(link.label)}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}

