// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// Queries
import { useExtendSelfTask, useReopenSelfTask } from "@/features/tasks/queries/selfTasks.mutations";

// Utils
import { formatDateTimeUz, toDateTimeInputValue } from "@/shared/utils/date.utils";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Joriy muddatga (yoki hozirga, agar o'tib ketgan bo'lsa) qo'shiladigan oraliqlar
const QUICK = [
  { label: "+1 kun", days: 1 },
  { label: "+3 kun", days: 3 },
  { label: "+1 hafta", days: 7 },
];

/**
 * MUDDATNI SURISH yoki QAYTA OCHISH — bitta oyna, ikki rejim.
 *
 * ⚠️ JARIMA BAYROG'I YO'Q (markazdagi oynadan farqi): shaxsiy ishda
 * jarima umuman bo'lmaydi, shuning uchun "jarima bilan uzaytirish"
 * kalitining o'zi ham ko'rsatilmaydi — server ham uni rad etadi.
 *
 * ⚠️ SABAB SURISHDA MAJBURIY: o'zgarish tarixga yoziladi va "nega
 * kechikdim" degan savolga javob shu yerdan qoladi. Qayta ochishda esa
 * ixtiyoriy — bu odatda "adashib yopdim" holati.
 *
 * Ikki rejim bitta oynada, chunki ikkalasi ham AYNI ikki maydonni
 * (yangi muddat + sabab) so'raydi; alohida oyna bo'lsa, tezkor
 * oraliqlar va minimal sana hisobi ikki nusxada bo'lardi.
 */
const SelfTaskDeadlineModal = () => (
  <ResponsiveModal name="selfTaskDeadline" title="Muddatni o'zgartirish">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, task, mode = "extend" }) => {
  const { mutate: extendTask } = useExtendSelfTask();
  const { mutate: reopenTask } = useReopenSelfTask();
  const [newDueDate, setNewDueDate] = useState("");
  const [reason, setReason] = useState("");
  const [openedAt] = useState(() => Date.now());

  if (!task) return null;

  const isReopen = mode === "reopen";

  // Surishda yangi muddat joriy muddatdan KEYIN bo'lishi shart (server
  // ham shuni talab qiladi); qayta ochishda esa shunchaki kelajakda.
  const minDate = isReopen
    ? toDateTimeInputValue(new Date(openedAt + 60000))
    : toDateTimeInputValue(new Date(new Date(task.dueDate).getTime() + 60000));

  const base = Math.max(new Date(task.dueDate || openedAt).getTime(), openedAt);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newDueDate) return toast.error("Yangi ijro muddati majburiy");
    if (!isReopen && !reason.trim()) return toast.error("Sabab majburiy");

    const data = {
      newDueDate: new Date(newDueDate).toISOString(),
      reason: reason.trim(),
    };

    const run = isReopen ? reopenTask : extendTask;
    setIsLoading(true);
    run(
      { id: task.id, data },
      {
        onSuccess: () => {
          close();
          toast.success(isReopen ? "Ish qayta ochildi" : "Muddat o'zgartirildi");
        },
        onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <p className="rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-600">
        {task.title}
        <span className="mt-1 block text-xs">
          Hozirgi muddat: <b className="text-gray-900">{formatDateTimeUz(task.dueDate)}</b>
        </span>
      </p>

      <div className="space-y-2">
        <InputField
          required
          label="Yangi ijro muddati"
          type="datetime-local"
          value={newDueDate}
          min={minDate}
          disabled={isLoading}
          onChange={(e) => setNewDueDate(e.target.value)}
        />
        <div className="flex flex-wrap gap-1.5">
          {QUICK.map((q) => (
            <button
              key={q.label}
              type="button"
              onClick={() =>
                setNewDueDate(toDateTimeInputValue(new Date(base + q.days * 86400000)))
              }
              className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600 hover:bg-blue-100 hover:text-blue-700"
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      <InputField
        required={!isReopen}
        label="Sabab"
        type="textarea"
        value={reason}
        inputClassName="min-h-20"
        disabled={isLoading}
        onChange={(e) => setReason(e.target.value)}
        placeholder={
          isReopen
            ? "Nega qayta ochyapsiz? (ixtiyoriy)"
            : "Nega muddat o'zgardi? Bu o'zgarish tarixda qoladi..."
        }
      />

      <p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
        Jarima yozilmaydi — bu o'zingiz belgilagan ish.
      </p>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" disabled={isLoading} onClick={() => close()}>
          Bekor qilish
        </Button>
        <Button disabled={isLoading}>
          {isLoading ? "Saqlanmoqda..." : isReopen ? "Qayta ochish" : "Muddatni saqlash"}
        </Button>
      </div>
    </form>
  );
};

export default SelfTaskDeadlineModal;
