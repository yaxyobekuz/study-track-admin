// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { Info, Undo2 } from "lucide-react";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Queries
import { tasksQueries } from "../queries/tasks.queries";
import { useUpdateTask } from "../queries/tasks.mutations";

// Data
import {
  fullName,
  DEFAULT_TASK_SETTINGS,
  WORKING_TASK_STATUSES,
} from "../data/tasks.data";

// Components
import FileDropzone from "./FileDropzone";
import AttachmentGrid from "./AttachmentGrid";
import AssigneePicker from "./AssigneePicker";
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

const EditTaskModal = () => (
  <ResponsiveModal
    name="editTask"
    title="Topshiriqni tahrirlash"
    description="Har bir o'zgarish tarixga yoziladi"
    className="max-w-2xl"
  >
    <Content />
  </ResponsiveModal>
);

/**
 * Tahrirlash formasi. Faqat O'ZGARGAN maydonlar yuboriladi — server
 * tarixga aynan nima o'zgarganini yozadi.
 *
 * Ijrochini almashtirish faqat ish topshirilmagan va jarima yozilmagan
 * topshiriqda ochiq (server ham shu qoidani tekshiradi).
 */
const Content = ({ close, isLoading, setIsLoading, task }) => {
  const { mutate: updateTask } = useUpdateTask();
  const { data: settings = DEFAULT_TASK_SETTINGS } = useQuery(tasksQueries.settings());

  const { title, description, penaltyPoints, setField } = useObjectState({
    title: task?.title || "",
    description: task?.description || "",
    penaltyPoints: String(task?.penaltyPoints ?? ""),
  });

  const [assignee, setAssignee] = useState(task?.assignee ? [task.assignee] : []);
  const [removedKeys, setRemovedKeys] = useState([]);
  const [newFiles, setNewFiles] = useState([]);

  if (!task) return null;

  const canReassign = WORKING_TASK_STATUSES.includes(task.status) && !task.penaltyRef;
  const currentFiles = (task.attachments || []).filter((a) => !removedKeys.includes(a.key));
  const removedFiles = (task.attachments || []).filter((a) => removedKeys.includes(a.key));
  const nextAssignee = assignee[0];

  const changes = [];
  if (title.trim() !== task.title) changes.push("title");
  if (description.trim() !== task.description) changes.push("description");
  if (Number(penaltyPoints) !== task.penaltyPoints) changes.push("penaltyPoints");
  if (nextAssignee && nextAssignee.id !== task.assignee?.id) changes.push("assignee");
  if (removedKeys.length || newFiles.length) changes.push("attachments");

  const problems = [];
  if (title.trim().length < settings.minTitleLength)
    problems.push(`Sarlavha kamida ${settings.minTitleLength} ta belgi`);
  if (description.trim().length < settings.minDescriptionLength)
    problems.push(`Tavsif kamida ${settings.minDescriptionLength} ta belgi`);
  const points = Number(penaltyPoints);
  if (!Number.isInteger(points) || points < 1 || points > settings.maxPenaltyPoints)
    problems.push(`Jarima bali 1–${settings.maxPenaltyPoints} oralig'ida`);
  if (!nextAssignee) problems.push("Ijrochini tanlang");
  if (currentFiles.length + newFiles.length > 10) problems.push("Ko'pi bilan 10 ta fayl");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (problems.length) return toast.error(problems[0]);
    if (!changes.length) return toast.info("Hech narsa o'zgartirilmadi");

    const formData = new FormData();
    if (changes.includes("title")) formData.append("title", title.trim());
    if (changes.includes("description")) formData.append("description", description.trim());
    if (changes.includes("penaltyPoints")) formData.append("penaltyPoints", String(points));
    if (changes.includes("assignee")) formData.append("assigneeId", nextAssignee.id);
    if (removedKeys.length) formData.append("removeAttachmentKeys", JSON.stringify(removedKeys));
    newFiles.forEach((file) => formData.append("files", file));

    setIsLoading(true);
    updateTask(
      { id: task.id, formData },
      {
        onSuccess: () => {
          close();
          toast.success("Topshiriq yangilandi");
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

      <InputField
        required
        min={1}
        max={settings.maxPenaltyPoints}
        type="number"
        label="Kechiksa jarima bali"
        value={penaltyPoints}
        className="sm:max-w-48"
        onChange={(e) => setField("penaltyPoints", e.target.value)}
      />

      {canReassign ? (
        <div className="space-y-1.5">
          <AssigneePicker
            single
            value={assignee}
            disabled={isLoading}
            onChange={setAssignee}
          />
          {changes.includes("assignee") && (
            <p className="flex items-center gap-1.5 text-xs text-amber-700">
              <Info className="size-3.5" />
              {fullName(task.assignee)} dan {fullName(nextAssignee)} ga o'tadi — yangi ijrochiga
              bildirishnoma boradi
            </p>
          )}
        </div>
      ) : (
        <div className="flex items-start gap-2 rounded-xl bg-gray-50 px-3.5 py-2.5 text-xs text-gray-600">
          <Info className="mt-0.5 size-4 shrink-0" />
          <p>
            Ijrochi: <b>{fullName(task.assignee)}</b>. Uni faqat ish hali topshirilmagan va
            jarima yozilmagan topshiriqda almashtirish mumkin.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Biriktirilgan fayllar</p>
        {currentFiles.length > 0 ? (
          <AttachmentGrid
            items={currentFiles}
            onRemove={(item) => setRemovedKeys((keys) => [...keys, item.key])}
          />
        ) : (
          <p className="text-xs text-gray-400">Fayl yo'q</p>
        )}
        {removedFiles.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-rose-600">
            {removedFiles.length} ta fayl olib tashlanadi
            <button
              type="button"
              onClick={() => setRemovedKeys([])}
              className="inline-flex items-center gap-1 font-medium text-blue-600 hover:underline"
            >
              <Undo2 className="size-3" />
              Qaytarish
            </button>
          </div>
        )}
      </div>

      <FileDropzone
        value={newFiles}
        onChange={setNewFiles}
        max={Math.max(0, 10 - currentFiles.length)}
        disabled={isLoading}
        label="Yangi fayl qo'shish"
      />

      <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-gray-500">
          {problems[0] || (changes.length ? `${changes.length} ta o'zgarish` : "Hali o'zgarish yo'q")}
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={() => close()} disabled={isLoading}>
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

export default EditTaskModal;
