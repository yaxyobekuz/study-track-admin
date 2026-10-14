// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { Info } from "lucide-react";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Queries
import { tasksQueries } from "@/features/tasks/queries/tasks.queries";
import { useCreateSelfRule, useCreateSelfTask } from "@/features/tasks/queries/selfTasks.mutations";

// Utils
import { toDateTimeInputValue } from "@/shared/utils/date.utils";

// Data
import { DEFAULT_RECURRENCE, DEFAULT_TASK_SETTINGS } from "@/features/tasks/data/tasks.data";

// Components — Lavozimlar markazi formasining AYNI bo'laklari
import FileDropzone from "@/features/tasks/components/FileDropzone";
import TaskKindPicker from "@/features/tasks/components/form/TaskKindPicker";
import TaskLinksField from "@/features/tasks/components/form/TaskLinksField";
import TaskScheduleField from "@/features/tasks/components/form/TaskScheduleField";
import TaskRecurrenceField from "@/features/tasks/components/form/TaskRecurrenceField";
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

/**
 * O'ZIMGA ISH BELGILASH.
 *
 * Lavozimlar markazidagi "Yangi topshiriq" formasining AYNI bo'laklaridan
 * qurilgan (tur tanlash, takrorlanish qoidasi, vaqt oynasi, fayllar,
 * havolalar) — ikkinchi forma yozilmadi: shakli ham, tekshiruvlari ham bir
 * xil bo'lishi kerak.
 *
 * ⚠️ UCHTA MAYDON YO'Q va bu bo'shliq emas, QOIDA:
 *   · IJROCHI — har doim o'zingiz (server boshqa odamni rad etadi);
 *   · JARIMA BALI — shaxsiy ishda jarima umuman yo'q (biznes qarori);
 *   · tasdiqlash — ikkinchi tomon yo'q, ish topshirilgani YAKUNLANADI.
 *
 * ⚠️ TUR FORMANING SHAKLINI O'ZGARTIRADI (markaz bilan AYNI qoida):
 *   "Asosiy"     → DOIMIY ish, takrorlanish qoidasi saqlanadi
 *                  (`/self-tasks/rules`) va topshiriqlar undan avtomat
 *                  yoziladi — ertalab paydo bo'lgan ish eslatma bo'ladi.
 *   "Qo'shimcha" → BIR MARTALIK ish, aniq sanaga (`/self-tasks`).
 */
