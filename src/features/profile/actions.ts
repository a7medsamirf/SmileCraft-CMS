"use server";

import { createClient } from "@/lib/supabase/server";
import { resolveClinicId, getAuthenticatedUser } from "@/lib/supabase-utils";
import { revalidatePath } from "next/cache";

/**
 * Fetches the current user's profile and clinic information.
 */
export async function getProfileAction() {
  const user = await getAuthenticatedUser();
  if (!user) return null;

  const clinicId = await resolveClinicId();
  const supabase = await createClient();

  // Fetch from users table
  const { data: userData } = await supabase
    .from("users")
    .select("fullName, phone, email")
    .eq("id", user.id)
    .single();

  // Fetch from Clinic table
  let clinicName = "";
  if (clinicId) {
    const { data: clinicData } = await supabase
      .from("Clinic")
      .select("name")
      .eq("id", clinicId)
      .single();
    clinicName = clinicData?.name || "";
  }

  return {
    fullName: userData?.fullName || "",
    phone: userData?.phone || "",
    email: userData?.email || user.email || "",
    clinicName,
  };
}

/**
 * Updates the user's personal profile and clinic name.
 */
export async function updateProfileAction(_prevState: any, formData: FormData) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) throw new Error("Unauthorized");

    const clinicId = await resolveClinicId();
    const supabase = await createClient();

    const fullName = formData.get("fullName") as string;
    const phone = formData.get("phone") as string;
    const clinicName = formData.get("clinicName") as string;

    // 1. Update User record in DB
    const { error: userError } = await supabase
      .from("users")
      .update({ fullName, phone })
      .eq("id", user.id);

    if (userError) throw new Error(userError.message);

    // 2. Update Clinic record in DB
    if (clinicId && clinicName) {
      const { error: clinicError } = await supabase
        .from("Clinic")
        .update({ name: clinicName })
        .eq("id", clinicId);
      
      if (clinicError) throw new Error(clinicError.message);
    }

    // 3. Update Auth Metadata (raw_user_meta_data)
    await supabase.auth.updateUser({
      data: { fullName, phone, clinicName }
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Updates the user's password.
 */
export async function updatePasswordAction(_prevState: any, formData: FormData) {
  try {
    const supabase = await createClient();
    const newPassword = formData.get("newPassword") as string;
    const confirmNewPassword = formData.get("confirmNewPassword") as string;

    if (newPassword !== confirmNewPassword) {
      return { error: "Passwords do not match" };
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw new Error(error.message);

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
