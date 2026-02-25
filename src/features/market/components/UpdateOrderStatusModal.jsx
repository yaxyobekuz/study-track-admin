import { toast } from "sonner";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import Input from "@/shared/components/form/input";
import Select from "@/shared/components/form/select";
import Button from "@/shared/components/form/button";
import useModal from "@/shared/hooks/useModal";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import { marketAPI } from "@/shared/api/market.api";
import { marketOrderUpdateStatusOptions } from "@/features/market/data/market.data";

/**
 * Modal for updating market order status by owner.
 * @returns {JSX.Element} Update order status modal.
 */
const UpdateOrderStatusModal = () => <ModalContainer />;

const ModalContainer = () => {
  const { data } = useModal("updateMarketOrderStatus");

  return (
    <ResponsiveModal
      name="updateMarketOrderStatus"
      title="Buyurtma holatini o'zgartirish"
      description="Statusni tanlab buyurtmani yakunlang"
    >
      <Content key={data?.sessionId || data?.orderId || "order-status-modal"} />
    </ResponsiveModal>
  );
};

const Content = ({ close, orderId, orderStatus }) => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("approved");
  const [rejectReason, setRejectReason] = useState("");

  const updateStatusMutation = useMutation({
    mutationFn: () =>
      marketAPI.updateOrderStatus(orderId, {
        status,
        ...(status === "rejected" ? { rejectReason: rejectReason.trim() } : {}),
      }),
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Status"
        value={status}
        options={marketOrderUpdateStatusOptions}
        onChange={setStatus}
      />

      {status === "rejected" && (
        <Input
          required
          type="textarea"
          label="Sabab"
          value={rejectReason}
          onChange={setRejectReason}
          placeholder="Rad etish sababini yozing"
        />
      )}

      <div className="flex flex-col-reverse gap-3.5 w-full xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          variant="neutral"
          className="w-full xs:w-32"
          onClick={close}
        >
          Bekor qilish
        </Button>

        <Button
          className="w-full xs:w-32"
          disabled={updateStatusMutation.isPending}
          variant={status === "approved" ? "primary" : "danger"}
        >
          Saqlash
        </Button>
      </div>
    </form>
  );
};

export default UpdateOrderStatusModal;
