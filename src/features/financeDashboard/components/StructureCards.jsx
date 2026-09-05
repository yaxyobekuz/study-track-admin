// Recharts
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

// Components
import DashboardCard from "./DashboardCard";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

// Data
import { AGING_COLORS, COLORS, PALETTE, compactMoney } from "../data/financeDashboard.data";

/**
 * Halqa diagramma + yonidagi ro'yxat.
 *
 * Ro'yxat MAJBURIY qism, bezak emas: halqaning o'zi "qaysi bo'lak nechchi
 * foiz" ni aytadi, lekin "qancha so'm" ni aytmaydi — rahbarga esa ikkalasi
 * ham kerak.
 *
 * Markazda JAMI turadi: bo'laklar yig'indisi qancha ekanini ko'z bilan
 * qo'shib chiqishga majbur qilmaslik uchun.
 */
const DonutBreakdown = ({ items, total, centerLabel, emptyText }) => {
  const chartData = items.map((row, index) => ({
    name: row.label,
    value: Number(row.amount),
    share: row.share,
    color: PALETTE[index % PALETTE.length],
  }));

  return (
    <div className="flex h-full flex-col gap-4 lg:flex-row lg:items-center">
      <div className="relative h-44 w-full shrink-0 lg:h-48 lg:w-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="92%"
              paddingAngle={1.5}
              stroke="none"
            >
              {chartData.map((row) => (
                <Cell key={row.name} fill={row.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) =>
                active && payload?.length ? (
                  <div className="rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-lg">
                    <p className="text-xs font-semibold text-gray-900">
                      {payload[0].payload.name}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {formatMoney(payload[0].payload.value)} · {payload[0].payload.share}%
                    </p>
                  </div>
                ) : null
              }
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Halqa markazi — SVG ichida emas, ustiga qo'yilgan matn:
            recharts'ning `label` i uzun summani halqaga sig'dira olmaydi */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
            {centerLabel}
          </p>
          <p className="text-sm font-bold text-gray-900">{compactMoney(total)}</p>
          <p className="text-[10px] text-gray-400">so'm</p>
        </div>
      </div>

      <ul className="min-w-0 flex-1 space-y-1.5 overflow-y-auto lg:max-h-52">
        {chartData.length === 0 && <li className="text-sm text-gray-400">{emptyText}</li>}

        {chartData.map((row) => (
          <li key={row.name} className="flex items-center gap-2 text-xs">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: row.color }}
            />
            <span className="truncate text-gray-600">{row.name}</span>
            <span className="ml-auto shrink-0 font-semibold text-gray-900">{row.share}%</span>
            <span className="w-24 shrink-0 text-right tabular-nums text-gray-500">
              {compactMoney(row.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

/** XARAJATLAR TUZILMASI — oylik alohida bo'lak, qolgani kategoriya kesimida. */
export const ExpenseStructureCard = ({ data, isLoading, isError }) => {
  const structure = data?.expenseStructure;
  const items = structure?.items ?? [];

  return (
    <DashboardCard
      title="Xarajatlar tuzilmasi"
      hint="Xodimlar maoshi + kategoriyalar"
      isLoading={isLoading}
      isError={isError}
      isEmpty={items.length === 0}
      emptyText="Bu oyda xarajat yozilmagan"
    >
      <DonutBreakdown
        items={items}
        total={structure?.total}
        centerLabel="Jami xarajat"
        emptyText="Xarajat yo'q"
      />
    </DashboardCard>
  );
};

/** DAROMAD TUZILMASI — pul qaysi yo'nalishdan kelgani (tarif kesimi). */
export const RevenueStructureCard = ({ data, isLoading, isError }) => {
  const structure = data?.revenueStructure;
  const items = structure?.items ?? [];

  return (
    <DashboardCard
      title="Daromad tuzilmasi"
      hint="Yo'nalishlar bo'yicha — kassaga tushgan pul"
      isLoading={isLoading}
      isError={isError}
      isEmpty={items.length === 0}
      emptyText="Bu oyda tushum yo'q"
    >
      <DonutBreakdown
        items={items}
        total={structure?.total}
        centerLabel="Jami tushum"
        emptyText="Tushum yo'q"
      />
    </DashboardCard>
  );
};

/**
 * TOP 5 XARAJAT KATEGORIYASI — gorizontal ustunlar.
 *
 * ⚠️ Yuqoridagi halqaning AYNAN SHU ro'yxatining boshi (server bitta
 * so'rovdan ikkalasini ham beradi): ikki alohida hisob bo'lganda ular bir
 * kuni ajralib ketardi.
 */
export const TopExpensesCard = ({ data, isLoading, isError }) => {
  const items = data?.expenseStructure?.top ?? [];
  const max = items.reduce((acc, row) => Math.max(acc, Number(row.amount)), 0);

  return (
    <DashboardCard
      title="Top 5 xarajat kategoriyasi"
      hint="Pul eng ko'p qayerga ketdi"
      isLoading={isLoading}
      isError={isError}
      isEmpty={items.length === 0}
      emptyText="Bu oyda xarajat yozilmagan"
    >
      <ul className="space-y-3">
        {items.map((row, index) => (
          <li key={row.key}>
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="truncate font-medium text-gray-700">{row.label}</span>
              <span className="shrink-0 tabular-nums text-gray-500">
                {formatMoney(row.amount)}
              </span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full transition-[width]"
                style={{
                  width: `${max > 0 ? (Number(row.amount) / max) * 100 : 0}%`,
                  backgroundColor: PALETTE[index % PALETTE.length],
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
};

/**
 * DEBITOR QARZDORLIK — qarzdorlar ulushi va qarzning kattaligi.
 *
 * ⚠️ Bu blok MAJBURIYAT o'lchovida: qarz "hisob-faktura yopilmagani".
 * Qolgan bloklar kassa bo'yicha — shuning uchun izoh matnida "oy oxiri
 * holatiga" deb yozilgan.
 */
export const DebtCard = ({ data, isLoading, isError }) => {
  const debt = data?.debt;

  const chartData = debt
    ? [
        { name: "Qarzdor", value: debt.debtorCount, color: COLORS.debt },
        { name: "Qarzsiz", value: debt.clearCount, color: COLORS.clear },
      ].filter((row) => row.value > 0)
    : [];

  return (
    <DashboardCard
      title="Debitor qarzdorlik"
      hint={debt ? `${debt.asOfMonthLabel} holatiga` : ""}
      isLoading={isLoading}
      isError={isError}
      isEmpty={!debt || debt.studentCount === 0}
      emptyText="Hisob-faktura yozilmagan"
    >
      {debt && (
        <div className="flex h-full flex-col gap-4 sm:flex-row sm:items-center lg:flex-col lg:items-stretch xl:flex-row xl:items-center">
          <div className="relative h-40 w-full shrink-0 sm:w-40 lg:w-full xl:w-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="62%"
                  outerRadius="92%"
                  paddingAngle={1.5}
                  stroke="none"
                >
                  {chartData.map((row) => (
                    <Cell key={row.name} fill={row.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <div className="rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-lg">
                        <p className="text-xs font-semibold text-gray-900">
                          {payload[0].payload.name}: {payload[0].payload.value} ta
                        </p>
                      </div>
                    ) : null
                  }
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                Jami qarz
              </p>
              <p className="text-sm font-bold text-red-600">{compactMoney(debt.debt)}</p>
              <p className="text-[10px] text-gray-400">so'm</p>
            </div>
          </div>

          <dl className="min-w-0 flex-1 space-y-2 text-xs">
            <Row label="Jami o'quvchi" value={`${debt.studentCount} ta`} />
            <Row
              label="Qarzdor o'quvchi"
              value={`${debt.debtorCount} ta`}
              valueClassName="text-orange-600"
              sub={`${debt.debtorShare}%`}
            />
            <Row label="O'rtacha qarz" value={formatMoney(debt.average)} />
            <Row
              label="30 kundan ortiq"
              value={formatMoney(debt.overdue)}
              valueClassName="text-red-600"
            />
            <Row label="Eng eski qarz" value={debt.oldestMonthLabel ?? "—"} />
          </dl>
        </div>
      )}
    </DashboardCard>
  );
};

const Row = ({ label, value, sub, valueClassName }) => (
  <div className="flex items-center justify-between gap-2 border-b border-dashed border-gray-100 pb-1.5 last:border-0 last:pb-0">
    <dt className="truncate text-gray-500">{label}</dt>
    <dd className="flex shrink-0 items-center gap-1.5">
      {sub && <span className="text-[10px] text-gray-400">{sub}</span>}
      <span className={cn("font-semibold text-gray-900", valueClassName)}>{value}</span>
    </dd>
  </div>
);

/**
 * QARZ YOSHI — qarz qancha vaqtdan beri turibdi.
 *
 * ⚠️ Yosh hisob-faktura QAYSI OYGA tegishli ekanidan kelib chiqadi,
 * chiqarilgan sanasidan emas. Rang qanchalik eskirgan bo'lsa shunchalik
 * qizil: "joriy oy" hali muammo emas, "6 oydan ortiq" esa deyarli
 * qaytmaydigan pul.
 */
export const DebtAgingCard = ({ data, isLoading, isError }) => {
  const rows = data?.debt?.aging ?? [];
  const max = rows.reduce((acc, row) => Math.max(acc, Number(row.amount)), 0);
  const hasData = max > 0;

  return (
    <DashboardCard
      title="Qarz yoshi"
      hint="Qarz qancha vaqtdan beri yopilmagan"
      isLoading={isLoading}
      isError={isError}
      isEmpty={!hasData}
      emptyText="Qarz yo'q"
    >
      <ul className="space-y-3">
        {rows.map((row) => (
          <li key={row.key}>
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="truncate font-medium text-gray-700">{row.label}</span>
              <span className="shrink-0 tabular-nums text-gray-500">
                {formatMoney(row.amount)}
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${max > 0 ? (Number(row.amount) / max) * 100 : 0}%`,
                    backgroundColor: AGING_COLORS[row.key],
                  }}
                />
              </div>
              <span className="w-16 shrink-0 text-right text-[10px] text-gray-400">
                {row.studentCount} ta · {row.share}%
              </span>
            </div>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
};
