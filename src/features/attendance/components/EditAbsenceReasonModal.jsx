// Toast
import { toast } from "sonner";

// React
import { useEffect } from "react";

// Tanstack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { absenceReasonAPI } from "../api/absenceReason.api";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import MultiSelect from "@/shared/components/form/multi-select";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import useArrayStore from "@/shared/hooks/useArrayStore";

// Helpers
import { getAllRoles } from "@/shared/helpers/role.helpers";

const EditAbsenceReasonModal = () => (
  <ResponsiveModal name="editAbsenceReason" title="Sababni tahrirlash">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, id, ...data }) => {
  const queryClient = useQueryClient();
  const { getCollectionData } = useArrayStore();
  const roles = getCollectionData("roles") || [];
  const roleOptions = getAllRoles(roles).filter((r) => r.value !== "developer");

  const {
    title,
    description,
    roles: selectedRoles,
    appliesToAll,
    setField,
    setFields,
  } = useObjectState({
    title: "",
    description: "",
    roles: [],
    appliesToAll: false,
  });

  useEffect(() => {
    if (data.title) {
      setFields({
        title: data.title || "",
        description: data.description || "",
        roles: data.roles || [],
        appliesToAll: !!data.appliesToAll,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const updateMutation = useMutation({
    mutationFn: (payload) => absenceReasonAPI.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["absenceReasons"] });
      close();
      toast.success("Sabab yangilandi");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Sarlavha majburiy");
    updateMutation.mutate({
      title,
      description,
      appliesToAll,
      roles: appliesToAll ? [] : selectedRoles,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <InputField
        required
        label="Sarlavha"
        value={title}
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

      <Button disabled={updateMutation.isPending}>
        Saqlash{updateMutation.isPending && "..."}
      </Button>
    </form>
  );
};

export default EditAbsenceReasonModal;
