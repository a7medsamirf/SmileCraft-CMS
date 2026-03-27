import { getLocale } from 'next-intl/server';
import NavbarClient from './NavbarClient';

export default async function Navbar() {
  const locale = await getLocale();
  return <NavbarClient locale={locale} />;
}