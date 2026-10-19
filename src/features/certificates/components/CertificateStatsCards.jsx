// Icons
import { AlarmClock, CalendarClock, CircleHelp, GraduationCap, Users } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

/**
 * SANOQ KARTALARI.
 *
 * ⚠️ "O'QUVCHILAR" va "REJALAR" — IKKI XIL raqam va ikkalasi ham turadi.
 * Bitta o'quvchi ikki sertifikat rejalashtirsa, rejalar 2 ga, o'quvchilar
 * 1 ga oshadi. Faqat biri ko'rsatilsa "277 o'quvchi sertifikat topshiradi"
 * degan yolg'on raqam chiqardi (haqiqatda 152 o'quvchi, 277 reja).
 *
 * @param {object} props
 * @param {object} [props.totals] - server javobidagi `stats.totals`
 * @param {string} props.scopeLabel - "Butun maktab" / sinf nomi
 */
const CertificateStatsCards = ({ totals, scopeLabel }) => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
    <StatCard
      icon={Users}
      label="Sertifikat topshirmoqchi"
      value={totals?.students}
      hint={scopeLabel}
      tone="primary"
    />
    <StatCard
      icon={GraduationCap}
      label="Rejalar"
      value={totals?.plans}
      hint={
        totals?.passed > 0
          ? `${totals.passed} ta topshirilgan (${totals.passedStudents} o'quvchi)`
          : "Har o'quvchida bir nechta bo'lishi mumkin"
      }
    />
    <StatCard
      icon={AlarmClock}
      label="Muddati o'tgan"
      value={totals?.overdue}
      hint="Tekshirish kerak"
      tone={totals?.overdue > 0 ? "danger" : "muted"}
    />
    <StatCard
      icon={CalendarClock}
      label="Shu oyda"
      value={totals?.dueThisMonth}
      hint={
        totals?.noDue > 0
          ? `${totals.noDue} ta reja muddatsiz`
          : `Keyinroq: ${totals?.dueLater ?? 0}`
      }
      tone={totals?.dueThisMonth > 0 ? "warning" : "muted"}
      hintIcon={totals?.noDue > 0 ? CircleHelp : null}
    />
  </div>
);

const TONES = {
  primary: "text-primary",
  danger: "text-red-600",
  warning: "text-amber-600",
  muted: "text-gray-900",
};

const StatCard = ({ icon: Icon, label, value, hint, tone = "muted", hintIcon: HintIcon }) => (
  <div className="rounded-2xl bg-white p-4">
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <Icon className="size-4 shrink-0" strokeWidth={1.75} />
      <span className="truncate">{label}</span>
    </div>

    <p className={cn("mt-2 text-2xl font-semibold", TONES[tone])}>
      {value ?? "—"}
    </p>

    {hint && (
      <p className="mt-1 flex items-center gap-1 truncate text-xs text-gray-500">
        {HintIcon && <HintIcon className="size-3.5 shrink-0" strokeWidth={1.75} />}
        {hint}
      </p>
    )}
  </div>
);

export default CertificateStatsCards;
