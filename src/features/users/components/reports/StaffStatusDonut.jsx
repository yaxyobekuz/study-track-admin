// Recharts
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

// Components
import ReportPanelCard from "./ReportPanelCard";
import ChartTooltip from "./ChartTooltip";

// Data
import { buildStatusSlices, percentText } from "../../data/staffReport.data";

/**
 * Doiraviy diagramma tooltip'i — sektorning o'zidagi raqamni takrorlaydi.
 *
 * Halqa ichida faqat ro'yxatdagi jami turadi, sektorlarda esa yozuv yo'q:
 * kichik ulushlar (bitta bloklangan xodim) ustiga raqam sig'masdi. Shu
 * sababli aniq son sichqoncha ostida beriladi. Ko'rinish umumiy
 * `ChartTooltip` qobig'idan, bu yerda faqat recharts payload'i moslanadi.
 */
const StatusTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

  const slice = payload[0].payload;

  return (
    <ChartTooltip
      rows={[
        {
          key: slice.key,
          color: slice.color,
          name: slice.name,
          value: `${slice.value} ta · ${percentText(slice.percent)}`,
        },
      ]}
    />
  );
};

/**
 * Xodimlar holati — faol, bloklangan va arxivlangan ulushi.
 *
 * Maxrajga arxivdagilar ham qo'shiladi (`buildStatusSlices` shu qoidada):
 * aks holda arxiv sektori 100% dan oshib ketgan doirada turar edi. Ya'ni
 * bu karta "butun ro'yxat" ni ko'rsatadi, "hozir ishlaydiganlar" ni emas —
 * shuning uchun markazda `listedTotal` turadi va u "Ro'yxatda" deb
 * ataladi: tepadagi KPI kartasidagi "Jami xodimlar" arxivsiz sondir.
 *
 * Halqa markazida jami son turadi — ko'z avval umumiy hajmni, keyin
 * bo'linishni o'qiydi; afsona esa aniq raqamlarni beradi, chunki
 * diagrammadan 2 va 3 ni farqlab bo'lmaydi.
 *
 * @param {object} props
 * @param {object} props.composition
 */
const StaffStatusDonut = ({ composition }) => {
  const slices = buildStatusSlices(composition);
  const total = composition.listedTotal;
  const hasGender = composition.male > 0 || composition.female > 0;

  return (
    <ReportPanelCard
      title="Xodimlar holati"
      hint="Faol, bloklangan va arxivlangan xodimlar ulushi — arxivlangan xodimlar bilan birga"
      isEmpty={total === 0}
      emptyText="Xodimlar yo'q"
    >
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        {/* Halqa: markazda jami, sektorlarda ulushlar */}
        <div className="relative size-40 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={slices}
                dataKey="value"
                innerRadius={58}
                outerRadius={78}
                paddingAngle={2}
                stroke="none"
              >
                {slices.map((slice) => (
                  <Cell key={slice.key} fill={slice.color} />
                ))}
              </Pie>
              <Tooltip content={<StatusTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-2xl font-bold text-gray-900">{total}</p>
            <p className="text-xs text-gray-500">Ro&apos;yxatda</p>
          </div>
        </div>

        {/* Afsona — diagrammada o'qib bo'lmaydigan aniq sonlar shu yerda */}
        <div className="w-full space-y-2.5">
          {slices.map((slice) => (
            <div key={slice.key} className="flex items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: slice.color }}
              />
              <span className="text-sm text-gray-600">{slice.name}</span>
              <span className="ml-auto font-semibold text-gray-900">
                {slice.value}
              </span>
              <span className="text-xs text-gray-400">
                {percentText(slice.percent)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Jins kesimi — alohida panelga arzimaydigan bir qatorlik izoh */}
      {hasGender && (
        <div className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-500">
          Erkak: {composition.male} · Ayol: {composition.female}
          {composition.genderUnknown > 0 && (
            <> · Ko&apos;rsatilmagan: {composition.genderUnknown}</>
          )}
        </div>
      )}
    </ReportPanelCard>
  );
};

export default StaffStatusDonut;
