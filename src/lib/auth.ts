import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "الأيميل وكلمة المرور",
      credentials: {
        email: { label: "البريد الإلكتروني", type: "email", placeholder: "admin@smilecraft.com" },
        password: { label: "كلمة المرور", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("بيانات الدخول غير مكتملة");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("المستخدم غير موجود");
        }

        // In production, use bcrypt.compare(credentials.password, user.password)
        // For phase 1 start, we do plain string compare or skip hash temporarily
        const isPasswordValid = credentials.password === user.password; 

        if (!isPasswordValid) {
          throw new Error("كلمة المرور غير صحيحة");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role, // Custom field
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/ar/login", // Redirect custom login page
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-dev",
};

export default NextAuth(authOptions);
