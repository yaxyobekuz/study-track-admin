// Toast
import { toast } from "sonner";

// React
import { useEffect, useState } from "react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { Info } from "lucide-react";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Queries
import { tasksQueries } from "../queries/tasks.queries";
import { useCreateTask } from "../queries/tasks.mutations";
import { useCreateTaskSchedule } from "../queries/taskSchedules.queries";

// Utils
import { toDateTimeInputValue } from "@/shared/utils/date.utils";

// Data
import { DEFAULT_RECURRENCE, DEFAULT_TASK_SETTINGS } from "../data/tasks.data";

// Components
import FileDropzone from "./FileDropzone";
import AssigneePicker from "./AssigneePicker";
import TaskKindPicker from "./form/TaskKindPicker";
import TaskLinksField from "./form/TaskLinksField";
import TaskScheduleField from "./form/TaskScheduleField";
import TaskRecurrenceField from "./form/TaskRecurrenceField";
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

/**
 * YANGI TOPSHIRIQ.
 *
 * ⚠️ TUR FORMANING SHAKLINI O'ZGARTIRADI (biznes qarori):
 *   "Asosiy"     → DOIMIY ish, takrorlanish qoidasi so'raladi va qoida
 *                  saqlanadi (`/task-schedules`); topshiriqlarni undan
 *                  server vaqtidan oldin o'zi yozadi.
 *   "Qo'shimcha" → BIR MARTALIK ish, aniq sanaga (`/tasks`).
 */
