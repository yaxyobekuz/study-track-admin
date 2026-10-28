// React
import { useState } from "react";

// Router
import { Link, useNavigate } from "react-router-dom";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { Check, ChevronDown, ClipboardList, FileText } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Counter from "@/shared/components/ui/Counter";
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

// Queries & data
import { tasksQueries } from "@/features/tasks/queries/tasks.queries";
import {
  DASHBOARD_PERIODS,
  STAFF_TASKS_REPORT_PATH,
  docPercentText,
} from "@/features/tasks/data/tasks.data";

// Utils
import { cn } from "@/shared/utils/cn";

/** Karta ochilganda turadigan davr — Lavozimlar markazi bilan AYNI sukut. */
const DEFAULT_PERIOD = "month";

/**
 * XODIMLAR TOPSHIRIQLARI — bosh sahifadagi karta.
 *
 * ⚠️ Bu karta "Premium foydalanuvchilar" ning O'RNIDA turadi va FAQAT
 * "Umumiy — barcha filiallar" ko'rinishida (biznes qarori, 2026-10-27),
 * ya'ni faqat tizim egasida. Filial tanlangan bo'lsa o'sha joyda
 * avvalgidek Premium kartasi qoladi — ya'ni birorta raqam yo'qolmaydi
 * (`UsersStats`).
 *
 * Sabab: savol tarmoq darajasida beriladi — "bu oy butun tarmoqda nechta
 * topshiriq berildi, qanchasi bajarildi, qaysi filialda ish qolib
 * ketyapti". Bitta filial ichida bu savolga Lavozimlar markazi allaqachon
 * javob beradi.
 *
 * ⚠️ DAVR KARTANING O'ZIDA almashtiriladi (kunlik / haftalik / oylik /
 * yillik): bosh sahifada rahbar "bugun qanday" va "bu yil qanday" degan
 * ikki xil savolni ketma-ket beradi, buning uchun esa bo'limga o'tish
 * shart emas. Chegaralar SERVERDA, Toshkent vaqtida hisoblanadi
 * (`taskReport.service.js`) — panel sana hisoblamaydi.
 *
 * ⚠️ RUXSATSIZ UMUMAN CHIZILMAYDI (`StudentSystemsCard` bilan AYNI
 * qoida): bosh sahifada "ruxsatingiz yo'q" degan quti keraksiz shovqin
 * bo'lardi.
 */
