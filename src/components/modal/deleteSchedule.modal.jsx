// Toast
import { toast } from "sonner";

// API
import { schedulesAPI } from "@/api/client";

// Components
import Button from "../form/button";
import ResponsiveModal from "../ResponsiveModal";

// Hooks
import useArrayStore from "@/hooks/useArrayStore.hook";

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
      className="flex justify-end gap-5 w-full"
    >
      <Button type="button" className="w-32" variant="neutral" onClick={close}>
        Bekor qilish
      </Button>

      <Button autoFocus className="w-32" variant="danger" disabled={isLoading}>
        O'chirish
        {isLoading && "..."}
      </Button>
    </form>
  );
};

export default DeleteScheduleModal;
