// Toast
import { toast } from "sonner";

// API
import { rolesAPI } from "@/features/roles/api/roles.api";

// Components
import Input from "@/shared/components/form/input";
import Button from "@/shared/components/form/button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Hooks
import useArrayStore from "@/shared/hooks/useArrayStore";
import useObjectState from "@/shared/hooks/useObjectState";

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
    <form onSubmit={handleCreateRole} className="space-y-3.5">
      <Input
        required
        name="name"
        value={name}
        label="Rol nomi"
        placeholder="Masalan: Mentor"
        onChange={(v) => setField("name", v)}
      />

      <Input
        required
        name="value"
        value={value}
        label="Rol kaliti"
        placeholder="Masalan: mentor"
        onChange={(v) => setField("value", v?.toLowerCase().trim())}
      />
      <p className="text-xs text-gray-500 -mt-2">
        Faqat kichik lotin harflari, raqamlar va pastki chiziq
      </p>

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
          Yaratish
          {isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

export default CreateRoleModal;
