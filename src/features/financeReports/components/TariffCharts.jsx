// Recharts
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Utils
import { formatMoney } from "@/shared/utils/formatMoney";

// Components
import ChartCard from "./ChartCard";
import MoneyTooltip from "./MoneyTooltip";

// Data
import {
  CHART_COLORS,
  CHART_PALETTE,
  compactMoney,
} from "../data/financeReports.data";

const AXIS = {
  axisLine: false,
  tickLine: false,
  tick: { fontSize: 11, fill: "#9ca3af" },
};

/**
 * Pul qaysi tarifdan kelayotgani.
 *
 * ⚠️ Tarif nomi hisob-fakturaga MUHRLANGAN: tarif keyin qayta nomlansa ham
 * o'tgan hisobot o'zgarmaydi. Shuning uchun bu yerda eski nom ham
 * ko'rinishi mumkin va bu xato emas.
 */
export const TariffShareChart = ({ data, isLoading, isError }) => {
  const items = (data?.byTariff ?? []).map((row) => ({
    ...row,
    invoicedNum: Number(row.invoiced),
  }));

  return (
    <ChartCard
      title="Tarif bo'yicha taqsimot"
      hint="Majburiyatning qaysi tarifdan kelgani"
      isLoading={isLoading}
      isError={isError}
      isEmpty={items.length === 0}
      height={320}
    >
      <div className="flex h-full flex-col items-center gap-4 sm:flex-row">
        <div className="h-full w-full sm:w-1/2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={items}
                dataKey="invoicedNum"
                nameKey="tariffName"
                innerRadius="55%"
                outerRadius="85%"
                paddingAngle={2}
                strokeWidth={0}
              >
                {items.map((item, index) => (
                  <Cell
                    key={item.tariffName}
                    fill={CHART_PALETTE[index % CHART_PALETTE.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<MoneyTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full space-y-2 sm:w-1/2">
          {items.map((item, index) => (
            <div key={item.tariffName} className="flex items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: CHART_PALETTE[index % CHART_PALETTE.length] }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {item.tariffName}
                </p>
                <p className="text-xs text-gray-400">
                  {item.invoiceCount} ta · yig'ildi {formatMoney(item.collected)}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {formatMoney(item.invoiced)}
                </p>
                <p className="text-xs text-gray-400">{item.share}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
};

/**
 * Maktab qancha pul "bermagani": chegirma va kirish proratsiyasi.
 *
 * Ikkalasi bitta diagrammada, chunki ikkalasi ham bir savolga javob —
 * to'liq tarif narxidan qanchasi hisoblanmagan. Farqi: chegirma ONGLI
 * qaror, proratsiya esa o'quvchi oy o'rtasida kelgani uchun avtomatik.
 */
export const DiscountProrationChart = ({ data, isLoading, isError }) => {
  const series = (data?.series ?? []).map((row) => ({
    ...row,
    discountNum: Number(row.discountAmount),
    prorationNum: Number(row.prorationAmount),
  }));

  const hasData = series.some((row) => row.discountNum > 0 || row.prorationNum > 0);

  return (
    <ChartCard
      title="Chegirma va proratsiya"
      hint="To'liq narxdan hisoblanmagan summa: chegirma — qaror, proratsiya — kirish kuni"
      isLoading={isLoading}
      isError={isError}
      isEmpty={!hasData}
      emptyText="Bu davrda chegirma ham, proratsiya ham bo'lmagan"
      height={300}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={series} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#f3f4f6" />
          <XAxis dataKey="monthShort" {...AXIS} />
          <YAxis {...AXIS} tickFormatter={compactMoney} />
          <Tooltip content={<MoneyTooltip />} cursor={{ fill: "#f9fafb" }} />

          <Bar
            dataKey="discountNum"
            name="Chegirma"
            stackId="cut"
            fill={CHART_COLORS.discount}
            maxBarSize={38}
          />
          <Bar
            dataKey="prorationNum"
            name="Proratsiya"
            stackId="cut"
            fill={CHART_COLORS.proration}
            radius={[6, 6, 0, 0]}
            maxBarSize={38}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
