// Toast
import { toast } from "sonner";

// Hooks
import { useDeleteChangelog } from "../queries/changelog.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";

const DeleteChangelogForm = ({ close, isLoading, setIsLoading, ...entry }) => {
  const { mutate: deleteChangelog } = useDeleteChangelog();

  const handleDelete = () => {
    setIsLoading(true);

    deleteChangelog(entry.id, {
      onSuccess: () => {
        close();
        toast.success("Yozuv o'chirildi");
      },
      onError: (error) =>
        toast.error(error.response?.data?.message || "O'chirishda xatolik"),
      onSettled: () => setIsLoading(false),
    });
  };

  return (
    <div className="flex justify-end gap-4">
      <Button variant="secondary" onClick={close}>
        Bekor qilish
      </Button>

      <Button variant="danger" onClick={handleDelete} disabled={isLoading}>
        O'chirish{isLoading && "..."}
      </Button>
    </div>
  );
};

export default DeleteChangelogForm;
