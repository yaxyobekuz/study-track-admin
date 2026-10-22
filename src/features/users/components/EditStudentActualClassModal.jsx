// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// Components
import Button from "@/shared/components/ui/button/Button";
import SelectField from "@/shared/components/ui/select/SelectField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Hooks
import { useClasses } from "@/features/classes/queries/classes.queries";
import { useUpdateStudentActualClass } from "@/features/users/queries/users.mutations";

/**
 * O'QUVCHINING HAQIQIY SINFI.
 *
 * "Sinflar" — o'quvchi HOZIR O'QIYOTGAN guruh(lar), bu yerdagi sinf esa
 * uning O'Z sinfi: bilimi yaxshi bola IT 2 dan IT 1 ga o'tqazilsa, guruhi
 * IT 1, haqiqiy sinfi IT 2 bo'lib qoladi.
 *
 * ⚠️ SABAB SO'RALMAYDI va jurnalga YOZILMAYDI (`EditStudentClassesModal`
 * dan farqi): bu a'zolik emas, belgi — hech kim sinfidan chiqarilmaydi.
 */
const EditStudentActualClassModal = () => (
  <ResponsiveModal name="editStudentActualClass" title="Haqiqiy sinfi">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, ...user }) => {
  const { data: classes = [] } = useClasses();
  const { mutate: updateActualClass } = useUpdateStudentActualClass();

  const currentId = user.actualClass?.id ?? "";
  const [selected, setSelected] = useState(currentId);

  const options = classes.map((cls) => ({ label: cls.name, value: cls.id }));
  const hasChanges = selected !== currentId;

  // Hozirgi guruh(lar)i — admin farqni ko'rib turib tanlasin
  const studyingIn =
    user.classes?.length > 0
      ? user.classes.map((cls) => cls.name).join(", ")
      : "—";

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!hasChanges) return close();

    setIsLoading(true);

    updateActualClass(
      { id: user.id, actualClassId: selected },
      {
        onSuccess: () => {
          close();
          toast.success(
            selected
              ? "Haqiqiy sinfi saqlandi"
              : "Haqiqiy sinfi olib tashlandi",
          );
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
        Hozir o'qiyotgan guruhi: <b className="text-gray-900">{studyingIn}</b>
        <span className="mt-1 block text-xs text-gray-500">
          Haqiqiy sinf o'quvchini sinfga qo'shmaydi — u faqat o'quvchi aslida
          qaysi sinfniki ekanini ko'rsatadi.
        </span>
      </p>

      <div className="space-y-1.5">
        {/* `inline` — modal ichida MAJBURIY (`SelectSearch` izohi) */}
        <SelectField
          searchable
          inline
          label="Haqiqiy sinfi"
          options={options}
          value={selected}
          placeholder="Sinfni tanlang"
          onChange={(v) => setSelected(v)}
        />

        {selected && (
          <button
            type="button"
            onClick={() => setSelected("")}
            className="text-sm font-medium text-red-600 hover:text-red-700"
          >
            Haqiqiy sinfni olib tashlash
          </button>
        )}
      </div>

      <div className="flex flex-col-reverse gap-3.5 w-full mt-5 xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          onClick={close}
          variant="secondary"
          className="w-full xs:w-32"
        >
          Bekor qilish
        </Button>

        <Button className="w-full xs:w-32" disabled={isLoading || !hasChanges}>
          Saqlash
          {isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

export default EditStudentActualClassModal;
