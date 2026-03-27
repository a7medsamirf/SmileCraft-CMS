import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { ProductCardData } from '@/models/product';
import * as motion from "framer-motion/client"; // Framer Motion v12 optimization for Server Components
import { clsx } from 'clsx';

// البيانات الثابتة للكروت (يمكن جلبها من API لاحقاً)
const productsData: ProductCardData[] = [
  {
    id: 'airpods',
    imageSrc: '/assets/images/product/1.png', // تأكد من وضع الصورة في هذا المسار
    imageAlt: 'Apple AirPods',
    bgColorClass: 'bg-[#e6f7f0]', // اللون الوردي الفاتح
    href: '/products/airpods',
  },
  {
    id: 'iphone',
    imageSrc: '/assets/images/product/2.png', // تأكد من وضع الصورة في هذا المسار
    imageAlt: 'Apple iPhone',
    bgColorClass: 'bg-[#fff4e6]', // اللون البرتقالي/البيج الفاتح
    href: '/products/iphone',
  },
  {
    id: 'apple-watch',
    imageSrc: '/assets/images/product/3.png', // تأكد من وضع الصورة في هذا المسار
    imageAlt: 'Apple Watch',
    bgColorClass: 'bg-[#fdeceb]', // اللون الأخضر الفاتح (النعناعي)
    href: '/products/watch',
  },
];

export default function FeaturedProducts() {
  // جلب الترجمات من ملفات JSON
  const t = useTranslations('FeaturedProducts');

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {productsData.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
            className={clsx(
              "flex flex-col items-center text-center p-8 rounded-sm hover:shadow-lg transition-shadow duration-300",
              product.bgColorClass
            )}
          >
            {/* الحاوية الخاصة بالصورة مع next/image لتحسين الأداء */}
            <div className="relative w-48 h-64 mb-8">
              <Image
                src={product.imageSrc}
                alt={product.imageAlt}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>

            {/* النصوص (RTL/LTR سيتم التعامل معها تلقائياً بفضل اتجاه الصفحة) */}
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {t('title')}
            </h3>
            
            <p className="text-sm text-gray-600 mb-8 leading-relaxed max-w-[280px]">
              {t('description')}
            </p>

            <Link 
              href={product.href}
              className="mt-auto font-bold text-gray-900 hover:text-gray-600 transition-colors"
            >
              {t('shopNow')}
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}