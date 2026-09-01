// Toast
import { toast } from "sonner";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import {
  useCreateEnrollment,
  useUpdateEnrollment,
} from "../queries/enrollment.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Utils
import { formatMoney } from "@/shared/utils/formatMoney";

// Data
import { END_REASON_OPTIONS } from "../data/enrollment.data";

/** Bugungi sana `input[type=date]` uchun (server ham shu shaklni kutadi). */
const todayInputValue = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

/**
 * O'qish davri qo'shish yoki tahrirlash.
 *
 * Boshlanish sanasi PULGA ta'sir qiladi: oy o'rtasida bo'lsa o'sha oy
 * ulushga hisoblanadi. Tugash sanasi esa faqat hisob-faktura bor-yo'qligini
 * hal qiladi — ketish oyi har doim to'liq to'lanadi.
 *
 * `openModal("enrollmentPeriod", { studentId, period? })`
 */
const EnrollmentPeriodModal = () => (
  <ResponsiveModal name="enrollmentPeriod" title="O'qish davri">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, studentId, period }) => {
  const isEdit = Boolean(period?.id);

  const { mutate: createEnrollment } = useCreateEnrollment();
  const { mutate: updateEnrollment } = useUpdateEnrollment();

  const { startDate, endDate, endReason, reason, note, setField } = useObjectState({
    startDate: period?.startDate ?? todayInputValue(),
    endDate: period?.endDate ?? "",
    endReason: period?.endReason ?? "",
    reason: period?.reason ?? "",
    note: period?.note ?? "",
  });

  const handleError = (err) =>
    toast.error(err.response?.data?.message || "Xatolik yuz berdi");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (endDate && !endReason) {
      toast.error("Tugash sanasi bilan birga ketish sababini ham tanlang");
      return;
    }

    setIsLoading(true);

    const payload = {
      startDate,
      endDate: endDate || null,
      endReason: endDate ? endReason : null,
      reason,
      note,
    };

    const onSuccess = (result) => {
      close();
      toast.success(isEdit ? "Davr yangilandi" : "O'qish davri qo'shildi");

      // Davr ochilganda server o'sha oy uchun hisob-fakturani darhol
      // shakllantiradi — kassir buni ko'rishi kerak
      if (result?.generated?.created > 0) {
        toast.success(
          `${result.generated.monthLabel} uchun hisob-faktura shakllantirildi` +
            (Number(result.generated.totalAmount) > 0
              ? ` — ${formatMoney(result.generated.totalAmount)}`
              : ""),
        );
      }

      result?.warnings?.forEach((warning) => toast.warning(warning));
    };

    const onSettled = () => setIsLoading(false);

    if (isEdit) {
      updateEnrollment(
        { id: period.id, data: payload },
        { onSuccess, onError: handleError, onSettled },
      );
    } else {
      createEnrollment(
        { studentId, ...payload },
        { onSuccess, onError: handleError, onSettled },
      );
    }
  };

  return (
    <InputGroup onSubmit={handleSubmit} as="form">
      <InputField
        required
        autoFocus
        type="date"
        name="startDate"
        label="Boshlanish sanasi"
        value={startDate}
        description="Oy o'rtasi bo'lsa o'sha oy ulushga hisoblanadi"
        onChange={(e) => setField("startDate", e.target.value)}
      />

      <InputField
        type="date"
        name="endDate"
        label="Tugash sanasi"
        value={endDate}
        min={startDate}
        description="Bo'sh qolsa — hozir o'qiyapti"
        onChange={(e) => setField("endDate", e.target.value)}
      />

      {endDate && (
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-gray-700">Ketish sababi</p>
          <Select searchable
            value={endReason}
            placeholder="Sababni tanlang"
            options={END_REASON_OPTIONS}
            onChange={(v) => setField("endReason", v)}
          />
        </div>
      )}

      <InputField
        name="reason"
        label="Izoh"
        value={reason}
        placeholder="Ixtiyoriy"
        onChange={(e) => setField("reason", e.target.value)}
      />

      <p className="text-xs text-gray-500">
        Ketish oyi har doim to'liq to'lanadi — tugash sanasi faqat keyingi
        oylarga hisob yozilmasligini bildiradi.
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
          Saqlash
          {isLoading && "..."}
        </Button>
      </div>
    </InputGroup>
  );
};

export default EnrollmentPeriodModal;
