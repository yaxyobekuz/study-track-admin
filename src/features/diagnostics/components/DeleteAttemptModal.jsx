// Toast
import { toast } from "sonner";

// Components
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import Button from "@/shared/components/ui/button/Button";

// Queries
import { useDeleteAttempt } from "../queries/diagnostics.mutations";

/**
 * URINISHNI O'CHIRISH.
 *
 * ⚠️ BU AMAL QAYTARILMAYDI va u tahlildagi raqamlarni ham o'zgartiradi —
 * shuning uchun matn buni ochiq aytadi. Xato topshirilgan urinishni
 * tozalash uchun mo'ljallangan, "yoqmagan natijani yashirish" uchun emas.
 */
const DeleteAttemptModal = () => (
  <ResponsiveModal name="deleteDiagnosticAttempt" title="Urinishni o'chirish">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, attempt }) => {
  const { mutate: deleteAttempt } = useDeleteAttempt();

  const handleDelete = () => {
    setIsLoading(true);
    deleteAttempt(attempt.id, {
      onSuccess: () => {
        close();
        toast.success("Urinish o'chirildi");
      },
      onError: (err) =>
        toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      onSettled: () => setIsLoading(false),
    });
  };

  const name = [attempt?.student?.lastName, attempt?.student?.firstName]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        <span className="font-medium text-gray-900">{name || "O'quvchi"}</span>ning
        urinishi ({attempt?.score != null ? `${Math.round(attempt.score)}%` : "—"})
        butunlay o'chiriladi.
      </p>

      <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">
        Bu amalni qaytarib bo'lmaydi. Urinish tahlil hisobotlaridan ham
        chiqib ketadi.
      </p>

      <div className="flex flex-col-reverse gap-3.5 xs:flex-row xs:justify-end">
        <Button variant="secondary" className="w-full xs:w-32" onClick={close}>
          Bekor qilish
        </Button>
        <Button
          variant="destructive"
          className="w-full xs:w-32"
          disabled={isLoading}
          onClick={handleDelete}
        >
          O'chirish
          {isLoading && "..."}
        </Button>
      </div>
    </div>
  );
};

export default DeleteAttemptModal;
