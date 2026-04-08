import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import Button from "@/shared/components/ui/button/Button";
import Input from "@/shared/components/ui/input/Input";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import { attendanceAPI } from "../api/attendance.api";
import { formatUzDate } from "@/shared/utils/formatDate";

const ReviewExcuseModal = () => (
  <ResponsiveModal name="reviewExcuse" title="Uzrli so'rovni ko'rib chiqish">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, ...excuse }) => {
  const [rejectionReason, setRejectionReason] = useState("");
  const queryClient = useQueryClient();

  const handleReview = (status) => {
    if (status === "rejected" && !rejectionReason.trim()) {
      toast.warning("Rad etish sababini kiriting");
      return;
    }

    setIsLoading(true);
    attendanceAPI
      .reviewExcuse(excuse._id, { status, rejectionReason: rejectionReason || undefined })
      .then(() => {
        close();
        queryClient.invalidateQueries({ queryKey: ["attendance", "excuses"] });
        toast.success(status === "approved" ? "So'rov tasdiqlandi" : "So'rov rad etildi");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-gray-50 p-4 space-y-2 text-sm">
        <p>
          <span className="text-gray-500">Xodim:</span>{" "}
          <span className="font-medium">
            {excuse.user?.firstName} {excuse.user?.lastName}
          </span>
        </p>
        <p>
          <span className="text-gray-500">Sana:</span>{" "}
          <span className="font-medium">{formatUzDate(excuse.date)}</span>
        </p>
        <p>
          <span className="text-gray-500">Sabab:</span>{" "}
          <span>{excuse.reason}</span>
        </p>
      </div>

      <Input
        label="Rad etish sababi (faqat rad etilganda)"
        value={rejectionReason}
        onChange={setRejectionReason}
        placeholder="Sabab kiriting..."
      />

      <div className="flex flex-col-reverse gap-3 xs:flex-row xs:justify-end">
        <Button type="button" variant="neutral" className="w-full xs:w-28" onClick={close}>
          Bekor qilish
        </Button>
        <Button
          type="button"
          variant="danger"
          className="w-full xs:w-28"
          disabled={isLoading}
          onClick={() => handleReview("rejected")}
        >
          Rad etish
        </Button>
        <Button
          type="button"
          variant="primary"
          className="w-full xs:w-28"
          disabled={isLoading}
          onClick={() => handleReview("approved")}
        >
          Tasdiqlash
        </Button>
      </div>
    </div>
  );
};

export default ReviewExcuseModal;
