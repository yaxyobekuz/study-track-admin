// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// Components
import Button from "@/shared/components/ui/button/Button";
import SelectField from "@/shared/components/ui/select/SelectField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Hooks
import { useUpdateStudentActualGrade } from "@/features/users/queries/users.mutations";

// Data
import { formatGrade, getGradeOptions } from "../data/users.data";

/**
 * O'QUVCHINING ASL SINFI — maktab darajasi (1-sinf … 11-sinf).
 *
 * "Sinflar" — o'quvchi HOZIR O'QIYOTGAN guruh(lar), bu yerdagi daraja esa
 * u NECHANCHI SINF o'quvchisi: bilimi yaxshi 5-sinf o'quvchisi 6-sinflar
 * guruhida o'qiyotgan bo'lishi mumkin.
 *
 * ⚠️ Ro'yxat SINFLAR KATALOGIDAN EMAS — daraja katalogga bog'liq emas.
 * ⚠️ SABAB SO'RALMAYDI va jurnalga YOZILMAYDI (`EditStudentClassesModal`
 * dan farqi): bu a'zolik emas, belgi — hech kim sinfidan chiqarilmaydi.
 */
const EditStudentActualGradeModal = () => (
  <ResponsiveModal name="editStudentActualGrade" title="Asl sinfi">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, ...user }) => {
  const { mutate: updateActualGrade } = useUpdateStudentActualGrade();

  const currentValue =
    user.actualGrade == null ? "" : String(user.actualGrade);
  const [selected, setSelected] = useState(currentValue);

  const hasChanges = selected !== currentValue;

  // Hozirgi guruh(lar)i — admin farqni ko'rib turib tanlasin
  const studyingIn =
    user.classes?.length > 0
      ? user.classes.map((cls) => cls.name).join(", ")
      : "—";

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!hasChanges) return close();

    setIsLoading(true);

    updateActualGrade(
      { id: user.id, actualGrade: selected },
      {
        onSuccess: () => {
          close();
          toast.success(
            selected
              ? `Asl sinfi: ${formatGrade(selected)}`
              : "Asl sinfi olib tashlandi",
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
          Asl sinf o'quvchini guruhga qo'shmaydi — u faqat o'quvchi nechanchi
          sinf o'quvchisi ekanini ko'rsatadi.
        </span>
      </p>

      <div className="space-y-1.5">
        {/* `inline` — modal ichida MAJBURIY (`SelectSearch` izohi) */}
        <SelectField
          searchable
          inline
          label="Asl sinfi"
          options={getGradeOptions()}
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
            Asl sinfni olib tashlash
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

export default EditStudentActualGradeModal;
