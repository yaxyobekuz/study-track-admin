// Toast
import { toast } from "sonner";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import MultiSelect from "@/shared/components/form/multi-select";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import { useRoles } from "@/features/roles/queries/roles.queries";
import { useCreateAbsenceReason } from "../queries/attendance.mutations";

// Helpers
import { getAllRoles } from "@/shared/helpers/role.helpers";

const CreateAbsenceReasonModal = () => (
  <ResponsiveModal name="createAbsenceReason" title="Yangi sabab">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading }) => {
  const { data: roles = [] } = useRoles();
  const roleOptions = getAllRoles(roles).filter((r) => r.value !== "developer");

  const {
    title,
    description,
    roles: selectedRoles,
    appliesToAll,
    setField,
  } = useObjectState({
    title: "",
    description: "",
    roles: [],
    appliesToAll: false,
  });

  const { mutate: createReason } = useCreateAbsenceReason();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Sarlavha majburiy");
    setIsLoading(true);
    createReason(
      {
        title,
        description,
        appliesToAll,
        roles: appliesToAll ? [] : selectedRoles,
      },
      {
        onSuccess: () => {
          close();
          toast.success("Sabab yaratildi");
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <InputField
        required
        label="Sarlavha"
        value={title}
        placeholder="Masalan: Kasallik"
        onChange={(e) => setField("title", e.target.value)}
      />

      <InputField
        label="Qo'shimcha izoh (ixtiyoriy)"
        type="textarea"
        value={description}
        onChange={(e) => setField("description", e.target.value)}
      />

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={appliesToAll}
          onChange={(e) => setField("appliesToAll", e.target.checked)}
          className="size-4 rounded border-gray-300 accent-primary"
        />
        Barcha rollarga tegishli
      </label>

      {!appliesToAll && (
        <MultiSelect
          label="Rollar"
          value={selectedRoles}
          options={roleOptions}
          onChange={(v) => setField("roles", v)}
          placeholder="Rollarni tanlang..."
        />
      )}

      <Button disabled={isLoading}>Yaratish{isLoading && "..."}</Button>
    </form>
  );
};

export default CreateAbsenceReasonModal;
