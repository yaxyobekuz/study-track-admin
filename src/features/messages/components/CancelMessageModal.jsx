// Toast
import { toast } from "sonner";

// API
import { messagesAPI } from "@/features/messages/api/messages.api";

// Hooks
import useArrayStore from "@/shared/hooks/useArrayStore";

// Components
import Button from "@/shared/components/ui/button/Button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

const CancelMessageModal = () => (
  <ResponsiveModal
    name="cancelMessage"
    title="Xabar yuborishni to'xtatish"
    description="Navbatda turgan xabarlar yuborilmaydi. Allaqachon yuborilganlarni qaytarib bo'lmaydi. Davom etasizmi?"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, ...message }) => {
  const { invalidateCache } = useArrayStore("messages");
  const { invalidateCache: invalidateTeacherMessages } =
    useArrayStore("teacherMessages");

  const handleCancelMessage = (e) => {
    e.preventDefault();
    setIsLoading(true);

    messagesAPI
      .cancel(message._id)
      .then((res) => {
        close();
        invalidateCache();
        invalidateTeacherMessages();
        toast.success(res.data?.message || "Xabar to'xtatildi");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <form
      onSubmit={handleCancelMessage}
      className="flex flex-col-reverse gap-3.5 w-full xs:m-0 xs:flex-row xs:justify-end"
    >
      <Button
        type="button"
        onClick={close}
        variant="secondary"
        className="w-full xs:w-32"
      >
        Bekor qilish
      </Button>

      <Button
        autoFocus
        variant="danger"
        disabled={isLoading}
        className="w-full xs:w-32"
      >
        To'xtatish
        {isLoading && "..."}
      </Button>
    </form>
  );
};

export default CancelMessageModal;
