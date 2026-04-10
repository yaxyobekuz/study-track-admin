import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import Button from "@/shared/components/ui/button/Button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import SelectField from "@/shared/components/ui/select/SelectField";
import { attendanceAPI } from "../api/attendance.api";
import { formatUzDate } from "@/shared/utils/formatDate";
import InputField from "@/shared/components/ui/input/InputField";
import { REVIEW_ACTION_OPTIONS } from "../data/attendance.data";
import useObjectState from "@/shared/hooks/useObjectState";

const ReviewExcuseModal = () => (
  <ResponsiveModal name="reviewExcuse" title="Uzrli so'rovni ko'rib chiqish">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, ...excuse }) => {
  const { state, setField } = useObjectState({
    action: "approved",
    rejectionReason: "",
  });
  const queryClient = useQueryClient();

  const handleSubmit = () => {
    if (state.action === "rejected" && !state.rejectionReason.trim()) {
      toast.warning("Rad etish sababini kiriting");
      return;
    }

    setIsLoading(true);
    attendanceAPI
      .reviewExcuse(excuse._id, {
        status: state.action,
        rejectionReason:
          state.action === "rejected" ? state.rejectionReason : undefined,
      })
      .then(() => {
        close();
        queryClient.invalidateQueries({ queryKey: ["attendance", "excuses"] });
        toast.success(
          state.action === "approved"
            ? "So'rov tasdiqlandi"
            : "So'rov rad etildi",
        );
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="space-y-4">
      <div className="text-sm space-y-2">
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

      <SelectField
        required
        label="Holat"
        value={state.action}
        options={REVIEW_ACTION_OPTIONS}
        onChange={(val) => setField("action", val)}
      />

      {state.action === "rejected" && (
        <InputField
          required
          type="textarea"
          value={state.rejectionReason}
          label="Rad etish sababi"
          placeholder="Sabab kiriting..."
          onChange={(e) => setField("rejectionReason", e.target.value)}
        />
      )}

      <div className="flex flex-col-reverse gap-4 xs:flex-row xs:justify-end">
        <Button
          type="button"
          onClick={close}
          variant="secondary"
          className="w-full xs:w-28"
        >
          Bekor qilish
        </Button>

        <Button
          type="button"
          disabled={isLoading}
          onClick={handleSubmit}
          className="w-full xs:w-28"
        >
          Yuborish
        </Button>
      </div>
    </div>
  );
};

export default ReviewExcuseModal;
