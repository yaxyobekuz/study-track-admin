// Toast
import { toast } from "sonner";

// Hooks
import { useDeleteIssueCategory } from "../queries/issues.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";

/**
 * Kategoriyani o'chirish.
 *
 * ⚠️ IKKI XIL NATIJA va foydalanuvchiga AVVALDAN aytiladi:
 *
 *   muammosi yo'q   → butunlay o'chadi
 *   muammosi bor    → NOAKTIV qilinadi (botdan yo'qoladi, arxivdagi
 *                     muammolar kategoriyasiz qolmasligi uchun)
 *
 * Qaror serverda (`issue.service#deleteCategory`), chunki muammolar soni
 * shu orada o'zgargan bo'lishi mumkin; javobdagi `deleted` esa amalda
 * nima bo'lganini aytadi va toast shunga qarab yoziladi.
 */
const DeleteIssueCategoryForm = ({
  close,
  isLoading,
  setIsLoading,
  ...category
}) => {
  const { mutate: deleteCategory } = useDeleteIssueCategory();

  const hasIssues = (category.issuesCount ?? 0) > 0;

  const handleDelete = () => {
    setIsLoading(true);

    deleteCategory(category.id, {
      onSuccess: (res) => {
        toast.success(
          res?.data?.deleted
            ? "Kategoriya o'chirildi"
            : "Kategoriya noaktiv qilindi — botdan olib tashlandi",
        );
        close();
      },
      onError: (error) =>
        toast.error(error.response?.data?.message || "O'chirishda xatolik"),
      onSettled: () => setIsLoading(false),
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-700">
        <span className="font-medium">{category.name}</span>{" "}
        {hasIssues ? (
          <>
            kategoriyasida <b>{category.issuesCount} ta</b> muammo bor.
            Shuning uchun u o'chirilmaydi, <b>noaktiv</b> qilinadi: botdan
            yo'qoladi, eski muammolar esa o'z kategoriyasini saqlab qoladi.
          </>
        ) : (
          <>kategoriyasi butunlay o'chiriladi.</>
        )}
      </p>

      <div className="flex flex-col-reverse gap-4 xs:flex-row xs:justify-end">
        <Button variant="secondary" onClick={close} disabled={isLoading}>
          Bekor qilish
        </Button>

        <Button variant="danger" onClick={handleDelete} disabled={isLoading}>
          {hasIssues ? "Noaktiv qilish" : "O'chirish"}
          {isLoading && "..."}
        </Button>
      </div>
    </div>
  );
};

export default DeleteIssueCategoryForm;
