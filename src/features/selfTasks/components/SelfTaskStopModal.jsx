// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// Queries
import { useStopSelfRule, useStopSelfTask } from "@/features/tasks/queries/selfTasks.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

/**
 * O'ZIGA BELGILAGAN ISHNI TO'XTATISH — "kerak bo'lmay qoldi".
 *
 * ⚠️ O'CHIRISH BILAN CHALKASHMASIN. To'xtatilgan ish SABAB bilan
 * registrda qoladi va rahbariyat statistikasida "to'xtatilgan" bo'lib
 * ko'rinadi; o'chirish esa izsiz yo'q qiladi va u faqat XATO kiritilgan
 * ish uchun. Shuning uchun bu yerda sabab MAJBURIY.
 *
 * ⚠️ Jarima bayrog'i yo'q: shaxsiy ishda jarima umuman bo'lmaydi.
 *
 * ⚠️ DOIMIY ISH QOIDASI HAM SHU OYNADAN to'xtatiladi (`mode: "rule"`):
 * ikkalasi ham AYNAN BITTA maydonni (majburiy sabab) so'raydi. Alohida
 * oyna bo'lsa, sabab bitta joyda majburiy, ikkinchisida esa kodga
 * qotirilgan standart matn bo'lib qolardi — ya'ni registr "nega
 * to'xtatilgan" degan savolga javob bermaydigan bir xil qatorlar bilan
 * to'lardi.
 */
const SelfTaskStopModal = () => (
  <ResponsiveModal
    name="stopSelfTask"
    title="To'xtatish"
    description="To'xtatilgani sabab bilan ro'yxatda qoladi — keyin qayta yoqish mumkin"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, task, mode = "task" }) => {
  const { mutate: stopTask } = useStopSelfTask();
  const { mutate: stopRule } = useStopSelfRule();
  const [reason, setReason] = useState("");

  if (!task) return null;

  const isRule = mode === "rule";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return toast.error("Sabab majburiy");

    const run = isRule ? stopRule : stopTask;
    setIsLoading(true);
    run(
      { id: task.id, data: { reason: reason.trim() } },
      {
        onSuccess: () => {
          close();
          toast.success(isRule ? "Doimiy ish to'xtatildi" : "Ish to'xtatildi");
        },
        onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <p className="rounded-xl bg-gray-50 px-3.5 py-2.5 text-sm font-medium text-gray-800">
        {task.title}
      </p>

      <InputField
        required
        label="Sabab"
        type="textarea"
        value={reason}
        inputClassName="min-h-24"
        disabled={isLoading}
        onChange={(e) => setReason(e.target.value)}
        placeholder={
          isRule
            ? "Nega to'xtatilyapti? Yangi topshiriqlar yozilmaydi, yozilganlari qoladi..."
            : "Nega to'xtatilyapti? Masalan: vazifa boshqa xodimga o'tdi..."
        }
      />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" disabled={isLoading} onClick={() => close()}>
          Bekor qilish
        </Button>
        <Button variant="danger" disabled={isLoading}>
          {isLoading ? "To'xtatilmoqda..." : "To'xtatish"}
        </Button>
      </div>
    </form>
  );
};

export default SelfTaskStopModal;
