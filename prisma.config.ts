import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // هنا بنديها الباب المباشر (بورت 5432) عشان تعرف تبني الجداول براحتها
    url: env('DIRECT_URL'), 
  },
})