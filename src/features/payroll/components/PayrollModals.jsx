// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import InputField from "@/shared/components/ui/input/InputField";
import Select from "@/shared/components/ui/select/Select";
import Button from "@/shared/components/ui/button/Button";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";
import {
  currentMonthKey,
  monthKeyToInputValue,
  inputValueToMonthKey,
  formatMonthKey,
} from "@/shared/helpers/month.helpers";

// Queries
import { financeQueries } from "@/features/finance/queries/finance.queries";
import { usersQueries } from "@/features/users/queries/users.queries";
import {
  useCreateSalary,
  useUpdateSalary,
  useCreateSalaryPayment,
  usePreviewSalaryPayment,
  useVoidSalaryPayment,
  useCancelEntry,
  useRegenerateEntry,
} from "../queries/payroll.mutations";
import { NO_ADVANCE_HINT, PAYROLL_SEAL_HINT } from "../data/payroll.data";

const todayInputValue = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

// ─────────────────────────────────────────────
// Oylik belgilash
// ─────────────────────────────────────────────

export const SalaryRuleModal = () => (
  <ResponsiveModal name="staffSalary" title="Oylik belgilash">
    <SalaryRuleForm />
  </ResponsiveModal>
);

const SalaryRuleForm = ({ close, isLoading, setIsLoading, rule, staff }) => {
  const isEdit = Boolean(rule?.id);

  const { mutate: createSalary } = useCreateSalary();
  const { mutate: updateSalary } = useUpdateSalary();

  // Xodim allaqachon tanlangan bo'lsa ro'yxat kerak emas.
  // `allShort` — ruxsatga bog'liq bo'lmagan qisqa ro'yxat; o'quvchilar
  // mijozda filtrlanadi (serverda ham rad etiladi, bu faqat UI qatlami).
  const { data: people = [] } = useQuery({
    ...usersQueries.allShort(),
    enabled: !isEdit && !staff,
  });

  const { staffId, amount, startMonth, endMonth, note, setField } = useObjectState({
    staffId: staff?.id ?? rule?.staffId ?? "",
    amount: rule?.amount ?? "",
    startMonth: monthKeyToInputValue(rule?.startMonth ?? currentMonthKey()),
    endMonth: monthKeyToInputValue(rule?.endMonth),
    note: rule?.note ?? "",
  });

  const staffOptions = people
    .filter((person) => person.role !== "student")
    .map((person) => ({
      label: person.fullName || `${person.firstName ?? ""} ${person.lastName ?? ""}`.trim(),
      value: person.id,
    }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      amount,
      startMonth: inputValueToMonthKey(startMonth),
      endMonth: inputValueToMonthKey(endMonth),
      note,
    };

    const handlers = {
      onSuccess: () => {
        close();
        toast.success(isEdit ? "Oylik yangilandi" : "Oylik belgilandi");
      },
      onError: (err) =>
        toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      onSettled: () => setIsLoading(false),
    };

    if (isEdit) updateSalary({ id: rule.id, data: payload }, handlers);
    else createSalary({ ...payload, staffId }, handlers);
  };

  return (
    <InputGroup onSubmit={handleSubmit} as="form">
      {staff ? (
        <div className="rounded-xl bg-gray-50 p-3 text-sm">
          <p className="font-medium text-gray-900">
            {`${staff.firstName} ${staff.lastName ?? ""}`.trim()}
          </p>
        </div>
      ) : (
        !isEdit && (
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-gray-700">Xodim</p>
            <Select
              value={staffId}
              placeholder="Xodimni tanlang"
              onChange={(v) => setField("staffId", v)}
              options={staffOptions}
            />
          </div>
        )
      )}

      <InputField
        required
        min="1"
        type="number"
        name="amount"
        label="Oylik summasi"
        value={amount}
        placeholder="5000000"
        description={amount ? `${formatMoney(amount)} / oy` : "Oyiga qat'iy summa"}
        onChange={(e) => setField("amount", e.target.value)}
      />

      <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
        <InputField
          required
          type="month"
          name="startMonth"
          label="Qaysi oydan"
          value={startMonth}
          onChange={(e) => setField("startMonth", e.target.value)}
        />

        <InputField
          type="month"
          name="endMonth"
          label="Qaysi oygacha"
          value={endMonth}
          description="Bo'sh — muddatsiz"
          onChange={(e) => setField("endMonth", e.target.value)}
        />
      </div>

      <InputField
        name="note"
        label="Izoh (ixtiyoriy)"
        value={note}
        onChange={(e) => setField("note", e.target.value)}
      />

      <p className="rounded-xl bg-gray-50 p-3 text-xs text-gray-500">
        Oylik OY aniqligida hisoblanadi — kun bo'yicha bo'linmaydi. Oy o'rtasida
        ishga kirgan xodim uchun keyingi oydan boshlang.
      </p>

      <Button
        type="submit"
        className="w-full"
        loading={isLoading}
        disabled={!amount || (!isEdit && !staffId && !staff)}
      >
        {isEdit ? "Saqlash" : "Belgilash"}
      </Button>
    </InputGroup>
  );
};