const CreateSelfTaskModal = () => (
  <ResponsiveModal
    name="createSelfTask"
    title="O'zimga ish belgilash"
    description="Jarima yo'q — bu sizning o'z rejangiz"
    className="max-w-2xl"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading }) => {
  const { mutate: createTask } = useCreateSelfTask();
  const { mutate: createRule } = useCreateSelfRule();
  const { data: settings = DEFAULT_TASK_SETTINGS } = useQuery(tasksQueries.settings());

  const { title, description, startDate, dueDate, kind, timeMode, setField } = useObjectState({
    title: "",
    description: "",
    // "due" — faqat muddat, "range" — vaqt oralig'i
    timeMode: "due",
    startDate: "",
    dueDate: "",
    kind: "extra",
  });

  const [files, setFiles] = useState([]);
  const [links, setLinks] = useState([]);
  const [recurrence, setRecurrence] = useState(DEFAULT_RECURRENCE);
  const setRule = (field, value) => setRecurrence((prev) => ({ ...prev, [field]: value }));
  const isRecurring = kind === "main";
  // Modal ochilgan lahza — minimal muddat shunga nisbatan
  const [openedAt] = useState(() => Date.now());

  const minDue = toDateTimeInputValue(
    new Date(openedAt + Math.max(settings.minLeadHours, 0) * 3600000),
  );

  // Formadagi xatolar — server xatosini kutib o'tirmaslik uchun. Server
  // baribir hammasini qayta tekshiradi.
  const problems = [];
  if (title.trim().length < settings.minTitleLength)
    problems.push(`Sarlavha kamida ${settings.minTitleLength} ta belgi`);
  if (description.trim().length < settings.minDescriptionLength)
    problems.push(`Tavsif kamida ${settings.minDescriptionLength} ta belgi`);
  if (isRecurring) {
    if (recurrence.frequency === "weekly" && recurrence.weekdays.length === 0)
      problems.push("Kamida bitta hafta kunini tanlang");
    if (recurrence.frequency === "months" && recurrence.monthDays.length === 0)
      problems.push("Oyning kamida bitta kunini tanlang");

    const filled = recurrence.slots.filter((slot) => slot.due);
    if (filled.length === 0) problems.push("Kamida bitta tugash vaqtini belgilang");
    if (recurrence.slots.some((slot) => !slot.due))
      problems.push("Har bir qatorda tugash vaqti bo'lishi kerak");
    if (new Set(filled.map((slot) => slot.due)).size !== filled.length)
      problems.push("Bir xil tugash vaqti ikki marta berilgan");
    if (
      recurrence.slots.some(
        (slot) => slot.start && Number(slot.offsetDays) === 0 && slot.start >= slot.due,
      )
    )
      problems.push("Boshlanish vaqti tugash vaqtidan oldin bo'lsin");
  } else {
    if (timeMode === "range" && !startDate) problems.push("Boshlanish vaqtini belgilang");
    if (!dueDate) problems.push("Ijro muddatini belgilang");
    else if (dueDate < minDue)
      problems.push(
        settings.minLeadHours > 0
          ? `Muddat kamida ${settings.minLeadHours} soatdan keyin bo'lsin`
          : "Muddat kelajakda bo'lsin",
      );
    if (timeMode === "range" && startDate && dueDate && startDate >= dueDate)
      problems.push("Boshlanish vaqti tugash vaqtidan oldin bo'lsin");
  }
  if (settings.requireCreateAttachments && files.length === 0)
    problems.push("Kamida bitta fayl biriktiring");

  /** Ikkala yo'lda ham bir xil qism. ⚠️ `assigneeIds` va `penaltyPoints`
   *  YUBORILMAYDI — ikkalasini ham server o'zi belgilaydi. */
  const baseFormData = () => {
    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    if (links.length) formData.append("links", JSON.stringify(links));
    files.forEach((file) => formData.append("files", file));
    return formData;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (problems.length) return toast.error(problems[0]);

    if (isRecurring) {
      const formData = baseFormData();
      formData.append("frequency", recurrence.frequency);
      if (recurrence.frequency === "weekly") {
        formData.append("weekdays", JSON.stringify(recurrence.weekdays));
      } else if (recurrence.frequency === "days") {
        formData.append("intervalDays", String(recurrence.intervalDays));
      } else {
        formData.append("intervalMonths", String(recurrence.intervalMonths));
        formData.append("monthDays", JSON.stringify(recurrence.monthDays));
      }
      formData.append(
        "slots",
        JSON.stringify(
          recurrence.slots
            .filter((slot) => slot.due)
            .map((slot) => ({
              start: slot.start || null,
              due: slot.due,
              offsetDays: Number(slot.offsetDays) || 0,
            })),
        ),
      );
      formData.append("leadDays", String(recurrence.leadDays ?? 1));

      setIsLoading(true);
      return createRule(formData, {
        onSuccess: (res) => {
          close();
          const made = res?.data?.generatedCount || 0;
          toast.success(
            made > 0
              ? `Doimiy ish belgilandi · ${made} ta topshiriq darhol yozildi`
              : "Doimiy ish belgilandi",
          );
        },
        onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      });
    }

    const formData = baseFormData();
    formData.append("dueDate", new Date(dueDate).toISOString());
    // ⚠️ Faqat "oraliq" rejimida: "faqat muddat" rejimida maydon bo'sh
    // qolishi KERAK, aks holda ro'yxatda ma'nosiz "hali boshlanmagan"
    // holati paydo bo'lardi.
    if (timeMode === "range" && startDate) {
      formData.append("startDate", new Date(startDate).toISOString());
    }
    formData.append("kind", kind);

    setIsLoading(true);
    createTask(formData, {
      onSuccess: () => {
        close();
        toast.success("Ish o'zingizga belgilandi");
      },
      onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      onSettled: () => setIsLoading(false),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TaskKindPicker
        value={kind}
        disabled={isLoading}
        onChange={(value) => setField("kind", value)}
      />

      <InputField
        required
        value={title}
        maxLength={300}
        label="Sarlavha"
        placeholder="Masalan: Jurnalni to'ldirib chiqish"
        onChange={(e) => setField("title", e.target.value)}
        description={`Kamida ${settings.minTitleLength} ta belgi · ${title.trim().length}/300`}
      />

      <InputField
        required={settings.minDescriptionLength > 0}
        label="Tavsif"
        type="textarea"
        value={description}
        maxLength={5000}
        inputClassName="min-h-28"
        placeholder="Nima qilaman, natija qanday bo'lishi kerak..."
        onChange={(e) => setField("description", e.target.value)}
        description={
          settings.minDescriptionLength > 0
            ? `Kamida ${settings.minDescriptionLength} ta belgi · ${description.trim().length}/5000`
            : `${description.trim().length}/5000`
        }
      />

      {isRecurring ? (
        <TaskRecurrenceField value={recurrence} onChange={setRule} disabled={isLoading} />
      ) : (
        <TaskScheduleField
          mode={timeMode}
          minDue={minDue}
          startDate={startDate}
          dueDate={dueDate}
          disabled={isLoading}
          onModeChange={(mode) => {
            setField("timeMode", mode);
            if (mode === "due") setField("startDate", "");
          }}
          onChange={setField}
        />
      )}

      <FileDropzone
        value={files}
        onChange={setFiles}
        max={10}
        maxSizeMb={settings.maxFileSizeMb}
        disabled={isLoading}
        required={settings.requireCreateAttachments}
        label={settings.requireCreateAttachments ? "Fayllar" : "Fayllar (ixtiyoriy)"}
        hint="Namuna, ko'rsatma yoki hujjat — rasm, video, PDF, Word, Excel"
      />

      <TaskLinksField value={links} onChange={setLinks} disabled={isLoading} />

      <div className="flex items-start gap-2 rounded-xl bg-blue-50 px-3.5 py-2.5 text-xs text-blue-800">
        <Info className="mt-0.5 size-4 shrink-0" />
        <p>
          Bu <b>o'zingiz uchun</b> belgilangan ish: <b>jarima yozilmaydi</b> va tasdiqlash
          kutilmaydi — yakunlaganingizda darhol "Bajarildi" bo'ladi. Yakunlashda kamida{" "}
          <b>{Math.max(1, settings.minCompletionFiles)} ta fayl</b> kerak bo'ladi. Muddat o'tsa ish
          "Bajarilmadi" bo'lib ko'rinadi va rahbariyat statistikasida ham shunday hisoblanadi.
        </p>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-gray-400">
          {problems.length > 0
            ? problems[0]
            : isRecurring
              ? "Har takrorlanishda o'zingizga bitta topshiriq yoziladi"
              : "Ish faqat o'zingizga belgilanadi"}
        </p>
        <Button disabled={isLoading || problems.length > 0}>
          {isLoading
            ? "Saqlanmoqda..."
            : isRecurring
              ? "Doimiy ishni saqlash"
              : "O'zimga belgilash"}
        </Button>
      </div>
    </form>
  );
};

export default CreateSelfTaskModal;
