// Router
import { useNavigate } from "react-router-dom";

// Icons
import { ChevronRight, School } from "lucide-react";

// Components
import DashboardCard from "@/shared/components/dashboard/DashboardCard";
import MiniTable, { MiniTd, MiniTr } from "@/shared/components/dashboard/MiniTable";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

/** Ortiqcha (bo'sh) joy rangi: manfiy — to'lgan/oshgan (qizil), 0 — kulrang. */
const freeSpotClass = (n) =>
  n == null
    ? "text-gray-300"
    : n < 0
      ? "text-red-600"
      : n === 0
        ? "text-gray-400"
        : "text-gray-700";

/**
 * SINFLAR BO'YICHA — sig'im, o'quvchi, ortiqcha joy, grant va qarz.
 *
 * `limit` berilsa faqat shuncha sinf ko'rsatiladi va pastda "Ko'proq" tugmasi
 * chiqadi (`onMore` chaqiriladi — to'liq jadval alohida sahifada). Qatorni
 * bosganda o'sha sinfning moliyaviy sahifasiga o'tadi.
 *
 * ⚠️ Manba — "Umumiy" bilan BIR XIL (`overviewDashboard`).
 */
const ClassBreakdownCard = ({ data, isLoading, isError, className, limit, onMore }) => {
  const navigate = useNavigate();
  const rows = data?.byClass ?? [];
  const shown = limit ? rows.slice(0, limit) : rows;
  const hasMore = Boolean(limit && rows.length > limit);

  return (
    <DashboardCard
      title="Sinflar bo'yicha sig'im va qarz"
      hint={data ? `${data.monthLabel} · summalar so'mda` : ""}
      isLoading={isLoading}
      isError={isError}
      isEmpty={rows.length === 0}
      bodyClassName="overflow-x-auto"
      className={className}
      footer={
        hasMore && (
          <button
            type="button"
            onClick={onMore}
            className="mt-3 flex w-full items-center justify-center gap-1 border-t border-gray-100 pt-3 text-xs font-medium text-primary hover:underline"
          >
            Ko'proq — barcha {rows.length} ta sinf
            <ChevronRight className="size-3.5" />
          </button>
        )
      }
    >
      <MiniTable
        columns={[
          { label: "Sinf" },
          { label: "Sig'im", align: "right" },
          { label: "O'quvchi", align: "right" },
          { label: "Ortiqcha joy", align: "right" },
          { label: "Grant", align: "right" },
          { label: "Qarz", align: "right" },
          { label: "" },
        ]}
      >
        {shown.map((row) => {
          const clickable = Boolean(row.classId);
          const open = () =>
            clickable &&
            navigate(`/finance/main/classes/${row.classId}?month=${data.month}`);

          // Sinfning to'lish foizi (o'quvchi / sig'im) — nom tagida progress bar.
          const fillPct =
            row.capacity > 0
              ? Math.round((row.studentCount / row.capacity) * 100)
              : null;

          return (
            <MiniTr
              key={row.classId ?? "__none__"}
              onClick={open}
              className={cn(clickable && "cursor-pointer hover:bg-gray-50")}
            >
              <MiniTd className="font-medium text-gray-900">
                <div>{row.className}</div>
                {fillPct != null && (
                  <div className="mt-1 flex items-center gap-1.5">
                    <div className="h-1 w-16 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          fillPct > 100 ? "bg-red-500" : "bg-blue-500",
                        )}
                        style={{ width: `${Math.min(100, fillPct)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-normal text-gray-400">
                      {fillPct}%
                    </span>
                  </div>
                )}
              </MiniTd>

              <MiniTd align="right" className="text-gray-600">
                {row.capacity != null ? row.capacity : "—"}
              </MiniTd>

              <MiniTd align="right" className="text-gray-700">
                {row.studentCount}
              </MiniTd>

              <MiniTd
                align="right"
                className={cn("font-medium", freeSpotClass(row.freeSpots))}
              >
                {row.freeSpots != null ? row.freeSpots : "—"}
              </MiniTd>

              <MiniTd align="right" className="text-purple-700">
                {row.grantCount}
              </MiniTd>

              <MiniTd
                align="right"
                className={cn(
                  "font-medium",
                  Number(row.debt) > 0 ? "text-red-600" : "text-gray-400",
                )}
              >
                {formatMoney(row.debt, { withLabel: false })}
              </MiniTd>

              <MiniTd className="text-gray-300">
                {clickable && <ChevronRight className="size-4" />}
              </MiniTd>
            </MiniTr>
          );
        })}
      </MiniTable>
    </DashboardCard>
  );
};

export default ClassBreakdownCard;

/** Yorliq ustida, katta raqam ostida — gorizontal chiziq uchun. */
const InlineStat = ({ label, value, accent }) => (
  <div className="min-w-0">
    <p className="text-[11px] text-gray-400">{label}</p>
    <p className={cn("text-lg font-bold leading-tight tabular-nums", accent)}>{value}</p>
  </div>
);

/**
 * MAKTAB SIG'IMI — bitta QATORDA: jami sig'im, band, bo'sh joy va bandlik
 * foizi. Sinflar jadvalining tepasiga qo'yiladi.
 *
 * ⚠️ Manba `byClass` (sinflar jadvali bilan bir xil): sig'im belgilangan
 * sinflar bo'yicha jamlanadi.
 */
export const SchoolCapacityBar = ({ data, className }) => {
  const rows = data?.byClass ?? [];
  const capRows = rows.filter((r) => r.capacity != null);
  const totalCapacity = capRows.reduce((sum, r) => sum + r.capacity, 0);
  const free = capRows.reduce((sum, r) => sum + (r.freeSpots ?? 0), 0);
  const occupied = totalCapacity - free;
  const hasCapacity = capRows.length > 0;
  const pct =
    totalCapacity > 0 ? Math.min(100, Math.round((occupied / totalCapacity) * 100)) : 0;

  if (!hasCapacity) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-2xl bg-white p-4 text-sm text-gray-400 ring-1 ring-gray-100",
          className,
        )}
      >
        <School className="size-4 shrink-0" />
        Maktab sig'imi belgilanmagan — "Sinflar" bo'limida har sinfga sig'im qo'ying.
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-8 gap-y-3 rounded-2xl bg-white p-4 ring-1 ring-gray-100 xs:p-5",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-600 text-white shadow-sm">
          <School className="size-[18px]" />
        </span>
        <span className="text-sm font-semibold text-gray-700">Maktab sig'imi</span>
      </div>

      <InlineStat label="Jami sig'im" value={totalCapacity} accent="text-gray-900" />
      <InlineStat label="Band (o'quvchilar)" value={occupied} accent="text-blue-700" />
      <InlineStat
        label="Bo'sh joy"
        value={free}
        accent={free < 0 ? "text-red-600" : "text-green-700"}
      />

      <div className="flex min-w-[160px] flex-1 items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
          <div
            className={cn("h-full rounded-full", pct >= 100 ? "bg-red-500" : "bg-blue-500")}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="shrink-0 text-xs font-medium text-gray-500">{pct}% band</span>
      </div>
    </div>
  );
};
