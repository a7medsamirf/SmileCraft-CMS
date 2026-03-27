import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Facebook, Twitter, Instagram, Smartphone } from 'lucide-react';

export default function Footer() {
  const t = useTranslations('Footer');

  return (
    <footer className="w-full bg-[#fafafa] border-t border-gray-200 mt-16 text-sm">
      
      {/* 1. Top Section: Newsletter & Apps */}
      <div className="container mx-auto px-4 py-8 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
          
          {/* Newsletter Form */}
          <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-1/2">
            <div className="p-3 bg-teal-50 rounded-full text-teal-400">
              <Mail size={28} />
            </div>
            <div className="flex-1 text-center md:text-start">
              <h3 className="text-lg font-bold text-gray-800 mb-1">{t('newsletter.title')}</h3>
              <p className="text-gray-500 text-xs mb-3">{t('newsletter.subtitle')}</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input 
                    type="email" 
                    placeholder={t('newsletter.placeholder')} 
                    className="w-full border border-gray-300 rounded-sm px-4 py-2 focus:outline-none focus:border-teal-400"
                  />
                  <p className="absolute -top-6 right-0 text-[10px] text-gray-400">{t('newsletter.disclaimer')}</p>
                </div>
                <button className="bg-[#5ad3c0] hover:bg-teal-400 text-white font-semibold px-6 py-2 rounded-sm transition-colors">
                  {t('newsletter.subscribeBtn')}
                </button>
              </div>
            </div>
          </div>

          {/* App Links */}
          <div className="flex flex-col items-center lg:items-end gap-3 w-full lg:w-auto">
            <h3 className="font-bold text-gray-800">{t('appLinks.title')}</h3>
            <div className="flex gap-3">
              {/* Replace with actual App Store images */}
              <button className="bg-gray-800 text-white rounded-md px-4 py-2 flex items-center gap-2 hover:bg-gray-700">
                <Smartphone size={20} />
                <div className="text-start leading-tight">
                  <span className="text-[10px] block">Download on the</span>
                  <span className="text-sm font-bold">App Store</span>
                </div>
              </button>
              <button className="bg-gray-800 text-white rounded-md px-4 py-2 flex items-center gap-2 hover:bg-gray-700">
                <Smartphone size={20} />
                <div className="text-start leading-tight">
                  <span className="text-[10px] block">Get it on</span>
                  <span className="text-sm font-bold">Google Play</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Middle Section: Main Links */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 text-center lg:text-start">
          
          {/* About */}
          <div className="col-span-1 lg:col-span-1">
            <h4 className="font-bold text-gray-900 mb-4 text-lg">{t('about.title')}</h4>
            <p className="text-gray-500 leading-relaxed text-xs">
              {t('about.desc')}
            </p>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4 text-lg">{t('account.title')}</h4>
            <ul className="space-y-3 text-gray-500">
              {['myAccount', 'orders', 'cart', 'wishlist'].map((link) => (
                <li key={link}>
                  <Link href="/" className="hover:text-teal-500 transition-colors flex items-center justify-center lg:justify-start gap-1">
                    <span className="text-gray-300 rtl:rotate-180">«</span> {t(`account.links.${link}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Important Links */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4 text-lg">{t('importantLinks.title')}</h4>
            <ul className="space-y-3 text-gray-500">
              {['aboutUs', 'privacy', 'terms', 'support'].map((link) => (
                <li key={link}>
                  <Link href="/" className="hover:text-teal-500 transition-colors flex items-center justify-center lg:justify-start gap-1">
                     <span className="text-gray-300 rtl:rotate-180">«</span> {t(`importantLinks.links.${link}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4 text-lg">{t('contact.title')}</h4>
            <ul className="space-y-3 text-gray-500">
              <li><span className="text-gray-300 rtl:rotate-180">«</span> {t('contact.whatsapp')} : <br/><span className="text-gray-900 font-medium dir-ltr inline-block mt-1">009612345678932</span></li>
              <li><span className="text-gray-300 rtl:rotate-180">«</span> {t('contact.mobile')} : <br/><span className="text-gray-900 font-medium dir-ltr inline-block mt-1">009612345678932</span></li>
              <li><span className="text-gray-300 rtl:rotate-180">«</span> {t('contact.email')} : <br/><span className="text-gray-900 font-medium mt-1">https://salla.sa</span></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4 text-lg">{t('followUs.title')}</h4>
            <div className="flex gap-3 justify-center lg:justify-start">
              {[Facebook, Twitter, Instagram].map((Icon, index) => (
                <Link key={index} href="#" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-teal-500 hover:border-teal-500 transition-all">
                  <Icon size={18} />
                </Link>
              ))}
              {/* Snapchat placeholder icon (using lucide generic) */}
              <Link href="#" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-yellow-400 hover:border-yellow-400 transition-all">
                <span className="font-bold text-xs">Snap</span>
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Bottom Section: Copyright & Payments */}
      <div className="bg-[#1e1e1e] text-gray-400 py-4">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          
          <p>{t('bottom.copyright')}</p>

          <div className="flex items-center gap-2">
            <span>{t('bottom.taxNumber')} : 546987552</span>
            {/* VAT Logo Placeholder */}
            <div className="w-8 h-8 bg-green-800 rounded-sm flex items-center justify-center text-[8px] text-white font-bold">VAT</div>
          </div>

          {/* Payment Methods placeholders */}
          <div className="flex gap-2 bg-white px-2 py-1 rounded-sm">
             <span className="text-blue-800 font-bold text-[10px] px-1">VISA</span>
             <span className="text-red-500 font-bold text-[10px] px-1">MasterCard</span>
             <span className="text-blue-500 font-bold text-[10px] px-1">PayPal</span>
             <span className="text-green-600 font-bold text-[10px] px-1">mada</span>
          </div>

        </div>
      </div>

    </footer>
  );
}