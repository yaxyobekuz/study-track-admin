// Icons
import { CalendarRange, RefreshCw } from "lucide-react";

// Components
import { TabsButtons } from "@/shared/components/ui/tabs/Tabs";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateRangeUz, formatTimeUz } from "@/shared/utils/date.utils";

// Data
import { REPORT_PERIODS } from "../../data/tasks.data";

/**
 * Hisobot davri: tayyor tugmalar + ixtiyoriy oraliq. Tanlangan davr matn
 * bilan ham yoziladi — "30 kun" qaysi kundan qaysi kungacha ekani noaniq.
 *
 * @param {object} props
 * @param {string} props.preset - "30d" | ... | "custom"
 * @param {{from: string, to: string}} props.range
 * @param {(preset: string) => void} props.onPresetChange
 * @param {(range: {from: string, to: string}) => void} props.onRangeChange
 * @param {boolean} props.isFetching
 * @param {string} [props.generatedAt]
 */
const ReportPeriodBar = ({
  preset,
  range,
  onPresetChange,
  onRangeChange,
  isFetching,
  generatedAt,
}) => (
  <div className="flex flex-col gap-3 rounded-2xl bg-white p-3 ring-1 ring-gray-100 xs:p-4 lg:flex-row lg:items-center lg:justify-between">
    <div className="flex flex-wrap items-center gap-2">
      <TabsButtons
        items={REPORT_PERIODS}
        value={preset === "custom" ? undefined : preset}
        onChange={onPresetChange}
        listClassName="max-w-full overflow-x-auto hidden-scrollbar justify-start"
        triggerClassName="shrink-0"
      />

      <div
        className={cn(
          "flex items-center gap-1.5 rounded-full px-2 py-1 ring-1",
          preset === "custom" ? "ring-primary" : "ring-gray-200",
        )}
      >
        <CalendarRange className="ml-1 size-4 text-gray-400" />
        <input
          type="date"
          value={range.from}
          max={range.to}
          onChange={(e) => e.target.value && onRangeChange({ ...range, from: e.target.value })}
          className="bg-transparent text-sm outline-none"
          aria-label="Davr boshi"
        />
        <span className="text-gray-300">—</span>
        <input
          type="date"
          value={range.to}
          min={range.from}
          onChange={(e) => e.target.value && onRangeChange({ ...range, to: e.target.value })}
          className="bg-transparent text-sm outline-none"
          aria-label="Davr oxiri"
        />
      </div>
    </div>

    <div className="flex items-center gap-2 text-xs text-gray-500">
      <RefreshCw className={cn("size-3.5", isFetching && "animate-spin text-blue-500")} />
      <span>
        {formatDateRangeUz(range.from, range.to)}
        {generatedAt && ` · ${formatTimeUz(generatedAt)} holatiga`}
      </span>
    </div>
  </div>
);

export default ReportPeriodBar;
