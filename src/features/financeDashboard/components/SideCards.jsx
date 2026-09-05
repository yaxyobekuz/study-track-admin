// Icons
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  CalendarPlus,
  GraduationCap,
  Landmark,
  Minus,
  Smile,
  UserCheck,
  Wallet2,
} from "lucide-react";

// Components
import DashboardCard from "./DashboardCard";
import MiniTable, { MiniTd, MiniTr } from "./MiniTable";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";
import { formatDateTimeUz } from "@/shared/utils/date.utils";

// Data
import { PALETTE, formatByUnit, planTone } from "../data/financeDashboard.data";

/**
 * BANK HISOBLARI HOLATI — har bir to'lov turining qoldig'i.
 *
 * ⚠️ Foydalanuvchi matnida atama "to'lov turi" (kodda `PaymentAccount`).
 * Sarlavha "Bank hisoblari" — dizayndagi nom, lekin ro'yxatda naqd kassa
 * ham bor, shuning uchun izohda ikkalasi ham aytiladi.
 */
export const AccountsCard = ({ data, isLoading, isError }) => {
  const accounts = data?.accounts;
  const items = accounts?.items ?? [];

  return (
    <DashboardCard
      title="Bank hisoblari holati"
      hint="To'lov turlari bo'yicha qoldiq — oy oxiriga"
      isLoading={isLoading}
      isError={isError}
      isEmpty={items.length === 0}
      emptyText="To'lov turi qo'shilmagan"
      footer={
        accounts && (
          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs">
            <span className="font-medium text-gray-500">Jami qoldiq</span>
            <span className="font-bold text-gray-900">{formatMoney(accounts.total)}</span>
          </div>
        )
      }
    >
      <ul className="space-y-2.5">
        {items.map((row, index) => (
          <li key={row.id} className="flex items-center gap-3">
            <span
              className="flex size-8 shrink-0 items-center justify-center rounded-xl text-white"
              style={{ backgroundColor: PALETTE[index % PALETTE.length] }}
            >
              {index === 0 ? <Wallet2 className="size-4" /> : <Landmark className="size-4" />}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-gray-700">{row.name}</p>
              <p className="text-[11px] text-gray-400">{row.share}% ulush</p>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-xs font-semibold tabular-nums text-gray-900">
                {formatMoney(row.balance)}
              </p>
              <Delta change={row.change} />
            </div>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
};

const Delta = ({ change }) => {
  if (change == null) return <p className="text-[11px] text-gray-300">—</p>;

  const value = Number(change);
  const Icon = value > 0 ? ArrowUpRight : value < 0 ? ArrowDownRight : Minus;

  return (
    <p
      className={cn(
        "inline-flex items-center justify-end gap-0.5 text-[11px] font-medium",
        value > 0 ? "text-green-600" : value < 0 ? "text-red-600" : "text-gray-400",
      )}
    >
      <Icon className="size-3" />
      {value > 0 ? "+" : ""}
      {value}%
    </p>
  );
};

const SCORECARD_ICONS = {
  academicQuality: GraduationCap,
  paymentDiscipline: Banknote,
  attendance: UserCheck,
  nps: Smile,
  newAdmissions: CalendarPlus,
};

/**
 * KPI KO'RSATKICHLARI — maktabning moliyaviy bo'lmagan sog'lig'i.
 *
 * Pul bilan BITTA ekranda turishi ataylab: "foyda o'sdi, lekin davomat
 * tushdi" degan bog'liqlik ikki alohida sahifada hech qachon ko'rinmaydi.
 *
 * Qiymat `null` bo'lsa "—" chiziladi, nol EMAS: o'lchanmagan ko'rsatkich
 * bilan noldagi ko'rsatkich boshqa-boshqa narsa.
 */
export const ScorecardCard = ({ data, isLoading, isError }) => {
  const items = data?.items ?? [];

  return (
    <DashboardCard
      title="KPI ko'rsatkichlari"
      hint={data ? `${data.monthLabel} holatiga` : ""}
      isLoading={isLoading}
      isError={isError}
      isEmpty={items.length === 0}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((row) => {
          const Icon = SCORECARD_ICONS[row.key] ?? GraduationCap;
          const reached = row.reached;

          return (
            <div key={row.key} className="rounded-xl border border-gray-100 p-3">
              <div className="flex items-start justify-between gap-2">
                <span className="flex size-8 items-center justify-center rounded-xl bg-gray-50 text-gray-500">
                  <Icon className="size-4" />
                </span>
                {reached != null && (
                  <span
                    className={cn(
                      "text-xs font-bold",
                      reached ? "text-green-600" : "text-amber-600",
                    )}
                  >
                    {reached ? "↑" : "↓"}
                  </span>
                )}
              </div>

              <p className="mt-2 truncate text-[11px] text-gray-500" title={row.label}>
                {row.label}
              </p>
              <p className="mt-0.5 text-lg font-bold text-gray-900">
                {formatByUnit(row.value, row.unit)}
              </p>
              <p
                className={cn(
                  "mt-0.5 text-[11px]",
                  // Reja nol bo'lsa bo'lish Infinity beradi va har qanday
                  // natija "yashil" bo'lib qolardi — bunday holatda rang
                  // umuman berilmaydi
                  row.plan == null || row.value == null || Number(row.plan) === 0
                    ? "text-gray-300"
                    : planTone((Number(row.value) / Number(row.plan)) * 100),
                )}
              >
                {row.plan == null
                  ? "Reja belgilanmagan"
                  : `Reja: ${formatByUnit(row.plan, row.unit)}`}
              </p>
              {row.sub && <p className="mt-0.5 text-[10px] text-gray-300">{row.sub}</p>}
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
};

/**
 * SO'NGGI MOLIYAVIY OPERATSIYALAR — kassa daftarining oxirgi qatorlari.
 *
 * ⚠️ "Qoldiq" ustuni — O'SHA HISOBNING qoldig'i, umumiy kassaniki emas
 * (daftar har bir to'lov turi bo'yicha alohida yuritiladi). Sarlavhada
 * shu aytilgan, aks holda ustun yuqoridagi "Pul qoldig'i" kartasi bilan
 * mos kelmagandek ko'rinardi.
 */
export const RecentOperationsCard = ({ data, isLoading, isError, className }) => {
  const rows = data?.recent ?? [];

  return (
    <DashboardCard
      title="So'nggi moliyaviy operatsiyalar"
      hint="Kassa daftaridagi oxirgi yozuvlar · qoldiq shu to'lov turi bo'yicha · summalar so'mda"
      isLoading={isLoading}
      isError={isError}
      isEmpty={rows.length === 0}
      emptyText="Hali harakat yo'q"
      bodyClassName="overflow-x-auto"
      className={className}
    >
      <MiniTable
        columns={[
          { label: "Sana" },
          { label: "Tavsif" },
          { label: "To'lov turi" },
          { label: "Kirim", align: "right" },
          { label: "Chiqim", align: "right" },
          { label: "Qoldiq", align: "right" },
        ]}
      >
        {rows.map((row) => (
          <MiniTr key={row.id}>
            <MiniTd className="text-gray-500">{formatDateTimeUz(row.occurredAt)}</MiniTd>

            <MiniTd className="text-gray-700">
              <span className="inline-flex items-center gap-1.5">
                {/* Rangli nuqta — jadvalni o'qimasdan ham kirim/chiqim
                    nisbatini ko'rsatadi */}
                <span
                  className={cn(
                    "size-1.5 shrink-0 rounded-full",
                    row.isIncome ? "bg-green-500" : "bg-red-500",
                  )}
                />
                {row.description}
              </span>
            </MiniTd>

            <MiniTd className="text-gray-400">{row.accountName ?? "—"}</MiniTd>

            <MiniTd align="right" className="font-medium text-green-600">
              {row.isIncome ? `+${formatMoney(row.amount, { withLabel: false })}` : "—"}
            </MiniTd>

            <MiniTd align="right" className="font-medium text-red-600">
              {row.isIncome ? "—" : `\u2212${formatMoney(row.amount, { withLabel: false })}`}
            </MiniTd>

            <MiniTd align="right" className="font-medium text-gray-900">
              {formatMoney(row.balanceAfter, { withLabel: false })}
            </MiniTd>
          </MiniTr>
        ))}
      </MiniTable>
    </DashboardCard>
  );
};

/**
 * ENG KATTA QARZDORLAR — kim bilan gaplashish kerakligi.
 *
 * Debitor qarzdorlik kartasi "qancha" ni aytadi, bu esa "kim" ni. Ro'yxat
 * qasddan qisqa: uzun ro'yxat kerak bo'lsa "Qarzdorlar" tabi bor, bu yerda
 * esa rahbarga eng og'ir bir nechtasi yetadi.
 */
export const TopDebtorsCard = ({ data, isLoading, isError, className }) => {
  const rows = data?.debt?.topDebtors ?? [];

  return (
    <DashboardCard
      title="Eng katta qarzdorlar"
      hint="Qarz bo'yicha yuqoridan"
      isLoading={isLoading}
      isError={isError}
      isEmpty={rows.length === 0}
      emptyText="Qarzdor yo'q"
      className={className}
    >
      <ul className="space-y-2.5">
        {rows.map((row, index) => (
          <li key={row.id} className="flex items-center gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-[11px] font-semibold text-gray-500">
              {index + 1}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-gray-700">
                {row.fullName}
                {row.isArchived && (
                  <span className="ml-1.5 text-[10px] text-gray-400">(arxivlangan)</span>
                )}
              </p>
              <p className="truncate text-[11px] text-gray-400">
                {row.unpaidCount} ta oy · {row.oldestMonthLabel ?? "—"} dan beri
              </p>
            </div>

            <span className="shrink-0 text-xs font-semibold tabular-nums text-red-600">
              {formatMoney(row.debt)}
            </span>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
};
