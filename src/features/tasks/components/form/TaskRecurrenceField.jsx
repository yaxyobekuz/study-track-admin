// Icons
import { BellRing, Repeat } from "lucide-react";

// Components
import InputField from "@/shared/components/ui/input/InputField";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import {
  MAX_DUE_OFFSET_DAYS,
  MAX_LEAD_DAYS,
  TASK_FREQUENCIES,
  WEEKDAY_OPTIONS,
  describeRecurrence,
} from "../../data/tasks.data";

const MONTH_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

const toggle = (list, value) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

/**
 * DOIMIY TOPSHIRIQ QOIDASI — "har dushanba 08:10 da", "har 10 kunda bir",
 * "3 oyda bir, oyning 1-kuni".
 *
 * ⚠️ Hafta kunlari JS konvensiyasida (0 = yakshanba) — serverdagi
 * `taskSchedule.helpers.js` bilan AYNI. Hisobotdagi "0 = dushanba"
 * indeksi BOSHQA narsa, u bu yerda ishlatilmaydi.
 *
 * ⚠️ VAQT faqat SOAT: qaysi kun ekanini qoida hal qiladi. Topshiriq
 * hodisadan `leadDays` kun OLDIN yoziladi — va aynan shu yozilish xodim
 * uchun eslatma bo'ladi.
 *
 * @param {object} props
 * @param {object} props.value - takrorlanish maydonlari
 * @param {(field: string, value: unknown) => void} props.onChange
 * @param {boolean} [props.disabled]
 */
const TaskRecurrenceField = ({ value, onChange, disabled = false }) => {
  const { frequency } = value;

  return (
    <div className="space-y-3 rounded-xl bg-indigo-50/40 p-3 ring-1 ring-indigo-100">
      <div className="flex items-center gap-2">
        <Repeat className="size-4 text-indigo-600" />
        <p className="text-sm font-medium text-gray-800">Takrorlanish</p>
      </div>

      {/* Rejim */}
      <div className="grid gap-2 sm:grid-cols-3">
        {TASK_FREQUENCIES.map((item) => (
          <button
            key={item.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange("frequency", item.value)}
            className={cn(
              "rounded-xl border bg-white p-2.5 text-left transition-colors disabled:opacity-50",
              frequency === item.value
                ? "border-primary bg-primary/5"
                : "border-gray-200 hover:border-gray-300",
            )}
          >
            <span className="block text-sm font-medium text-gray-900">{item.label}</span>
            <span className="block text-xs leading-snug text-gray-500">{item.hint}</span>
          </button>
        ))}
      </div>

      {/* Haftalik — kunlar */}
      {frequency === "weekly" && (
        <div>
          <p className="mb-1.5 text-xs font-medium text-gray-600">
            Hafta kunlari <span className="text-primary">*</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {WEEKDAY_OPTIONS.map((day) => {
              const active = value.weekdays.includes(day.value);
              return (
                <button
                  key={day.value}
                  type="button"
                  title={day.full}
                  disabled={disabled}
                  onClick={() => onChange("weekdays", toggle(value.weekdays, day.value))}
                  className={cn(
                    "size-10 rounded-xl text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-white"
                      : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50",
                  )}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Har N kunda */}
      {frequency === "days" && (
        <InputField
          required
          min={1}
          max={365}
          type="number"
          label="Necha kunda bir"
          value={value.intervalDays}
          disabled={disabled}
          className="sm:max-w-52"
          onChange={(e) => onChange("intervalDays", e.target.value)}
          description="Qoida boshlangan kundan sanaladi"
        />
      )}

      {/* Oylik */}
      {frequency === "months" && (
        <div className="space-y-2.5">
          <InputField
            required
            min={1}
            max={24}
            type="number"
            label="Necha oyda bir"
            value={value.intervalMonths}
            disabled={disabled}
            className="sm:max-w-52"
            onChange={(e) => onChange("intervalMonths", e.target.value)}
          />
          <div>
            <p className="mb-1.5 text-xs font-medium text-gray-600">
              Oyning kunlari <span className="text-primary">*</span>
            </p>
            <div className="flex flex-wrap gap-1">
              {MONTH_DAYS.map((day) => {
                const active = value.monthDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    disabled={disabled}
                    onClick={() => onChange("monthDays", toggle(value.monthDays, day))}
                    className={cn(
                      "size-8 rounded-lg text-xs font-medium transition-colors",
                      active
                        ? "bg-primary text-white"
                        : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50",
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            <p className="mt-1 text-[11px] text-gray-500">
              Oyda yo&apos;q kun (masalan 31) o&apos;sha oyning oxirgi kuniga suriladi
            </p>
          </div>
        </div>
      )}

      {/* Vaqt */}
      <div className="grid gap-3 sm:grid-cols-3">
        <InputField
          type="time"
          label="Boshlanish vaqti"
          value={value.startTime}
          disabled={disabled}
          onChange={(e) => onChange("startTime", e.target.value)}
          description="Ixtiyoriy"
        />
        <InputField
          required
          type="time"
          label="Tugash vaqti"
          value={value.dueTime}
          disabled={disabled}
          onChange={(e) => onChange("dueTime", e.target.value)}
          description="Muddat"
        />
        <InputField
          min={0}
          max={MAX_DUE_OFFSET_DAYS}
          type="number"
          label="Muddat +kun"
          value={value.dueOffsetDays}
          disabled={disabled}
          onChange={(e) => onChange("dueOffsetDays", e.target.value)}
          description="0 — o'sha kuni"
        />
      </div>

      {/* Eslatma */}
      <div className="grid gap-3 sm:grid-cols-[180px_1fr] sm:items-center">
        <InputField
          min={0}
          max={MAX_LEAD_DAYS}
          type="number"
          label="Necha kun oldin"
          value={value.leadDays}
          disabled={disabled}
          onChange={(e) => onChange("leadDays", e.target.value)}
        />
        <p className="flex items-start gap-2 rounded-xl bg-white px-3 py-2 text-xs text-gray-600 ring-1 ring-gray-100">
          <BellRing className="mt-0.5 size-4 shrink-0 text-amber-500" />
          <span>
            Topshiriq belgilangan vaqtdan{" "}
            <b>{Number(value.leadDays) === 0 ? "o'sha kuni" : `${value.leadDays} kun oldin`}</b>{" "}
            xodimning ro&apos;yxatida paydo bo&apos;ladi va unga bildirishnoma boradi —
            eslatma shu.
          </span>
        </p>
      </div>

      <p className="rounded-xl bg-white px-3 py-2 text-sm font-medium text-indigo-700 ring-1 ring-indigo-100">
        {describeRecurrence(value)}
      </p>
    </div>
  );
};

export default TaskRecurrenceField;
