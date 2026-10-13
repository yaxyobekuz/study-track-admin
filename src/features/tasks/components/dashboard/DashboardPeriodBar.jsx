// Icons
import { RefreshCw } from "lucide-react";

// Components
import { TabsButtons } from "@/shared/components/ui/tabs/Tabs";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateRangeUz, formatTimeUz } from "@/shared/utils/date.utils";

// Data
import { DASHBOARD_PERIODS } from "../../data/tasks.data";

/**
 * Dashboard davri: Kunlik / Haftalik / Oylik / Yillik.
 *
 * ⚠️ Davr chegarasi SERVERDA, Toshkent vaqti bo'yicha hisoblanadi
 * (`taskReport.service.js` → `_resolvePreset`): brauzer mintaqasi boshqa
 * bo'lsa "bugun" bir kunga siljib ketardi. Shuning uchun bu yerda faqat
 * kalit yuboriladi, sana hisoblanmaydi — ekranda esa serverdan qaytgan
 * aniq oraliq yoziladi ("Haftalik" qaysi kundan ekani noaniq).
 *
 * @param {object} props
 * @param {string} props.period
 * @param {(period: string) => void} props.onChange
 * @param {{ from: string, to: string }} [props.range] - serverdan qaytgan davr
 * @param {boolean} props.isFetching
 * @param {string} [props.generatedAt]
 */
const DashboardPeriodBar = ({ period, onChange, range, isFetching, generatedAt }) => (
  <div className="flex flex-col gap-3 rounded-2xl bg-white p-3 ring-1 ring-gray-100 xs:p-4 lg:flex-row lg:items-center lg:justify-between">
    <TabsButtons
      value={period}
      items={DASHBOARD_PERIODS}
      onChange={onChange}
      listClassName="max-w-full overflow-x-auto hidden-scrollbar justify-start"
      triggerClassName="shrink-0"
    />

    <div className="flex items-center gap-2 text-xs text-gray-500">
      <RefreshCw className={cn("size-3.5", isFetching && "animate-spin text-blue-500")} />
      <span>
        {range ? formatDateRangeUz(range.from, range.to) : "—"}
        {generatedAt && ` · ${formatTimeUz(generatedAt)} holatiga`}
      </span>
    </div>
  </div>
);

export default DashboardPeriodBar;
