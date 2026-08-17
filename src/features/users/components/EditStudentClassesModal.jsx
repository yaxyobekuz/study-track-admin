// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// Components
import Button from "@/shared/components/ui/button/Button";
import MultiSelect from "@/shared/components/form/multi-select";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Hooks
import { useClasses } from "@/features/classes/queries/classes.queries";
import { useUpdateUser } from "@/features/users/queries/users.mutations";

/**
 * O'quvchining sinflari.
 *
 * Arxivlangan o'quvchiga sinf biriktirib bo'lmaydi — server rad etadi,
 * shuning uchun forma ham ogohlantirish ko'rsatadi.
 */
const EditStudentClassesModal = () => (
  <ResponsiveModal name="editStudentClasses" title="Sinflarni tahrirlash">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, ...user }) => {
  const { data: classes = [] } = useClasses();
  const { mutate: updateUser } = useUpdateUser();

  const [selected, setSelected] = useState(
    user.classes?.map((cls) => cls.id) ?? [],
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    if (selected.length === 0) {
      return toast.warning("Kamida bitta sinf tanlanishi kerak");
    }

    setIsLoading(true);

    updateUser(
      { id: user.id, data: { classes: selected } },
      {
        onSuccess: () => {
          close();
          toast.success("Sinflar saqlandi");
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {user.isArchived && (
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          O'quvchi arxivlangan. Sinf biriktirish uchun avval uni arxivdan
          qaytaring.
        </p>
      )}

      <MultiSelect
        required
        label="Sinflar"
        value={selected}
        onChange={setSelected}
        placeholder="Sinflarni tanlang..."
        options={classes.map((cls) => ({ label: cls.name, value: cls.id }))}
      />

      <div className="flex flex-col-reverse gap-3.5 w-full mt-5 xs:m-0 xs:flex-row xs:justify-end">
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
          className="w-full xs:w-32"
          disabled={isLoading || user.isArchived}
        >
          Saqlash
          {isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

export default EditStudentClassesModal;
