import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";
 
export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'ar'],
 
  // Used when no locale matches
  defaultLocale: 'ar',

  pathnames: {
    "/": { en: '/', ar: '/', },
    // CMS Routes
    "/patients": { en: '/patients', ar: '/patients' },
    "/calendar": { en: '/calendar', ar: '/calendar' },
    "/billing": { en: '/billing', ar: '/billing' },
    "/settings": { en: '/settings', ar: '/settings' },
    "/clinical": { en: '/clinical', ar: '/clinical' },
    "/staff": { en: '/staff', ar: '/staff' },
    "/appointments": { en: '/appointments', ar: '/appointments' },
    "/finance": { en: '/finance', ar: '/finance' },
    "/dashboard": { en: '/dashboard', ar: '/dashboard' },
    "/patients/[id]": { en: '/patients/[id]', ar: '/patients/[id]' },
    "/login": { en: '/login', ar: '/login' },
 },  

});
 
// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
 
export type Locale = (typeof routing.locales)[number];
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);