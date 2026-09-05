// Icons
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckSquare,
  GraduationCap,
  Minus,
  Star,
  Trophy,
  UserCheck,
  Users,
} from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import {
  KPI_CARDS,
  formatByUnit,
  formatChange,
  planTone,
  trendTone,
} from "../data/academicDashboard.data";

const ICONS = {
  students: Users,
  averageGrade: GraduationCap,
  qualityRate: Star,
  attendanceRate: UserCheck,
  taskCompletion: CheckSquare,
  achievements: Trophy,
};

/** O'tgan oyga nisbatan o'zgarish — foizni ham, punktni ham server beradi. */
const Delta = ({ change, changeUnit }) => {
  if (change == null) return null;

  const tone = trendTone(change);
  const Icon =
    tone.direction === "up" ? ArrowUpRight : tone.direction === "down" ? ArrowDownRight : Minus;

  return (
    <span className={cn("inline-flex items-center gap-0.5 font-medium", tone.className)}>
      <Icon className="size-3.5 shrink-0" />
      {formatChange(change, changeUnit)}
    </span>
  );
};

/**
 * Sahifaning yuqori qatori — oltita savolga bir qarashda javob:
 * nechta o'quvchi bor, qanday baho oladi, sifat qanday, darsga keladimi,
 * topshiriq bajariladimi va tashqarida qanday natija ko'rsatyapmiz.
 *
 * ⚠️ Har kartada IKKI taqqoslash bor: REJA (o'quv bo'limi nima kutgan) va
 * O'TGAN OY (haqiqat qayoqqa ketyapti). Moliya dashboardidagi karta bilan
 * AYNAN BIR XIL SHAKL — foydalanuvchi ikkala ekranni bitta tizim deb
 * o'qiydi va bir joyda "Reja:" ostida, ikkinchisida ustida turgan raqam
 * uni har safar to'xtatib qo'yardi.
 */
const KpiCards = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {KPI_CARDS.map((card) => (
          <div key={card.key} className="h-32 animate-pulse rounded-2xl bg-white" />
        ))}
      </div>
    );
  }

  if (!data?.kpi) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {KPI_CARDS.map((card) => {
        const row = data.kpi[card.key];
        if (!row) return null;

        const Icon = ICONS[card.key];

        return (
          <div
            key={card.key}
            className="relative overflow-hidden rounded-2xl bg-white p-4 ring-1 ring-gray-100 xs:p-5"
          >
            {/* Yumshoq rangli dog' — kartalarni ajratadi, raqamni bosmaydi */}
            <div
              className={cn(
                "absolute -right-7 -top-7 size-24 rounded-full opacity-10",
                card.accent,
              )}
            />

            <div className="relative flex items-start justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                {card.label}
              </p>
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm",
                  card.accent,
                )}
              >
                <Icon className="size-[18px]" />
              </span>
            </div>

            <p
              className={cn(
                "relative mt-3 text-[22px] font-bold leading-tight tracking-tight xl:text-2xl",
                card.tone,
              )}
            >
              {formatByUnit(row.value, row.unit)}
            </p>

            <div className="relative mt-3 space-y-1.5 border-t border-gray-100 pt-2.5 text-[11px]">
              {/* REJA — belgilanmagan bo'lsa qator umuman chizilmaydi:
                  "Reja: —" bo'sh joy egallab, hech narsa aytmasdi */}
              {row.plan != null && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-400">
                    Reja: {formatByUnit(row.plan, row.unit)}
                  </span>
                  {row.planRate != null && (
                    <span className={cn("font-semibold", planTone(row.planRate))}>
                      {row.planRate}%
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-gray-400">
                  O'tgan oy: {formatByUnit(row.previous, row.unit)}
                </span>
                <Delta change={row.change} changeUnit={row.changeUnit} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KpiCards;
