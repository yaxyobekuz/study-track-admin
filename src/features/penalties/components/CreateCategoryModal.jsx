// Toast
import { toast } from "sonner";

// Tanstack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { penaltiesAPI } from "@/features/penalties/api/penalties.api";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import SelectField from "@/shared/components/ui/select/SelectField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import useArrayStore from "@/shared/hooks/useArrayStore";

// Helpers
import { getAllRoles } from "@/shared/helpers/role.helpers";

const CreateCategoryModal = () => (
  <ResponsiveModal name="createPenaltyCategory" title="Yangi kategoriya">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close }) => {
  const queryClient = useQueryClient();
  const { getCollectionData } = useArrayStore();
  const roles = getCollectionData("roles") || [];

  // Owner va developer'dan tashqari barcha rollar
  const roleOptions = getAllRoles(roles).filter((r) => r.value !== "developer");

  const { title, description, points, targetRole, setField } = useObjectState({
    title: "",
    description: "",
    points: "",
    targetRole: roleOptions[0]?.value || "",
  });

  const createMutation = useMutation({
    mutationFn: (data) => penaltiesAPI.createPenaltyCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["penalties", "categories"] });
      close();
      toast.success("Kategoriya yaratildi");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!targetRole) return toast.error("Rol tanlanmagan");
    createMutation.mutate({
      title,
      description,
      points: Number(points),
      targetRole,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <SelectField
        required
        label="Rol"
        value={targetRole}
        options={roleOptions}
        onChange={(v) => setField("targetRole", v)}
      />

      <InputField
        required
        label="Sarlavha"
        value={title}
        onChange={(e) => setField("title", e.target.value)}
      />

      <InputField
        label="Izoh"
        type="textarea"
        value={description}
        onChange={(e) => setField("description", e.target.value)}
      />

      <InputField
        min={1}
        required
        label="Ball"
        type="number"
        value={points}
        onChange={(e) => setField("points", e.target.value)}
      />

      <Button disabled={createMutation.isPending}>
        Yaratish{createMutation.isPending && "..."}
      </Button>
    </form>
  );
};

export default CreateCategoryModal;
