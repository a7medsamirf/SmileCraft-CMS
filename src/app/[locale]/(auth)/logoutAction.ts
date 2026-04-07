"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function logoutAction(formData: FormData) {
  const supabase = await createClient();
  // THE FIX — actually signs out from Supabase, clearing sb-*-auth-token cookies
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("[logoutAction] Supabase signOut error:", error.message);
  }
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  const locale = (formData.get("locale") as string | null) ?? "ar";
  redirect(`/${locale}/login`);
}
