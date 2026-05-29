// Toast
import { toast } from "sonner";

// API
import { teacherAssignmentsAPI } from "../api/teacherAssignments.api";

// Components
import Button from "@/shared/components/ui/button/Button";

const DeleteAssignmentForm = ({
  onSuccess,
  close,
  isLoading,
  setIsLoading,
  ...assignment
}) => {
  const handleDelete = async () => {
    setIsLoading(true);

    try {
      await teacherAssignmentsAPI.delete(assignment._id);
      onSuccess();
      toast.success("Biriktiruv o'chirildi");
      close();
    } catch (error) {
      toast.error(error.response?.data?.message || "O'chirishda xatolik");
    } finally {
      setIsLoading(false);
    }
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
