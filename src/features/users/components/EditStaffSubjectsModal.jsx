// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// Components
import Button from "@/shared/components/ui/button/Button";
import MultiSelect from "@/shared/components/form/multi-select";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Hooks
import { useSubjects } from "@/features/subjects/queries/subjects.queries";
import { useUpdateUser } from "@/features/users/queries/users.mutations";

/**
 * Xodim qaysi fanlardan dars beradi.
 *
 * O'quvchidagi "Sinflar" modalining ko'zgusi, faqat teskari tomonga: sinf
 * o'quvchiga, fan esa xodimga biriktiriladi.
 *
 * Bu ro'yxat dars jadvalini rejalashtirishning KIRIMI — fan biriktirilgan
 * zahoti xodim "Dars jadvalini rejalashtirish → Asosiy" jadvalida satr
 * sifatida paydo bo'ladi. Shuning uchun bo'sh ro'yxat ham to'g'ri holat:
 * dars bermaydigan xodimga fan kerak emas.
 */
const EditStaffSubjectsModal = () => (
  <ResponsiveModal name="editStaffSubjects" title="Fanlarni tahrirlash">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, ...user }) => {
  const { data: subjects = [] } = useSubjects();
  const { mutate: updateUser } = useUpdateUser();

  const [selected, setSelected] = useState(
    user.subjects?.map((subject) => subject.id) ?? [],
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    updateUser(
      { id: user.id, data: { subjects: selected } },
      {
        onSuccess: () => {
          close();
          toast.success("Fanlar saqlandi");
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <MultiSelect
        label="Fanlar"
        value={selected}
        onChange={setSelected}
        placeholder="Fanlarni tanlang..."
        options={subjects.map((subject) => ({
          label: subject.name,
          value: subject.id,
        }))}
      />

      <p className="text-sm text-gray-500">
        Belgilangan fanlar dars jadvalini rejalashtirishda ishlatiladi: har bir
        fan uchun haftalik soat va sinflar alohida belgilanadi.
      </p>

      <div className="flex flex-col-reverse gap-3.5 w-full mt-5 xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          onClick={close}
          variant="secondary"
          className="w-full xs:w-32"
        >
          Bekor qilish
        </Button>

        <Button autoFocus className="w-full xs:w-32" disabled={isLoading}>
          Saqlash
          {isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

export default EditStaffSubjectsModal;
