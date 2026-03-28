"use server";

// =============================================================================
// DENTAL CMS — Authentication: Logout Server Action
// app/[locale]/auth/logoutAction.ts
// =============================================================================

import { cookies } from "next/headers";
import { redirect } from "@/i18n/routing";

export async function logoutAction() {
  // Clear session cookie
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");

  // Simulate logout delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Redirect to login page
  redirect({ href: "/login", locale: "ar" });
}
