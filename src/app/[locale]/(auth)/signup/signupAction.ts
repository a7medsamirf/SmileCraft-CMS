"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { prisma } from "@/lib/db";
import { signupSchema, type SignupFormData } from "./schema";

// -----------------------------------------------------------------------------
// Signup Result Types
// -----------------------------------------------------------------------------

export type SignupState = {
  success: boolean;
  message?: string;
  errors?: {
    [key in keyof SignupFormData]?: string[];
  } & {
    form?: string[];
  };
  redirectTo?: string;
};

// -----------------------------------------------------------------------------
// Supabase Client Helper (Same as loginAction)
// -----------------------------------------------------------------------------

async function createClient() {
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
            // Ignored when called from server component/action
          }
        },
      },
    }
  );
}

// -----------------------------------------------------------------------------
// Signup Server Action
// -----------------------------------------------------------------------------

export async function signupAction(data: SignupFormData): Promise<SignupState> {
  // 1. Validate request data
  const result = signupSchema.safeParse(data);

  if (!result.success) {
    const errorMap = result.error.flatten().fieldErrors;
    return {
      success: false,
      errors: errorMap as SignupState["errors"],
    };
  }

  const { email, password, clinicName, doctorName, phone } = result.data;

  try {
    const supabase = await createClient();

    // 2. Sign up with Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          fullName: doctorName,
          clinicName,
          phone,
        },
      },
    });

    if (authError) {
      if (authError.message.includes("User already registered")) {
        return {
          success: false,
          errors: {
            email: ["البريد الإلكتروني مسجل بالفعل"],
          },
        };
      }
      return {
        success: false,
        errors: {
          form: ["حدث خطأ أثناء الاتصال بـ Supabase: " + authError.message],
        },
      };
    }

    const { user, session } = authData;

    if (!user) {
      return {
        success: false,
        errors: {
          form: ["فشل في إنشاء الحساب، يرجى المحاولة لاحقاً."],
        },
      };
    }

    // 3. Create User in Prisma DB (using Supabase UUID)
    // We do this immediately so the profile is ready
    await prisma.user.create({
      data: {
        id: user.id, // Supabase UUID
        email: email.toLowerCase(),
        fullName: doctorName,
        clinicName,
        phone,
        role: "ADMIN",
        isActive: true,
      },
    });

    // 4. Handle Redirection / Confirmation UX
    if (session) {
      // Case A: Email Confirmation is DISABLED (Instant login)
      const cookieStore = await cookies();
      cookieStore.set("auth_token", session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      return {
        success: true,
        message: "تم إنشاء حسابك بنجاح. سنقوم بتحويلك الآن...",
        redirectTo: "/dashboard",
      };
    } else {
      // Case B: Email Confirmation is ENABLED
      return {
        success: true,
        message: "تم إنشاء حسابك بنجاح! يرجى مراجعة بريدك الإلكتروني لتنشيط الحساب قبل تسجيل الدخول.",
      };
    }
  } catch (error) {
    console.error("Signup error:", error);
    return {
      success: false,
      errors: {
        form: ["حدث خطأ غير متوقع أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى."],
      },
    };
  }
}
