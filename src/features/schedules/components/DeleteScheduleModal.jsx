// Toast
import { toast } from "sonner";

// API
import { schedulesAPI } from "@/shared/api/schedules.api";

// Components
import Button from "@/shared/components/form/button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Hooks
import useArrayStore from "@/shared/hooks/useArrayStore";

const DeleteScheduleModal = () => (
  <ResponsiveModal
    name="deleteSchedule"
    title="Dars jadvalini o'chirish"
    description="Haqiqatdan ham dars jadvalini o'chirmoqchimisiz?"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, ...scheduleData }) => {
  const { invalidateCacheByStartsName } = useArrayStore("schedules");

  const handleDeleteSchedule = (e) => {
    e.preventDefault();
    setIsLoading(true);

    schedulesAPI
      .delete(scheduleData._id)
      .then(() => {
        close();
        invalidateCacheByStartsName();
        toast.success("Dars jadvali o'chirildi");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <form
      onSubmit={handleDeleteSchedule}
      className="flex flex-col-reverse gap-3.5 w-full xs:m-0 xs:flex-row xs:justify-end"
    >
      <Button type="button" className="w-full xs:w-32" variant="neutral" onClick={close}>
        Bekor qilish
      </Button>

      <Button autoFocus className="w-full xs:w-32" variant="danger" disabled={isLoading}>
        O'chirish
        {isLoading && "..."}
      </Button>
    </form>
  );
};

export default DeleteScheduleModal;
