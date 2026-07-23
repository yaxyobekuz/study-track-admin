// Toast
import { toast } from "sonner";

// Hooks
import { useDeleteAssignment } from "../queries/test-seasons.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";

const DeleteAssignmentForm = ({
  close,
  isLoading,
  setIsLoading,
  ...assignment
}) => {
  const { mutate: deleteAssignment } = useDeleteAssignment();

  const handleDelete = () => {
    setIsLoading(true);

    deleteAssignment(assignment.id, {
      onSuccess: () => {
        toast.success("Biriktiruv o'chirildi");
        close();
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

export default DeleteAssignmentForm;
