// Toast
import { toast } from "sonner";

// Query
import { useQuery } from "@tanstack/react-query";

// Components
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import InputField from "@/shared/components/ui/input/InputField";
import Select from "@/shared/components/ui/select/Select";
import Button from "@/shared/components/ui/button/Button";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Utils & helpers
import { formatMoney } from "@/shared/utils/formatMoney";
import {
  currentMonthKey,
  monthKeyToInputValue,
  inputValueToMonthKey,
} from "@/shared/helpers/month.helpers";

// Queries
import { usersQueries } from "@/features/users/queries/users.queries";
import { useCreateBonus } from "../queries/payroll.mutations";

const BONUS_TYPE_OPTIONS = [
  { value: "fixed", label: "So'm (qat'iy summa)" },
  { value: "percent", label: "Foiz (oylikdan %)" },
];

/**
 * USTAMA QO'SHISH — sodda oyna: xodimni tanla + ustama ber.
 *
 * Fiksa oylik / KPI toifasi YO'Q — bular "Struktura" tabida belgilanadi.
 * Bu yerda faqat ustama (nomi, turi, qiymati). Bir xodimda bir nechta
 * ustama bo'lishi mumkin — kesishuv tekshirilmaydi.
 *
 * `openModal("assignBonus", { staff })` — xodim qatoridan (qulflangan) yoki
 * `openModal("assignBonus", {})` — ro'yxatdan tanlab.
 */
const AssignBonusModal = () => (
  <ResponsiveModal name="assignBonus" title="Ustama qo'shish">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, staff }) => {
  const { mutate: createBonus } = useCreateBonus();

  const isStaffLocked = Boolean(staff?.id);

  const { staffId, label, type, value, startMonth, endMonth, setField } =
    useObjectState({
      staffId: staff?.id ?? "",
      label: "",
      type: "fixed",
      value: "",
      startMonth: monthKeyToInputValue(currentMonthKey()),
      endMonth: "",
    });

  const { data: people = [] } = useQuery({
    ...usersQueries.allShort(),
    enabled: !isStaffLocked,
  });

  const staffOptions = people
    .filter((p) => p.role !== "student")
    .map((p) => ({
      label: p.fullName || `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim(),
      value: p.id,
    }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!staffId) return toast.error("Xodimni tanlang");
    if (!(Number(value) > 0)) return toast.error("Ustama qiymatini kiriting");

    setIsLoading(true);
    createBonus(
      {
        staffId,
        label: label.trim() || "Ustama",
        type,
        value: String(value),
        startMonth: inputValueToMonthKey(startMonth),
        endMonth: inputValueToMonthKey(endMonth),
      },
      {
        onSuccess: () => {
          close();
          toast.success("Ustama qo'shildi");
        },
        onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <InputGroup onSubmit={handleSubmit} as="form">
      {/* Qulflangan xodim yoki tanlash */}
      {isStaffLocked ? (
        <div className="rounded-xl bg-gray-50 p-3 text-sm">
          <p className="text-gray-500">Xodim</p>
          <p className="font-medium text-gray-900">
            {staff.fullName ||
              `${staff.firstName ?? ""} ${staff.lastName ?? ""}`.trim()}
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-gray-700">Xodim</p>
          <Select
            searchable
            value={staffId}
            placeholder="Xodimni tanlang"
            onChange={(v) => setField("staffId", v)}
            options={staffOptions}
          />
        </div>
      )}

      {/* Ustama nomi */}
      <InputField
        name="label"
        label="Ustama nomi"
        value={label}
        placeholder="Masalan: Sertifikat, Transport"
        onChange={(e) => setField("label", e.target.value)}
      />

      {/* Turi + qiymati */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-gray-700">Turi</p>
          <Select
            value={type}
            options={BONUS_TYPE_OPTIONS}
            onChange={(v) => setField("type", v)}
          />
        </div>
        <InputField
          required
          type="number"
          name="value"
          label={type === "percent" ? "Foiz (%)" : "Summa (so'm)"}
          value={value}
          placeholder={type === "percent" ? "10" : "500000"}
          onChange={(e) => setField("value", e.target.value)}
        />
      </div>

      {Number(value) > 0 && type === "fixed" && (
        <p className="text-xs text-gray-500">
          = {formatMoney(value)} / oy
        </p>
      )}
      {type === "percent" && (
        <p className="text-xs text-gray-500">
          Foiz xodimning boshlang'ich oyligidan (lavozim/soatbay + fiksa)
          hisoblanadi.
        </p>
      )}

      {/* Amal qilish davri */}
      <div className="grid grid-cols-2 gap-3">
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

      <div className="mt-4 flex w-full flex-col-reverse gap-3 xs:m-0 xs:flex-row xs:justify-end">
        <Button type="button" variant="secondary" onClick={close} className="w-full xs:w-32">
          Bekor qilish
        </Button>
        <Button className="w-full xs:w-32" disabled={isLoading}>
          Qo'shish
          {isLoading && "..."}
        </Button>
      </div>
    </InputGroup>
  );
};

export default AssignBonusModal;
