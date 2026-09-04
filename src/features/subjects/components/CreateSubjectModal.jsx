// Toast
import { toast } from "sonner";

// Components
import InputField from "@/shared/components/ui/input/InputField";
import Button from "@/shared/components/ui/button/Button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import { useCreateSubject } from "@/features/subjects/queries/subjects.mutations";

const CreateSubjectModal = () => (
  <ResponsiveModal name="createSubject" title="Yangi fan">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading }) => {
  const { mutate: createSubject } = useCreateSubject();

  const { name, description, state, setField } = useObjectState({
    name: "",
    description: "",
  });

  const handleCreateSubject = (e) => {
    e.preventDefault();
    setIsLoading(true);

    createSubject(state, {
      onSuccess: () => {
        close();
        toast.success("Fan yaratildi");
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      },
      onSettled: () => setIsLoading(false),
    });
  };

  return (
    <form onSubmit={handleCreateSubject} className="space-y-3.5">
      <InputField
        required
        name="name"
        value={name}
        label="Fan nomi"
        onChange={(e) => setField("name", e.target.value)}
      />

      <InputField
        type="textarea"
        name="description"
        value={description}
        label="Tavsif (ixtiyoriy)"
        onChange={(e) => setField("description", e.target.value)}
      />

      <div className="flex flex-col-reverse gap-3.5 w-full mt-5 xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          className="w-full xs:w-32"
          variant="secondary"
          onClick={close}
        >
          Bekor qilish
        </Button>

        <Button
          autoFocus
          className="w-full xs:w-32"
          variant="default"
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
