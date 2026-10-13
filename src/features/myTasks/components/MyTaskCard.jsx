// Router
import { Link } from "react-router-dom";

// Icons
import { ArrowUpRight, Check, Link2, Paperclip, X } from "lucide-react";

// Components
import TaskKindBadge from "@/features/tasks/components/TaskKindBadge";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import {
  TASK_STATE_META,
  formatTaskWindow,
  getDeadlineInfo,
  resolveTimeState,
} from "@/features/tasks/data/tasks.data";

const SUBMITTABLE = ["pending", "extended", "pending_rejected"];

/**
 * KATAKCHA (✓ / ✗) — ijrochining asosiy belgisi.
 *
 * ⚠️ Katakcha o'zi holatni o'zgartirmaydi: u TOPSHIRISH oynasini ochadi,
 * chunki ishni yakunlash uchun isbot majburiy.
 *
 * ✗ — AVTOMATIK va HOSILA: muddat o'tdi-yu ish topshirilmadi. Hech kim
 * qo'ymaydi, shuning uchun muddat uzaytirilsa o'z-o'zidan yo'qoladi.
 */
const CheckBox = ({ state, disabled, onClick }) => {
  const done = state === "done";
  const review = state === "review";
  const missed = state === "missed";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={
        done ? "Bajarilgan" : missed ? "Bajarilmagan" : review ? "Tekshiruvda" : "Bajarildi deb belgilash"
      }
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-xl border-2 transition-colors",
        done && "border-emerald-500 bg-emerald-500 text-white",
        review && "border-amber-400 bg-amber-400 text-white",
        missed && "border-rose-500 bg-rose-500 text-white",
        !done && !review && !missed && "border-gray-300 bg-white text-transparent",
        !disabled && !done && !review && !missed && "hover:border-primary hover:bg-primary/5",
        disabled && "cursor-default",
      )}
    >
      {missed ? <X className="size-5" strokeWidth={3} /> : <Check className="size-5" strokeWidth={3} />}
    </button>
  );
};

/**
 * "Topshiriqlarim" ro'yxatidagi bitta topshiriq.
 *
 * ⚠️ HOZIR BAJARILISH VAQTI — QIZIL: oraliq ichidagi topshiriq butun
 * kartasi bilan ajralib turadi, chunki xodim ro'yxatga qarab "hozir nima
 * qilishim kerak" degan savolga bir qarashda javob olishi kerak.
 *
 * @param {{ task: object, now: number, onSubmit: (task: object) => void }} props
 */
const MyTaskCard = ({ task, now, onSubmit }) => {
  // `now` — jonli hisoblagich: holat ekran ochiq turganda ham yangilanadi
  const state = resolveTimeState(task, now);
  const meta = TASK_STATE_META[state] || TASK_STATE_META.open;
  const StateIcon = meta.icon;
  const canSubmit = SUBMITTABLE.includes(task.status);
  const isActive = state === "active";
  const deadline = getDeadlineInfo(task.dueDate, task.status);

  return (
    <div
      className={cn(
        "rounded-2xl bg-white p-4 ring-1 transition-shadow",
        isActive ? "shadow-md shadow-rose-100 ring-2 ring-rose-300" : "ring-gray-100",
        state === "missed" && "ring-rose-200",
      )}
    >
      <div className="flex items-start gap-3">
        <CheckBox state={state} disabled={!canSubmit} onClick={() => canSubmit && onSubmit(task)} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <Link
              to={`/tasks/${task.id}`}
              className="min-w-0 font-medium leading-snug text-gray-900 hover:text-primary"
            >
              {task.title}
            </Link>
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset",
                meta.chip,
              )}
            >
              <StateIcon className="size-3" strokeWidth={2} />
              {meta.short}
            </span>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <TaskKindBadge kind={task.kind} />
            <span className="text-xs text-gray-500">{formatTaskWindow(task).text}</span>
            {deadline && (
              <span
                className={cn(
                  "text-xs font-medium",
                  deadline.overdue ? "text-rose-600" : "text-gray-500",
                )}
              >
                · {deadline.text}
              </span>
            )}
            {task.attachmentsCount > 0 && (
              <span className="inline-flex items-center gap-0.5 text-xs text-gray-400">
                <Paperclip className="size-3" />
                {task.attachmentsCount}
              </span>
            )}
            {task.linksCount > 0 && (
              <span className="inline-flex items-center gap-0.5 text-xs text-gray-400">
                <Link2 className="size-3" />
                {task.linksCount}
              </span>
            )}
          </div>

          {isActive && (
            <p className="mt-2 rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700">
              Hozir shu topshiriqni bajarish vaqti
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            {canSubmit ? (
              <button
                type="button"
                onClick={() => onSubmit(task)}
                className={cn(
                  "rounded-xl px-3 py-1.5 text-xs font-medium text-white transition-colors",
                  isActive || state === "missed"
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-primary hover:opacity-90",
                )}
              >
                Bajardim — isbot yuborish
              </button>
            ) : (
              <span className="text-xs text-gray-400">
                {state === "review"
                  ? "Tekshiruv javobini kutyapsiz"
                  : state === "done"
                    ? "Ish qabul qilindi"
                    : "Topshiriq yopilgan"}
              </span>
            )}

            <Link
              to={`/tasks/${task.id}`}
              className="inline-flex items-center gap-0.5 text-xs text-gray-500 hover:text-primary"
            >
              Batafsil
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTaskCard;
