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

          return (
            <MiniTr
              key={row.classId ?? "__none__"}
              onClick={open}
              className={cn(clickable && "cursor-pointer hover:bg-gray-50")}
            >
              <MiniTd className="font-medium text-gray-900">{row.className}</MiniTd>

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
