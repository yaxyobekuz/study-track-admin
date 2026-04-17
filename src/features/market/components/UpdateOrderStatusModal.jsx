// Sonner
import { toast } from "sonner";

// React
import { useRef, useState } from "react";

// Hooks
import useModal from "@/shared/hooks/useModal";

// API
import { marketAPI } from "@/features/market/api/market.api";

// Tanstack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import SelectField from "@/shared/components/ui/select/SelectField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Data
import {
  marketOrderUpdateStatusOptions,
  marketOrderDeliverStatusOptions,
} from "@/features/market/data/market.data";

const UpdateOrderStatusModal = () => {
  const { data } = useModal("updateMarketOrderStatus");

  return (
    <ResponsiveModal
      name="updateMarketOrderStatus"
      title="Buyurtma holatini o'zgartirish"
      description="Holatni tanlab buyurtmani yakunlang"
    >
      <Content key={data?.sessionId || data?.orderId || "order-status-modal"} />
    </ResponsiveModal>
  );
};

const Content = ({ close, orderId, orderStatus }) => {
  const queryClient = useQueryClient();
  const fileRef = useRef(null);

  const isDelivering = orderStatus === "delivering";

  const [status, setStatus] = useState(
    isDelivering ? "approved" : "delivering",
  );
  const [rejectReason, setRejectReason] = useState("");
  const [deliveryImage, setDeliveryImage] = useState(null);

  const updateStatusMutation = useMutation({
    mutationFn: () => {
      const formData = new FormData();
      formData.append("status", status);

      if (status === "rejected") {
        formData.append("rejectReason", rejectReason.trim());
      }

      if (status === "approved" && deliveryImage) {
        formData.append("deliveryImage", deliveryImage);
      }

      return marketAPI.updateOrderStatus(orderId, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["market", "admin", "orders"],
      });
      toast.success("Buyurtma holati yangilandi");
      close();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();

    if (status === "rejected" && rejectReason.trim().length < 3) {
      toast.error("Rad etish sababi majburiy");
      return;
    }

    updateStatusMutation.mutate();
  };

  const statusOptions = isDelivering
    ? marketOrderDeliverStatusOptions
    : marketOrderUpdateStatusOptions;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SelectField
        required
        label="Holat"
        value={status}
        onChange={setStatus}
        triggerClassName="w-full"
        options={statusOptions}
      />

      {status === "rejected" && (
        <InputField
          required
          label="Sabab"
          name="reason"
          type="textarea"
          value={rejectReason}
          placeholder="Rad etish sababini yozing"
          onChange={(e) => setRejectReason(e.target.value)}
        />
      )}

      {status === "approved" && (
        <InputField
          type="file"
          name="deliveryImage"
          label="Yetkazib berish rasmi"
          accept="image/*"
          description="Ixtiyoriy: yetkazib berish rasmini yuklang"
          ref={fileRef}
          onChange={(e) => setDeliveryImage(e.target.files?.[0] || null)}
        />
      )}

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
          disabled={updateStatusMutation.isPending}
          variant={status === "rejected" ? "danger" : "default"}
        >
          Saqlash
        </Button>
      </div>
    </form>
  );
};

export default UpdateOrderStatusModal;
