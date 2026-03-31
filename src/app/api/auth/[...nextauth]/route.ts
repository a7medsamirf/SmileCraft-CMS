import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("يرجى إدخال البريد الإلكتروني وكلمة المرور");
        }

        try {
          // البحث عن المستخدم في Supabase
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          if (!user) throw new Error("بيانات الدخول غير صحيحة");

          // مقارنة الباسورد المدخل بالمشفر في القاعدة
          const isValid = await bcrypt.compare(credentials.password, user.password);
          
          if (!isValid) throw new Error("بيانات الدخول غير صحيحة");

          return { 
            id: user.id, 
            name: user.name, 
            email: user.email, 
            role: user.role 
          };
        } catch (error: any) {
          console.error("Auth Server Error:", error.message);
          throw new Error(error.message.includes("Can't reach") 
            ? "فشل الاتصال بقاعدة البيانات" 
            : error.message);
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).role = token.role;
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login", // عرض الأخطاء في نفس صفحة اللوجن
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };