import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { getLangDir } from "rtl-detect";
import { El_Messiri, DM_Sans } from "next/font/google";

const elMessiri = El_Messiri({
  subsets: ['arabic'],
  display: 'swap',
  variable: '--font-elMessiri',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dmSans',
});

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const direction = getLangDir(locale);

  if (!["en", "ar"].includes(locale)) return notFound();

  const messages = await getMessages();

  return (
    <html lang={locale} dir={direction} className={`${locale === 'ar' ? elMessiri.variable : dmSans.variable}`} suppressHydrationWarning>
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
