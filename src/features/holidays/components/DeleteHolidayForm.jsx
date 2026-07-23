// Toast
import { toast } from "sonner";

// Hooks
import { useDeleteHoliday } from "@/features/holidays/queries/holidays.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";

const DeleteHolidayForm = ({ close, isLoading, setIsLoading, ...holiday }) => {
  const { mutate: deleteHoliday } = useDeleteHoliday();

  const handleDelete = () => {
    setIsLoading(true);

    deleteHoliday(holiday.id, {
      onSuccess: () => {
        toast.success("Dam olish kuni o'chirildi");
        close();
      },
      onError: () => toast.error("O'chirishda xatolik"),
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

export default DeleteHolidayForm;
