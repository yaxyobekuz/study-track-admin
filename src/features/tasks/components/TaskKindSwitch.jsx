// Toast
import { toast } from "sonner";

// Queries
import { useUpdateTask } from "../queries/tasks.mutations";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { TASK_KIND_META } from "../data/tasks.data";

const KINDS = ["main", "extra"];

/**
 * TOPSHIRIQ TURINI TEZ O'ZGARTIRISH — "Asosiy" ↔ "Qo'shimcha".
 *
 * ⚠️ NIMA UCHUN KERAK: "asosiy" endi DOIMIY (takrorlanadigan) ishni
 * bildiradi, lekin bu ma'no keyin kiritildi — undan oldin yaratilgan
 * bir martalik topshiriqlarning hammasi "asosiy" bo'lib qolgan. Ularni
 * ommaviy ravishda avtomat o'zgartirish ADMINNING qaroriga aralashish
 * bo'lardi, shuning uchun tur QO'LDA to'g'rilanadi.
 *
 * ⚠️ Yakunlangan topshiriqda ham ishlaydi: tur — YORLIQ, u tasdiqlangan
 * natija nimaga nisbatan qabul qilinganini o'zgartirmaydi (server ham
 * aynan shu bitta maydonga ruxsat beradi).
 *
 * @param {{ task: object, size?: "sm"|"md", className?: string }} props
 */
const TaskKindSwitch = ({ task, size = "md", className = "" }) => {
  const { can } = usePermissions();
  const { mutate: updateTask, isPending } = useUpdateTask();

  if (!can("tasks.update") && !can("tasks.team")) return null;

  const change = (kind) => {
    if (kind === (task.kind || "main") || isPending) return;

    const formData = new FormData();
    formData.append("kind", kind);

    updateTask(
      { id: task.id, formData },
      {
        onSuccess: () => toast.success(`Turi "${TASK_KIND_META[kind].label}" ga o'zgartirildi`),
        onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      },
    );
  };

  return (
    <div
      className={cn("inline-flex gap-0.5 rounded-full bg-gray-100 p-0.5", className)}
      // Ro'yxat qatori bosilganda topshiriq ochiladi — tugma uni ochmasin
      onClick={(e) => e.stopPropagation()}
      role="group"
      aria-label="Topshiriq turi"
    >
      {KINDS.map((kind) => {
        const meta = TASK_KIND_META[kind];
        const active = (task.kind || "main") === kind;
        return (
          <button
            key={kind}
            type="button"
            disabled={isPending}
            title={meta.hint}
            onClick={() => change(kind)}
            className={cn(
              "rounded-full font-medium transition-colors disabled:opacity-50",
              size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
              active ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800",
            )}
          >
            {meta.label}
          </button>
        );
      })}
    </div>
  );
};

export default TaskKindSwitch;
