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

// Utils
import { toDateTimeInputValue } from "@/shared/utils/date.utils";

// Data
import { DEFAULT_TASK_SETTINGS } from "../data/tasks.data";

// Components
import FileDropzone from "./FileDropzone";
import AssigneePicker from "./AssigneePicker";
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Tezkor muddat tugmalari: hozirdan necha soat keyin
const DUE_PRESETS = [
  { label: "Bugun 18:00", build: () => atHour(0, 18) },
  { label: "Ertaga", build: () => atHour(1, 18) },
  { label: "3 kun", build: () => atHour(3, 18) },
  { label: "1 hafta", build: () => atHour(7, 18) },
];

function atHour(daysAhead, hour) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  d.setHours(hour, 0, 0, 0);
  return d;
}

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
  const { data: settings = DEFAULT_TASK_SETTINGS } = useQuery(
    tasksQueries.settings(),
  );

  const { title, description, dueDate, penaltyPoints, setField } =
    useObjectState({
      title: "",
      description: "",
      dueDate: "",
      penaltyPoints: "",
    });

  const [assignees, setAssignees] = useState([]);
  const [files, setFiles] = useState([]);
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

  // Formadagi xatolar — tugma yonida ko'rinadi, server xatosini kutib o'tirmaslik uchun
  const problems = [];
  if (assignees.length === 0) problems.push("Kamida bitta ijrochi tanlang");
  if (title.trim().length < settings.minTitleLength)
    problems.push(`Sarlavha kamida ${settings.minTitleLength} ta belgi`);
  if (description.trim().length < settings.minDescriptionLength)
    problems.push(`Tavsif kamida ${settings.minDescriptionLength} ta belgi`);
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
  if (settings.requireCreateAttachments && files.length === 0)
    problems.push("Kamida bitta fayl biriktiring");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (problems.length) return toast.error(problems[0]);

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("dueDate", new Date(dueDate).toISOString());
    formData.append("penaltyPoints", String(points));
    formData.append("assigneeIds", JSON.stringify(assignees.map((u) => u.id)));
    files.forEach((file) => formData.append("files", file));

    setIsLoading(true);
    createTask(formData, {
      onSuccess: (res) => {
        close();
        const count = res?.data?.length || 1;
        toast.success(`${count} ta topshiriq yaratildi`);
      },
      onError: (err) =>
        toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      onSettled: () => setIsLoading(false),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AssigneePicker value={assignees} disabled={isLoading} onChange={setAssignees} />

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

      <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
        <div className="space-y-2">
          <InputField
            required
            value={dueDate}
            min={minDue}
            label="Ijro muddati"
            type="datetime-local"
            onChange={(e) => setField("dueDate", e.target.value)}
          />
          <div className="flex flex-wrap gap-1.5">
            {DUE_PRESETS.map((preset) => {
              const value = toDateTimeInputValue(preset.build());
              const disabled = value < minDue;
              return (
                <button
                  key={preset.label}
                  type="button"
                  disabled={disabled}
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
          onChange={(e) => setField("penaltyPoints", e.target.value)}
          description={`Ko'pi bilan ${settings.maxPenaltyPoints}`}
        />
      </div>

      <FileDropzone
        value={files}
        onChange={setFiles}
        max={10}
        disabled={isLoading}
        required={settings.requireCreateAttachments}
        label={settings.requireCreateAttachments ? "Fayllar" : "Fayllar (ixtiyoriy)"}
        hint="Namuna, ko'rsatma yoki hujjat — rasm, video, PDF, Word, Excel"
      />

      <div className="flex items-start gap-2 rounded-xl bg-blue-50 px-3.5 py-2.5 text-xs text-blue-800">
        <Info className="mt-0.5 size-4 shrink-0" />
        <p>
          Ijrochi ishni topshirishda kamida{" "}
          <b>{Math.max(1, settings.minCompletionFiles)} ta fayl</b> yuklashi kerak.
          Muddat o'tsa{" "}
          {settings.autoPenaltyEnabled ? (
            <>avtomatik ravishda <b>{points || "—"} ball</b> jarima yoziladi.</>
          ) : (
            <>avtomatik jarima yozilmaydi (sozlamada o'chirilgan).</>
          )}
        </p>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-gray-400">
          {problems.length > 0 ? problems[0] : assignees.length > 1
              ? `${assignees.length} kishining har biriga alohida topshiriq yaratiladi`
              : "1 kishiga topshiriq yaratiladi"}
        </p>
        <Button disabled={isLoading || problems.length > 0}>
          {isLoading
            ? "Yaratilmoqda..."
            : assignees.length > 1
              ? `${assignees.length} ta topshiriq berish`
              : "Topshiriq berish"}
        </Button>
      </div>
    </form>
  );
};

export default CreateTaskModal;
