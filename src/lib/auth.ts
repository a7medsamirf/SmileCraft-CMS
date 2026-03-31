import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "الأيميل وكلمة المرور",
      credentials: {
        email: { label: "البريد الإلكتروني", type: "email", placeholder: "admin@smile-craft.com" },
        password: { label: "كلمة المرور", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("بيانات الدخول غير مكتملة");
        }

        const inputEmail = credentials.email.trim().toLowerCase();
        const fallbackEmail = inputEmail.includes("smilecraft.com")
          ? inputEmail.replace("smilecraft.com", "smile-craft.com")
          : inputEmail.includes("smile-craft.com")
            ? inputEmail.replace("smile-craft.com", "smilecraft.com")
            : null;

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: inputEmail },
              ...(fallbackEmail ? [{ email: fallbackEmail }] : []),
            ],
          },
        });

        if (!user) {
          throw new Error("المستخدم غير موجود");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

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
      const jwtToken = token as typeof token & { id?: string; role?: string };
      if (user) {
        jwtToken.id = user.id;
        jwtToken.role = (user as { role?: string }).role;
      }
      return jwtToken;
    },
    async session({ session, token }) {
      const jwtToken = token as typeof token & { id?: string; role?: string };
      if (session.user) {
        const sessionUser = session.user as typeof session.user & {
          id?: string;
          role?: string;
        };
        sessionUser.id = jwtToken.id;
        sessionUser.role = jwtToken.role;
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
