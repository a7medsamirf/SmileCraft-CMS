// =============================================================================
// Dashboard Widget — Quick Actions
// =============================================================================

import { UserPlus, CalendarPlus, FileText, Stethoscope } from "lucide-react";
import Link from "next/link";

const ACTIONS = [
  {
    label: "مريض جديد",
    href: "/ar/patients",
    icon: UserPlus,
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    hoverColor: "hover:bg-blue-500/20",
  },
  {
    label: "حجز موعد",
    href: "/ar/appointments",
    icon: CalendarPlus,
    color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    hoverColor: "hover:bg-emerald-500/20",
  },
  {
    label: "فاتورة جديدة",
    href: "/ar/finance",
    icon: FileText,
    color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    hoverColor: "hover:bg-purple-500/20",
  },
  {
    label: "تشخيص سريع",
    href: "/ar/clinical",
    icon: Stethoscope,
    color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    hoverColor: "hover:bg-amber-500/20",
  },
];

export function QuickActions() {
  return (
    <div className="glass-card p-6">
      <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">
        ⚡ إجراءات سريعة
      </h3>
      <div className="grid grid-cols-4 gap-3">
        {ACTIONS.map((action, i) => (
          <Link
            key={i}
            href={action.href}
            className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border transition-all duration-200 ${action.color} ${action.hoverColor} group`}
          >
            <action.icon className="w-6 h-6 transition-transform group-hover:scale-110" />
            <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
