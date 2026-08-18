// Toast
import { toast } from "sonner";

// Icons
import { TriangleAlert } from "lucide-react";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import { useCreateFinanceStatus } from "../queries/finance.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Helpers
import {
  currentMonthKey,
  inputValueToMonthKey,
  monthKeyToInputValue,
} from "@/shared/helpers/month.helpers";

// Data
import { FINANCE_STATUS_OPTIONS } from "../data/finance.data";

/**
 * O'quvchining moliyaviy holatini o'zgartirish (muzlatish / chetlatish /
 * faollashtirish).
 *
 * Joriy oydan boshlash ruxsat etilgan — masalan hisob-faktura kuni 5 bo'lsa,
 * 2-sanada muzlatish o'sha oy majburiyatini oldini oladi. Ammo majburiyat
 * allaqachon shakllangan bo'lsa, u avtomatik bekor qilinmaydi: server
 * `warnings` qaytaradi va u toast'da ko'rsatiladi.
 */
const StudentFinanceStatusModal = () => (
  <ResponsiveModal name="editStudentFinanceStatus" title="Moliyaviy holat">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, studentId, currentStatus }) => {
  const { mutate: createStatus } = useCreateFinanceStatus();

  const { status, startMonth, endMonth, reason, setField } = useObjectState({
    status: currentStatus?.status === "active" ? "frozen" : "active",
    startMonth: monthKeyToInputValue(currentMonthKey()),
    endMonth: "",
    reason: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!studentId) return;

    setIsLoading(true);

    createStatus(
      {
        studentId,
        status,
        startMonth: inputValueToMonthKey(startMonth),
        endMonth: inputValueToMonthKey(endMonth),
        reason,
      },
      {
        onSuccess: (result) => {
          close();
          toast.success("Holat o'zgartirildi");
          result?.warnings?.forEach((warning) => toast.warning(warning));
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  const isNonBillable = status === "frozen";

  return (
    <InputGroup onSubmit={handleSubmit} as="form">
      {currentStatus && (
        <div className="rounded-xl bg-gray-50 p-3 text-sm">
          <p className="text-gray-500">Joriy holat</p>
          <p className="font-medium text-gray-900">{currentStatus.statusLabel}</p>
        </div>
      )}

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700">Yangi holat</p>
        <Select
          value={status}
          options={FINANCE_STATUS_OPTIONS}
          onChange={(v) => setField("status", v)}
        />
      </div>

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
          onChange={(e) => setField("endMonth", e.target.value)}
        />
      </div>

      <InputField
        name="reason"
        value={reason}
        label="Sabab"
        placeholder="Masalan: oilaviy sharoit"
        onChange={(e) => setField("reason", e.target.value)}
      />

      {isNonBillable && (
        <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          <TriangleAlert className="size-4 shrink-0 mt-0.5" />
          <p>
            Bu davrda yangi majburiyat shakllanmaydi. Allaqachon
            shakllantirilgan hisob-fakturalar esa o'z kuchida qoladi — ularni
            alohida bekor qilish kerak.
          </p>
        </div>
      )}

      <p className="text-xs text-gray-500">
        "Qaysi oygacha" bo'sh qolsa — holat muddatsiz amal qiladi.
      </p>

      <div className="flex flex-col-reverse gap-3.5 w-full mt-5 xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          onClick={close}
          variant="secondary"
          className="w-full xs:w-32"
        >
          Bekor qilish
        </Button>

        <Button autoFocus className="w-full xs:w-32" disabled={isLoading}>
          Saqlash
          {isLoading && "..."}
        </Button>
      </div>
    </InputGroup>
  );
};

export default StudentFinanceStatusModal;
