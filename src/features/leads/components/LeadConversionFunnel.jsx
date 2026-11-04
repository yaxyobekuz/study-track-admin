// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";

// Utils
import { cn } from "@/shared/utils/cn";

// Data & queries
import { leadStatusChartColors } from "../data/leads.data";
import { leadsQueries } from "../queries/leads.queries";

/**
 * QABUL FUNNELI — 6 pog'ona.
 *
 * ⚠️ HAR POG'ONADA "YETGANLAR" TURADI, o'sha pog'onada TURGANLAR emas.
 * Ilgari funnel joriy holatdan hisoblanardi: to'lov qilgan bola
 * "keldi" da sanalmay qolar va har pog'ona faqat o'sha yerda QOTIB
 * QOLGANLARNI ko'rsatardi — "10 ta olib keldim, 2 tasi qoldi" degan
 * savolga javob bermasdi. Endi zinapoya monoton yoziladi
 * (`helpers/leadStage.helpers.js`), ya'ni raqamlar pastga qarab faqat
 * kamayadi va yo'qotish aynan qaysi qadamda bo'lgani ko'rinadi.
 *
 * ⚠️ "Hozir qaysi bosqichda" — ALOHIDA blok: u ishlash kerak bo'lgan
 * navbat, funnel esa o'tgan natija. Bitta grafikda ko'rsatilsa, ikkisi
 * bir-birini inkor qilib turardi.
 */
const LeadConversionFunnel = ({ dateParams }) => {
  const params = buildParams(dateParams);
  const { data, isLoading } = useQuery(leadsQueries.conversion(params));

  const pipeline = data?.pipeline ?? [];
  const exits = data?.exits ?? [];
  const current = data?.current ?? [];
  const totalLeads = data?.totalLeads ?? 0;

  if (isLoading) {
    return <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>;
  }

  return (
    <div className="space-y-4">
      {/* ── Yakuniy natija ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Tile label="Ro'yxatga olingan" value={totalLeads} />
        <Tile
          label="Qabul qilindi (to'lov qildi)"
          value={data?.enrolled ?? 0}
          valueClassName="text-green-600"
        />
        <Tile
          label="Konversiya"
          value={`${data?.conversion ?? 0}%`}
          valueClassName={
            (data?.conversion ?? 0) >= 50
              ? "text-green-600"
              : (data?.conversion ?? 0) > 0
                ? "text-amber-600"
                : "text-red-600"
          }
        />
      </div>

      {/* ── Zinapoya ── */}
      <Card title="Qabul bosqichlari — qaysi qadamda yo'qotildi" className="space-y-3">
        {pipeline.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">Ma'lumot topilmadi</p>
        ) : (
          <div className="space-y-2">
            {pipeline.map((row) => {
              const width = totalLeads > 0 ? (row.reached / totalLeads) * 100 : 0;
              const color = leadStatusChartColors[row.status] || "#6b7280";

              return (
                <div key={row.stage}>
                  <div className="flex items-center gap-3">
                    <div className="flex w-40 shrink-0 items-center justify-end">
                      <span className="text-xs font-medium text-gray-700">
                        {row.stage}. {row.label}
                      </span>
                    </div>

                    <div className="h-8 flex-1 overflow-hidden rounded-xl bg-gray-100">
                      <div
                        className="flex h-full items-center justify-end rounded-xl pr-2 transition-all duration-500"
                        style={{ backgroundColor: color, width: `${Math.max(width, 8)}%` }}
                      >
                        <span className="text-xs font-bold text-white">{row.reached}</span>
                      </div>
                    </div>

                    <div className="w-14 shrink-0 text-right text-xs font-semibold text-gray-500">
                      {row.conversion}%
                    </div>
                  </div>

                  {/* Oldingi qadamdan yo'qotish — AYNAN shu yerda ko'rinadi */}
                  {row.lostCount > 0 && (
                    <div className="flex items-center gap-3 py-0.5">
                      <div className="w-40 shrink-0" />
                      <div className="flex flex-1 items-center gap-1 pl-2">
                        <div className="ml-4 h-3 border-l-2 border-dashed border-gray-300" />
                        <span className="ml-1 text-[11px] font-medium text-red-500">
                          ↓ {row.lostCount} ta yo'qotildi ({row.dropOff}%)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* ── Chiqib ketganlar ── */}
        <Card title="Chiqib ketganlar" className="space-y-2">
          <div className="grid grid-cols-3 gap-3">
            {exits.map((exit) => {
              const color = leadStatusChartColors[exit.status] || "#6b7280";
              return (
                <div
                  key={exit.status}
                  className="rounded-xl p-3 text-center"
                  style={{ backgroundColor: `${color}18` }}
                >
                  <p className="text-2xl font-bold" style={{ color }}>
                    {exit.count}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-600">{exit.label}</p>
                  <p className="text-[11px] text-gray-400">{exit.percentage}%</p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* ── Hozirgi navbat ── */}
        <Card title="Hozir qaysi bosqichda turibdi" className="space-y-2">
          <p className="text-xs text-gray-400">
            Bu — ishlash kerak bo'lgan navbat (yuqoridagi funnel esa o'tgan natija).
          </p>
          <ul className="divide-y divide-gray-100">
            {current.map((row) => (
              <li key={row.stage} className="flex items-center justify-between py-1.5">
                <span className="text-sm text-gray-700">{row.label}</span>
                <span
                  className={cn(
                    "text-sm font-semibold",
                    row.count > 0 ? "text-gray-900" : "text-gray-300",
                  )}
                >
                  {row.count}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
};

const Tile = ({ label, value, valueClassName = "text-gray-900" }) => (
  <Card>
    <p className="text-xs font-medium text-gray-500">{label}</p>
    <p className={cn("mt-1 text-2xl font-bold", valueClassName)}>{value}</p>
  </Card>
);

/** Davr tanlagichidan so'rov parametrlari (boshqa chartlar bilan AYNI). */
function buildParams(dateParams) {
  if (!dateParams) return {};
  if (dateParams.startDate || dateParams.endDate) {
    const params = {};
    if (dateParams.startDate) params.startDate = dateParams.startDate;
    if (dateParams.endDate) params.endDate = dateParams.endDate;
    return params;
  }
  if (dateParams.period) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(dateParams.period));
    return { startDate: startDate.toISOString().split("T")[0] };
  }
  return {};
}

export default LeadConversionFunnel;
