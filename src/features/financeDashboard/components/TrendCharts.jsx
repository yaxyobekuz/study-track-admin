// React
import { useState } from "react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Recharts
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Components
import DashboardCard from "@/shared/components/dashboard/DashboardCard";
import MoneyTooltip from "./MoneyTooltip";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

// Data & queries
import { AXIS, COLORS, compactMoney } from "../data/financeDashboard.data";
import { dashboardQueries } from "../queries/financeDashboard.queries";

/** Trend granulyatsiyasi — cash flow va hisoblangan/yig'ilgan grafiklari uchun. */
const TREND_GRAN = [
  { value: "day", label: "Kunlik" },
  { value: "month", label: "Oylik" },
  { value: "year", label: "Yillik" },
];

/**
 * Trend grafigining davr filtri — granulyatsiya (kunlik/oylik/yillik) +
 * sanadan-sanagacha ixtiyoriy oraliq. Ikkala grafik ham AYNAN bir xil
 * boshqaruvni ishlatadi (`DashboardCard`ning `action` slotida turadi).
 */
const TrendFilter = ({ granularity, from, to, onGranularity, onFrom, onTo, onClear }) => (
  <div className="flex flex-wrap items-center gap-2">
    {/* Granulyatsiya — kunlik / oylik / yillik */}
    <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5">
      {TREND_GRAN.map((g) => (
        <button
          key={g.value}
          type="button"
          onClick={() => onGranularity(g.value)}
          className={cn(
            "rounded-md px-2 py-0.5 text-xs font-medium transition",
            granularity === g.value
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700",
          )}
        >
          {g.label}
        </button>
      ))}
    </div>

    {/* Sanadan — sanagacha (ixtiyoriy oraliq) */}
    <div className="flex items-center gap-1">
      <input
        type="date"
        value={from}
        max={to || undefined}
        onChange={(e) => onFrom(e.target.value)}
        className="rounded-md border border-gray-200 px-1.5 py-0.5 text-xs text-gray-600 focus:border-primary focus:outline-none"
      />
      <span className="text-gray-300">—</span>
      <input
        type="date"
        value={to}
        min={from || undefined}
        onChange={(e) => onTo(e.target.value)}
        className="rounded-md border border-gray-200 px-1.5 py-0.5 text-xs text-gray-600 focus:border-primary focus:outline-none"
      />
      {(from || to) && (
        <button
          type="button"
          title="Oraliqni tozalash"
          onClick={onClear}
          className="rounded-md px-1 text-xs text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      )}
    </div>
  </div>
);

// ⚠️ CHAP MARJA MANFIY BO'LMAYDI va `YAxis` kengligi yorliqqa yetarli
// bo'lishi kerak. Ilgari `left: -12` va `width: 58` turgani uchun "500 mln"
// yorlig'ining birinchi harfi kesilib, ekranda "i00 mln" bo'lib ko'rinardi.
// Eng uzun yorliq "1.4 mlrd" — 72px unga ham, kelajakdagi kattaroq
// summalarga ham yetadi.

/** Diagramma uchun qatorlarni songa o'giradi (recharts string bilan ishlamaydi). */
const toNumbers = (series = []) =>
  series.map((row) => ({
    ...row,
    incomeNum: Number(row.income),
    expenseNum: Number(row.expense),
    profitNum: Number(row.profit),
  }));

/**
 * TUSHUM VA FOYDA DINAMIKASI — 12 oylik chiziq.
 *
 * Ikkalasi BITTA diagrammada: rahbarga "tushum o'sdi, lekin foyda o'smadi"
 * degan holat aynan shu ikki chiziqning bir-biridan uzoqlashishida ko'rinadi.
 */
export const TrendChart = ({ data, isLoading, isError }) => {
  const series = toNumbers(data?.trend);
  const hasData = series.some((row) => row.incomeNum > 0 || row.expenseNum > 0);

  return (
    <DashboardCard
      title="Tushum va foyda dinamikasi"
      hint={`Oxirgi ${series.length || 12} oy`}
      isLoading={isLoading}
      isError={isError}
      isEmpty={!hasData}
      height={280}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={series} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#f3f4f6" />
          <XAxis dataKey="monthShort" {...AXIS} interval="preserveStartEnd" />
          <YAxis {...AXIS} tickFormatter={compactMoney} width={72} tickMargin={6} />
          <Tooltip content={<MoneyTooltip />} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />

          <Line
            type="monotone"
            dataKey="incomeNum"
            name="Tushum"
            stroke={COLORS.profit}
            strokeWidth={2}
            dot={{ r: 2.5 }}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="profitNum"
            name="Sof foyda"
            stroke={COLORS.income}
            strokeWidth={2}
            dot={{ r: 2.5 }}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </DashboardCard>
  );
};

/**
 * HISOBLANGAN VA YIG'ILGAN — dashboarddagi yagona MAJBURIYAT kesimi.
 *
 * Qolgan bloklar kassa bo'yicha ("pul kirdimi"), bu esa "qancha to'lashi
 * kerak edi" ni ko'rsatadi. Ikkalasi kerak: faqat kassaga qarab turgan
 * rahbar "oy yaxshi o'tdi" deb o'ylashi mumkin, holbuki pul o'tgan
 * oylarning qarzidan yig'ilgan bo'lishi mumkin.
 *
 * Chiziq — undirish foizi, o'ng o'qda: u summa bilan bir shkalada tura
 * olmaydi (biri milliard, biri 0..100).
 *
 * ⚠️ Cash flow bilan bir xil davr filtri (kunlik/oylik/yillik + oraliq).
 * Kunlik ma'noli bo'lishi uchun server HODISA sanasi bo'yicha yig'adi:
 * hisoblangan — hisob-faktura chiqarilgan kun, yig'ilgan — pul taqsimlangan
 * kun (batafsil `getAccrualSeries` izohida).
 */
export const AccrualChart = ({ className, height = 264 }) => {
  const [granularity, setGranularity] = useState("month");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const range = from && to ? { from, to } : {};
  const { data, isLoading, isError } = useQuery(
    dashboardQueries.accrual({ granularity, ...range }),
  );

  const series = (data?.series ?? []).map((row) => ({
    ...row,
    invoicedNum: Number(row.invoiced),
    collectedNum: Number(row.collected),
  }));

  const hasData = series.some((row) => row.invoicedNum > 0 || row.collectedNum > 0);
  const totals = data?.totals;

  return (
    <DashboardCard
      title="Hisoblangan va yig'ilgan"
      hint="Ustun — hisoblangan/yig'ilgan, chiziq — undirish foizi"
      isLoading={isLoading}
      isError={isError}
      isEmpty={!hasData}
      emptyText="Hisob-faktura shakllantirilmagan"
      height={height}
      className={className}
      action={
        <TrendFilter
          granularity={granularity}
          from={from}
          to={to}
          onGranularity={setGranularity}
          onFrom={setFrom}
          onTo={setTo}
          onClear={() => {
            setFrom("");
            setTo("");
          }}
        />
      }
      footer={
        totals && (
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-3 sm:grid-cols-4">
            <Stat label="Hisoblandi" value={formatMoney(totals.invoiced)} />
            <Stat
              label="Yig'ildi"
              value={formatMoney(totals.collected)}
              valueClassName="text-green-700"
            />
            <Stat
              label="Berilgan chegirma"
              value={formatMoney(totals.discount)}
              hint="Ongli qaror bilan"
            />
            <Stat
              label="Proratsiya"
              value={formatMoney(totals.proration)}
              hint="Oy o'rtasida kelganlar"
            />
          </div>
        )
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={series} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#f3f4f6" />
          <XAxis dataKey="label" {...AXIS} interval="preserveStartEnd" />
          <YAxis {...AXIS} tickFormatter={compactMoney} width={72} tickMargin={6} />
          <YAxis
            yAxisId="rate"
            orientation="right"
            domain={[0, 100]}
            unit="%"
            width={48}
            tickMargin={4}
            {...AXIS}
          />
          <Tooltip
            content={<MoneyTooltip unitByKey={{ collectionRate: "percent" }} />}
            cursor={{ fill: "#f9fafb" }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />

          <Bar
            dataKey="invoicedNum"
            name="Hisoblangan"
            fill={COLORS.profit}
            radius={[4, 4, 0, 0]}
            maxBarSize={18}
          />
          <Bar
            dataKey="collectedNum"
            name="Yig'ilgan"
            fill={COLORS.income}
            radius={[4, 4, 0, 0]}
            maxBarSize={18}
          />
          <Line
            yAxisId="rate"
            type="monotone"
            dataKey="collectionRate"
            name="Undirish %"
            stroke={COLORS.balance}
            strokeWidth={2}
            dot={{ r: 2.5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </DashboardCard>
  );
};

/** Diagramma ostidagi kichik raqam. */
const Stat = ({ label, value, hint, valueClassName = "text-gray-900" }) => (
  <div className="min-w-0">
    <p className="truncate text-[11px] text-gray-400">{label}</p>
    <p className={`truncate text-xs font-semibold tabular-nums ${valueClassName}`}>{value}</p>
    {hint && <p className="truncate text-[10px] text-gray-300">{hint}</p>}
  </div>
);
