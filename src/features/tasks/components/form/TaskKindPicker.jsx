// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { TASK_KIND_META } from "../../data/tasks.data";

const KINDS = ["main", "extra"];

/**
 * TOPSHIRIQ TURI — asosiy yoki qo'shimcha.
 *
 * ⚠️ Tur KO'RSATKICH, to'siq emas: qoidalar (jarima, fayl, muddat)
 * ikkalasida ham bir xil. U rahbarga "qo'shimcha ishlar asosiy ishni bosib
 * ketmayaptimi" degan savolga javob beradi (dashboarddagi "Ish turlari"
 * kartasi), shuning uchun forma uni ochiq tanlov qilib ko'rsatadi —
 * sukut bo'yicha "Asosiy".
 *
 * @param {{ value: string, onChange: (kind: string) => void, disabled?: boolean }} props
 */
const TaskKindPicker = ({ value = "main", onChange, disabled = false }) => (
  <div>
    <p className="mb-1.5 text-sm font-medium text-gray-700">Topshiriq turi</p>

    <div className="grid grid-cols-2 gap-2">
      {KINDS.map((kind) => {
        const meta = TASK_KIND_META[kind];
        const Icon = meta.icon;
        const active = value === kind;

        return (
          <button
            key={kind}
            type="button"
            disabled={disabled}
            onClick={() => onChange(kind)}
            className={cn(
              "flex items-start gap-2.5 rounded-xl border p-3 text-left transition-colors disabled:opacity-50",
              active
                ? "border-primary bg-primary/5"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
            )}
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-lg",
                meta.chip,
              )}
            >
              <Icon className="size-4" strokeWidth={1.75} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-gray-900">{meta.label}</span>
              <span className="block text-xs leading-snug text-gray-500">{meta.hint}</span>
            </span>
          </button>
        );
      })}
    </div>
  </div>
);

export default TaskKindPicker;
