// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { Undo2 } from "lucide-react";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Queries
import { tasksQueries } from "@/features/tasks/queries/tasks.queries";
import { useUpdateSelfTask } from "@/features/tasks/queries/selfTasks.mutations";

// Data
import { DEFAULT_TASK_SETTINGS } from "@/features/tasks/data/tasks.data";

// Utils
import { toDateTimeInputValue } from "@/shared/utils/date.utils";

// Components
import FileDropzone from "@/features/tasks/components/FileDropzone";
import AttachmentGrid from "@/features/tasks/components/AttachmentGrid";
import TaskKindPicker from "@/features/tasks/components/form/TaskKindPicker";
import TaskLinksField from "@/features/tasks/components/form/TaskLinksField";
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

/**
 * O'ZIGA BELGILAGAN ISHNI TAHRIRLASH.
 *
 * ⚠️ IKKI MAYDON YO'Q (markazdagi oynadan farqi): IJROCHI — ish har doim
 * o'zingizda qoladi, JARIMA BALI — shaxsiy ishda u umuman yo'q. Server
 * ikkalasini ham rad etadi, bu yerdagi yo'qlik esa shunchaki o'sha
 * qoidaning ko'rinishi.
 *
 * ⚠️ MUDDATNING O'ZI BU YERDA TAHRIRLANMAYDI — u "Muddatni o'zgartirish"
 * oynasining ishi (sabab va tarix bilan). Bu yerda faqat BOSHLANISH
 * vaqti to'g'rilanadi, ya'ni oraliq.
 *
 * Faqat O'ZGARGAN maydonlar yuboriladi — server tarixga aynan nima
 * o'zgarganini yozadi.
 */
const EditSelfTaskModal = () => (
  <ResponsiveModal
    name="editSelfTask"
    title="Ishni tahrirlash"
    description="Har bir o'zgarish tarixga yoziladi"
    className="max-w-2xl"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, task }) => {
  const { mutate: updateTask } = useUpdateSelfTask();
  const { data: settings = DEFAULT_TASK_SETTINGS } = useQuery(tasksQueries.settings());

  const { title, description, kind, startDate, setField } = useObjectState({
    title: task?.title || "",
    description: task?.description || "",
    kind: task?.kind || "extra",
    startDate: task?.startDate ? toDateTimeInputValue(new Date(task.startDate)) : "",
  });

  const [removedKeys, setRemovedKeys] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [links, setLinks] = useState(task?.links || []);

  if (!task) return null;

  const currentFiles = (task.attachments || []).filter((a) => !removedKeys.includes(a.key));
  const removedFiles = (task.attachments || []).filter((a) => removedKeys.includes(a.key));
  const currentStart = task.startDate ? toDateTimeInputValue(new Date(task.startDate)) : "";

  const changes = [];
  if (title.trim() !== task.title) changes.push("title");
  if (description.trim() !== task.description) changes.push("description");
  if (kind !== (task.kind || "extra")) changes.push("kind");
  if (startDate !== currentStart) changes.push("startDate");
  if (removedKeys.length || newFiles.length) changes.push("attachments");
  if (JSON.stringify(links) !== JSON.stringify(task.links || [])) changes.push("links");

  const problems = [];
  if (title.trim().length < settings.minTitleLength)
    problems.push(`Sarlavha kamida ${settings.minTitleLength} ta belgi`);
  if (description.trim().length < settings.minDescriptionLength)
    problems.push(`Tavsif kamida ${settings.minDescriptionLength} ta belgi`);
  if (currentFiles.length + newFiles.length > 10) problems.push("Ko'pi bilan 10 ta fayl");
  if (startDate && startDate >= toDateTimeInputValue(new Date(task.dueDate)))
    problems.push("Boshlanish vaqti ijro muddatidan oldin bo'lsin");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (problems.length) return toast.error(problems[0]);
    if (!changes.length) return toast.info("Hech narsa o'zgartirilmadi");

    const formData = new FormData();
    if (changes.includes("title")) formData.append("title", title.trim());
    if (changes.includes("description")) formData.append("description", description.trim());
    if (changes.includes("kind")) formData.append("kind", kind);
    // Bo'sh satr — oraliqni olib tashlash ("shu vaqtgacha" rejimiga qaytish)
    if (changes.includes("startDate"))
      formData.append("startDate", startDate ? new Date(startDate).toISOString() : "");
    if (changes.includes("links")) formData.append("links", JSON.stringify(links));
    if (removedKeys.length) formData.append("removeAttachmentKeys", JSON.stringify(removedKeys));
    newFiles.forEach((file) => formData.append("files", file));

    setIsLoading(true);
    updateTask(
      { id: task.id, formData },
      {
        onSuccess: () => {
          close();
          toast.success("Ish yangilandi");
        },
        onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        onChange={(e) => setField("description", e.target.value)}
        description={`${description.trim().length}/5000`}
      />

      <TaskKindPicker
        value={kind}
        disabled={isLoading}
        onChange={(value) => setField("kind", value)}
      />

      <InputField
        label="Boshlanish vaqti (ixtiyoriy)"
        type="datetime-local"
        value={startDate}
        disabled={isLoading}
        onChange={(e) => setField("startDate", e.target.value)}
        description="Bo'sh qoldirilsa — faqat muddat ko'rsatiladi"
      />

      {currentFiles.length > 0 && (
        <div>
          <p className="mb-1.5 text-sm font-medium text-gray-700">Biriktirilgan fayllar</p>
          <AttachmentGrid
            items={currentFiles}
            onRemove={(item) => setRemovedKeys((prev) => [...prev, item.key])}
          />
        </div>
      )}

      {removedFiles.length > 0 && (
        <div className="rounded-xl bg-rose-50 p-3">
          <p className="mb-1.5 text-xs font-medium text-rose-700">
            Olib tashlanadi ({removedFiles.length})
          </p>
          <ul className="space-y-1">
            {removedFiles.map((file) => (
              <li key={file.key} className="flex items-center justify-between gap-2 text-xs">
                <span className="min-w-0 truncate text-rose-800">{file.name || file.key}</span>
                <button
                  type="button"
                  onClick={() => setRemovedKeys((prev) => prev.filter((k) => k !== file.key))}
                  className="inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 font-medium text-rose-700 hover:bg-rose-100"
                >
                  <Undo2 className="size-3" />
                  Qaytarish
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <FileDropzone
        value={newFiles}
        onChange={setNewFiles}
        max={10 - currentFiles.length}
        maxSizeMb={settings.maxFileSizeMb}
        disabled={isLoading}
        label="Yangi fayllar (ixtiyoriy)"
        hint="Rasm, video, PDF, Word, Excel"
      />

      <TaskLinksField value={links} onChange={setLinks} disabled={isLoading} />

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-gray-400">
          {problems.length > 0
            ? problems[0]
            : changes.length > 0
              ? `${changes.length} ta maydon o'zgardi`
              : "Hech narsa o'zgartirilmadi"}
        </p>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" disabled={isLoading} onClick={() => close()}>
            Bekor qilish
          </Button>
          <Button disabled={isLoading || problems.length > 0 || changes.length === 0}>
            {isLoading ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default EditSelfTaskModal;
