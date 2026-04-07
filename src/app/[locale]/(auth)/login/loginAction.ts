"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "./schema";

export type LoginState = {
  errors?: {
    email?: string[];
    password?: string[];
    form?: string[];
  };
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const raw = {
    email: (formData.get("email") as string | null) ?? "",
    password: (formData.get("password") as string | null) ?? "",
  };
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) {
    return { errors: { form: ["البريد الإلكتروني أو كلمة المرور غير صحيحة"] } };
  }
  const locale = (formData.get("locale") as string | null) ?? "ar";
  redirect(`/${locale}/dashboard`);
}