// ─────────────────────────────────────────────
// Oylik to'lash
// ─────────────────────────────────────────────

export const SalaryPaymentModal = () => (
  <ResponsiveModal name="salaryPayment" title="Oylik to'lash">
    <SalaryPaymentForm />
  </ResponsiveModal>
);

const SalaryPaymentForm = ({ close, isLoading, setIsLoading, staff }) => {
  const { data: accounts = [] } = useQuery(financeQueries.activeAccounts());
  const { mutate: createPayment } = useCreateSalaryPayment();
  const { mutate: runPreview, isPending: isPreviewing } = usePreviewSalaryPayment();

  const [preview, setPreview] = useState(null);

  const { amount, accountId, paidAt, note, setField } = useObjectState({
    amount: "",
    accountId: "",
    paidAt: todayInputValue(),
    note: "",
  });

  const resolvedAccount = accountId || (accounts.length === 1 ? accounts[0].id : "");

  /**
   * Taqsimotni hisoblash — summa kiritilib bo'lgach (blur).
   * Har harfda emas: bu server so'rovi.
   */
  const refreshPreview = () => {
    if (!amount || Number(amount) <= 0) return setPreview(null);

    runPreview(
      { staffId: staff.id, amount },
      { onSuccess: setPreview, onError: () => setPreview(null) },
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    createPayment(
      { staffId: staff.id, accountId: resolvedAccount, amount, paidAt, note },
      {
        onSuccess: () => {
          close();
          toast.success("Oylik to'landi");
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <InputGroup onSubmit={handleSubmit} as="form">
      <div className="rounded-xl bg-gray-50 p-3 text-sm">
        <p className="font-medium text-gray-900">
          {`${staff?.firstName ?? ""} ${staff?.lastName ?? ""}`.trim()}
        </p>
        {preview && (
          <p className="text-gray-500">
            To'lanmagan oylik: {formatMoney(preview.outstanding)}
          </p>
        )}
      </div>

      <InputField
        required
        min="1"
        type="number"
        name="amount"
        label="Summa"
        value={amount}
        placeholder="5000000"
        description={amount ? formatMoney(amount) : "So'mda"}
        onChange={(e) => setField("amount", e.target.value)}
        onBlur={refreshPreview}
      />

      {/* Taqsimot — pul qaysi oylarga ketishini OLDINDAN ko'rsatadi */}
      {preview && (
        <div className="rounded-xl bg-gray-50 p-3 text-sm">
          {preview.exceedsDebt ? (
            <p className="text-red-600">
              To'lov qarzdan {formatMoney(preview.excess)} ko'p. Avans
              qo'llab-quvvatlanmaydi — summani kamaytiring.
            </p>
          ) : preview.allocations.length === 0 ? (
            <p className="text-gray-500">To'lanmagan oylik yo'q</p>
          ) : (
            <>
              <p className="mb-1.5 text-xs font-medium text-gray-500">
                Qaysi oylarga ketadi
              </p>
              <div className="space-y-1">
                {preview.allocations.map((a) => (
                  <div
                    key={a.payrollEntryId}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-gray-600">{a.monthLabel}</span>
                    <span className="font-medium text-gray-900">
                      {formatMoney(a.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700">Pul qayerdan chiqdi</p>
        <Select
          value={resolvedAccount}
          placeholder="To'lov turini tanlang"
          onChange={(v) => setField("accountId", v)}
          options={accounts.map((a) => ({ label: a.name, value: a.id }))}
        />
      </div>

      <InputField
        required
        type="date"
        name="paidAt"
        label="Sana"
        value={paidAt}
        max={todayInputValue()}
        onChange={(e) => setField("paidAt", e.target.value)}
      />

      <InputField
        name="note"
        label="Izoh (ixtiyoriy)"
        value={note}
        onChange={(e) => setField("note", e.target.value)}
      />

      <p className="rounded-xl bg-gray-50 p-3 text-xs text-gray-500">
        {NO_ADVANCE_HINT}
      </p>

      <Button
        type="submit"
        className="w-full"
        loading={isLoading || isPreviewing}
        disabled={!amount || !resolvedAccount || preview?.exceedsDebt}
      >
        To'lash
      </Button>
    </InputGroup>
  );
};

// ─────────────────────────────────────────────
// Bekor qilish (to'lov va majburiyat)
// ─────────────────────────────────────────────

export const VoidSalaryPaymentModal = () => (
  <ResponsiveModal name="voidSalaryPayment" title="To'lovni bekor qilish">
    <ReasonForm kind="payment" />
  </ResponsiveModal>
);

export const CancelPayrollEntryModal = () => (
  <ResponsiveModal name="cancelPayrollEntry" title="Majburiyatni bekor qilish">
    <ReasonForm kind="entry" />
  </ResponsiveModal>
);

/**
 * QAYTA SHAKLLANTIRISH — bekor qilinganini qaytarish yoki oylik qoidasi
 * to'g'rilangandan keyin summani yangilash.
 *
 * ⚠️ Oylik passi bekor qilingan majburiyatni QAYTA YOZMAYDI (u qaror,
 * bo'shliq emas), shuning uchun qaytarishning yagona yo'li shu oyna.
 */
export const RegeneratePayrollEntryModal = () => (
  <ResponsiveModal
    name="regeneratePayrollEntry"
    title="Majburiyatni qayta shakllantirish"
  >
    <ReasonForm kind="regenerate" />
  </ResponsiveModal>
);

const ReasonForm = ({ close, isLoading, setIsLoading, kind, payment, entry }) => {
  const { mutate: voidPayment } = useVoidSalaryPayment();
  const { mutate: cancelEntry } = useCancelEntry();
  const { mutate: regenerateEntry } = useRegenerateEntry();

  const { reason, setField } = useObjectState({ reason: "" });
  const target = kind === "payment" ? payment : entry;
  const isRegenerate = kind === "regenerate";

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    const handlers = {
      onSuccess: () => {
        close();
        toast.success(
          isRegenerate ? "Majburiyat qayta shakllantirildi" : "Bekor qilindi",
        );
      },
      onError: (err) =>
        toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      onSettled: () => setIsLoading(false),
    };

    if (kind === "payment") voidPayment({ id: payment.id, reason }, handlers);
    else if (isRegenerate) regenerateEntry({ id: entry.id, reason }, handlers);
    else cancelEntry({ id: entry.id, reason }, handlers);
  };

  return (
    <InputGroup onSubmit={handleSubmit} as="form">
      <div className="rounded-xl bg-gray-50 p-3 text-sm">
        <p className="font-medium text-gray-900">{target?.staffName}</p>
        <p className="text-gray-500">
          {formatMoney(target?.amount)}
          {target?.month ? ` · ${formatMonthKey(target.month)}` : ""}
        </p>
      </div>

      <p
        className={cn(
          "rounded-xl p-3 text-xs",
          isRegenerate ? "bg-blue-50 text-blue-800" : "bg-amber-50 text-amber-800",
        )}
      >
        {kind === "payment"
          ? "Yozuv o'chirilmaydi — daftarga teskari qator yoziladi, kassa qoldig'i qaytadi va oylik yana qarzga o'tadi."
          : isRegenerate
            ? "Summa AMALDAGI oylik qoidasidan qayta hisoblanadi va majburiyat yana \"to'lanmagan\" holatiga o'tadi. Bekor qilingan bo'lsa — qaytariladi."
            : PAYROLL_SEAL_HINT}
      </p>

      <InputField
        required
        name="reason"
        label="Sabab"
        value={reason}
        placeholder="Xato summa kiritilgan"
        onChange={(e) => setField("reason", e.target.value)}
      />

      <Button
        type="submit"
        variant={isRegenerate ? "default" : "danger"}
        className="w-full"
        loading={isLoading}
        disabled={!reason.trim()}
      >
        {isRegenerate ? "Qayta shakllantirish" : "Bekor qilish"}
      </Button>
    </InputGroup>
  );
};
