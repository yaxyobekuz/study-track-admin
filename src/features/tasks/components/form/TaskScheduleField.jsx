// Icons
import { CalendarClock, CalendarRange } from "lucide-react";

// Components
import InputField from "@/shared/components/ui/input/InputField";

// Utils
import { cn } from "@/shared/utils/cn";
import { toDateTimeInputValue } from "@/shared/utils/date.utils";

// Tezkor muddat tugmalari: hozirdan necha kun keyin, soat 18:00
const DUE_PRESETS = [
  { label: "Bugun 18:00", days: 0 },
  { label: "Ertaga", days: 1 },
  { label: "3 kun", days: 3 },
  { label: "1 hafta", days: 7 },
];

const atHour = (daysAhead, hour) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  d.setHours(hour, 0, 0, 0);
  return d;
};

const MODES = [
  {
    value: "due",
    label: "Faqat muddat",
    hint: "Shu vaqtgacha bajarilsin",
    icon: CalendarClock,
  },
  {
    value: "range",
    label: "Vaqt oralig'i",
    hint: "Aynan shu oraliqda bajarilsin",
    icon: CalendarRange,
  },
];

/**
 * TOPSHIRIQ VAQTI — ikki rejim:
 *
 *   "Faqat muddat"    → `dueDate` ("ertaga 18:00 gacha tayyorlang");
 *   "Vaqt oralig'i"   → `startDate` + `dueDate` ("bugun 13:00 dan 15:00 gacha").
 *
 * Ikkalasida ham KUN, SOAT va DAQIQA tanlanadi (`datetime-local`).
 *
 * ⚠️ HAQIQIY MUDDAT HAR DOIM `dueDate`: jarima, hisobot va "Men ketdim"
 * darvozasi faqat unga qaraydi. Boshlanish vaqti — KO'RSATMA (qachondan
 * boshlash) va ijrochi panelidagi "hozir bajarilish vaqti" qizil belgisi
 * shundan chiqadi, ikkinchi muddat EMAS.
 *
 * ⚠️ Boshlanish vaqti O'TMISHDA bo'lishi mumkin: "soat 13:00 dan" degan
 * topshiriq 13:20 da ham beriladi. Minimal muddat (`minLeadHours`) faqat
 * `dueDate` ga tegishli — server ham aynan shunday tekshiradi.
 *
 * @param {object} props
 * @param {"due"|"range"} props.mode
 * @param {(mode: string) => void} props.onModeChange
 * @param {string} props.startDate - `datetime-local` qiymati
 * @param {string} props.dueDate
 * @param {(field: string, value: string) => void} props.onChange
 * @param {string} props.minDue - `datetime-local` qiymati (sozlamadagi minimal muddat)
 * @param {boolean} [props.disabled]
 */
const TaskScheduleField = ({
  mode,
  onModeChange,
  startDate,
  dueDate,
  onChange,
  minDue,
  disabled = false,
}) => (
  <div className="space-y-3 rounded-xl bg-gray-50/70 p-3">
    {/* Rejim */}
    <div className="grid grid-cols-2 gap-2">
      {MODES.map(({ value, label, hint, icon: Icon }) => (
        <button
          key={value}
          type="button"
          disabled={disabled}
          onClick={() => onModeChange(value)}
          className={cn(
            "flex items-start gap-2 rounded-xl border bg-white p-2.5 text-left transition-colors disabled:opacity-50",
            mode === value
              ? "border-primary bg-primary/5"
              : "border-gray-200 hover:border-gray-300",
          )}
        >
          <Icon
            className={cn(
              "mt-0.5 size-4 shrink-0",
              mode === value ? "text-primary" : "text-gray-400",
            )}
          />
          <span className="min-w-0">
            <span className="block text-sm font-medium text-gray-900">{label}</span>
            <span className="block text-xs leading-snug text-gray-500">{hint}</span>
          </span>
        </button>
      ))}
    </div>

    <div className={cn("grid gap-3", mode === "range" && "sm:grid-cols-2")}>
      {mode === "range" && (
        <InputField
          required
          type="datetime-local"
          label="Boshlanish vaqti"
          value={startDate}
          max={dueDate || undefined}
          disabled={disabled}
          onChange={(e) => onChange("startDate", e.target.value)}
          description="Kun, soat va daqiqa"
        />
      )}

      <InputField
        required
        type="datetime-local"
        label={mode === "range" ? "Tugash vaqti (muddat)" : "Ijro muddati"}
        value={dueDate}
        min={mode === "range" ? startDate || minDue : minDue}
        disabled={disabled}
        onChange={(e) => onChange("dueDate", e.target.value)}
        description="Kun, soat va daqiqa"
      />
    </div>

    {/* Tezkor muddat — faqat "faqat muddat" rejimida ma'noli */}
    {mode === "due" && (
      <div className="flex flex-wrap gap-1.5">
        {DUE_PRESETS.map((preset) => {
          const value = toDateTimeInputValue(atHour(preset.days, 18));
          return (
            <button
              key={preset.label}
              type="button"
              disabled={disabled || value < minDue}
              onClick={() => onChange("dueDate", value)}
              className="rounded-full bg-white px-2.5 py-1 text-xs text-gray-600 ring-1 ring-gray-200 transition-colors hover:bg-blue-50 hover:text-blue-700 disabled:opacity-40 disabled:hover:bg-white"
            >
              {preset.label}
            </button>
          );
        })}
      </div>
    )}
  </div>
);

export default TaskScheduleField;
