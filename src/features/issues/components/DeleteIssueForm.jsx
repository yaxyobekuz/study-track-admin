// Toast
import { toast } from "sonner";

// Hooks
import { useDeleteIssue } from "../queries/issues.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";

const DeleteIssueForm = ({ close, isLoading, setIsLoading, ...issue }) => {
  const { mutate: deleteIssue } = useDeleteIssue();

  const handleDelete = () => {
    setIsLoading(true);

    deleteIssue(issue.id, {
      onSuccess: () => {
        toast.success("Muammo o'chirildi");
        close();
      },
      onError: (error) =>
        toast.error(error.response?.data?.message || "O'chirishda xatolik"),
      onSettled: () => setIsLoading(false),
    });
  };

  return (
    <div className="space-y-4">
      <p className="max-h-32 overflow-y-auto whitespace-pre-wrap rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
        {issue.body}
      </p>

      <div className="flex flex-col-reverse gap-4 xs:flex-row xs:justify-end">
        <Button variant="secondary" onClick={close} disabled={isLoading}>
          Bekor qilish
        </Button>

        <Button variant="danger" onClick={handleDelete} disabled={isLoading}>
          O'chirish{isLoading && "..."}
        </Button>
      </div>
    </div>
  );
};

export default DeleteIssueForm;
