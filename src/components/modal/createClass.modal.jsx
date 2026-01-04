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

const CreateClassModal = () => (
  <ResponsiveModal name="createClass" title="Yangi sinf">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading }) => {
  const { invalidateCache } = useArrayStore("classes");

  const { grade, section, state, setField } = useObjectState({
    grade: "1",
    section: "",
  });

  const handleCreateClass = (e) => {
    e.preventDefault();

    setIsLoading(true);
    const data = { ...state, name: `${grade}-${section.toUpperCase()}` };

    classesAPI
      .create(data)
      .then(() => {
        close();
        invalidateCache();
        toast.success("Sinf yaratildi");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <form onSubmit={handleCreateClass} className="space-y-5">
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
          maxLength={1}
          label="Bo'lim"
          name="section"
          value={section}
          placeholder="A, B, C..."
          className="[&>input]:uppercase"
          onChange={(v) => setField("section", v)}
        />
      </div>

      <div className="flex justify-end gap-5 w-full">
        <Button
          type="button"
          className="w-32"
          variant="neutral"
          onClick={close}
        >
          Bekor qilish
        </Button>

        <Button
          autoFocus
          className="w-32"
          variant="primary"
          disabled={isLoading}
        >
          Yaratish
          {isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

export default CreateClassModal;
