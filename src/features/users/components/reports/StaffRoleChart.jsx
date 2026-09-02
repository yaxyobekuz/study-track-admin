// Recharts
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

// Components
import Counter from "@/shared/components/ui/Counter";
import ChartTooltip from "./ChartTooltip";
import ReportPanelCard from "./ReportPanelCard";

// Data
import { buildRoleSlices, percentText } from "../../data/staffReport.data";

/**
 * Sektor tooltip'i — afsonada ko'rinmay qolgan tafsilotni beradi.
 *
 * Yarim doiraning sektorlari tor, ustiga yozuv sig'maydi: shu sababli rol
 * nomi, xodimlar soni va ulushi faqat sichqoncha ostida chiqadi. Qobiq
 * umumiy `ChartTooltip` dan olinadi — sahifadagi barcha tooltip'lar bitta
 * ko'rinishda bo'lishi kerak, bu yerda faqat recharts payload'i moslanadi.
 */
const RoleTooltip = ({ active, payload }) => {
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
 * Rol taqsimoti — yarim doira "o'lchagich" ko'rinishida.
 *
 * To'liq doira o'rniga yarmi ataylab: markazidagi bo'sh joyga jami xodimlar
 * soni sig'adi va bitta panelda ikki savolga javob beriladi — "qancha odam
 * bor" va "ular qanday taqsimlangan". Sektorlar `buildRoleSlices` dan
 * keladi, ya'ni uzun dum allaqachon "Boshqalar" ga yig'ilgan: bu yerda
 * hech narsa qayta hisoblanmaydi.
 *
 * Shu sababli afsona ham qisqa — eng ko'pi bilan 5 ta rol va bitta
 * "Boshqalar" qatori chiqadi, ichki skroll kerak emas.
 *
 * @param {object} props
 * @param {Array} props.byRole - serverdan kelgan rol kesimi
 * @param {number} props.total - arxivlanmagan xodimlar soni
 */
const StaffRoleChart = ({ byRole = [], total }) => {
  const slices = buildRoleSlices(byRole);

  return (
    <ReportPanelCard
      title="Rol bo'yicha taqsimot"
      hint="Arxivlanmagan xodimlar kesimida"
      isEmpty={!byRole.length}
      bodyClassName={
        slices.length ? "flex flex-col items-center gap-4 sm:flex-row" : ""
      }
    >
      {/* Yarim doira + markazdagi jami */}
      <div className="relative h-28 w-48 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="name"
              startAngle={180}
              endAngle={0}
              cy="100%"
              innerRadius={56}
              outerRadius={82}
              paddingAngle={2}
              stroke="none"
            >
              {slices.map((slice) => (
                <Cell key={slice.key} fill={slice.color} />
              ))}
            </Pie>

            <Tooltip content={<RoleTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 text-center">
          <p className="text-2xl font-bold leading-tight text-gray-900">
            {total == null ? "—" : <Counter value={total} />}
          </p>
          <p className="text-xs text-gray-500">Jami</p>
        </div>
      </div>

      {/* Afsona — ko'pi bilan 6 qator, shuning uchun tabiiy joylashadi */}
      <div className="w-full space-y-2 pr-1 sm:w-auto sm:flex-1">
        {slices.map((slice) => (
          <div key={slice.key} className="flex items-center gap-2">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: slice.color }}
            />
            <span className="min-w-0 truncate text-sm text-gray-600">
              {slice.name}
            </span>

            <span className="ml-auto shrink-0 text-sm font-semibold text-gray-900">
              {slice.value}
            </span>
            <span className="shrink-0 text-xs text-gray-400">
              ({percentText(slice.percent)})
            </span>
          </div>
        ))}
      </div>
    </ReportPanelCard>
  );
};

export default StaffRoleChart;
