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
import { payrollQueries } from "../queries/payroll.queries";
import {
  useCreateSalary,
  useUpdateSalary,
  useCreateSalaryPayment,
  usePreviewSalaryPayment,
  useVoidSalaryPayment,
  useCancelEntry,
  useCreateCategory,
  useUpdateCategory,
} from "../queries/payroll.mutations";
import {
  NO_ADVANCE_HINT,
  PAYROLL_SEAL_HINT,
  KPI_HINT,
  CATEGORY_HINT,
  ALLOWANCE_TYPE_OPTIONS,
} from "../data/payroll.data";

// Icons
import { Plus, Trash2 } from "lucide-react";

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

// Serverdan formatlangan summa ("4500000.00") → input qiymati ("4500000")
const toInputAmount = (value) =>
  value == null || Number(value) === 0 ? "" : String(Number(value));

// Fiksadan ustama summasini hisoblaydi (percent — fiksadan foiz)
const allowanceAmount = (rule, fixed) =>
  rule.type === "percent"
    ? (Number(fixed) || 0) * (Number(rule.value) || 0) / 100
    : Number(rule.value) || 0;

const SalaryRuleForm = ({ close, isLoading, setIsLoading, rule, staff }) => {
  const isEdit = Boolean(rule?.id);

  const { mutate: createSalary } = useCreateSalary();
  const { mutate: updateSalary } = useUpdateSalary();

  const { data: people = [] } = useQuery({
    ...usersQueries.allShort(),
    enabled: !isEdit && !staff,
  });
  const { data: categories = [] } = useQuery(payrollQueries.activeCategories());

  const {
    staffId,
    fixedAmount,
    categoryId,
    allowances,
    startMonth,
    endMonth,
    note,
    setField,
  } = useObjectState({
    staffId: staff?.id ?? rule?.staffId ?? "",
    fixedAmount: toInputAmount(rule?.fixedAmount),
    categoryId: rule?.categoryId ?? "",
    allowances: Array.isArray(rule?.allowances) ? rule.allowances : [],
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

  // Ustama qoidalari
  const addAllowance = () =>
    setField("allowances", [...allowances, { label: "", type: "fixed", value: "" }]);
  const removeAllowance = (i) =>
    setField("allowances", allowances.filter((_, idx) => idx !== i));
  const updateAllowance = (i, field, value) =>
    setField(
      "allowances",
      allowances.map((a, idx) => (idx === i ? { ...a, [field]: value } : a)),
    );

  // KPI: toifa stavkasi × dars soati
  const selectedCategory = categories.find((c) => c.id === categoryId);
  const categoryRate = Number(selectedCategory?.perHourRate) || 0;
  const wantsKpi = Boolean(categoryId);

  const previewStaffId = staff?.id || staffId || rule?.staffId || "";
  const previewMonth = inputValueToMonthKey(startMonth);
  const { data: lessonInfo, isFetching: hoursLoading } = useQuery({
    ...payrollQueries.lessonHours(previewStaffId, previewMonth),
    enabled: Boolean(previewStaffId) && wantsKpi,
  });

  const hours = lessonInfo?.hours ?? 0;
  const kpiValue = wantsKpi ? categoryRate * hours : 0;
  const allowancesTotal = allowances.reduce((sum, a) => sum + allowanceAmount(a, fixedAmount), 0);
  const totalValue = (Number(fixedAmount) || 0) + allowancesTotal + kpiValue;
  const hasAmount = Number(fixedAmount) > 0 || wantsKpi;

  const handleSubmit = (e) => {
    e.preventDefault();

    // Ustamalarni tozalaymiz (bo'sh qiymatlilarni tashlab)
    const cleanAllowances = allowances
      .filter((a) => Number(a.value) > 0)
      .map((a) => ({ label: a.label || "", type: a.type, value: Number(a.value) }));

    setIsLoading(true);
    const payload = {
      fixedAmount: fixedAmount || 0,
      categoryId: categoryId || null,
      allowances: cleanAllowances,
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
        min="0"
        type="number"
        name="fixedAmount"
        label="Fiksa oylik (ixtiyoriy)"
        value={fixedAmount}
        placeholder="5000000"
        description={
          Number(fixedAmount) > 0 ? `${formatMoney(fixedAmount)} / oy` : "Oyiga qat'iy summa"
        }
        onChange={(e) => setField("fixedAmount", e.target.value)}
      />

      {/* KPI toifasi (soatlik stavka sozlamalardan) */}
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700">
          KPI toifasi (dars soati bo'yicha, ixtiyoriy)
        </p>
        <Select
          value={categoryId}
          placeholder={categories.length ? "Toifani tanlang" : "Sozlamalarda toifa yo'q"}
          onChange={(v) => setField("categoryId", v)}
          options={[
            { label: "— (KPI yo'q)", value: "" },
            ...categories.map((c) => ({
              label: `${c.name} — ${formatMoney(c.perHourRate)}/soat`,
              value: c.id,
            })),
          ]}
        />
      </div>

      {/* KPI preview */}
      {wantsKpi && previewStaffId && (
        <div className="rounded-xl bg-indigo-50 p-3 text-xs text-indigo-900">
          {hoursLoading ? (
            "Dars soati hisoblanmoqda..."
          ) : hours > 0 ? (
            <div className="space-y-0.5">
              <div>
                {formatMonthKey(previewMonth)}: <b>{hours} dars soati</b>
                {lessonInfo?.monthlyLessons ? ` (${lessonInfo.monthlyLessons} ta dars)` : ""}
              </div>
              <div>
                KPI: {formatMoney(categoryRate)} × {hours} = <b>{formatMoney(kpiValue)}</b>
              </div>
            </div>
          ) : (
            "Bu oy uchun jadvalda dars topilmadi — KPI 0 bo'ladi. Avval dars jadvalini to'ldiring."
          )}
        </div>
      )}

      {/* Ustama qoidalari (cheksiz) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">Ustama qoidalari</p>
          <button
            type="button"
            onClick={addAllowance}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <Plus className="size-3.5" /> Qoida qo'shish
          </button>
        </div>

        {allowances.length === 0 && (
          <p className="text-xs text-gray-400">
            Sertifikat, tajriba ustamasi va h.k. Foizli ustama fiksa maoshdan olinadi.
          </p>
        )}

        {allowances.map((a, i) => (
          <div key={i} className="rounded-xl border border-gray-200 p-2 space-y-1.5">
            <div className="flex items-center gap-2">
              <input
                value={a.label}
                placeholder="Nomi (masalan: Sertifikat)"
                onChange={(e) => updateAllowance(i, "label", e.target.value)}
                className="h-9 flex-1 rounded-lg border border-gray-200 px-2 text-sm outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => removeAllowance(i)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={a.type}
                onChange={(v) => updateAllowance(i, "type", v)}
                options={ALLOWANCE_TYPE_OPTIONS}
              />
              <input
                type="number"
                min="0"
                value={a.value}
                placeholder={a.type === "percent" ? "10" : "200000"}
                onChange={(e) => updateAllowance(i, "value", e.target.value)}
                className="h-9 rounded-lg border border-gray-200 px-2 text-sm outline-none focus:border-primary"
              />
            </div>
            {Number(a.value) > 0 && (
              <p className="text-xs text-gray-500">
                = {formatMoney(allowanceAmount(a, fixedAmount))}
                {a.type === "percent" ? " (fiksadan)" : ""}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Jami hisob */}
      {totalValue > 0 && (
        <div className="rounded-xl bg-green-50 p-3 text-sm text-green-900">
          Jami ≈ fiksa {formatMoney(fixedAmount || 0)}
          {allowancesTotal > 0 ? ` + ustama ${formatMoney(allowancesTotal)}` : ""}
          {kpiValue > 0 ? ` + KPI ${formatMoney(kpiValue)}` : ""} ={" "}
          <b>{formatMoney(totalValue)}</b>
          {wantsKpi && <span className="block text-xs text-green-700">KPI dars soatiga qarab har oy o'zgaradi</span>}
        </div>
      )}

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

      <p className="rounded-xl bg-gray-50 p-3 text-xs text-gray-500">{KPI_HINT}</p>

      <Button
        type="submit"
        className="w-full"
        loading={isLoading}
        disabled={!hasAmount || (!isEdit && !staffId && !staff)}
      >
        {isEdit ? "Saqlash" : "Belgilash"}
      </Button>
    </InputGroup>
  );
};

// ─────────────────────────────────────────────
// Malaka toifasi (KPI stavka katalogi)
// ─────────────────────────────────────────────

export const SalaryCategoryModal = () => (
  <ResponsiveModal name="salaryCategory" title="Malaka toifasi">
    <SalaryCategoryForm />
  </ResponsiveModal>
);

const SalaryCategoryForm = ({ close, isLoading, setIsLoading, category }) => {
  const isEdit = Boolean(category?.id);
  const { mutate: createCategory } = useCreateCategory();
  const { mutate: updateCategory } = useUpdateCategory();

  const { name, perHourRate, description, setField } = useObjectState({
    name: category?.name ?? "",
    perHourRate: toInputAmount(category?.perHourRate),
    description: category?.description ?? "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    const payload = { name, perHourRate: perHourRate || 0, description };
    const handlers = {
      onSuccess: () => {
        close();
        toast.success(isEdit ? "Toifa yangilandi" : "Toifa qo'shildi");
      },
      onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      onSettled: () => setIsLoading(false),
    };
    if (isEdit) updateCategory({ id: category.id, data: payload }, handlers);
    else createCategory(payload, handlers);
  };

  return (
    <InputGroup onSubmit={handleSubmit} as="form">
      <InputField
        required
        name="name"
        label="Toifa nomi"
        value={name}
        placeholder="Oliy malaka toifasi"
        onChange={(e) => setField("name", e.target.value)}
      />
      <InputField
        required
        min="0"
        type="number"
        name="perHourRate"
        label="1 dars soatiga (KPI stavka)"
        value={perHourRate}
        placeholder="60000"
        description={Number(perHourRate) > 0 ? `${formatMoney(perHourRate)} / soat` : "So'mda"}
        onChange={(e) => setField("perHourRate", e.target.value)}
      />
      <InputField
        name="description"
        label="Izoh (ixtiyoriy)"
        value={description}
        onChange={(e) => setField("description", e.target.value)}
      />
      <p className="rounded-xl bg-gray-50 p-3 text-xs text-gray-500">{CATEGORY_HINT}</p>
      <Button
        type="submit"
        className="w-full"
        loading={isLoading}
        disabled={!name || !(Number(perHourRate) > 0)}
      >
        {isEdit ? "Saqlash" : "Qo'shish"}
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

const ReasonForm = ({ close, isLoading, setIsLoading, kind, payment, entry }) => {
  const { mutate: voidPayment } = useVoidSalaryPayment();
  const { mutate: cancelEntry } = useCancelEntry();

  const { reason, setField } = useObjectState({ reason: "" });
  const target = kind === "payment" ? payment : entry;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    const handlers = {
      onSuccess: () => {
        close();
        toast.success("Bekor qilindi");
      },
      onError: (err) =>
        toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      onSettled: () => setIsLoading(false),
    };

    if (kind === "payment") voidPayment({ id: payment.id, reason }, handlers);
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

      <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
        {kind === "payment"
          ? "Yozuv o'chirilmaydi — daftarga teskari qator yoziladi, kassa qoldig'i qaytadi va oylik yana qarzga o'tadi."
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
        variant="danger"
        className="w-full"
        loading={isLoading}
        disabled={!reason.trim()}
      >
        Bekor qilish
      </Button>
    </InputGroup>
  );
};
