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

const EditReductionPackageModal = () => (
  <ResponsiveModal name="editReductionPackage" title="Paketni tahrirlash">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, _id, ...data }) => {
  const queryClient = useQueryClient();

  const { title, points, coinCost, order, isActive, setField, setFields } = useObjectState({
    title: "",
    points: "",
    coinCost: "",
    order: "0",
    isActive: true,
  });

  useEffect(() => {
    if (data.title !== undefined) {
      setFields({
        title: data.title || "",
        points: data.points ?? "",
        coinCost: data.coinCost ?? "",
        order: data.order ?? 0,
        isActive: data.isActive ?? true,
      });
    }
  }, [_id]);

  const updateMutation = useMutation({
    mutationFn: (payload) => penaltiesAPI.updateReductionPackage(_id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["penalties", "reduction-packages"] });
      close();
      toast.success("Paket yangilandi");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate({
      title,
      points: Number(points),
      coinCost: Number(coinCost),
      order: Number(order),
      isActive,
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
        required
        min={1}
        type="number"
        label="Kamaytiriladi (ball)"
        value={points}
        onChange={(e) => setField("points", e.target.value)}
      />

      <InputField
        required
        min={1}
        type="number"
        label="Narxi (tanga)"
        value={coinCost}
        onChange={(e) => setField("coinCost", e.target.value)}
      />

      <InputField
        min={0}
        type="number"
        label="Tartib raqami"
        value={order}
        onChange={(e) => setField("order", e.target.value)}
      />

      <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
        <input
          type="checkbox"
          className="rounded"
          checked={isActive}
          onChange={(e) => setField("isActive", e.target.checked)}
        />
        <span>Faol (o'quvchilarga ko'rinadi)</span>
      </label>

      <Button disabled={updateMutation.isPending}>
        Saqlash{updateMutation.isPending && "..."}
      </Button>
    </form>
  );
};

export default EditReductionPackageModal;
