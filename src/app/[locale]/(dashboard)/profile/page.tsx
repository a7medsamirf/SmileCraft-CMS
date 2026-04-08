import { ProfileForm } from "@/features/profile/components/ProfileForm";
import { getProfileAction } from "@/features/profile/actions";
import { getTranslations } from "next-intl/server";
import { PageTransition } from "@/components/ui/PageTransition";
import { redirect } from "next/navigation";
import { User} from "lucide-react";
export const metadata = {
  title: "الملف الشخصي | SmileCraft CMS",
  description: "إدارة بيانات الطبيب والعيادة",
};

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Profile");
  const initialData = await getProfileAction();

  if (!initialData) {
    redirect(`/${locale}/login`);
  }

  return (
    <PageTransition loadingText={t("updating")}>
      <div className="w-full mx-auto space-y-6">
        <div className="mb-6">
           <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <User className="h-8 w-8 text-blue-600" />
              {t("title")}
          </h1>

           <p className="mt-2 text-sm text-slate-500 font-medium">
             {t("subtitle")}
           </p>
        </div>

        <ProfileForm initialData={initialData} />
      </div>
    </PageTransition>
  );
}
