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
import { useEditReductionPackage } from "../queries/penalties.mutations";

const EditReductionPackageModal = () => (
  <ResponsiveModal name="editReductionPackage" title="Paketni tahrirlash">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, id, ...data }) => {
  const { mutate: editPackage } = useEditReductionPackage();

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
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    editPackage(
      {
        id,
        data: {
          title,
          points: Number(points),
          coinCost: Number(coinCost),
          order: Number(order),
          isActive,
        },
      },
      {
        onSuccess: () => {
          close();
          toast.success("Paket yangilandi");
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

      <Button disabled={isLoading}>Saqlash{isLoading && "..."}</Button>
    </form>
  );
};

export default EditReductionPackageModal;
