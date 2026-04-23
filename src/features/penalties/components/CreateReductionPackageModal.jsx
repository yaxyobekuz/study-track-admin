// Toast
import { toast } from "sonner";

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

const CreateReductionPackageModal = () => (
  <ResponsiveModal name="createReductionPackage" title="Yangi kamaytirish paketi">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close }) => {
  const queryClient = useQueryClient();

  const { title, points, coinCost, order, setField } = useObjectState({
    title: "",
    points: "",
    coinCost: "",
    order: "0",
  });

  const createMutation = useMutation({
    mutationFn: (data) => penaltiesAPI.createReductionPackage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["penalties", "reduction-packages"] });
      close();
      toast.success("Paket yaratildi");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      title,
      points: Number(points),
      coinCost: Number(coinCost),
      order: Number(order),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <InputField
        required
        label="Sarlavha"
        placeholder="Masalan: Kichik paket"
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
        description="Kichik raqam yuqorida ko'rinadi"
        value={order}
        onChange={(e) => setField("order", e.target.value)}
      />

      <Button disabled={createMutation.isPending}>
        Yaratish{createMutation.isPending && "..."}
      </Button>
    </form>
  );
};

export default CreateReductionPackageModal;
