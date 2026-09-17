// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// Queries
import { useReopenTask } from "../queries/tasks.mutations";

// Utils
import { toDateTimeInputValue } from "@/shared/utils/date.utils";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

const ReopenTaskModal = () => (
  <ResponsiveModal
    name="reopenTask"
    title="Topshiriqni qayta ochish"
    description="Topshiriq yana ijrochiga qaytadi va yangi muddat bilan boshlanadi"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, taskId }) => {
  const { mutate: reopen } = useReopenTask();
  const [newDueDate, setNewDueDate] = useState("");
  const [reason, setReason] = useState("");
  const [openedAt] = useState(() => Date.now());

  const minDate = toDateTimeInputValue(new Date(openedAt + 60000));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newDueDate) return toast.error("Yangi ijro muddatini belgilang");
    if (!reason.trim()) return toast.error("Sabab majburiy");

    setIsLoading(true);
    reopen(
      {
        id: taskId,
        data: { newDueDate: new Date(newDueDate).toISOString(), reason: reason.trim() },
      },
      {
        onSuccess: () => {
          close();
          toast.success("Topshiriq qayta ochildi");
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
        label="Yangi ijro muddati"
        type="datetime-local"
        value={newDueDate}
        min={minDate}
        onChange={(e) => setNewDueDate(e.target.value)}
      />

      <InputField
        required
        label="Nega qayta ochilyapti?"
        type="textarea"
        value={reason}
        inputClassName="min-h-24"
        onChange={(e) => setReason(e.target.value)}
        placeholder="Masalan: natijada kamchilik topildi..."
      />

      <Button disabled={isLoading || !newDueDate || !reason.trim()} className="w-full">
        {isLoading ? "Saqlanmoqda..." : "Qayta ochish"}
      </Button>
    </form>
  );
};

export default ReopenTaskModal;
