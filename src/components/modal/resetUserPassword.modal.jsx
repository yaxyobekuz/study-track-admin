// Toast
import { toast } from "sonner";

// API
import { usersAPI } from "@/api/client";

// Components
import Input from "../form/input";
import Button from "../form/button";
import ResponsiveModal from "../ResponsiveModal";

// Hooks
import useObjectState from "@/hooks/useObjectState.hook";

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

  const handleEditUser = (e) => {
    e.preventDefault();
    setIsLoading(true);

    usersAPI
      .resetPassword(user._id, { newPassword: password?.trim() })
      .then(() => {
        close();
        toast.success("Foydalanuvchining paroli yangilandi");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <form onSubmit={handleEditUser} className="space-y-5">
      <Input
        required
        autoFocus
        minLength={6}
        type="password"
        name="password"
        value={password}
        label="Yangi parol"
        onChange={(v) => setField("password", v)}
      />

      <div className="flex justify-end gap-5 w-full">
        <Button
          type="button"
          className="w-32"
          variant="neutral"
          onClick={close}
        >
          Bekor qilish
        </Button>

        <Button
          autoFocus
          className="w-32"
          variant="primary"
          disabled={isLoading}
        >
          Yangilash
          {isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

export default ResetUserPasswordModal;
