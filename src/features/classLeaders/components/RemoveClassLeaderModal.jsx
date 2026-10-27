// Toast
import { toast } from "sonner";

// Components
import Button from "@/shared/components/ui/button/Button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Queries
import { useRemoveClassLeader } from "../queries/classLeaders.mutations";

/**
 * SINF RAHBARLIGINI OLIB TASHLASH.
 *
 * ⚠️ TYUTOR OYNASIDAN FARQI: "qaysi oydan" so'ralmaydi. Tyutorda u PULNI
 * to'xtatadi, ya'ni oy muhim; bu yerda esa faqat huquq olinadi va u DARHOL
 * to'xtaydi — kelasi oy davomat qilib turadigan rahbarning ma'nosi yo'q.
 *
 * `openModal("removeClassLeader", { item })`
 */
const RemoveClassLeaderModal = () => (
  <ResponsiveModal name="removeClassLeader" title="Sinf rahbarligini olib tashlash">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, item }) => {
  const { mutate: remove } = useRemoveClassLeader();

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    remove(item.id, {
      onSuccess: (result) => {
        close();
        toast.success(result?.message || "Sinf rahbarligi olib tashlandi");
      },
      onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      onSettled: () => setIsLoading(false),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-600">
        <b className="text-gray-900">{item?.className}</b> sinfi{" "}
        <b className="text-gray-900">{item?.leader?.name}</b> dan olib tashlanadi.
      </p>

      <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
        Davomat belgilash huquqi darhol to'xtaydi. Avval belgilangan davomat
        o'z joyida qoladi — u kim belgilaganini saqlaydi.
      </p>

      <div className="mt-5 flex w-full flex-col-reverse gap-3.5 xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          onClick={close}
          variant="secondary"
          className="w-full xs:w-32"
        >
          Bekor qilish
        </Button>
        <Button variant="danger" className="w-full xs:w-40" disabled={isLoading}>
          Olib tashlash
          {isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

export default RemoveClassLeaderModal;
