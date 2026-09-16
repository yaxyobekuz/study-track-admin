// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { Check, X } from "lucide-react";

// Components
import Can from "@/shared/components/guards/Can";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import InputField from "@/shared/components/ui/input/InputField";
import Select from "@/shared/components/ui/select/Select";
import Button from "@/shared/components/ui/button/Button";
import EmptyState from "@/shared/components/ui/EmptyState";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Utils
import { formatMoney } from "@/shared/utils/formatMoney";

// Queries & mutations
import { expenseQueries, limitRequestQueries } from "../queries/expenses.queries";
import {
  useSubmitLimitRequest,
  useReviewLimitRequest,
} from "../queries/expenses.mutations";

const STATUS_META = {
  pending: { label: "Kutilmoqda", className: "bg-amber-100 text-amber-700" },
  approved: { label: "Tasdiqlangan", className: "bg-green-100 text-green-700" },
  rejected: { label: "Rad etilgan", className: "bg-red-100 text-red-600" },
};

// ─────────────────────────────────────────────
// SO'ROV YUBORISH (xodim)
// ─────────────────────────────────────────────

/**
 * Limit oshirish so'rovi.
 * `openModal("limitRequest", { categoryId?, categoryName?, currentLimit?,
 *   spent?, suggested?, month? })` — xarajat modalidagi limit xatosidan
 *   kelganda oldindan to'ldiriladi.
 */
export const LimitRequestModal = () => (
  <ResponsiveModal name="limitRequest" title="Limit oshirish so'rovi">
    <SubmitForm />
  </ResponsiveModal>
);

const SubmitForm = ({
  close,
  isLoading,
  setIsLoading,
  categoryId: presetCategoryId,
  categoryName: presetName,
  currentLimit,
  spent,
  suggested,
}) => {
  const { mutate: submit } = useSubmitLimitRequest();
  const { data: categories = [] } = useQuery({
    ...expenseQueries.activeCategories(),
    enabled: !presetCategoryId,
  });

  const { categoryId, requestedLimit, reason, setField } = useObjectState({
    categoryId: presetCategoryId ?? "",
    requestedLimit: suggested ? String(Number(suggested)) : "",
    reason: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!categoryId) return toast.error("Kategoriyani tanlang");
    if (!(Number(requestedLimit) > 0)) return toast.error("Yangi limitni kiriting");

    setIsLoading(true);
    submit(
      { categoryId, requestedLimit: String(requestedLimit), reason },
      {
        onSuccess: () => {
          close();
          toast.success("So'rov yuborildi — admin ko'rib chiqadi");
        },
        onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <InputGroup onSubmit={handleSubmit} as="form">
      {presetCategoryId ? (
        <div className="rounded-xl bg-gray-50 p-3 text-sm">
          <p className="font-medium text-gray-900">{presetName}</p>
          {currentLimit != null && (
            <p className="mt-0.5 text-gray-500">
              Joriy limit: <b>{formatMoney(currentLimit)}</b>
              {spent != null && <> · Ishlatilgan: <b>{formatMoney(spent)}</b></>}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-gray-700">Kategoriya</p>
          <Select
            searchable
            value={categoryId}
            placeholder="Kategoriyani tanlang"
            onChange={(v) => setField("categoryId", v)}
            options={categories.map((c) => ({ label: c.name, value: c.id }))}
          />
        </div>
      )}

      <InputField
        required
        type="number"
        name="requestedLimit"
        label="Yangi limit (so'm)"
        value={requestedLimit}
        placeholder="Masalan: 2000000"
        onChange={(e) => setField("requestedLimit", e.target.value)}
      />

      <InputField
        name="reason"
        label="Sabab"
        value={reason}
        placeholder="Nima uchun limit oshirilishi kerak?"
        onChange={(e) => setField("reason", e.target.value)}
      />

      <div className="mt-4 flex w-full flex-col-reverse gap-3 xs:m-0 xs:flex-row xs:justify-end">
        <Button type="button" variant="secondary" onClick={close} className="w-full xs:w-32">
          Bekor qilish
        </Button>
        <Button className="w-full xs:w-32" disabled={isLoading}>
          Yuborish
          {isLoading && "..."}
        </Button>
      </div>
    </InputGroup>
  );
};

// ─────────────────────────────────────────────
// KO'RIB CHIQISH (admin)
// ─────────────────────────────────────────────

/** Limit so'rovlari ro'yxati — tasdiqlash/rad etish. */
export const LimitRequestsReviewModal = () => (
  <ResponsiveModal name="limitRequestsReview" title="Limit so'rovlari" className="max-w-2xl">
    <ReviewList />
  </ResponsiveModal>
);

const ReviewList = () => {
  const { data } = useQuery(limitRequestQueries.all({ status: "pending", limit: 50 }));
  const { mutate: review } = useReviewLimitRequest();
  const [busyId, setBusyId] = useState(null);

  const rows = data?.data ?? [];

  const act = (id, status) => {
    let rejectionReason;
    if (status === "rejected") {
      rejectionReason = window.prompt("Rad etish sababi (ixtiyoriy):") ?? undefined;
    }
    setBusyId(id);
    review(
      { id, data: { status, rejectionReason } },
      {
        onSuccess: () => toast.success(status === "approved" ? "Tasdiqlandi — limit oshdi" : "Rad etildi"),
        onError: (err) => toast.error(err.response?.data?.message || "Xatolik"),
        onSettled: () => setBusyId(null),
      },
    );
  };

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={Check}
        title="Kutilayotgan so'rov yo'q"
        description="Barcha limit so'rovlari ko'rib chiqilgan."
      />
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.id} className="rounded-xl border border-gray-100 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-gray-900">
              {r.categoryName} · {r.monthLabel}
            </p>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_META[r.status].className}`}>
              {STATUS_META[r.status].label}
            </span>
          </div>

          <div className="mt-1.5 grid grid-cols-3 gap-2 text-sm">
            <div>
              <p className="text-xs text-gray-400">Joriy limit</p>
              <p className="font-medium">{formatMoney(r.currentLimit)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Ishlatilgan</p>
              <p className="font-medium">{formatMoney(r.spentAtRequest)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">So'ralgan</p>
              <p className="font-semibold text-primary">{formatMoney(r.requestedLimit)}</p>
            </div>
          </div>

          {r.reason && <p className="mt-1.5 text-sm text-gray-500">{r.reason}</p>}
          <p className="mt-1 text-xs text-gray-400">
            {r.requesterName} · {r.createdAtLabel}
          </p>

          <Can do="expenses.limitReview">
            <div className="mt-2.5 flex justify-end gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={busyId === r.id}
                onClick={() => act(r.id, "rejected")}
              >
                <X className="size-4" /> Rad etish
              </Button>
              <Button size="sm" disabled={busyId === r.id} onClick={() => act(r.id, "approved")}>
                <Check className="size-4" /> Tasdiqlash
              </Button>
            </div>
          </Can>
        </div>
      ))}
    </div>
  );
};
