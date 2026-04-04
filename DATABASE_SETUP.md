# 🚀 إعداد قاعدة البيانات - SmileCraft CMS

## ✅ ما تم إنجازه

- ✅ تثبيت Prisma v7.6 + Supabase
- ✅ إنشاء Schema كامل بـ 12 model
- ✅ إعداد ملفات الـ Configuration
- ✅ إنشاء Prisma Client wrapper

## 📋 الخطوات المطلوبة

### 1️⃣ تحديث ملف `.env`

```bash
# افتح ملف .env وعدل القيم دي:

# 1. روح على Supabase Dashboard → Project Settings → Database
# 2. خد Connection String (Pooler mode)
# 3. استبدل password بالـ password بتاعك
# 4. لو فيه special characters، اعملها URL encoding:
#    & → %26, $ → %24, + → %2B, # → %23, @ → %40

DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.kzpirzxhqvyhvtvjyfbz.supabase.co:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:YOUR_PASSWORD@aws-1-eu-central-1.pooler.supabase.com:5432/postgres"

# 5. روح على Project Settings → API
# 6. خد الـ Keys

NEXT_PUBLIC_SUPABASE_URL="https://kzpirzxhqvyhvtvjyfbz.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc...your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGc...your-service-role-key"
```

### 2️⃣ تشغيل Migration

```bash
# تأكد إنك في جذر المشروع
cd f:\react\SmileCraft-CMS

# شغّل الـ Migration
npx prisma migrate dev --name init

# هيخلق الجداول دي في Supabase:
# - users
# - patients
# - appointments
# - treatments
# - payments
# - invoices
# - invoice_items
# - services
# - inventory_items
# - staff
# - notifications
```

### 3️⃣ توليد Prisma Client

```bash
npx prisma generate
```

### 4️⃣ التحقق من الاتصال

```bash
# افتح Prisma Studio
npx prisma studio
```

## 📁 الملفات المهمة

```
prisma/
├── schema.prisma          # Database schema (12 models)
├── migrations/            # Migration files (هي تتخلق بعد ما تشغّل migrate)
└── ..

src/lib/
├── prisma.ts             # Prisma Client singleton
├── db.ts                 # Database exports
└── supabase.ts           # Supabase Client

.env                      # Environment variables (عدّلها!)
.env.example              # Template للـ .env
```

## 🔧 استكشاف الأخطاء

### مشكلة: Can't reach database server

```bash
# 1. تأكد من الـ DATABASE_URL صحيح
# 2. لو الـ password فيه special characters، اعمل URL encoding
# 3. تأكد إن الـ Database مفتوح في Supabase (مش pause)
```

### مشكلة: Schema parsing error

```bash
# Prisma 7 بيطلب datasource URL تكون في prisma.config.ts
# مش في schema.prisma - ده تمام عندنا
```

## 🎯 الخطوات الجاية

بعد ما الـ Migration تخلص:

1. ✅ **بناء Server Actions** لكل Module
2. ✅ **استبدال localStorage** بـ Prisma queries
3. ✅ **ربط Supabase Auth** مع Next.js Middleware
4. ✅ **تفعيل RBAC** (Role-Based Access Control)

## 📚 مراجع

- [Prisma 7 Documentation](https://www.prisma.io/docs/)
- [Supabase + Prisma Integration](https://supabase.com/docs/guides/database/prisma)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

---

**آخر تحديث:** April 2, 2026
**الحالة:** ✅ جاهز للـ Migration
