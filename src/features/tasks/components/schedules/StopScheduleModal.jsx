// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// Icons
import { Info } from "lucide-react";

// Queries
import { useStopTaskSchedule } from "../../queries/taskSchedules.queries";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

/**
 * Doimiy topshiriqni TO'XTATISH — o'chirish emas.
 *
 * ⚠️ Allaqachon yaratilgan topshiriqlar JOYIDA QOLADI: odam ularni
 * ko'rgan, boshlagan yoki bajargan bo'lishi mumkin. To'xtatish faqat
 * KELAJAKDAGI takrorlanishlarni to'xtatadi.
 */
const StopScheduleModal = () => (
  <ResponsiveModal
    name="stopTaskSchedule"
    title="Doimiy topshiriqni to'xtatish"
    description="Yangi topshiriqlar yozilmaydi — yaratilganlari qoladi"
    className="max-w-md"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, schedule }) => {
  const { mutate: stopSchedule } = useStopTaskSchedule();
  const [reason, setReason] = useState("");

  if (!schedule) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (reason.trim().length < 3) return toast.error("Sababni yozing");

    setIsLoading(true);
    stopSchedule(
      { id: schedule.id, reason: reason.trim() },
      {
        onSuccess: () => {
          close();
          toast.success("Doimiy topshiriq to'xtatildi");
        },
        onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="font-medium text-gray-900">{schedule.title}</p>
        <p className="text-sm text-gray-500">{schedule.ruleLabel}</p>
      </div>

      <InputField
        required
        label="Sabab"
        type="textarea"
        value={reason}
        maxLength={500}
        inputClassName="min-h-20"
        placeholder="Nega to'xtatilyapti?"
        onChange={(e) => setReason(e.target.value)}
      />

      <div className="flex items-start gap-2 rounded-xl bg-blue-50 px-3.5 py-2.5 text-xs text-blue-800">
        <Info className="mt-0.5 size-4 shrink-0" />
        <p>
          Allaqachon yaratilgan topshiriqlar o&apos;z holicha qoladi. Qoidani keyinroq
          qayta yoqish mumkin.
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" disabled={isLoading} onClick={() => close()}>
          Bekor qilish
        </Button>
        <Button disabled={isLoading}>{isLoading ? "To'xtatilmoqda..." : "To'xtatish"}</Button>
      </div>
    </form>
  );
};

export default StopScheduleModal;
