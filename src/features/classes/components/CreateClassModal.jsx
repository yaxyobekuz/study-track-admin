// Toast
import { toast } from "sonner";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import { useCreateClass } from "@/features/classes/queries/classes.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

const CreateClassModal = () => (
  <ResponsiveModal name="createClass" title="Yangi sinf">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading }) => {
  const { mutate: createClass } = useCreateClass();

  const { name, setField } = useObjectState({
    name: "",
  });

  const handleCreateClass = (e) => {
    e.preventDefault();
    setIsLoading(true);

    createClass(
      { name },
      {
        onSuccess: () => {
          close();
          toast.success("Sinf yaratildi");
        },
        onError: (err) => {
          toast.error(err.response?.data?.message || "Xatolik yuz berdi");
        },
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <form onSubmit={handleCreateClass} className="space-y-3.5">
      <InputField
        required
        name="name"
        value={name}
        maxLength={32}
        label="Sinf nomi"
        placeholder="1-A, 3-C, ..."
        onChange={(e) => setField("name", e.target.value)}
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

        <Button autoFocus className="w-full xs:w-32" disabled={isLoading}>
          Yaratish
          {isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

export default CreateClassModal;
