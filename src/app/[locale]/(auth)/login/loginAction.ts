"use server";

// =============================================================================
// DENTAL CMS — Authentication: Login Server Action
// app/[locale]/auth/login/loginAction.ts
// =============================================================================

import { z } from "zod";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// -----------------------------------------------------------------------------
// Validation Schema
// -----------------------------------------------------------------------------

import { loginSchema, type LoginFormData } from "./schema";

// -----------------------------------------------------------------------------
// Login Result Types
// -----------------------------------------------------------------------------

export type LoginState = {
  success: boolean;
  message?: string;
  errors?: {
    email?: string[];
    password?: string[];
    form?: string[];
  };
};

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored when called from server component/action when setting cookies
          }
        },
      },
    }
  );
}

// -----------------------------------------------------------------------------
// Login Server Action
// -----------------------------------------------------------------------------

export async function loginAction(data: LoginFormData): Promise<LoginState> {
  // Parse data to be sure
  const result = loginSchema.safeParse(data);

  // Validation failed
  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    return {
      success: false,
      errors: {
        email: fieldErrors.email,
        password: fieldErrors.password,
      },
    };
  }

  // Valid data
  const { email, password } = result.data;

  const supabase = await createClient();

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      success: false,
      errors: {
        form: ["البريد الإلكتروني أو كلمة المرور غير صحيحة"],
      },
    };
  }

  // Set the "auth_token" to satisfy existing middleware.ts logic 
  const cookieStore = await cookies();
  cookieStore.set("auth_token", authData.session?.access_token || "supabase_auth_secure_token", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return {
    success: true,
    message: "تم تسجيل الدخول بنجاح",
  };
}
