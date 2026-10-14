// Router
import { Link } from "react-router-dom";

// Icons
import {
  ArrowUpRight,
  Ban,
  CalendarClock,
  Check,
  Link2,
  Paperclip,
  PencilLine,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";

// Components
import TaskKindBadge from "@/features/tasks/components/TaskKindBadge";
import ConfirmPopover from "@/shared/components/ui/ConfirmPopover";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import {
  TASK_STATE_META,
  formatTaskWindow,
  getDeadlineInfo,
  resolveTimeState,
} from "@/features/tasks/data/tasks.data";

const WORKING = ["pending", "extended", "pending_rejected"];
const CLOSED = ["completed", "stopped"];

/**
 * KATAKCHA (✓ / ✗).
 *
 * ⚠️ Katakcha o'zi holatni o'zgartirmaydi: u YAKUNLASH oynasini ochadi,
 * chunki isbot (fayl) baribir majburiy — jarima yo'qligi "hech narsa
 * yuklamasdan yopib qo'yish" degani emas.
 *
 * ✗ — AVTOMATIK va HOSILA: muddat o'tdi-yu ish yakunlanmadi. Hech kim
 * qo'ymaydi, shuning uchun muddat surilsa o'z-o'zidan yo'qoladi.
 */
const CheckBox = ({ state, disabled, onClick }) => {
  const done = state === "done";
  const missed = state === "missed";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={done ? "Bajarilgan" : missed ? "Bajarilmagan" : "Bajardim deb belgilash"}
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-xl border-2 transition-colors",
        done && "border-emerald-500 bg-emerald-500 text-white",
        missed && "border-rose-500 bg-rose-500 text-white",
        !done && !missed && "border-gray-300 bg-white text-transparent",
        !disabled && !done && !missed && "hover:border-primary hover:bg-primary/5",
        disabled && "cursor-default",
      )}
    >
      {missed ? (
        <X className="size-5" strokeWidth={3} />
      ) : (
        <Check className="size-5" strokeWidth={3} />
      )}
    </button>
  );
};

const ActionButton = ({ icon: Icon, label, tone = "gray", onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors",
      tone === "rose"
        ? "text-rose-600 hover:bg-rose-50"
        : "text-gray-500 hover:bg-gray-100 hover:text-gray-800",
    )}
  >
    <Icon className="size-3.5" />
    {label}
  </button>
);

/**
 * "O'zim belgilagan" ro'yxatidagi bitta ish.
 *
 * ⚠️ TASDIQLASH KUTILMAYDI: "Tekshiruvda" holati bu oqimda umuman
 * bo'lmaydi, shuning uchun karta ham uni ko'rsatmaydi — yakunlangani
 * darhol ✓ bo'ladi.
 *
 * ⚠️ AMALLAR QATOR EGASIDA: tahrirlash, muddatni surish, to'xtatish,
 * qayta ochish va o'chirish — hammasi shu kartada. Rahbariyat bu ishni
 * faqat KO'RADI (`/tasks/self`), chunki bu odamning o'z rejasi.
 *
 * @param {{ task: object, now: number, onComplete: Function,
 *   onEdit: Function, onDeadline: Function, onStop: Function,
 *   onDelete: Function, detailPath?: string }} props
 */
const SelfTaskCard = ({
  task,
  now,
  onComplete,
  onEdit,
  onDeadline,
  onStop,
  onDelete,
  detailPath = "/my-tasks/self",
}) => {
  const state = resolveTimeState(task, now);
  const meta = TASK_STATE_META[state] || TASK_STATE_META.open;
  const StateIcon = meta.icon;
  const isWorking = WORKING.includes(task.status);
  const isClosed = CLOSED.includes(task.status);
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
        <CheckBox
          state={state}
          disabled={!isWorking}
          onClick={() => isWorking && onComplete(task)}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <Link
              to={`${detailPath}/${task.id}`}
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
            {task.scheduleId && (
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700">
                <RotateCcw className="size-3" />
                Doimiy ishdan
              </span>
            )}
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
              Hozir shu ishni bajarish vaqti
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {isWorking ? (
              <>
                <button
                  type="button"
                  onClick={() => onComplete(task)}
                  className={cn(
                    "rounded-xl px-3 py-1.5 text-xs font-medium text-white transition-colors",
                    isActive || state === "missed"
                      ? "bg-rose-600 hover:bg-rose-700"
                      : "bg-primary hover:opacity-90",
                  )}
                >
                  Bajardim
                </button>
                <ActionButton icon={PencilLine} label="Tahrirlash" onClick={() => onEdit(task)} />
                <ActionButton
                  icon={CalendarClock}
                  label="Muddat"
                  onClick={() => onDeadline(task, "extend")}
                />
                <ActionButton icon={Ban} label="To'xtatish" onClick={() => onStop(task)} />
              </>
            ) : (
              <>
                {isClosed && (
                  <ActionButton
                    icon={RotateCcw}
                    label="Qayta ochish"
                    onClick={() => onDeadline(task, "reopen")}
                  />
                )}
                <span className="text-xs text-gray-400">
                  {state === "done" ? "Bajarildi" : "To'xtatilgan"}
                </span>
              </>
            )}

            {/* ⚠️ O'CHIRISH — faqat XATO kiritilgan ish uchun. To'xtatish
                sabab bilan registrda qoladi, o'chirish esa izsiz yo'q
                qiladi, shuning uchun u oxirgi va tasdiq bilan. */}
            <ConfirmPopover
              danger
              title="Ishni o'chirish"
              description="Ish butunlay o'chiriladi. Bekor qilish uchun uni to'xtatish ham mumkin."
              confirmLabel="O'chirish"
              onConfirm={() => onDelete(task)}
            >
              {/* ⚠️ XOM `<button>`: `PopoverTrigger asChild` ref'ni bolaga
                  uzatadi, `forwardRef` siz komponent esa uni jimgina
                  yo'qotadi (Radix ogohlantirishi + ochilmaydigan oyna) */}
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50"
              >
                <Trash2 className="size-3.5" />
                O'chirish
              </button>
            </ConfirmPopover>

            <Link
              to={`${detailPath}/${task.id}`}
              className="ml-auto inline-flex items-center gap-0.5 text-xs text-gray-500 hover:text-primary"
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

export default SelfTaskCard;