const CreateTaskModal = () => (
  <ResponsiveModal
    name="createTask"
    title="Yangi topshiriq"
    description="Ijrochilarning har biriga alohida topshiriq yaratiladi"
    className="max-w-2xl"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading }) => {
  const { mutate: createTask } = useCreateTask();
  const { mutate: createSchedule } = useCreateTaskSchedule();
  const { data: settings = DEFAULT_TASK_SETTINGS } = useQuery(tasksQueries.settings());

  const {
    title,
    description,
    startDate,
    dueDate,
    penaltyPoints,
    kind,
    timeMode,
    setField,
  } = useObjectState({
    title: "",
    description: "",
    // "due" — faqat muddat, "range" — vaqt oralig'i
    timeMode: "due",
    startDate: "",
    dueDate: "",
    kind: "main",
    penaltyPoints: "",
  });

  const [assignees, setAssignees] = useState([]);
  const [files, setFiles] = useState([]);
  const [links, setLinks] = useState([]);
  // Takrorlanish — faqat "Asosiy" turida ishlatiladi
  const [recurrence, setRecurrence] = useState(DEFAULT_RECURRENCE);
  const setRule = (field, value) => setRecurrence((prev) => ({ ...prev, [field]: value }));
  const isRecurring = kind === "main";
  // Modal ochilgan lahza — minimal muddat shunga nisbatan
  const [openedAt] = useState(() => Date.now());

  // Standart jarima bali sozlamadan — foydalanuvchi tegmagan bo'lsa
  useEffect(() => {
    if (!penaltyPoints) setField("penaltyPoints", String(settings.defaultPenaltyPoints));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.defaultPenaltyPoints]);

  const minDue = toDateTimeInputValue(
    new Date(openedAt + Math.max(settings.minLeadHours, 0) * 3600000),
  );

  // Formadagi xatolar — tugma yonida ko'rinadi, server xatosini kutib
  // o'tirmaslik uchun. Server baribir hammasini qayta tekshiradi.
  const problems = [];
  if (assignees.length === 0) problems.push("Kamida bitta ijrochi tanlang");
  if (title.trim().length < settings.minTitleLength)
    problems.push(`Sarlavha kamida ${settings.minTitleLength} ta belgi`);
  if (description.trim().length < settings.minDescriptionLength)
    problems.push(`Tavsif kamida ${settings.minDescriptionLength} ta belgi`);
  if (isRecurring) {
    // Doimiy ish — sana emas, QOIDA tekshiriladi
    if (recurrence.frequency === "weekly" && recurrence.weekdays.length === 0)
      problems.push("Kamida bitta hafta kunini tanlang");
    if (recurrence.frequency === "months" && recurrence.monthDays.length === 0)
      problems.push("Oyning kamida bitta kunini tanlang");

    const filled = recurrence.slots.filter((slot) => slot.due);
    if (filled.length === 0) problems.push("Kamida bitta tugash vaqtini belgilang");
    if (recurrence.slots.some((slot) => !slot.due))
      problems.push("Har bir qatorda tugash vaqti bo'lishi kerak");
    // ⚠️ Takror vaqt — serverda ham rad etiladi: topshiriqlarning yagonalik
    // kaliti aynan tugash vaqti
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
  const points = Number(penaltyPoints);
  if (!Number.isInteger(points) || points < 1 || points > settings.maxPenaltyPoints)
    problems.push(`Jarima bali 1–${settings.maxPenaltyPoints} oralig'ida`);
  if (settings.requireCreateAttachments && files.length === 0)
    problems.push("Kamida bitta fayl biriktiring");

  /** Ikkala yo'lda ham bir xil bo'lgan qism. */
  const baseFormData = () => {
    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("penaltyPoints", String(points));
    formData.append("assigneeIds", JSON.stringify(assignees.map((u) => u.id)));
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
      return createSchedule(formData, {
        onSuccess: (res) => {
          close();
          const made = res?.data?.generatedCount || 0;
          toast.success(
            made > 0
              ? `Doimiy topshiriq yaratildi · ${made} ta topshiriq darhol yozildi`
              : "Doimiy topshiriq yaratildi",
          );
        },
        onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      });
    }

    const formData = baseFormData();
    formData.append("dueDate", new Date(dueDate).toISOString());
    // ⚠️ Faqat "oraliq" rejimida yuboriladi: "faqat muddat" rejimida
    // maydon bo'sh qolishi KERAK, aks holda ijrochi panelida ma'nosiz
    // "hali boshlanmagan" holati paydo bo'lardi.
    if (timeMode === "range" && startDate) {
      formData.append("startDate", new Date(startDate).toISOString());
    }
    formData.append("kind", kind);

    setIsLoading(true);
    createTask(formData, {
      onSuccess: (res) => {
        close();
        const count = res?.data?.length || 1;
        toast.success(`${count} ta topshiriq yaratildi`);
      },
      onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      onSettled: () => setIsLoading(false),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AssigneePicker value={assignees} disabled={isLoading} onChange={setAssignees} />

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
        placeholder="Masalan: Oylik hisobotni tayyorlash"
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
        placeholder="Nima qilish kerak, natija qanday bo'lishi kerak..."
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

      <InputField
        required
        min={1}
        max={settings.maxPenaltyPoints}
        type="number"
        label="Jarima bali"
        value={penaltyPoints}
        className="sm:max-w-44"
        onChange={(e) => setField("penaltyPoints", e.target.value)}
        description={`Muddat o'tsa yoziladi · ko'pi bilan ${settings.maxPenaltyPoints}`}
      />

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
          Ijrochi ishni topshirishda kamida{" "}
          <b>{Math.max(1, settings.minCompletionFiles)} ta fayl</b> yuklashi kerak.
          Muddat o'tsa{" "}
          {settings.autoPenaltyEnabled ? (
            <>
              avtomatik ravishda <b>{points || "—"} ball</b> jarima yoziladi va topshiriq
              "Bajarilmadi" bo'lib ko'rinadi.
            </>
          ) : (
            <>
              avtomatik jarima yozilmaydi (sozlamada o'chirilgan), lekin topshiriq
              "Bajarilmadi" bo'lib ko'rinadi.
            </>
          )}
        </p>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-gray-400">
          {problems.length > 0
            ? problems[0]
            : isRecurring
              ? `Har takrorlanishda ${assignees.length || 1} kishining har biriga alohida topshiriq yoziladi`
              : assignees.length > 1
                ? `${assignees.length} kishining har biriga alohida topshiriq yaratiladi`
                : "1 kishiga topshiriq yaratiladi"}
        </p>
        <Button disabled={isLoading || problems.length > 0}>
          {isLoading
            ? "Yaratilmoqda..."
            : isRecurring
              ? "Doimiy topshiriqni saqlash"
              : assignees.length > 1
                ? `${assignees.length} ta topshiriq berish`
                : "Topshiriq berish"}
        </Button>
      </div>
    </form>
  );
};

export default CreateTaskModal;
