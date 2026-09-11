// Toast
import { toast } from "sonner";

// Icons
import { AlertTriangle } from "lucide-react";

// Components
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import Button from "@/shared/components/ui/button/Button";

// Queries
import { useDeleteTest } from "../queries/diagnostics.mutations";

/**
 * TESTNI O'CHIRISH.
 *
 * ⚠️ URINISHI BOR TEST ARXIVLANADI (server qarori) — natijalar tarixi
 * testning nomiga va qoidasiga ishora qiladi. Oyna buni oldindan aytadi,
 * aks holda foydalanuvchi "o'chirdim" deb o'ylab, testni ro'yxatda
 * ko'rib qolardi.
 */
const DeleteTestModal = () => (
  <ResponsiveModal name="deleteDiagnosticTest" title="Testni o'chirish">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, test }) => {
  const { mutate: deleteTest } = useDeleteTest();
  const willArchive = (test?.attemptCount ?? 0) > 0;

  const handleDelete = () => {
    setIsLoading(true);
    deleteTest(test.id, {
      onSuccess: (res) => {
        close();
        toast.success(res?.message || "Test o'chirildi");
      },
      onError: (err) =>
        toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      onSettled: () => setIsLoading(false),
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        <span className="font-medium text-gray-900">{test?.title}</span> testini
        o'chirmoqchimisiz?
      </p>

      {willArchive && (
        <div className="flex gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          <AlertTriangle className="size-4 shrink-0" strokeWidth={1.5} />
          <span>
            Testda {test.attemptCount} ta urinish bor. U{" "}
            <b>o'chirilmaydi, arxivlanadi</b> — natijalar tarixi saqlanadi va
            test yangi o'quvchilarga ko'rinmaydi.
          </span>
        </div>
      )}

      <div className="flex flex-col-reverse gap-3.5 xs:flex-row xs:justify-end">
        <Button variant="secondary" className="w-full xs:w-32" onClick={close}>
          Bekor qilish
        </Button>
        <Button
          variant="destructive"
          className="w-full xs:w-36"
          disabled={isLoading}
          onClick={handleDelete}
        >
          {willArchive ? "Arxivlash" : "O'chirish"}
          {isLoading && "..."}
        </Button>
      </div>
    </div>
  );
};

export default DeleteTestModal;
