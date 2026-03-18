// Toast
import { toast } from "sonner";

// React
import { useEffect } from "react";

// Tanstack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { penaltiesAPI } from "@/features/penalties/api/penalties.api";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

const EditCategoryModal = () => (
  <ResponsiveModal name="editPenaltyCategory" title="Kategoriyani tahrirlash">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, _id, ...data }) => {
  const queryClient = useQueryClient();
  const { title, description, points, setField, setFields } = useObjectState({
    title: "",
    description: "",
    points: "",
  });

  useEffect(() => {
    if (data.title) {
      setFields({
        title: data.title || "",
        description: data.description || "",
        points: data.points || "",
      });
    }
  }, [_id]);

  const updateMutation = useMutation({
    mutationFn: (payload) => penaltiesAPI.updateCategory(_id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["penalties", "categories"] });
      close();
      toast.success("Kategoriya yangilandi");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate({ title, description, points: Number(points) });
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

      <Button disabled={updateMutation.isPending}>
        Saqlash{updateMutation.isPending && "..."}
      </Button>
    </form>
  );
};

export default EditCategoryModal;
