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
import { useAssignIssueTasks } from "../queries/issues.mutations";

// Queries
import { tasksQueries } from "@/features/tasks/queries/tasks.queries";

// Utils
import { toDateTimeInputValue } from "@/shared/utils/date.utils";

// Data
import { DEFAULT_TASK_SETTINGS } from "@/features/tasks/data/tasks.data";
import { DUE_PRESETS, issueAuthorKindLabels } from "../data/issues.data";

// Components
import FileDropzone from "@/features/tasks/components/FileDropzone";
import AssigneePicker from "@/features/tasks/components/AssigneePicker";
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";

/**
 * MUAMMONI HAL QILISH UCHUN TOPSHIRIQ BIRIKTIRISH.
 *
 * ⚠️ TOPSHIRIQLAR BO'LIMINING KOMPONENTLARI QAYTA ISHLATILADI
 * (`AssigneePicker`, `FileDropzone`) va qoidalar ham o'shaning sozlamasidan
 * o'qiladi (`tasksQueries.settings`). Bu yerda ikkinchi nusxa yozilsa,
 * sozlama o'zgarganda ikki joyda boshqa-boshqa qoida ishlab, server bir
 * joyda qabul qilib, boshqasida rad etardi.
 *
 * ⚠️ SARLAVHA VA TAVSIF OLDINDAN TO'LDIRILADI: ma'muriyat odatda
 * muammoning o'zini topshiriq tavsifiga ko'chiradi. Matnni o'zgartirish
 * mumkin — server bo'sh kelsa muammodan oladi.
 *
 * ⚠️ HAR IJROCHIGA ALOHIDA TOPSHIRIQ (serverdagi mavjud qoida). Muammo
 * esa HAMMASI tugagandan keyin yopiladi — tugma ostida shu aytiladi.
 */
const AssignIssueTaskForm = ({ close, isLoading, setIsLoading, ...issue }) => {
  const { mutate: assignTasks } = useAssignIssueTasks();
  const { data: settings = DEFAULT_TASK_SETTINGS } = useQuery(
    tasksQueries.settings(),
  );

  const { title, description, dueDate, penaltyPoints, setField, setFields } =
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

  // Muammo matnidan oldindan to'ldirish
  useEffect(() => {
    if (!issue?.id) return;
    setFields({
      title: `Muammo: ${issue.categoryName || "murojaat"}`,
      description: issue.body || "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issue?.id]);

  // Standart jarima bali sozlamadan — foydalanuvchi tegmagan bo'lsa
  useEffect(() => {
    if (!penaltyPoints) {
      setField("penaltyPoints", String(settings.defaultPenaltyPoints));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.defaultPenaltyPoints]);

  const minDue = toDateTimeInputValue(
    new Date(openedAt + Math.max(settings.minLeadHours, 0) * 3600000),
  );

  // Formadagi xatolar — tugma yonida ko'rinadi, server javobini kutmasdan
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
  if (
    !Number.isInteger(points) ||
    points < 1 ||
    points > settings.maxPenaltyPoints
  )
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
    assignTasks(
      { id: issue.id, formData },
      {
        onSuccess: () => {
          toast.success(
            assignees.length > 1
              ? `${assignees.length} ta topshiriq biriktirildi`
              : "Topshiriq biriktirildi",
          );
          close();
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Manba murojaat */}
      <div className="space-y-1.5 rounded-xl bg-gray-50 p-3 text-sm">
        <p className="text-xs text-gray-500">
          {issue.author?.fullName || "Noma'lum"} ·{" "}
          {issueAuthorKindLabels[issue.authorKind] || issue.authorKind} ·{" "}
          {issue.categoryName || "—"}
        </p>
        <p className="max-h-24 overflow-y-auto whitespace-pre-wrap text-gray-800">
          {issue.body}
        </p>
      </div>

      <AssigneePicker
        value={assignees}
        disabled={isLoading}
        onChange={setAssignees}
      />

      <InputField
        required
        value={title}
        maxLength={300}
        label="Sarlavha"
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
        label={
          settings.requireCreateAttachments ? "Fayllar" : "Fayllar (ixtiyoriy)"
        }
        hint="Rasm, video yoki hujjat — ijrochiga ko'rsatma sifatida"
      />

      <div className="flex items-start gap-2 rounded-xl bg-blue-50 px-3.5 py-2.5 text-xs text-blue-800">
        <Info className="mt-0.5 size-4 shrink-0" />
        <p>
          Topshiriq(lar) tasdiqlanganda muammo <b>avtomatik hal qilindi</b>{" "}
          deb yopiladi va yuborgan odamga botdan javob ketadi. Javob matni —
          ijrochining yakunlash izohi.
        </p>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-gray-400">
          {problems.length > 0
            ? problems[0]
            : assignees.length > 1
              ? `${assignees.length} kishining har biriga alohida topshiriq — muammo hammasi tugagach yopiladi`
              : "1 kishiga topshiriq biriktiriladi"}
        </p>

        <div className="flex gap-2">
          <Button
            type="button"
            onClick={close}
            variant="secondary"
            disabled={isLoading}
          >
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

export default AssignIssueTaskForm;
