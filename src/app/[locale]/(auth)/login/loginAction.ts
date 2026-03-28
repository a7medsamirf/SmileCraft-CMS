"use server";

// =============================================================================
// DENTAL CMS — Authentication: Login Server Action
// app/[locale]/auth/login/loginAction.ts
// =============================================================================

import { cookies } from "next/headers";
import { z } from "zod";

// -----------------------------------------------------------------------------
// Validation Schema
// -----------------------------------------------------------------------------

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "البريد الإلكتروني مطلوب")
    .email("صيغة البريد الإلكتروني غير صحيحة"),
  password: z
    .string()
    .min(1, "كلمة المرور مطلوبة")
    .min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

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
  data?: {
    email: string;
  };
};

// -----------------------------------------------------------------------------
// Login Server Action
// -----------------------------------------------------------------------------

export async function loginAction(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  // Parse form data
  const result = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

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

  // ---------------------------------------------------------------------------
  // Mock authentication for demo
  // ---------------------------------------------------------------------------
  const MOCK_CREDENTIALS = {
    email: "admin@smilecraft.com",
    password: "password123",
  };

  await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate network delay

  if (email !== MOCK_CREDENTIALS.email || password !== MOCK_CREDENTIALS.password) {
    return {
      success: false,
      errors: {
        form: ["البريد الإلكتروني أو كلمة المرور غير صحيحة"],
      },
      data: { email },
    };
  }

  // ---------------------------------------------------------------------------
  // SUCCESS: Set Session Cookie
  // ---------------------------------------------------------------------------
  const cookieStore = await cookies();
  
  // Set mock token (In production, use JWT or Session ID)
  cookieStore.set("auth_token", "smilecraft_mock_token_12345", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return {
    success: true,
    message: "تم تسجيل الدخول بنجاح",
    data: { email },
  };
}
