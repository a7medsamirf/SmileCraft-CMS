# 🚀 إعداد قاعدة البيانات - SmileCraft CMS (Multi-tenant Ready)

## ✅ ما تم إنجازه

- ✅ تثبيت Prisma v7.6 + Supabase SSR
- ✅ إنشاء Schema متطور يدعم Multi-tenancy (Clinic model)
- ✅ فصل `MedicalHistory` لجداول مستقلة (Queryable)
- ✅ إعداد طبقة المصادقة (Auth) مع Supabase Middleware
- ✅ تفعيل الـ Audit Logging والـ Media Storage (Metadata)
- ✅ إنشاء Error Boundary عالمي لحماية الـ UI

## 📋 الخطوات المطلوبة

### 1️⃣ تحديث ملف `.env`

```bash
# افتح ملف .env وعدل القيم دي:

# 1. روح على Supabase Dashboard → Project Settings → Database
# 2. خد Connection String (Pooler mode)
# 3. استبدل password بالـ password بتاعك (URL encoded)
#    & → %26, $ → %24, + → %2B, # # → %23, @ → %40

DATABASE_URL="postgresql://postgres:PASSWORD@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:PASSWORD@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"

# 4. روح على Project Settings → API
# 5. خد الـ Keys

NEXT_PUBLIC_SUPABASE_URL="https://wqvrsvscfsqnezlabmvb.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."
```

### 2️⃣ تشغيل Migration

```bash
# تأكد إنك في جذر المشروع
cd f:\react\SmileCraft-CMS

# لو فيه Drift أو مشاكل في الـ DB القديمة، صفر الـ DB:
npx prisma migrate reset --force

# شغّل الـ Migration الجديد:
npx prisma migrate dev --name init_multi_tenant_schema

# الجداول اللي اتخلقت:
# - clinics (Multi-tenancy root)
# - users (Auth linked)
# - staff (HR & Payroll)
# - patients (Profile & MouthMap)
# - medical_histories (Separate table)
# - appointments (Schedules)
# - treatments (Clinical plans)
# - payments & invoices (Finance)
# - services & inventory_items (Inventory)
# - media_files (Storage metadata)
# - audit_logs (Tracking)
```

### 3️⃣ توليد Prisma Client

```bash
npx prisma generate
```

### 4️⃣ التحقق من الاتصال

```bash
# افتح Prisma Studio لتعديل البيانات يدوياً
npx prisma studio
```

## 📁 الملفات المهمة

```
prisma/
├── schema.prisma          # Database schema (Multi-tenant)
├── migrations/            # Migration history
└── ..

src/lib/supabase/
├── client.ts              # Browser client
├── server.ts              # Server client (for Actions)
├── middleware.ts          # Auth session refresher
└── ..

src/lib/
├── prisma.ts             # Prisma singleton
├── db.ts                 # Main DB export
└── ..

src/components/shared/
└── ErrorBoundary.tsx     # Global Action Error Catcher
```

## 🔧 استكشاف الأخطاء

### مشكلة: Prisma 7 Datasource Error

```bash
# في Prisma 7، الـ URL لازم يكون في prisma.config.ts
# والـ schema.prisma يكون فيها datasource { provider = "postgresql" } بس.
```

### مشكلة: Auth Session Not Working

```bash
# تأكد إنك بتستخدم `await createClient()` من `src/lib/supabase/server.ts`
# في الـ Server Actions عشان تقرأ الـ session صح.
```
