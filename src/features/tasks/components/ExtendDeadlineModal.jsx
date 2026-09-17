// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// Queries
import { useExtendDeadline } from "../queries/tasks.mutations";

// Utils
import { formatDateTimeUz, toDateTimeInputValue } from "@/shared/utils/date.utils";

// Components
import Button from "@/shared/components/ui/button/Button";
import Switch from "@/shared/components/ui/switch/Switch";
import InputField from "@/shared/components/ui/input/InputField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

const ExtendDeadlineModal = () => (
  <ResponsiveModal name="extendDeadline" title="Muddatni uzaytirish">
    <Content />
  </ResponsiveModal>
);

// Joriy muddatga (yoki hozirga, agar o'tib ketgan bo'lsa) qo'shiladigan tezkor oraliqlar
const QUICK = [
  { label: "+1 kun", days: 1 },
  { label: "+3 kun", days: 3 },
  { label: "+1 hafta", days: 7 },
];

const Content = ({
  close,
  isLoading,
  setIsLoading,
  taskId,
  currentDueDate,
  defaultPenaltyPoints = 1,
  maxPenaltyPoints = 100,
}) => {
  const { mutate: extendDeadline } = useExtendDeadline();
  const [newDueDate, setNewDueDate] = useState("");
  const [reason, setReason] = useState("");
  const [withPenalty, setWithPenalty] = useState(false);
  const [penaltyPoints, setPenaltyPoints] = useState(String(defaultPenaltyPoints));
  const [openedAt] = useState(() => Date.now());

  // Minimum yangi muddat: joriy muddatdan 1 daqiqa keyin
  const minDate = currentDueDate
    ? toDateTimeInputValue(new Date(new Date(currentDueDate).getTime() + 60000))
    : undefined;

  const base = Math.max(new Date(currentDueDate || openedAt).getTime(), openedAt);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newDueDate) return toast.error("Yangi ijro muddati majburiy");
    if (!reason.trim()) return toast.error("Sabab majburiy");
    const points = Number(penaltyPoints);
    if (withPenalty && (!Number.isInteger(points) || points < 1 || points > maxPenaltyPoints)) {
      return toast.error(`Jarima bali 1–${maxPenaltyPoints} oralig'ida bo'lishi kerak`);
    }

    const data = {
      newDueDate: new Date(newDueDate).toISOString(),
      reason: reason.trim(),
      withPenalty,
    };
    if (withPenalty) data.penaltyPoints = points;

    setIsLoading(true);
    extendDeadline(
      { id: taskId, data },
      {
        onSuccess: () => {
          close();
          toast.success("Ijro muddati uzaytirildi");
        },
        onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <p className="rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-600">
        Hozirgi muddat: <b className="text-gray-900">{formatDateTimeUz(currentDueDate)}</b>
      </p>

      <div className="space-y-2">
        <InputField
          required
          label="Yangi ijro muddati"
          type="datetime-local"
          value={newDueDate}
          min={minDate}
          onChange={(e) => setNewDueDate(e.target.value)}
        />
        <div className="flex flex-wrap gap-1.5">
          {QUICK.map((q) => (
            <button
              key={q.label}
              type="button"
              onClick={() => setNewDueDate(toDateTimeInputValue(new Date(base + q.days * 86400000)))}
              className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600 hover:bg-blue-100 hover:text-blue-700"
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      <InputField
        required
        label="Sabab"
        type="textarea"
        value={reason}
        inputClassName="min-h-24"
        onChange={(e) => setReason(e.target.value)}
        placeholder="Muddatni uzaytirish sababini kiriting..."
      />

      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-gray-50 px-3.5 py-3">
        <span>
          <span className="block text-sm font-medium text-gray-800">Jarima bilan uzaytirish</span>
          <span className="text-xs text-gray-500">Ijrochi o'z vaqtida ulgurmagani uchun</span>
        </span>
        <Switch checked={withPenalty} onChange={setWithPenalty} />
      </label>

      {withPenalty && (
        <InputField
          required
          label="Jarima bali"
          type="number"
          min={1}
          max={maxPenaltyPoints}
          value={penaltyPoints}
          onChange={(e) => setPenaltyPoints(e.target.value)}
        />
      )}

      <Button disabled={isLoading || !newDueDate || !reason.trim()} className="w-full">
        {isLoading ? "Saqlanmoqda..." : "Uzaytirish"}
      </Button>
    </form>
  );
};

export default ExtendDeadlineModal;
