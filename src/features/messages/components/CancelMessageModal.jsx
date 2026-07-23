// Toast
import { toast } from "sonner";

// Queries
import { useCancelMessage } from "@/features/messages/queries/messages.mutations";

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
  const { mutate: cancelMessage } = useCancelMessage();

  const handleCancelMessage = (e) => {
    e.preventDefault();
    setIsLoading(true);

    cancelMessage(message.id, {
      onSuccess: (res) => {
        close();
        toast.success(res?.message || "Xabar to'xtatildi");
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      },
      onSettled: () => setIsLoading(false),
    });
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
