// ⚠️ VAQTINCHA — topshiriqni o'chirish tugmasi. Keyin shu fayl, uning
// ikki ishlatilish joyi (TasksPage, TaskDetailPage), `useDeleteTask` va
// `tasksAPI.remove` bilan birga olib tashlanadi.

// Toast
import { toast } from "sonner";

// Icons
import { Trash2 } from "lucide-react";

// Queries
import { useDeleteTask } from "../queries/tasks.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";
import ConfirmPopover from "@/shared/components/ui/ConfirmPopover";

/**
 * @param {{ taskId: string, full?: boolean, onDeleted?: () => void }} props
 * `full` — topshiriq sahifasidagi keng tugma, aks holda jadvaldagi belgi.
 */
const DeleteTaskButton = ({ taskId, full = false, onDeleted }) => {
  const { mutate: deleteTask, isPending } = useDeleteTask();

  const handleDelete = () =>
    deleteTask(taskId, {
      onSuccess: () => {
        toast.success("Topshiriq o'chirildi");
        onDeleted?.();
      },
      onError: (err) =>
        toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
    });

  return (
    <ConfirmPopover
      danger
      tooltip={full ? "" : "O'chirish"}
      title="Topshiriq o'chirilsinmi?"
      description="Topshiriq tarixi bilan birga butunlay o'chiriladi va qaytarib bo'lmaydi. Qo'llangan jarima o'chirilmaydi."
      confirmLabel="O'chirish"
      onConfirm={handleDelete}
    >
      {full ? (
        <Button variant="danger" className="w-full text-sm" disabled={isPending}>
          <Trash2 className="size-4" />
          O'chirish{isPending && "..."}
        </Button>
      ) : (
        <button
          type="button"
          disabled={isPending}
          aria-label="Topshiriqni o'chirish"
          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
        >
          <Trash2 className="size-3.5" />
        </button>
      )}
    </ConfirmPopover>
  );
};

export default DeleteTaskButton;
