// Sonner
import { toast } from "sonner";

// React
import { useState } from "react";

// Hooks
import useModal from "@/shared/hooks/useModal";

// API
import { marketAPI } from "@/features/market/api/market.api";

// Tanstack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

const AddDeliveryImageModal = () => {
  const { data } = useModal("addDeliveryImage");

  return (
    <ResponsiveModal
      name="addDeliveryImage"
      title="Yetkazib berish rasmi"
      description="Buyurtmaga yetkazib berish rasmini qo'shing yoki yangilang"
    >
      <Content key={data?.sessionId || data?.orderId || "delivery-image-modal"} />
    </ResponsiveModal>
  );
};

const Content = ({ close, orderId }) => {
  const queryClient = useQueryClient();
  const [image, setImage] = useState(null);

  const addImageMutation = useMutation({
    mutationFn: () => {
      const formData = new FormData();
      formData.append("deliveryImage", image);
      return marketAPI.addDeliveryImage(orderId, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["market", "admin", "orders"],
      });
      toast.success("Rasm muvaffaqiyatli qo'shildi");
      close();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!image) {
      toast.error("Rasm tanlang");
      return;
    }

    addImageMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField
        required
        type="file"
        name="deliveryImage"
        label="Rasm"
        accept="image/*"
        onChange={(e) => setImage(e.target.files?.[0] || null)}
      />

      <div className="flex flex-col-reverse gap-3.5 w-full xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          onClick={close}
          variant="secondary"
          className="w-full xs:w-32"
        >
          Bekor qilish
        </Button>

        <Button
          className="w-full xs:w-32"
          disabled={addImageMutation.isPending || !image}
        >
          Saqlash
        </Button>
      </div>
    </form>
  );
};

export default AddDeliveryImageModal;
