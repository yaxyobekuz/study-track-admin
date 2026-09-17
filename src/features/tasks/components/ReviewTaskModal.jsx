// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// Icons
import { CircleCheckBig, FileText, RotateCcw, TriangleAlert } from "lucide-react";

// Queries
import { useReviewTask } from "../queries/tasks.mutations";

// Utils
import { cn } from "@/shared/utils/cn";
import { toDateTimeInputValue } from "@/shared/utils/date.utils";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

const ReviewTaskModal = () => (
  <ResponsiveModal name="reviewTask" title="Ishni ko'rib chiqish" className="max-w-lg">
    <Content />
  </ResponsiveModal>
);

const ACTIONS = [
  {
    value: "approve",
    label: "Qabul qilish",
    hint: "Ish to'g'ri bajarilgan",
    icon: CircleCheckBig,
    active: "bg-emerald-50 text-emerald-700 ring-emerald-400",
  },
  {
    value: "reject",
    label: "Qaytarish",
    hint: "Qayta ishlash kerak",
    icon: RotateCcw,
    active: "bg-orange-50 text-orange-700 ring-orange-400",
  },
];

/**
 * Qabul qilish yoki qayta ishlashga qaytarish. Rad etishda izoh DOIM
 * majburiy (ijrochi nimani tuzatishini bilishi kerak); tasdiqlashda esa
 * sozlamaga bog'liq (`requireApproveReason`).
 */
const Content = ({
  close,
  isLoading,
  setIsLoading,
  taskId,
  dueDate,
  initialAction = "approve",
  requireApproveReason = false,
  filesCount = 0,
  autoPenaltyPoints = 0,
}) => {
  const { mutate: reviewTask } = useReviewTask();
  const [action, setAction] = useState(initialAction);
  const [reason, setReason] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [openedAt] = useState(() => Date.now());

  const isOverdue = dueDate && new Date(dueDate).getTime() < openedAt;
  const reasonRequired = action === "reject" || requireApproveReason;
  const needsDate = action === "reject" && isOverdue;
  const canSubmit = (!reasonRequired || reason.trim()) && (!needsDate || newDueDate);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (reasonRequired && !reason.trim()) return toast.error("Izoh majburiy");
    if (needsDate && !newDueDate)
      return toast.error("Muddati o'tganligi sababli yangi ijro muddati majburiy");

    const data = { reason: reason.trim() };
    if (action === "reject" && newDueDate) data.newDueDate = new Date(newDueDate).toISOString();

    setIsLoading(true);
    reviewTask(
      { id: taskId, action, data },
      {
        onSuccess: () => {
          close();
          toast.success(action === "approve" ? "Ish qabul qilindi" : "Ish qayta ishlashga qaytarildi");
        },
        onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {ACTIONS.map((a) => {
          const Icon = a.icon;
          const on = action === a.value;
          return (
            <button
              key={a.value}
              type="button"
              onClick={() => setAction(a.value)}
              aria-pressed={on}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl px-3 py-3 ring-1 transition-colors",
                on ? `${a.active} ring-2` : "bg-white text-gray-600 ring-gray-200 hover:bg-gray-50",
              )}
            >
              <Icon className="size-6" strokeWidth={1.75} />
              <span className="text-sm font-semibold">{a.label}</span>
              <span className="text-[11px] opacity-80">{a.hint}</span>
            </button>
          );
        })}
      </div>

      <p className="flex items-center gap-1.5 text-xs text-gray-500">
        <FileText className="size-3.5" />
        Ijrochi {filesCount} ta fayl yuklagan
      </p>

      <InputField
        required={reasonRequired}
        label={action === "approve" ? "Izoh" : "Nimani tuzatish kerak?"}
        type="textarea"
        value={reason}
        inputClassName="min-h-24"
        onChange={(e) => setReason(e.target.value)}
        placeholder={
          action === "approve" ? "Masalan: Zo'r bajarilgan, rahmat!" : "Aniq yozing — ijrochi shu matnni ko'radi"
        }
      />

      {action === "reject" && (
        <>
          <InputField
            required={isOverdue}
            label={isOverdue ? "Yangi ijro muddati" : "Yangi ijro muddati (ixtiyoriy)"}
            type="datetime-local"
            min={toDateTimeInputValue(new Date(openedAt + 60000))}
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
          />
          {isOverdue && (
            <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />
              <p>
                Muddat o'tgan, shuning uchun yangi muddat majburiy.
                {autoPenaltyPoints > 0 && <> Ijrochiga <b>{autoPenaltyPoints} ball</b> jarima yoziladi.</>}
              </p>
            </div>
          )}
        </>
      )}

      <Button
        className="w-full"
        disabled={isLoading || !canSubmit}
        variant={action === "approve" ? "default" : "danger"}
      >
        {isLoading ? "Saqlanmoqda..." : action === "approve" ? "Qabul qilish" : "Qaytarish"}
      </Button>
    </form>
  );
};

export default ReviewTaskModal;
