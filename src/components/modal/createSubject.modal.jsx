// Toast
import { toast } from "sonner";

// API
import { subjectsAPI } from "@/api/client";

// Components
import Input from "../form/input";
import Button from "../form/button";
import ResponsiveModal from "../ResponsiveModal";

// Hooks
import useArrayStore from "@/hooks/useArrayStore.hook";
import useObjectState from "@/hooks/useObjectState.hook";

const CreateSubjectModal = () => (
  <ResponsiveModal name="createSubject" title="Yangi fan">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading }) => {
  const { invalidateCache } = useArrayStore("subjects");

  const { name, description, state, setField } = useObjectState({
    name: "",
    description: "",
  });

  const handleCreateSubject = (e) => {
    e.preventDefault();
    setIsLoading(true);

    subjectsAPI
      .create(state)
      .then(() => {
        close();
        invalidateCache();
        toast.success("Fan yaratildi");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <form onSubmit={handleCreateSubject} className="space-y-5">
      <Input
        required
        name="name"
        value={name}
        label="Fan nomi"
        onChange={(v) => setField("name", v)}
      />

      <Input
        type="textarea"
        name="description"
        value={description}
        label="Tavsif (ixtiyoriy)"
        onChange={(v) => setField("description", v)}
      />

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

export default CreateSubjectModal;
