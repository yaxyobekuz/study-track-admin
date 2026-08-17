// Toast
import { toast } from "sonner";

// Components
import Button from "@/shared/components/ui/button/Button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Hooks
import { useRestoreUser } from "@/features/users/queries/users.mutations";

const RestoreUserModal = () => (
  <ResponsiveModal
    name="restoreUser"
    title="Arxivdan qaytarish"
    description="Foydalanuvchi asosiy ro'yxatga qaytadi va tizimga kira oladi. Arxivlashda 0 ga tushirilgan tanga va jarimalar tiklanmaydi."
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, ...user }) => {
  const { mutate: restoreUser } = useRestoreUser();

  const handleRestoreUser = (e) => {
    e.preventDefault();
    setIsLoading(true);

    restoreUser(user.id, {
      onSuccess: () => {
        close();
        toast.success("Foydalanuvchi qaytarildi");
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      },
      onSettled: () => setIsLoading(false),
    });
  };

  return (
    <form
      onSubmit={handleRestoreUser}
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

      <Button autoFocus disabled={isLoading} className="w-full xs:w-32">
        Qaytarish
        {isLoading && "..."}
      </Button>
    </form>
  );
};

export default RestoreUserModal;
