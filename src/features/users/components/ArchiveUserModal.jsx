// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// API
import { usersAPI } from "@/features/users/api/users.api";

// Components
import Button from "@/shared/components/ui/button/Button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Hooks
import useArrayStore from "@/shared/hooks/useArrayStore";

const ArchiveUserModal = () => (
  <ResponsiveModal
    name="archiveUser"
    title="O'quvchini arxivlash"
    description="O'quvchi arxivlanadi va asosiy ro'yxatdan yashiriladi. Keyinchalik qaytarish mumkin."
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, ...user }) => {
  const { invalidateCache } = useArrayStore("users");
  const [resetCoins, setResetCoins] = useState(false);
  const [resetPenalties, setResetPenalties] = useState(false);

  const handleArchiveUser = (e) => {
    e.preventDefault();
    setIsLoading(true);

    usersAPI
      .archive(user._id, { resetCoins, resetPenalties })
      .then(() => {
        close();
        invalidateCache();
        toast.success("O'quvchi arxivlandi");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <form onSubmit={handleArchiveUser} className="flex flex-col gap-4">
      {/* Reset options */}
      <div className="flex flex-col gap-2.5">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={resetCoins}
            onChange={(e) => setResetCoins(e.target.checked)}
            className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
          />
          Tangalarni 0 ga tushirish
        </label>

        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={resetPenalties}
            onChange={(e) => setResetPenalties(e.target.checked)}
            className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
          />
          Jarimalarni 0 ga tushirish
        </label>
      </div>

      <div className="flex flex-col-reverse gap-3.5 w-full xs:m-0 xs:flex-row xs:justify-end">
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
          Arxivlash
          {isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

export default ArchiveUserModal;
