// Components
import InputField from "@/shared/components/ui/input/InputField";
import Button from "@/shared/components/ui/button/Button";
import { Field, FieldLabel } from "@/shared/components/shadcn/field";

// Data
import { WORK_DAYS_OPTIONS } from "@/features/attendance/data/attendance.data";

const DAY_NAMES = {
  0: "Yakshanba",
  1: "Dushanba",
  2: "Seshanba",
  3: "Chorshanba",
  4: "Payshanba",
  5: "Juma",
  6: "Shanba",
};

/**
 * weeklySchedule: { "1": { startTime: "09:00", endTime: "18:00" }, ... }
 * workDays: [1, 2, 3, 4, 5]
 * defaultStart / defaultEnd: asosiy ish vaqti (placeholder uchun)
 * onChange(weeklySchedule): callback
 */
const WeeklyScheduleEditor = ({
  workDays = [1, 2, 3, 4, 5],
  weeklySchedule = {},
  defaultStart,
  defaultEnd,
  onChange,
}) => {
  const schedule = weeklySchedule || {};

  const handleChange = (day, field, value) => {
    const key = String(day);
    const current = schedule[key] || {};
    const updated = { ...schedule, [key]: { ...current, [field]: value } };
    // Agar ikkala vaqt ham bo'sh bo'lsa, kunni o'chirish
    if (!updated[key].startTime && !updated[key].endTime) {
      const copy = { ...updated };
      delete copy[key];
      onChange(copy);
    } else {
      onChange(updated);
    }
  };

  const activeDays = workDays.filter((d) => d >= 0 && d <= 6);

  if (activeDays.length === 0) {
    return (
      <p className="text-sm text-gray-400">
        Ish kunlari tanlanmagan. Avval ish kunlarini belgilang.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {activeDays.map((day) => {
        const key = String(day);
        const override = schedule[key] || {};
        const hasOverride = !!(override.startTime || override.endTime);

        return (
          <div key={day} className="flex items-center gap-3 flex-wrap">
            <span className="w-24 text-sm font-medium text-gray-700 shrink-0">
              {DAY_NAMES[day]}
            </span>

            {hasOverride ? (
              <>
                <InputField
                  type="time"
                  className="w-32"
                  value={override.startTime || ""}
                  placeholder={defaultStart || "09:00"}
                  onChange={(e) => handleChange(day, "startTime", e.target.value)}
                />
                <span className="text-gray-400 text-sm">-</span>
                <InputField
                  type="time"
                  className="w-32"
                  value={override.endTime || ""}
                  placeholder={defaultEnd || "18:00"}
                  onChange={(e) => handleChange(day, "endTime", e.target.value)}
                />
                <button
                  type="button"
                  className="text-xs text-gray-400 hover:text-red-500 underline"
                  onClick={() => {
                    const copy = { ...schedule };
                    delete copy[key];
                    onChange(copy);
                  }}
                >
                  Olib tashlash
                </button>
              </>
            ) : (
              <button
                type="button"
                className="text-xs text-blue-500 hover:text-blue-700 underline"
                onClick={() =>
                  handleChange(day, "startTime", defaultStart || "")
                }
              >
                + Maxsus vaqt belgilash
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default WeeklyScheduleEditor;
