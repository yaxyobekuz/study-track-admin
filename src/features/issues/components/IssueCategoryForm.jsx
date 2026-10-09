// Toast
import { toast } from "sonner";

// React
import { useEffect } from "react";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import {
  useCreateIssueCategory,
  useEditIssueCategory,
} from "../queries/issues.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";

/**
 * Kategoriya formasi — NOMI va HOLATI, boshqa hech narsa.
 *
 * ⚠️ MAYDON QO'SHILMAYDI. Kategoriya botdagi oddiy klaviatura tugmasi
 * bo'lib xizmat qiladi va tugmada faqat nom ko'rinadi (Telegram'da
 * tugmaga ikonka yoki tavsif qo'yib bo'lmaydi). Panelda to'ldirilgan,
 * botda esa hech qachon ko'rinmaydigan maydon foydalanuvchini chalg'itardi.
 *
 * ⚠️ `isActive` — BOTDAGI KO'RINISH kaliti: o'chirilgan kategoriya
 * tugmasi darhol yo'qoladi, lekin eski muammolar o'z kategoriyasini
 * saqlab qoladi.
 */
const IssueCategoryForm = ({
  close,
  isLoading,
  setIsLoading,
  isEdit = false,
  ...category
}) => {
  const { mutate: createCategory } = useCreateIssueCategory();
  const { mutate: editCategory } = useEditIssueCategory();

  const { name, isActive, setFields, setField } = useObjectState({
    name: "",
    isActive: true,
  });

  useEffect(() => {
    if (isEdit && category.id) {
      setFields({
        name: category.name || "",
        isActive: category.isActive ?? true,
      });
    }
  }, [isEdit, category?.id]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) {
      toast.warning("Kategoriya nomini kiriting");
      return;
    }

    setIsLoading(true);

    const options = {
      onSuccess: () => {
        toast.success(isEdit ? "Kategoriya yangilandi" : "Kategoriya qo'shildi");
        close();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Xatolik yuz berdi");
      },
      onSettled: () => setIsLoading(false),
    };

    const payload = { name: trimmed, isActive };

    if (isEdit) editCategory({ id: category.id, data: payload }, options);
    else createCategory(payload, options);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField
        required
        label="Nomi"
        value={name}
        placeholder="Masalan: Texnika / jihozlar"
        description="Shu matn botda tugma bo'lib ko'rinadi — qisqa va tushunarli yozing."
        onChange={(e) => setField("name", e.target.value)}
      />

      {/* Holat */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="issueCategoryActive"
          checked={isActive}
          onChange={(e) => setField("isActive", e.target.checked)}
          className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="issueCategoryActive" className="text-sm text-gray-700">
          Aktiv (botda ko'rinadi)
        </label>
      </div>

      <div className="flex flex-col-reverse gap-4 pt-2 xs:flex-row xs:justify-end">
        <Button
          type="button"
          onClick={close}
          variant="secondary"
          disabled={isLoading}
        >
          Bekor qilish
        </Button>

        <Button disabled={isLoading}>
          {isLoading ? "Saqlanmoqda..." : "Saqlash"}
        </Button>
      </div>
    </form>
  );
};

export default IssueCategoryForm;
