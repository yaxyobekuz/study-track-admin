// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Queries, helpers & data
import { useRejectRevision } from "../queries/scheduleSync.mutations";
import { notifySyncError } from "../helpers/scheduleSync.helpers";
import { REJECT_REASON_MAX } from "../data/scheduleSync.data";

/**
 * O'ZGARISHNI RAD ETISH — sheet'dagi holat qo'llanmaydi, amaldagi jadval
 * o'zgarmaydi. Sabab ixtiyoriy, lekin tarixda ko'rinadi: sheet'ni
 * tuzatadigan odam nima noto'g'ri ekanini bilishi kerak.
 */
const RejectRevisionModal = () => (
  <ResponsiveModal
    name="scheduleSyncReject"
    title="O'zgarishni rad etish"
    description="Sheet'dagi bu holat qo'llanmaydi. Amaldagi jadval o'zgarmaydi."
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, revisionId }) => {
  const [reason, setReason] = useState("");
  const { mutate: reject } = useRejectRevision();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!revisionId) return;

    setIsLoading(true);
    reject(
      { id: revisionId, reason: reason.trim() || undefined },
      {
        onSuccess: () => {
          close();
          toast.success("O'zgarish rad etildi");
        },
        onError: (err) => notifySyncError(err),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <InputGroup as="form" onSubmit={handleSubmit}>
      <InputField
        type="textarea"
        name="rejectReason"
        label="Sabab (ixtiyoriy)"
        placeholder="Masalan: 7-B sinfda o'qituvchi noto'g'ri yozilgan"
        value={reason}
        maxLength={REJECT_REASON_MAX}
        inputClassName="min-h-28"
        description={`${reason.length}/${REJECT_REASON_MAX}`}
        onChange={(e) => setReason(e.target.value)}
      />

      <div className="flex flex-col-reverse gap-3.5 w-full xs:flex-row xs:justify-end">
        <Button
          type="button"
          variant="secondary"
          className="w-full xs:w-32"
          onClick={close}
        >
          Bekor qilish
        </Button>

        <Button
          variant="danger"
          className="w-full xs:w-32"
          disabled={isLoading || !revisionId}
        >
          Rad etish{isLoading && "..."}
        </Button>
      </div>
    </InputGroup>
  );
};

export default RejectRevisionModal;
