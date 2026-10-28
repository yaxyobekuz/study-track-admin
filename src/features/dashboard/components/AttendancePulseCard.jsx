// React
import { useState } from "react";

// Router
import { Link, useNavigate } from "react-router-dom";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import {
  Check,
  ChevronDown,
  FileText,
  Minus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import BranchSplit from "@/shared/components/ui/BranchSplit";
import { Skeleton } from "@/shared/components/shadcn/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/shadcn/dropdown-menu";

// Hooks
import useBranch from "@/shared/hooks/useBranch";
import usePermissions from "@/shared/hooks/usePermissions";

// Data
import {
  DASHBOARD_PERIODS,
  docPercentText,
  periodOf,
  pointsText,
  toneOfChange,
} from "@/shared/data/dashboardPeriods.data";

// Utils
import { cn } from "@/shared/utils/cn";

/**
 * DAVOMAT KARTASI — bosh sahifadagi "O'quvchilar davomati" va
 * "O'qituvchilar davomati" uchun BITTA komponent.
 *
 * ⚠️ IKKI KARTA, BITTA SHAKL. Ular yonma-yon turadi va bir xil savolga
 * (davomat qanday, oldingi davrga nisbatan qanday o'zgardi) javob beradi:
 * ikki alohida komponent bo'lsa, maketi va ranglari asta-sekin
 * uzoqlashardi. Farqi faqat NIMA ko'rsatilishida — uni chaqiruvchi
 * beradi (`rows`).
 *
 * ⚠️ DAVR KARTANING O'ZIDA almashtiriladi (kunlik / haftalik / oylik /
 * yillik) — xodimlar topshiriqlari kartasi bilan AYNI tanlagich va AYNI
 * ro'yxat (`shared/data/dashboardPeriods.data.js`). Chegaralar SERVERDA,
 * Toshkent vaqtida hisoblanadi: panel sana hisoblamaydi.
 *
 * ⚠️ FOIZNI PANEL HISOBLAMAYDI. U serverdan keladi va yig'indidan
 * chiqariladi (umumiy ko'rinishda filiallar o'rtachasi EMAS) — kartadagi
 * raqam hujjatdagi raqam bilan bir xil formuladan chiqishi shart.
 *
 * ⚠️ FAQAT "UMUMIY — BARCHA FILIALLAR" KO'RINISHIDA (biznes qarori,
 * 2026-10-28), ya'ni faqat tizim egasida — "Xodimlar topshiriqlari"
 * kartasi bilan AYNI qoida. Filial tanlangan bo'lsa o'sha joyda
 * avvalgidek bot kartalari turadi (`DailyStats`), ya'ni birorta raqam
 * ekrandan tushib qolmaydi va maketda bo'sh joy qolmaydi.
 *
 * Darvoza SERVERDA ham bor (`attendanceStats.controller.js` → 403), ya'ni
 * saqlangan havola orqali ham ochilmaydi.
 *
 * ⚠️ RUXSATSIZ UMUMAN CHIZILMAYDI (`StudentSystemsCard` bilan AYNI
 * qoida): bosh sahifada "ruxsatingiz yo'q" degan quti keraksiz shovqin
 * bo'lardi.
 */

/** Karta ochilganda turadigan davr — boshqa kartalar bilan AYNI sukut. */
const DEFAULT_PERIOD = "month";

/** Davomat bo'limining hisobot huquqi — serverda ham AYNI kalit. */
const PERMISSION = "attendance.reports";

/**
 * O'sish / tushish o'qi.
 *
 * ⚠️ Komponent MODUL darajasida e'lon qilinadi: ikonka render ichida
 * tanlansa, React uni har safar YANGI komponent deb qabul qilardi
 * (`react-hooks/static-components`).
 */
const TrendIcon = ({ value, className }) => {
  if (value > 0) return <TrendingUp className={className} strokeWidth={2.2} />;
  if (value < 0) return <TrendingDown className={className} strokeWidth={2.2} />;
  return <Minus className={className} strokeWidth={2.2} />;
};

const TONE = {
  emerald: {
    bg: "bg-emerald-50",
    hover: "hover:bg-emerald-100",
    ring: "focus-visible:ring-emerald-300",
    icon: "text-emerald-700",
  },
  indigo: {
    bg: "bg-indigo-50",
    hover: "hover:bg-indigo-100",
    ring: "focus-visible:ring-indigo-300",
    icon: "text-indigo-700",
  },
};

const AttendancePulseCard = ({
  title,
  icon: Icon,
  tone = "emerald",
  reportPath,
  reportTitle,
  branchTo,
  hint,
  rows,
  queryOf,
}) => {
  const navigate = useNavigate();
  const { isAggregate } = useBranch();
  const { can } = usePermissions();
  const [period, setPeriod] = useState(DEFAULT_PERIOD);

  const allowed = isAggregate && can(PERMISSION);

  const { data, isLoading, isError } = useQuery({
    ...queryOf({ period }),
    enabled: allowed,
  });

  if (!allowed) return null;

  const current = periodOf(period);
  const skin = TONE[tone] ?? TONE.emerald;
  const path = `${reportPath}?period=${period}`;
  const change = data?.change?.percentPoints;

  /**
   * ⚠️ FILIALLAR KESIMIDA FOIZ ko'rsatiladi, sanoq emas: karta ham foiz
   * haqida. Kesim serverdan TAYYOR keladi (yo'l `anchor` — umumiy
   * birlashtiruvchi tegmaydi), ya'ni panel hech narsa bo'lmaydi.
   */
  const branchItems = data?.byBranch?.map((row) => ({
    branch: { id: row.branchId, name: row.branchName },
    value: row.percent,
  }));

  return (
    <Card className="space-y-4">
      {/* Sarlavha + davr tanlagich. Sarlavha boshqa kartalardagi kabi
          chapda qoladi, davr esa o'ng chetda — maket o'zgarmaydi. */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="min-w-0 truncate font-semibold text-gray-900">{title}</h2>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              title={`Davr: ${current.label} — ${current.hint}`}
              className="flex shrink-0 items-center gap-1 rounded-lg border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 outline-none transition hover:border-gray-300 hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-blue-200"
            >
              {current.label}
              <ChevronDown className="size-3.5 opacity-60" strokeWidth={2} />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52">
            {DASHBOARD_PERIODS.map((item) => (
              <DropdownMenuItem
                key={item.value}
                onSelect={() => setPeriod(item.value)}
                className="flex items-start gap-2"
              >
                <Check
                  className={cn(
                    "mt-0.5 size-3.5 shrink-0",
                    item.value === period ? "opacity-100" : "opacity-0",
                  )}
                  strokeWidth={2.5}
                />
                <span className="min-w-0">
                  <span className="block text-sm">{item.label}</span>
                  <span className="block text-[11px] text-gray-400">
                    {item.hint}
                  </span>
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center justify-between gap-3">
        {/* Belgi — hisobotga olib boradi. Ustiga kelganda hujjat belgisiga
            almashadi: dizayn o'zgarmaydi, lekin bosiladigani ko'rinib
            turadi (`UsersStats` va `StudentSystemsCard` bilan AYNI naqsh). */}
        <button
          type="button"
          title={reportTitle}
          aria-label={reportTitle}
          onClick={() => navigate(path)}
          className={cn(
            "group relative flex size-9 shrink-0 items-center justify-center rounded-full outline-none transition focus-visible:ring-2",
            skin.bg,
            skin.hover,
            skin.ring,
          )}
        >
          <Icon
            className={cn("size-5 transition-opacity group-hover:opacity-0", skin.icon)}
            strokeWidth={1.5}
          />
          <FileText
            className={cn(
              "absolute size-4 opacity-0 transition-opacity group-hover:opacity-100",
              skin.icon,
            )}
            strokeWidth={1.5}
          />
        </button>

        {isLoading ? (
          <Skeleton className="h-7 w-20" />
        ) : isError ? (
          <span className="text-2xl font-bold text-gray-300">—</span>
        ) : (
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tabular-nums text-gray-900">
              {docPercentText(data?.totals?.percent)}
            </span>

            {/* ⚠️ O'ZGARISH PUNKTDA: "94% dan 96% ga" o'sish 2 punkt,
                2,1% emas — foizning foizi chalg'itardi. */}
            {change != null && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums",
                  toneOfChange(change),
                )}
                title={`${data.period.previous.title} (${data.period.previous.label}) bilan solishtirganda`}
              >
                <TrendIcon value={change} className="size-3" />
                {pointsText(change, { withUnit: false })}
              </span>
            )}
          </div>
        )}
      </div>

      <p className="text-xs leading-relaxed text-gray-500">
        {hint(current, data)}
      </p>

      {/* Qatorlar — bosilsa hujjat ochiladi. */}
      {isLoading ? (
        <Skeleton className="h-12 w-full" />
      ) : data ? (
        <Link
          to={path}
          className="block space-y-1 rounded-lg border-t border-gray-100 pt-2 transition hover:bg-gray-50"
        >
          {rows(data).map((row) => (
            <div
              key={row.key}
              title={row.title}
              className="flex items-center justify-between gap-2 text-[11px]"
            >
              <span className="min-w-0 truncate text-gray-500">{row.label}</span>
              <span
                className={cn(
                  "shrink-0 font-semibold tabular-nums",
                  row.tone ?? "text-gray-700",
                )}
              >
                {row.value}
              </span>
            </div>
          ))}
        </Link>
      ) : null}

      {/* Umumiy ko'rinishda: qaysi filialda qancha (bosilsa — o'sha
          filialga o'tadi va bo'limni ochadi) */}
      <BranchSplit items={branchItems} to={branchTo} format={docPercentText} />
    </Card>
  );
};

export default AttendancePulseCard;
