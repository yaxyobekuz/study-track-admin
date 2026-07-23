// Toast
import { toast } from "sonner";

// React
import { useEffect } from "react";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import { useEditPenaltyCategory } from "../queries/penalties.mutations";

const EditCategoryModal = () => (
  <ResponsiveModal name="editPenaltyCategory" title="Kategoriyani tahrirlash">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, id, ...data }) => {
  const { mutate: editCategory } = useEditPenaltyCategory();
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
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    editCategory(
      { id, data: { title, description, points: Number(points) } },
      {
        onSuccess: () => {
          close();
          toast.success("Kategoriya yangilandi");
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

      <Button disabled={isLoading}>Saqlash{isLoading && "..."}</Button>
    </form>
  );
};

export default EditCategoryModal;
