// Toast
import { toast } from "sonner";

// React
import { useEffect } from "react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { Check, RotateCcw, Save } from "lucide-react";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Queries
import { tasksQueries } from "../queries/tasks.queries";
import { useUpdateTaskSettings } from "../queries/tasks.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";
import Switch from "@/shared/components/ui/switch/Switch";
import LoaderCard from "@/shared/components/ui/LoaderCard";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import {
  TONES,
  SETTINGS_SECTIONS,
  FILE_TYPE_OPTIONS,
  DEFAULT_TASK_SETTINGS,
} from "../data/tasks.data";

const FIELD_KEYS = Object.keys(DEFAULT_TASK_SETTINGS);

const pick = (source) =>
  Object.fromEntries(FIELD_KEYS.map((key) => [key, source?.[key] ?? DEFAULT_TASK_SETTINGS[key]]));

/** Sonli qoida: − [ son ] + birlik. Katta raqam bilan o'qish oson. */
const NumberStepper = ({ field, value, onChange }) => {
  const num = Number(value);
  const set = (next) => onChange(Math.min(field.max, Math.max(field.min, next)));

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center overflow-hidden rounded-xl ring-1 ring-gray-200">
        <button
          type="button"
          onClick={() => set((Number.isFinite(num) ? num : field.min) - 1)}
          disabled={num <= field.min}
          className="px-3 py-2 text-lg leading-none text-gray-500 hover:bg-gray-100 disabled:opacity-30"
          aria-label="Kamaytirish"
        >
          −
        </button>
        <input
          type="number"
          min={field.min}
          max={field.max}
          value={value}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
          className="w-16 border-x border-gray-200 py-2 text-center text-sm font-semibold tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          type="button"
          onClick={() => set((Number.isFinite(num) ? num : field.min) + 1)}
          disabled={num >= field.max}
          className="px-3 py-2 text-lg leading-none text-gray-500 hover:bg-gray-100 disabled:opacity-30"
          aria-label="Oshirish"
        >
          +
        </button>
      </div>
      {field.unit && <span className="text-sm text-gray-500">{field.unit}</span>}
    </div>
  );
};

/**
 * "Sozlamalar" tabi — topshiriq qoidalari. Har bir qoida serverda HAM
 * tekshiriladi (`task.service.js`), bu sahifa faqat ularni boshqaradi.
 *
 * Saqlash tugmasi pastda "yopishqoq" panelda va faqat o'zgarish bo'lganda
 * faol: nima o'zgarganini sanab turadi.
 */
