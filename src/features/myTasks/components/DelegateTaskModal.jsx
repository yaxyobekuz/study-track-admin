// Toast
import { toast } from "sonner";

// React
import { useEffect, useState } from "react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { Info } from "lucide-react";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import { useDelegateMyTask } from "../queries/myTasks.queries";

// Queries
import { tasksQueries } from "@/features/tasks/queries/tasks.queries";

// Utils
import { toDateTimeInputValue } from "@/shared/utils/date.utils";

// Data
import { DEFAULT_TASK_SETTINGS } from "@/features/tasks/data/tasks.data";
import { DELEGATE_DUE_PRESETS } from "../data/myTasks.data";

// Components
import AssigneePicker from "@/features/tasks/components/AssigneePicker";
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

/**
 * TOPSHIRIQNI BOSHQA XODIMGA BIRIKTIRISH — ro'yxatdan chiqmasdan.
 *
 * MUAMMO: topshiriq olgan rahbar uni o'z xodimiga biriktirmoqchi bo'lsa,
 * "Topshiriq berish" oynasiga kirib sarlavha, tavsif, tur va jarima balini
 * QAYTA YOZIB CHIQISHI kerak edi. Nusxa qo'lda yozilgani uchun manbadan
 * farq qilib ketardi.
 *
 * YECHIM: matn MANBADAN tayyor keladi, odam faqat KIMGA va QACHONGACHA ni
 * belgilaydi. Sarlavha va tavsifni xohlasa o'zgartiradi.
 *
 * ⚠️ MANBA O'Z JOYIDA QOLADI: server YANGI topshiriq yaratadi, ijrochini
 * ko'chirmaydi — biriktirgan odam baribir javobgar. Oynaning ostida shu
 * aytiladi, aks holda "biriktirdim, endi mendan ketdi" degan tushuncha
 * paydo bo'lardi.
 *
 * ⚠️ TOPSHIRIQLAR BO'LIMINING KOMPONENTI QAYTA ISHLATILADI
 * (`AssigneePicker`) va qoidalar ham o'shaning sozlamasidan o'qiladi
 * (`tasksQueries.settings`) — `AssignIssueTaskForm` bilan AYNI qaror.
 * Ikkinchi nusxa yozilsa, sozlama o'zgarganda panel bir qoidani, server
 * boshqasini tekshirardi.
 *
 * ⚠️ FAYL MAYDONI YO'Q: manba topshiriqning fayllari serverda havolasi
 * bilan ko'chadi (bitta fayl ikki marta saqlanmaydi). Yangi fayl kerak
 * bo'lsa biriktirilgandan keyin tahrirlash orqali qo'shiladi.
 */
