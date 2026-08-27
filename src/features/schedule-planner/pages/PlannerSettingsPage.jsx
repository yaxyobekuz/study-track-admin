// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import Input from "@/shared/components/ui/input/Input";
import Switch from "@/shared/components/ui/switch/Switch";
import LoaderCard from "@/shared/components/ui/LoaderCard";
import PeriodsEditor from "@/features/schedule-settings/components/PeriodsEditor";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";

// Queries
import { usePlannerSettings } from "../queries/planner.queries";
import { useUpdatePlannerSettings } from "../queries/planner.mutations";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import {
  DAY_OPTIONS,
  CONSTRAINT_FLAGS,
  CLASS_CONSTRAINTS,
  TEACHER_CONSTRAINTS,
} from "../data/planner.data";

/**
 * "Sozlamalar" tab — grid va shakllantirish qoidalari.
 *
 * Dars soatlari (`PeriodsEditor`) AYNAN "Dars jadvali sozlamalari"
 * sahifasidagi komponent: grid ikkala joyda bir xil bo'lishi shart, shuning
 * uchun nusxa emas, o'sha komponentning o'zi chiziladi.
 */
const PlannerSettingsPage = () => {
  const { can } = usePermissions();
  const canEdit = can("planner.settings");

  const { data, isLoading } = usePlannerSettings();
  const { mutate: update, isPending } = useUpdatePlannerSettings();

  const [draft, setDraft] = useState(null);
  const settings = draft ?? data?.settings ?? null;

  const setField = (key, value) =>
    setDraft({ ...(draft ?? data?.settings ?? {}), [key]: value });

  const toggleDay = (value) => {
    const current = settings.workDays?.length
      ? settings.workDays
      : DAY_OPTIONS.map((day) => day.value);
    const next = current.includes(value)
      ? current.filter((day) => day !== value)
      : [...current, value];
    if (next.length === 0) {
      return toast.warning("Kamida bitta ish kuni belgilanishi kerak");
    }
    setField("workDays", next);
  };

  const handleSave = () => {
    if (settings.minLessonsPerDay > settings.maxLessonsPerDay) {
      return toast.error(
        "Kunlik minimal dars maksimaldan katta bo'lishi mumkin emas",
      );
    }

    update(
      {
        workDays: settings.workDays ?? [],
        maxLessonsPerDay: Number(settings.maxLessonsPerDay),
        minLessonsPerDay: Number(settings.minLessonsPerDay),
        teacherMaxPerDay: Number(settings.teacherMaxPerDay),
        maxSameSubjectPerDay: Number(settings.maxSameSubjectPerDay),
        allowClassGaps: settings.allowClassGaps,
        allowTeacherGaps: settings.allowTeacherGaps,
        avoidConsecutiveSame: settings.avoidConsecutiveSame,
        seed: Number(settings.seed),
      },
      {
        onSuccess: () => {
          setDraft(null);
          toast.success("Sozlamalar saqlandi");
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Saqlashda xatolik"),
      },
    );
  };

  if (isLoading || !settings) return <LoaderCard title="Sozlamalar yuklanmoqda..." />;

  // Bo'sh massiv = hamma kun (server ham shunday o'qiydi).
  const activeDays = settings.workDays?.length
    ? settings.workDays
    : DAY_OPTIONS.map((day) => day.value);

  return (
    <div className="space-y-4">
      <PeriodsEditor />

      <Card className="space-y-3">
        <div>
          <h2 className="font-medium text-gray-900">Ish kunlari</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Jadval faqat belgilangan kunlarga tuziladi.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {DAY_OPTIONS.map((day) => {
            const active = activeDays.includes(day.value);
            return (
              <button
                key={day.value}
                type="button"
                disabled={!canEdit}
                onClick={() => toggleDay(day.value)}
                className={cn(
                  "rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "border-primary bg-primary text-white"
                    : "border-gray-200 bg-white text-gray-500 hover:border-gray-300",
                  !canEdit && "cursor-default opacity-70",
                )}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      </Card>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <ConstraintCard
          title="Sinf cheklovlari"
          items={CLASS_CONSTRAINTS}
          settings={settings}
          canEdit={canEdit}
          onChange={setField}
        />

        <ConstraintCard
          title="O'qituvchi cheklovlari"
          items={TEACHER_CONSTRAINTS}
          settings={settings}
          canEdit={canEdit}
          onChange={setField}
        />
      </div>

      <Card className="space-y-4">
        <h2 className="font-medium text-gray-900">Qo'shimcha qoidalar</h2>

        {CONSTRAINT_FLAGS.map((flag) => (
          <div key={flag.key} className="flex items-start gap-3">
            <Switch
              checked={Boolean(settings[flag.key])}
              disabled={!canEdit}
              onChange={(value) => setField(flag.key, value)}
            />
            <div>
              <p className="text-sm font-medium text-gray-900">{flag.label}</p>
              <p className="text-xs text-gray-500">{flag.hint}</p>
            </div>
          </div>
        ))}
      </Card>

      <Card className="space-y-3">
        <div>
          <h2 className="font-medium text-gray-900">Variant raqami</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Bir xil ma'lumot va bir xil raqam har doim AYNAN bir xil jadval
            beradi. Boshqacha joylashtirish kerak bo'lsa raqamni o'zgartiring
            (yoki Shakllantirish tabidagi "Boshqa variant" tugmasini bosing).
          </p>
        </div>

        <Input
          min={1}
          max={999999}
          type="number"
          disabled={!canEdit}
          className="h-10 w-32"
          value={String(settings.seed ?? 1)}
          onChange={(e) => setField("seed", e.target.value)}
        />
      </Card>

      {canEdit && (
        <div className="flex justify-end">
          <Button
            className="w-full xs:w-40"
            disabled={isPending || draft === null}
            onClick={handleSave}
          >
            Saqlash{isPending && "..."}
          </Button>
        </div>
      )}
    </div>
  );
};

const ConstraintCard = ({ title, items, settings, canEdit, onChange }) => (
  <Card className="space-y-4">
    <h2 className="font-medium text-gray-900">{title}</h2>

    {items.map((item) => (
      <div key={item.key} className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-700">{item.label}</span>
          <Input
            min={item.min}
            max={item.max}
            type="number"
            disabled={!canEdit}
            className="h-9 w-20"
            value={String(settings[item.key] ?? 0)}
            onChange={(e) => onChange(item.key, e.target.value)}
          />
          <span className="text-sm text-gray-500">{item.suffix}</span>
        </div>
        <p className="text-xs text-gray-500">{item.hint}</p>
      </div>
    ))}
  </Card>
);

export default PlannerSettingsPage;
