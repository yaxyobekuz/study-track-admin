// Toast
import { toast } from "sonner";

// Components
import Input from "@/shared/components/ui/input/Input";
import Button from "@/shared/components/ui/button/Button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import InputField from "@/shared/components/ui/input/InputField";
import { useResetUserPassword } from "@/features/users/queries/users.mutations";

const ResetUserPasswordModal = () => (
  <ResponsiveModal
    name="resetUserPassword"
    title="Foydalanuvchining parolini yangilash"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, ...user }) => {
  const { password, setField } = useObjectState({ password: "" });
  const { mutate: resetPassword } = useResetUserPassword();

  const handleEditUser = (e) => {
    e.preventDefault();
    setIsLoading(true);

    resetPassword(
      { id: user.id, newPassword: password?.trim() },
      {
        onSuccess: () => {
          close();
          toast.success("Foydalanuvchining paroli yangilandi");
        },
        onError: (err) => {
          toast.error(err.response?.data?.message || "Xatolik yuz berdi");
        },
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <form onSubmit={handleEditUser} className="space-y-3.5">
      <InputField
        required
        autoFocus
        minLength={6}
        type="password"
        name="password"
        value={password}
        label="Yangi parol"
        onChange={(e) => setField("password", e.target.value)}
      />

      <div className="flex flex-col-reverse gap-3.5 w-full mt-5 xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          className="w-full xs:w-32"
          variant="secondary"
          onClick={close}
        >
          Bekor qilish
        </Button>

        <Button autoFocus className="w-full xs:w-32" disabled={isLoading}>
          Yangilash
          {isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

export default ResetUserPasswordModal;
