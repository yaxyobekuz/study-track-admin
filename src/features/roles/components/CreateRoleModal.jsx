// Toast
import { toast } from "sonner";

// API
import { rolesAPI } from "@/features/roles/api/roles.api";

// Hooks
import useArrayStore from "@/shared/hooks/useArrayStore";
import useObjectState from "@/shared/hooks/useObjectState";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

const CreateRoleModal = () => (
  <ResponsiveModal name="createRole" title="Yangi rol">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading }) => {
  const { invalidateCache } = useArrayStore("roles");

  const { name, value, state, setField } = useObjectState({
    name: "",
    value: "",
  });

  const handleCreateRole = (e) => {
    e.preventDefault();
    setIsLoading(true);

    rolesAPI
      .create(state)
      .then(() => {
        close();
        invalidateCache();
        toast.success("Rol yaratildi");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <InputGroup onSubmit={handleCreateRole} as="form">
      <InputField
        required
        name="name"
        value={name}
        label="Rol nomi"
        placeholder="Masalan: Mentor"
        onChange={(e) => setField("name", e.target.value)}
      />

      <InputField
        required
        name="value"
        value={value}
        label="Rol kaliti"
        placeholder="Masalan: mentor"
        description="Faqat kichik lotin harflari, raqamlar va pastki chiziq"
        onChange={(e) =>
          setField("value", e.target.value?.toLowerCase().trim())
        }
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

        <Button autoFocus className="w-full xs:w-32" disabled={isLoading}>
          Yaratish
          {isLoading && "..."}
        </Button>
      </div>
    </InputGroup>
  );
};

export default CreateRoleModal;
