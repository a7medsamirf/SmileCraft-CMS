"use server";

// =============================================================================
// SmileCraft CMS — Signup Server Action
// ✅ No Prisma — uses Supabase client directly.
// ✅ useActionState compatible: (_prevState, formData) signature.
// ✅ Works even if DB migration hasn't been run yet (Auth-first approach).
//
// Flow:
//  1. Validate with Zod
//  2. supabase.auth.signUp() — always works, stores metadata in auth.users
//  3. Try to create Clinic + User records in DB (graceful skip if tables missing)
//  4. redirect() to dashboard if session exists, else show "check email" message
// =============================================================================

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signupSchema } from "./schema";

// ---------------------------------------------------------------------------
// State type
// ---------------------------------------------------------------------------
export type SignupState = {
  errors?: {
    clinicName?: string[];
    doctorName?: string[];
    phone?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
    form?: string[];
  };
  /** Shown when email confirmation is required */
  successMessage?: string;
};

// ---------------------------------------------------------------------------
// Action
// ---------------------------------------------------------------------------
export async function signupAction(
  _prevState: SignupState,
  formData: FormData,
): Promise<SignupState> {
  // ── 1. Extract & validate ─────────────────────────────────────────────
  const raw = {
    clinicName: (formData.get("clinicName") as string | null) ?? "",
    doctorName: (formData.get("doctorName") as string | null) ?? "",
    phone: (formData.get("phone") as string | null) ?? "",
    email: (formData.get("email") as string | null) ?? "",
    password: (formData.get("password") as string | null) ?? "",
    confirmPassword: (formData.get("confirmPassword") as string | null) ?? "",
  };

  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { clinicName, doctorName, phone, email, password } = parsed.data;
  const supabase = await createClient();

  // ── 2. Create Supabase Auth user ──────────────────────────────────────
  // Stores clinicName, doctorName, phone in auth.users.raw_user_meta_data
  // so data is never lost even if the DB insert below is skipped.
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { fullName: doctorName, clinicName, phone },
    },
  });

  if (authError) {
    const msg = authError.message.toLowerCase();
    // ── HTTP 429 / rate-limit ─────────────────────────────────────────
    if (
      msg.includes("rate limit") ||
      msg.includes("over_email_send_rate_limit") ||
      (authError as { status?: number }).status === 429
    ) {
      return {
        errors: {
          form: [
            "تم تجاوز الحد المسموح لإرسال إيميلات التأكيد (٢ إيميل/ساعة على الخطة المجانية). " +
              "انتظر ساعة وأعد المحاولة، أو عطّل «Confirm email» من: " +
              "Supabase Dashboard → Authentication → Providers → Email.",
          ],
        },
      };
    }
    // ── Email already registered ──────────────────────────────────────
    if (
      msg.includes("already registered") ||
      msg.includes("already been registered") ||
      msg.includes("user already exists")
    ) {
      return {
        errors: {
          email: ["هذا البريد الإلكتروني مسجل بالفعل — يرجى تسجيل الدخول."],
        },
      };
    }
    // ── Weak password ─────────────────────────────────────────────────
    if (msg.includes("weak") || msg.includes("password should be")) {
      return {
        errors: {
          password: [
            "كلمة المرور ضعيفة جداً — استخدم ٨ أحرف أو أكثر تتضمن أرقاماً وحروفاً.",
          ],
        },
      };
    }
    // ── Invalid email format ──────────────────────────────────────────
    if (
      msg.includes("invalid email") ||
      msg.includes("unable to validate email")
    ) {
      return { errors: { email: ["صيغة البريد الإلكتروني غير صحيحة."] } };
    }
    // ── Fallback ──────────────────────────────────────────────────────
    console.error("[signupAction] Supabase authError:", authError);
    return { errors: { form: ["حدث خطأ غير متوقع: " + authError.message] } };
  }

  const { user, session } = authData;
  if (!user) {
    return { errors: { form: ["فشل إنشاء الحساب، يرجى المحاولة مرة أخرى."] } };
  }

  // ── Silent duplicate: Supabase returns a fake user (empty identities) ──
  // when the email is already registered but not yet confirmed.
  // This prevents email enumeration but we still want to guide the user.
  if (Array.isArray(user.identities) && user.identities.length === 0) {
    return {
      errors: {
        email: [
          "هذا البريد مسجل بالفعل وينتظر التفعيل. " +
            "تحقق من بريدك الوارد (أو Spam)، أو انتظر ساعة لإعادة إرسال رابط التأكيد.",
        ],
      },
    };
  }

  // ── 3. Sync to application DB (Supabase client, no Prisma) ───────────
  // Wrapped in try/catch — if migration hasn't been run yet the tables
  // won't exist and we gracefully skip.  Run `npx prisma migrate dev`
  // to create the tables and this block will work on the next signup.
  try {
    // 3a. Create the Clinic record first (required FK for User)
    const { data: clinic, error: clinicErr } = await supabase
      .from("Clinic") // Prisma creates table as "Clinic" (no @@map)
      .insert({ name: clinicName, subscription: "free" })
      .select("id")
      .single();

    if (!clinicErr && clinic) {
      // 3b. Create the User profile linked to the new clinic
      await supabase.from("users").insert({
        id: user.id, // Supabase Auth UUID
        email: email.toLowerCase(),
        fullName: doctorName,
        phone,
        role: "ADMIN",
        isActive: true,
        clinicId: clinic.id,
      });
    }
  } catch (dbErr) {
    // Tables may not exist yet — Auth user is safely created above.
    // TODO: run `npx prisma migrate dev --name init` to create DB tables.
    console.warn(
      "[signupAction] DB insert skipped (migration not run?):",
      dbErr instanceof Error ? dbErr.message : dbErr,
    );
  }

  // ── 4. Redirect or return success message ────────────────────────────
  const locale = (formData.get("locale") as string | null) ?? "ar";

  if (session) {
    // Email confirmation DISABLED → user is already signed in
    redirect(`/${locale}/dashboard`);
  }

  // Email confirmation ENABLED → ask user to check inbox
  return {
    successMessage:
      "تم إنشاء حسابك بنجاح! يرجى مراجعة بريدك الإلكتروني لتفعيل الحساب ثم تسجيل الدخول.",
  };
}
