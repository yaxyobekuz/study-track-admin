// Toast
import { toast } from "sonner";

// API
import { usersAPI } from "@/features/users/api/users.api";

// Components
import Button from "@/shared/components/ui/button/Button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Hooks
import useArrayStore from "@/shared/hooks/useArrayStore";

const RestoreUserModal = () => (
  <ResponsiveModal
    name="restoreUser"
    title="O'quvchini qaytarish"
    description="O'quvchi arxivdan qaytariladi va asosiy ro'yxatda ko'rinadi. Tangalar va jarimalar 0 holatda qoladi."
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, ...user }) => {
  const { invalidateCache } = useArrayStore("users");

  const handleRestoreUser = (e) => {
    e.preventDefault();
    setIsLoading(true);

    usersAPI
      .restore(user._id)
      .then(() => {
        close();
        invalidateCache();
        toast.success("O'quvchi qaytarildi");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      })
      .finally(() => setIsLoading(false));
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