const StaffTasksCard = () => {
  const navigate = useNavigate();
  const { isAggregate } = useBranch();
  const { can } = usePermissions();
  const [period, setPeriod] = useState(DEFAULT_PERIOD);

  // Karta — `tasks.view`, HUJJAT esa `tasks.reports` (xodimlar reytingi
  // ro'yxatni ko'rishdan kengroq kesim). Serverda ham AYNI shart.
  const canSee = isAggregate && can("tasks.view");
  const canOpenReport = canSee && can("tasks.reports");

  const { data, isLoading, isError } = useQuery({
    ...tasksQueries.networkPulse({ period }),
    enabled: canSee,
  });

  if (!canSee) return null;

  const current =
    DASHBOARD_PERIODS.find((item) => item.value === period) ||
    DASHBOARD_PERIODS[2];

  const reportPath = `${STAFF_TASKS_REPORT_PATH}?period=${period}`;
  const title = "Xodimlar topshiriqlari hisobotini ochish";

  // Kesim serverdan keladi (yo'l `anchor` — umumiy birlashtiruvchi
  // tegmaydi), shuning uchun `BranchSplit` ga TAYYOR qatorlar beriladi.
  const branchItems = data?.byBranch?.map((row) => ({
    branch: {
      id: row.branchId,
      name: row.branchName,
      shortName: row.branchShortName,
    },
    value: row.total,
  }));

  return (
    <Card className="space-y-4">
      {/* Sarlavha + davr tanlagich. Karta sarlavhasi boshqa kartalardagi
          kabi chapda qoladi, davr esa o'ng chetda — maket o'zgarmaydi. */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="min-w-0 truncate font-semibold text-gray-900">
          Xodimlar topshiriqlari
        </h2>

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

          <DropdownMenuContent align="end" className="w-48">
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
            turadi (`UsersStats` va `StudentSystemsCard` bilan AYNI naqsh).
            ⚠️ Ruxsati bo'lmasa BOSILMAYDI: marshrut ruxsat bilan
            to'silmagan, ya'ni bosilsa odam 403 ga tushardi. */}
        {canOpenReport ? (
          <button
            type="button"
            title={title}
            aria-label={title}
            onClick={() => navigate(reportPath)}
            className="group relative flex size-9 shrink-0 items-center justify-center rounded-full bg-violet-50 outline-none transition hover:bg-violet-100 focus-visible:ring-2 focus-visible:ring-violet-300"
          >
            <ClipboardList
              className="size-5 text-violet-700 transition-opacity group-hover:opacity-0"
              strokeWidth={1.5}
            />
            <FileText
              className="absolute size-4 text-violet-700 opacity-0 transition-opacity group-hover:opacity-100"
              strokeWidth={1.5}
            />
          </button>
        ) : (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-violet-50">
            <ClipboardList
              className="size-5 text-violet-700"
              strokeWidth={1.5}
            />
          </div>
        )}

        {isLoading ? (
          <Skeleton className="h-7 w-16" />
        ) : isError ? (
          <span className="text-2xl font-bold text-gray-300">—</span>
        ) : (
          <div className="flex items-baseline gap-1">
            <Counter
              value={data?.total ?? 0}
              className="text-2xl font-bold tabular-nums text-gray-900"
            />
            {data?.completionRate != null && (
              <span className="text-sm font-semibold text-emerald-600">
                {docPercentText(data.completionRate)}
              </span>
            )}
          </div>
        )}
      </div>

      <p className="text-xs leading-relaxed text-gray-500">
        {current.hint} berilgan topshiriqlar va bajarilish darajasi
      </p>

      {/* HOLATLAR: bajarildi — yashil, jarayonda — kulrang, muddati
          o'tgan — qizil. Bosilsa hujjat ochiladi. */}
      {isLoading ? (
        <Skeleton className="h-12 w-full" />
      ) : data ? (
        <StatusRows data={data} to={canOpenReport ? reportPath : null} />
      ) : null}

      {/* Umumiy ko'rinishda: qaysi filialda qancha (bosilsa — o'sha
          filialga o'tib, Lavozimlar markazini ochadi) */}
      <BranchSplit items={branchItems} to="/tasks" />
    </Card>
  );
};

/**
 * Uchta qator: bajarildi / jarayonda / muddati o'tgan.
 *
 * ⚠️ "Jarayonda" ichiga TEKSHIRUVDAGI ham kiradi: kartada besh holatni
 * sanab o'tish uni jadvalga aylantirardi, hujjatda esa ularning har biri
 * alohida turadi. Shuning uchun bu yerda ularning yig'indisi ko'rsatiladi
 * va nomi ham "jarayonda" — ish hali tugamagan.
 */
const StatusRows = ({ data, to }) => {
  const rows = [
    {
      key: "completed",
      label: "Bajarildi",
      value: data.completed ?? 0,
      tone: "text-emerald-600",
    },
    {
      key: "inProgress",
      label: "Jarayonda",
      value: (data.inProgress ?? 0) + (data.review ?? 0),
      tone: "text-gray-700",
    },
    {
      key: "overdue",
      label: "Muddati o'tgan",
      value: data.overdue ?? 0,
      tone: "text-red-500",
    },
  ];

  const body = (
    <>
      {rows.map((row) => (
        <div
          key={row.key}
          className="flex items-center justify-between gap-2 text-[11px]"
        >
          <span className="min-w-0 truncate text-gray-500">{row.label}</span>
          <span className={cn("shrink-0 font-semibold tabular-nums", row.tone)}>
            {row.value}
          </span>
        </div>
      ))}
    </>
  );

  // ⚠️ Ruxsati yo'q bo'lsa havola ham qo'yilmaydi: bosilsa odam bo'sh
  // sahifaga va 403 ga tushardi.
  if (!to) {
    return (
      <div className="space-y-1 border-t border-gray-100 pt-2">{body}</div>
    );
  }

  return (
    <Link
      to={to}
      className="block space-y-1 rounded-lg border-t border-gray-100 pt-2 transition hover:bg-gray-50"
    >
      {body}
    </Link>
  );
};

export default StaffTasksCard;