const DelegateTaskModal = () => (
  <ResponsiveModal
    name="delegateTask"
    title="Boshqa xodimga biriktirish"
    description="Topshiriq matni saqlanadi — ijrochi va muddatni belgilang"
    className="max-w-xl"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, task }) => {
  const { mutate: delegate } = useDelegateMyTask();
  const { data: settings = DEFAULT_TASK_SETTINGS } = useQuery(tasksQueries.settings());

  const { title, note, dueDate, penaltyPoints, setField, setFields } = useObjectState({
    title: "",
    note: "",
    dueDate: "",
    penaltyPoints: "",
  });

  const [assignees, setAssignees] = useState([]);
  // Oyna ochilgan lahza — minimal muddat SHUNGA nisbatan o'lchanadi, aks
  // holda oyna uzoq ochiq turganda chegara jimgina eskirib qolardi
  const [openedAt] = useState(() => Date.now());

  // Manba topshiriqdan oldindan to'ldirish
  useEffect(() => {
    if (!task?.id) return;
    setFields({
      title: task.title || "",
      penaltyPoints: String(task.penaltyPoints ?? settings.defaultPenaltyPoints),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task?.id]);

  if (!task) return null;

  const minDue = toDateTimeInputValue(
    new Date(openedAt + Math.max(settings.minLeadHours, 0) * 3600000),
  );

  // Formadagi xatolar — tugma yonida, server javobini kutmasdan
  const problems = [];
  if (assignees.length === 0) problems.push("Kamida bitta ijrochi tanlang");
  if (title.trim().length < settings.minTitleLength)
    problems.push(`Sarlavha kamida ${settings.minTitleLength} ta belgi`);
  if (!dueDate) problems.push("Ijro muddatini belgilang");
  else if (dueDate < minDue)
    problems.push(
      settings.minLeadHours > 0
        ? `Muddat kamida ${settings.minLeadHours} soatdan keyin bo'lsin`
        : "Muddat kelajakda bo'lsin",
    );
  const points = Number(penaltyPoints);
  if (!Number.isInteger(points) || points < 1 || points > settings.maxPenaltyPoints)
    problems.push(`Jarima bali 1–${settings.maxPenaltyPoints} oralig'ida`);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (problems.length) return toast.error(problems[0]);

    setIsLoading(true);
    delegate(
      {
        id: task.id,
        data: {
          assigneeIds: assignees.map((u) => u.id),
          dueDate: new Date(dueDate).toISOString(),
          title: title.trim(),
          penaltyPoints: points,
          // ⚠️ `note` — QO'SHIMCHA ko'rsatma: server uni manba tavsifining
          // OXIRIGA qo'shadi, ustiga yozmaydi. Shu sababli bu yerda tavsif
          // maydoni umuman yo'q: manba matni o'z holida ketishi kerak.
          ...(note.trim() && { note: note.trim() }),
        },
      },
      {
        onSuccess: () => {
          toast.success(
            assignees.length > 1
              ? `${assignees.length} ta xodimga biriktirildi`
              : "Topshiriq biriktirildi",
          );
          close();
        },
        onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Manba topshiriq — nimadan nusxa olinayotgani ko'rinib turadi */}
      <div className="space-y-1 rounded-xl bg-gray-50 p-3 text-sm">
        <p className="text-xs text-gray-500">Manba topshiriq</p>
        <p className="font-medium text-gray-900">{task.title}</p>
        {task.description && (
          <p className="max-h-20 overflow-y-auto whitespace-pre-wrap text-gray-600">
            {task.description}
          </p>
        )}
      </div>

      <AssigneePicker value={assignees} disabled={isLoading} onChange={setAssignees} />

      <InputField
        required
        value={title}
        maxLength={300}
        label="Sarlavha"
        disabled={isLoading}
        onChange={(e) => setField("title", e.target.value)}
        description={`Manbadan olindi — o'zgartirish mumkin · ${title.trim().length}/300`}
      />

      <InputField
        label="Qo'shimcha ko'rsatma"
        type="textarea"
        value={note}
        maxLength={2000}
        disabled={isLoading}
        inputClassName="min-h-20"
        placeholder="Ijrochiga nima qo'shimcha aytmoqchisiz..."
        onChange={(e) => setField("note", e.target.value)}
        description="Ixtiyoriy — topshiriq tavsifining oxiriga qo'shiladi"
      />

      <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
        <div className="space-y-2">
          <InputField
            required
            value={dueDate}
            min={minDue}
            label="Ijro muddati"
            type="datetime-local"
            disabled={isLoading}
            onChange={(e) => setField("dueDate", e.target.value)}
          />

          <div className="flex flex-wrap gap-1.5">
            {DELEGATE_DUE_PRESETS.map((preset) => {
              const value = toDateTimeInputValue(preset.build());
              return (
                <button
                  key={preset.label}
                  type="button"
                  disabled={isLoading || value < minDue}
                  onClick={() => setField("dueDate", value)}
                  className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600 transition-colors hover:bg-blue-100 hover:text-blue-700 disabled:opacity-40 disabled:hover:bg-gray-100"
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        <InputField
          required
          min={1}
          max={settings.maxPenaltyPoints}
          type="number"
          label="Jarima bali"
          value={penaltyPoints}
          disabled={isLoading}
          onChange={(e) => setField("penaltyPoints", e.target.value)}
          description={`Ko'pi bilan ${settings.maxPenaltyPoints}`}
        />
      </div>

      {/* ⚠️ ENG MUHIM IZOH: manba o'z joyida qoladi */}
      <div className="flex items-start gap-2 rounded-xl bg-blue-50 px-3.5 py-2.5 text-xs text-blue-800">
        <Info className="mt-0.5 size-4 shrink-0" />
        <p>
          Sizdagi topshiriq <b>o'z joyida qoladi</b> — tanlangan xodimga yangi
          topshiriq beriladi va vaqt chizig'ida kimga biriktirganingiz yozilib
          qoladi. Fayllar va havolalar o'zi ko'chadi.
        </p>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-gray-400">
          {problems.length > 0
            ? problems[0]
            : assignees.length > 1
              ? `${assignees.length} kishining har biriga alohida topshiriq`
              : "1 kishiga topshiriq biriktiriladi"}
        </p>

        <div className="flex gap-2">
          <Button type="button" variant="secondary" disabled={isLoading} onClick={() => close()}>
            Bekor qilish
          </Button>

          <Button disabled={isLoading || problems.length > 0}>
            {isLoading ? "Biriktirilmoqda..." : "Biriktirish"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default DelegateTaskModal;
