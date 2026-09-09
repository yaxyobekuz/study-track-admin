// Toast
import { toast } from "sonner";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import { useBulkMonthOverride } from "../queries/finance.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import SelectSearch from "@/shared/components/ui/select/SelectSearch";
import MultiSelect from "@/shared/components/form/multi-select";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Helpers
import { formatMonthKey } from "@/shared/helpers/month.helpers";

// Data & queries
import { MONTH_OVERRIDE_REASON_OPTIONS } from "../data/finance.data";
import { classesQueries } from "@/features/classes/queries/classes.queries";

const SCOPE_OPTIONS = [
  { label: "Tanlangan o'quvchilar", value: "students" },
  { label: "Butun sinf", value: "class" },
];

/**
 * OMMAVIY oy summasi (grant) — bir oy uchun bir nechta o'quvchiga (yoki butun
 * sinfga) bir xil summa + sabab. Har biri uchun override yoziladi va o'sha oy
 * hisob-fakturasi qayta muhrlanadi.
 *
 * `openModal("bulkMonthOverride", { month })` — oy `OverviewPage` dan keladi.
 */
const BulkMonthOverrideModal = () => (
  <ResponsiveModal name="bulkMonthOverride" title="Ommaviy oy summasi">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, month }) => {
  const { mutate: bulk } = useBulkMonthOverride();

  const {
    scope,
    classId,
    studentIds,
    amount,
    reasonCode,
    note,
    setField,
  } = useObjectState({
    scope: "students",
    classId: "",
    studentIds: [],
    amount: "",
    reasonCode: "",
    note: "",
  });

  const { data: classes = [] } = useQuery(classesQueries.list());
  const { data: students = [] } = useQuery(classesQueries.students(classId));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!classId) return toast.error("Sinfni tanlang");
    if (scope === "students" && studentIds.length === 0)
      return toast.error("Kamida bitta o'quvchi tanlang");
    if (!amount.trim()) return toast.error("Summani kiriting");
    if (!reasonCode) return toast.error("Sababni tanlang");

    setIsLoading(true);

    const payload = {
      month,
      amount: amount.trim(),
      reasonCode,
      note,
      ...(scope === "class" ? { classId } : { studentIds }),
    };

    bulk(payload, {
      onSuccess: (result) => {
        close();
        toast.success(`${result?.applied ?? 0} ta o'quvchiga qo'llandi`);
        result?.skipped?.forEach((s) =>
          toast.warning(s.reason || "Bir o'quvchi o'tkazib yuborildi"),
        );
      },
      onError: (err) =>
        toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      onSettled: () => setIsLoading(false),
    });
  };

  return (
    <InputGroup onSubmit={handleSubmit} as="form">
      <div className="rounded-xl bg-gray-50 p-3 text-sm">
        <p className="text-gray-500">Oy</p>
        <p className="font-medium text-gray-900">{formatMonthKey(month)}</p>
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700">Kimga</p>
        <Select
          value={scope}
          options={SCOPE_OPTIONS}
          onChange={(v) => setField("scope", v)}
        />
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700">Sinf</p>
        <SelectSearch
          inline
          value={classId}
          placeholder="Sinfni tanlang"
          options={classes.map((c) => ({ label: c.name, value: c.id }))}
          onChange={(v) => {
            setField("classId", v);
            setField("studentIds", []);
          }}
        />
      </div>

      {scope === "students" && (
        <MultiSelect
          label="O'quvchilar"
          value={studentIds}
          disabled={!classId}
          placeholder={classId ? "O'quvchilarni tanlang" : "Avval sinfni tanlang"}
          onChange={(v) => setField("studentIds", v)}
          options={students.map((s) => ({
            label: `${s.firstName} ${s.lastName ?? ""}`.trim(),
            value: s.id,
          }))}
        />
      )}

      <InputField
        required
        type="number"
        name="amount"
        label="Summa (so'm)"
        value={amount}
        onChange={(e) => setField("amount", e.target.value)}
      />

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700">Sabab</p>
        <Select
          value={reasonCode}
          placeholder="Sababni tanlang"
          options={MONTH_OVERRIDE_REASON_OPTIONS}
          onChange={(v) => setField("reasonCode", v)}
        />
      </div>

      <InputField
        name="note"
        label="Izoh"
        value={note}
        placeholder="Ixtiyoriy"
        onChange={(e) => setField("note", e.target.value)}
      />

      <p className="text-xs text-gray-500">
        Bu summa faqat <b>{formatMonthKey(month)}</b> oyiga tegishli. To'lov
        tushgan hisob-fakturalar o'zgarmaydi — ular ogohlantirishda ko'rsatiladi.
      </p>

      <div className="mt-5 flex w-full flex-col-reverse gap-3.5 xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          onClick={close}
          variant="secondary"
          className="w-full xs:w-32"
        >
          Bekor qilish
        </Button>

        <Button className="w-full xs:w-32" disabled={isLoading}>
          Qo'llash
          {isLoading && "..."}
        </Button>
      </div>
    </InputGroup>
  );
};

export default BulkMonthOverrideModal;