const TaskSettingsPage = () => {
  const { data: settings, isLoading } = useQuery(tasksQueries.settings());
  const { mutate: save, isPending } = useUpdateTaskSettings();

  const { state, setField, setFields } = useObjectState(pick(null));

  useEffect(() => {
    if (settings) setFields(pick(settings));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  if (isLoading) return <LoaderCard className="ring-1 ring-gray-100" />;

  const initial = pick(settings);
  const changedCount = FIELD_KEYS.filter(
    (key) => JSON.stringify(state[key]) !== JSON.stringify(initial[key]),
  ).length;

  const problems = [];
  SETTINGS_SECTIONS.forEach((section) =>
    section.fields.forEach((field) => {
      if (field.type !== "number") return;
      const v = state[field.key];
      if (v === "" || !Number.isInteger(Number(v)) || v < field.min || v > field.max) {
        problems.push(`"${field.label}" ${field.min}–${field.max} oralig'ida bo'lsin`);
      }
    }),
  );
  if (Number(state.maxCompletionFiles) < Number(state.minCompletionFiles))
    problems.push("Ko'pi bilan yuklanadigan fayllar kamidan kam bo'lmasin");
  if (Number(state.defaultPenaltyPoints) > Number(state.maxPenaltyPoints))
    problems.push("Standart jarima bali eng kattasidan oshmasin");
  if (!state.completionFileTypes.length) problems.push("Kamida bitta fayl turini tanlang");

  const toggleFileType = (type) => {
    const list = state.completionFileTypes;
    setField(
      "completionFileTypes",
      list.includes(type) ? list.filter((t) => t !== type) : [...list, type],
    );
  };

  const handleSave = () => {
    if (problems.length) return toast.error(problems[0]);
    const payload = Object.fromEntries(
      FIELD_KEYS.map((key) => [
        key,
        typeof DEFAULT_TASK_SETTINGS[key] === "number" ? Number(state[key]) : state[key],
      ]),
    );
    save(payload, {
      onSuccess: () => toast.success("Sozlamalar saqlandi"),
      onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
    });
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="grid gap-4 lg:grid-cols-2">
        {SETTINGS_SECTIONS.map((section) => {
          const tone = TONES[section.tone];
          const Icon = section.icon;
          return (
            <section
              key={section.key}
              className="rounded-2xl bg-white p-4 ring-1 ring-gray-100 xs:p-5"
            >
              <div className="flex items-start gap-3">
                <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", tone.chip)}>
                  <Icon className="size-5" strokeWidth={1.75} />
                </span>
                <div>
                  <h2 className="font-semibold text-gray-900">{section.title}</h2>
                  <p className="text-xs text-gray-500">{section.description}</p>
                </div>
              </div>

              <div className="mt-4 divide-y divide-gray-50">
                {section.fields.map((field) => {
                  const dirty =
                    JSON.stringify(state[field.key]) !== JSON.stringify(initial[field.key]);
                  return (
                    <div
                      key={field.key}
                      className={cn(
                        "flex flex-col gap-3 py-3.5 first:pt-0 last:pb-0",
                        field.type === "fileTypes"
                          ? ""
                          : "sm:flex-row sm:items-center sm:justify-between",
                      )}
                    >
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 text-sm font-medium text-gray-800">
                          {field.label}
                          {dirty && (
                            <span className="size-1.5 rounded-full bg-amber-500" title="O'zgartirildi" />
                          )}
                        </p>
                        {field.hint && <p className="mt-0.5 text-xs text-gray-500">{field.hint}</p>}
                      </div>

                      {field.type === "number" && (
                        <NumberStepper
                          field={field}
                          value={state[field.key]}
                          onChange={(v) => setField(field.key, v)}
                        />
                      )}

                      {field.type === "switch" && (
                        <Switch
                          checked={Boolean(state[field.key])}
                          onChange={(v) => setField(field.key, v)}
                        />
                      )}

                      {field.type === "fileTypes" && (
                        <div className="grid grid-cols-3 gap-2">
                          {FILE_TYPE_OPTIONS.map((opt) => {
                            const on = state.completionFileTypes.includes(opt.value);
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => toggleFileType(opt.value)}
                                aria-pressed={on}
                                className={cn(
                                  "relative rounded-xl px-3 py-2.5 text-left ring-1 transition-colors",
                                  on
                                    ? "bg-blue-50 ring-blue-300"
                                    : "bg-white ring-gray-200 hover:bg-gray-50",
                                )}
                              >
                                {on && (
                                  <Check className="absolute right-2 top-2 size-3.5 text-blue-600" />
                                )}
                                <p className={cn("text-sm font-medium", on ? "text-blue-700" : "text-gray-700")}>
                                  {opt.label}
                                </p>
                                <p className="text-[11px] text-gray-400">{opt.hint}</p>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* Saqlash paneli */}
      <div className="sticky bottom-3 z-10">
        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/95 px-4 py-3 shadow-lg ring-1 backdrop-blur transition-colors",
            changedCount > 0 ? "ring-amber-200" : "ring-gray-100",
          )}
        >
          <p className="text-sm text-gray-600">
            {problems.length > 0 ? (
              <span className="text-rose-600">{problems[0]}</span>
            ) : changedCount > 0 ? (
              <>
                <b>{changedCount}</b> ta qoida o'zgartirildi — saqlashni unutmang
              </>
            ) : (
              "Barcha o'zgarishlar saqlangan"
            )}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={changedCount === 0 || isPending}
              onClick={() => setFields(initial)}
            >
              <RotateCcw />
              Bekor qilish
            </Button>
            <Button
              type="button"
              disabled={changedCount === 0 || isPending || problems.length > 0}
              onClick={handleSave}
            >
              <Save />
              {isPending ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskSettingsPage;
