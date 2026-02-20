// Toast
import { toast } from "sonner";

// API
import { classesAPI } from "@/shared/api/classes.api";

// Components
import Input from "@/shared/components/form/input";
import Button from "@/shared/components/form/button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Hooks
import useArrayStore from "@/shared/hooks/useArrayStore";
import useObjectState from "@/shared/hooks/useObjectState";

const EditClassModal = () => (
  <ResponsiveModal name="editClass" title="Sinfni tahrirlash">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, ...classData }) => {
  const { invalidateCache } = useArrayStore("classes");

  const { name, setField } = useObjectState({
    name: classData.name || "",
  });

  const handleEditClass = (e) => {
    e.preventDefault();
    setIsLoading(true);

    classesAPI
      .update(classData._id, { name })
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
      <Input
        required
        label="Sinf nomi"
        name="name"
        maxLength={32}
        value={name}
        placeholder="Masalan: 5-A, 9-B..."
        onChange={(v) => setField("name", v)}
      />

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
