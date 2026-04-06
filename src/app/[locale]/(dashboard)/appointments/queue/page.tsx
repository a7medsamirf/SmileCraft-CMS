import { CalendarCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { PageTransition } from "@/components/ui/PageTransition";
import { QueueDashboardUI } from "@/features/appointments/components/QueueDashboardUI";
import { RealtimeAppointmentListener } from "@/features/appointments/components/RealtimeAppointmentListener";
import type { AppointmentStatus } from "@/features/appointments/types";

async function getClinicIdForCurrentUser(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { clinicId: true },
  });

  if (!dbUser) {
    throw new Error("User record not found");
  }

  return dbUser.clinicId;
}

export default async function AppointmentsQueuePage() {
  const t = await getTranslations("Appointments");
  const clinicId = await getClinicIdForCurrentUser();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const appointments = await prisma.appointment.findMany({
    where: {
      clinicId,
      date: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
    include: {
      patient: {
        select: {
          fullName: true,
        },
      },
    },
    orderBy: {
      startTime: "asc",
    },
  });

  const queueItems = appointments.map((appointment) => ({
    id: appointment.id,
    patientName: appointment.patient.fullName,
    startTime: appointment.startTime,
    type: appointment.type,
    status: appointment.status as AppointmentStatus,
  }));

  const stats = {
    total: appointments.length,
    pending: appointments.filter((appointment) => appointment.status === "SCHEDULED").length,
    inProgress: appointments.filter((appointment) => appointment.status === "CONFIRMED").length,
    completed: appointments.filter((appointment) => appointment.status === "COMPLETED").length,
    cancelled: appointments.filter((appointment) => appointment.status === "CANCELLED" || appointment.status === "NO_SHOW").length,
  };

  return (
    <PageTransition loadingText={t("queueTitle")}>
      <div className="space-y-6" dir="rtl">
        <div className="mb-2 flex items-end justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-extrabold text-slate-900 dark:text-white">
              <span className="rounded-xl bg-blue-600 p-2 shadow-lg shadow-blue-200 dark:shadow-blue-900/40">
                <CalendarCheck className="h-6 w-6 text-white" />
              </span>
              {t("queueTitle")}
            </h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">{t("queueSubtitle")}</p>
          </div>
        </div>

        <QueueDashboardUI appointments={queueItems} stats={stats} />
        <RealtimeAppointmentListener clinicId={clinicId} />
      </div>
    </PageTransition>
  );
}
