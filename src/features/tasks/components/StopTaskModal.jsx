// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// Queries
import { useStopTask } from "../queries/tasks.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";
import Switch from "@/shared/components/ui/switch/Switch";
import InputField from "@/shared/components/ui/input/InputField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

const StopTaskModal = () => (
  <ResponsiveModal
    name="stopTask"
    title="Topshiriqni to'xtatish"
    description="To'xtatilgan topshiriq ijrochidan olib tashlanadi. Keyin qayta ochish mumkin."
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({
  close,
  isLoading,
  setIsLoading,
  taskId,
  defaultPenaltyPoints,
  maxPenaltyPoints = 100,
  penaltyApplied = false,
}) => {
  const { mutate: stopTask } = useStopTask();
  const [reason, setReason] = useState("");
  const [withPenalty, setWithPenalty] = useState(false);
  const [penaltyPoints, setPenaltyPoints] = useState(String(defaultPenaltyPoints || 1));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return toast.error("Sabab majburiy");
    const points = Number(penaltyPoints);
    if (withPenalty && (!Number.isInteger(points) || points < 1 || points > maxPenaltyPoints)) {
      return toast.error(`Jarima bali 1–${maxPenaltyPoints} oralig'ida bo'lishi kerak`);
    }

    const data = { reason: reason.trim(), withPenalty };
    if (withPenalty) data.penaltyPoints = points;

    setIsLoading(true);
    stopTask(
      { id: taskId, data },
      {
        onSuccess: () => {
          close();
          toast.success("Topshiriq to'xtatildi");
        },
        onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <InputField
        required
        label="To'xtatish sababi"
        type="textarea"
        value={reason}
        inputClassName="min-h-24"
        onChange={(e) => setReason(e.target.value)}
        placeholder="Masalan: vazifa endi dolzarb emas"
      />

      {penaltyApplied ? (
        <p className="rounded-xl bg-gray-50 px-3 py-2.5 text-xs text-gray-600">
          Bu topshiriq uchun jarima allaqachon yozilgan — qayta jarima berilmaydi.
        </p>
      ) : (
        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-gray-50 px-3.5 py-3">
          <span>
            <span className="block text-sm font-medium text-gray-800">Jarima bilan to'xtatish</span>
            <span className="text-xs text-gray-500">Ijrochi aybi bilan to'xtatilgan bo'lsa</span>
          </span>
          <Switch checked={withPenalty} onChange={setWithPenalty} />
        </label>
      )}

      {withPenalty && !penaltyApplied && (
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

      <Button type="submit" variant="danger" disabled={isLoading || !reason.trim()} className="w-full">
        {isLoading ? "Saqlanmoqda..." : "To'xtatish"}
      </Button>
    </form>
  );
};

export default StopTaskModal;
