"use server";

// =============================================================================
// DENTAL CMS — Authentication: Logout Server Action
// app/[locale]/auth/logoutAction.ts
// =============================================================================

import { redirect } from "@/i18n/routing";

export async function logoutAction() {
  // ---------------------------------------------------------------------------
  // TODO: Replace with actual logout logic
  // - Clear session cookie
  // - Invalidate server-side session
  // ---------------------------------------------------------------------------

  // Simulate logout delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Redirect to login page
  redirect({ href: "/login", locale: "ar" });
}
