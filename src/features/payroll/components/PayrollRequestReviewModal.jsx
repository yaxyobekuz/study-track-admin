// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// Icons
import { Paperclip, Check, X } from "lucide-react";

// Components
import Can from "@/shared/components/guards/Can";
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Utils
import { formatDateTimeUz } from "@/shared/utils/date.utils";

// Data & mutations
import { REQUEST_KIND_LABELS } from "../data/payroll.data";
import { useReviewPayrollRequest } from "../queries/payroll.mutations";

/**
 * Zayavkani ko'rib chiqish oynasi.
 *
 * `openModal("reviewPayrollRequest", { request })`
 *
 * Tasdiqlash → serverda oylikka ta'sir qiladi (toifa biriktirish yoki ustama
 * yaratish). Rad etish → sabab (ixtiyoriy) bilan yopiladi.
 */
const PayrollRequestReviewModal = () => (
  <ResponsiveModal name="reviewPayrollRequest" title="Zayavkani ko'rib chiqish">
    <Content />
  </ResponsiveModal>
);

const Row = ({ label, children }) => (
  <div className="flex items-start justify-between gap-3 border-b border-gray-50 py-2 text-sm last:border-0">
    <span className="shrink-0 text-gray-500">{label}</span>
    <span className="text-right font-medium text-gray-900">{children}</span>
  </div>
);

const Content = ({ close, isLoading, setIsLoading, request }) => {
  const { mutate: review } = useReviewPayrollRequest();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  if (!request) return null;

  const isBonus = request.kind === "bonus";

  const run = (status, rejectionReason) => {
    setIsLoading(true);
    review(
      { id: request.id, status, rejectionReason },
      {
        onSuccess: () => {
          close();
          toast.success(status === "approved" ? "Zayavka tasdiqlandi" : "Zayavka rad etildi");
        },
        onError: (err) => toast.error(err.response?.data?.message || "Xatolik"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  const handleReject = () => {
    if (!rejecting) return setRejecting(true);
    run("rejected", reason.trim() || undefined);
  };

  return (
    <div className="space-y-4">
      {/* So'rovchi + tur */}
      <div className="rounded-xl bg-gray-50 p-3">
        <p className="font-semibold text-gray-900">{request.staffName}</p>
        <p className="text-sm text-gray-500">
          {REQUEST_KIND_LABELS[request.kind] || request.kind} ·{" "}
          {formatDateTimeUz(request.createdAt)}
        </p>
      </div>

      {/* Tafsilotlar */}
      <div className="rounded-xl border border-gray-100 px-3">
        {isBonus ? (
          <>
            <Row label="Ustama nomi">{request.bonusLabel || "—"}</Row>
            <Row label="Miqdori">
              {request.bonusValue}
              {request.bonusType === "percent" ? "%" : " so'm"}
            </Row>
            <Row label="Amal qilish">
              {request.bonusStartMonthLabel || "—"}
              {request.bonusEndMonthLabel ? ` — ${request.bonusEndMonthLabel}` : " dan"}
            </Row>
          </>
        ) : (
          <Row label="So'ralgan toifa">{request.requestedCategoryName || "—"}</Row>
        )}
        {request.reason && <Row label="Izoh">{request.reason}</Row>}
      </div>

      {/* Biriktirilgan hujjatlar */}
      {request.attachments?.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-gray-500">Biriktirilgan hujjatlar</p>
          <div className="flex flex-wrap gap-2">
            {request.attachments.map((a, i) => (
              <a
                key={i}
                href={a.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-1.5 text-sm text-blue-600 hover:bg-gray-100"
              >
                <Paperclip className="size-3.5" />
                {a.originalName || `Hujjat ${i + 1}`}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Rad etish sababi (ixtiyoriy) */}
      {rejecting && (
        <InputField
          autoFocus
          name="reason"
          label="Rad etish sababi (ixtiyoriy)"
          value={reason}
          placeholder="Nima uchun rad etilyapti?"
          onChange={(e) => setReason(e.target.value)}
        />
      )}

      {/* Amallar — faqat pending zayavka uchun va faqat review huquqi bilan */}
      {request.status === "pending" ? (
        <Can
          do="payrollRequests.review"
          fallback={
            <p className="rounded-xl bg-gray-50 p-3 text-center text-sm text-gray-500">
              Ko'rib chiqish huquqi yo'q — faqat ko'rish.
            </p>
          }
        >
          <div className="flex flex-col-reverse gap-3 xs:flex-row xs:justify-end">
            <Button
              variant={rejecting ? "danger" : "secondary"}
              className="w-full xs:w-auto"
              disabled={isLoading}
              onClick={handleReject}
            >
              <X className="size-4" /> {rejecting ? "Rad etishni tasdiqlash" : "Rad etish"}
            </Button>
            {!rejecting && (
              <Button className="w-full xs:w-auto" disabled={isLoading} onClick={() => run("approved")}>
                <Check className="size-4" /> Tasdiqlash
              </Button>
            )}
          </div>
        </Can>
      ) : (
        <div className="rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
          {request.status === "approved" ? "Tasdiqlangan" : "Rad etilgan"}
          {request.reviewerName ? ` · ${request.reviewerName}` : ""}
          {request.reviewedAtLabel ? ` · ${request.reviewedAtLabel}` : ""}
          {request.status === "rejected" && request.rejectionReason && (
            <p className="mt-1 text-red-600">Sabab: {request.rejectionReason}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PayrollRequestReviewModal;
