// Router
import { useNavigate } from "react-router-dom";

// Icons
import { ChevronRight } from "lucide-react";

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
 * Moliya dashboardida P&L o'rnini bosdi. "Umumiy" bo'limidagi sinflar
 * jadvaliga o'xshaydi, lekin sig'im (admin belgilaydi) va bo'sh joy ustunlari
 * qo'shilgan. Qatorni bosganda o'sha sinfning moliyaviy sahifasiga o'tadi.
 *
 * ⚠️ Manba — "Umumiy" bilan BIR XIL (`overviewDashboard`), shuning uchun
 * bu yerdagi o'quvchi/grant/qarz raqamlari u yerdagilar bilan aynan mos.
 */
const ClassBreakdownCard = ({ data, isLoading, isError, className }) => {
  const navigate = useNavigate();
  const rows = data?.byClass ?? [];

  return (
    <DashboardCard
      title="Sinflar bo'yicha sig'im va qarz"
      hint={data ? `${data.monthLabel} · summalar so'mda` : ""}
      isLoading={isLoading}
      isError={isError}
      isEmpty={rows.length === 0}
      bodyClassName="overflow-x-auto"
      className={className}
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
        {rows.map((row) => {
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

/** Bitta ko'rsatkich qatori — yorliq chapda, katta raqam o'ngda. */
const CapacityStat = ({ label, value, accent }) => (
  <div className="flex items-baseline justify-between gap-2">
    <span className="text-xs text-gray-500">{label}</span>
    <span className={cn("text-lg font-bold tabular-nums", accent)}>{value}</span>
  </div>
);

/**
 * MAKTAB SIG'IMI — butun maktab bo'yicha jami sig'im, band va bo'sh joy.
 *
 * ⚠️ Manba `byClass` (sinflar jadvali bilan BIR XIL): sig'im belgilangan
 * sinflar bo'yicha jamlanadi. Sig'imi bor sinf yo'q bo'lsa — belgilanmagan
 * deb ko'rsatiladi.
 */
export const SchoolCapacityCard = ({ data, isLoading, isError, className }) => {
  const rows = data?.byClass ?? [];
  const capRows = rows.filter((r) => r.capacity != null);
  const totalCapacity = capRows.reduce((sum, r) => sum + r.capacity, 0);
  const free = capRows.reduce((sum, r) => sum + (r.freeSpots ?? 0), 0);
  const occupied = totalCapacity - free;
  const hasCapacity = capRows.length > 0;
  const pct = totalCapacity > 0 ? Math.min(100, Math.round((occupied / totalCapacity) * 100)) : 0;

  return (
    <DashboardCard
      title="Maktab sig'imi"
      hint={data ? data.monthLabel : ""}
      isLoading={isLoading}
      isError={isError}
      className={className}
    >
      {!hasCapacity ? (
        <p className="py-6 text-center text-sm text-gray-400">
          Sig'im belgilanmagan. Sinf sozlamalarida ("Sinflar" bo'limi) har
          sinfga sig'im qo'ying.
        </p>
      ) : (
        <div className="space-y-3">
          <CapacityStat label="Jami sig'im" value={totalCapacity} accent="text-gray-900" />
          <CapacityStat label="Band (o'quvchilar)" value={occupied} accent="text-blue-700" />
          <CapacityStat
            label="Bo'sh joy"
            value={free}
            accent={free < 0 ? "text-red-600" : "text-green-700"}
          />

          {/* Bandlik chizig'i — necha foizi to'lgan */}
          <div className="pt-1">
            <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
              <div
                className={cn("h-full rounded-full", pct >= 100 ? "bg-red-500" : "bg-blue-500")}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] text-gray-400">{pct}% band</p>
          </div>
        </div>
      )}
    </DashboardCard>
  );
};
