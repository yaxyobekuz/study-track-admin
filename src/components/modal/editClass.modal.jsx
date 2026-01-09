// Toast
import { toast } from "sonner";

// API
import { classesAPI } from "@/api/client";

// Components
import Input from "../form/input";
import Select from "../form/select";
import Button from "../form/button";
import ResponsiveModal from "../ResponsiveModal";

// Hooks
import useArrayStore from "@/hooks/useArrayStore.hook";
import useObjectState from "@/hooks/useObjectState.hook";

const EditClassModal = () => (
  <ResponsiveModal name="editClass" title="Sinfni tahrirlash">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, ...classData }) => {
  const { invalidateCache } = useArrayStore("classes");

  const { grade, section, state, setField } = useObjectState({
    section: classData.section,
    grade: String(classData.grade),
  });

  const handleEditClass = (e) => {
    e.preventDefault();
    setIsLoading(true);

    classesAPI
      .update(classData._id, {
        ...state,
        name: `${state.grade}-${state.section}`,
      })
      .then(() => {
        close();
        invalidateCache();
        toast.success("Sinf tahrirlandi");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <form onSubmit={handleEditClass} className="space-y-3.5">
      <div className="grid grid-cols-2 gap-5">
        <Select
          required
          value={grade}
          label="Daraja"
          onChange={(v) => setField("grade", v)}
          options={Array.from({ length: 11 }, (_, i) => ({
            label: `${i + 1}-sinf`,
            value: String(i + 1),
          }))}
        />

        <Input
          required
          label="Nom"
          name="section"
          maxLength={32}
          value={section}
          placeholder="A, B, C..."
          onChange={(v) => setField("section", v)}
        />
      </div>

      <div className="flex flex-col-reverse gap-3.5 w-full mt-5 xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          className="w-full xs:w-32"
          variant="neutral"
          onClick={close}
        >
          Bekor qilish
        </Button>

        <Button
          autoFocus
          className="w-full xs:w-32"
          variant="primary"
          disabled={isLoading}
        >
          Yangilash
          {isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

export default EditClassModal;
