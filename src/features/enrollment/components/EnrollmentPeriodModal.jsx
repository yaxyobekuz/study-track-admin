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

/** YYYYMM (Int) → `input[type=month]` qiymati (YYYY-MM). Bo'sh bo'lsa "". */
const monthKeyToInput = (key) => {
  if (key == null || key === "") return "";
  const s = String(key);
  return `${s.slice(0, 4)}-${s.slice(4, 6)}`;
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

  const {
    startDate,
    endDate,
    endReason,
    reason,
    note,
    firstMonthKey,
    firstMonthAmount,
    setField,
  } = useObjectState({
    startDate: period?.startDate ?? todayInputValue(),
    endDate: period?.endDate ?? "",
    endReason: period?.endReason ?? "",
    reason: period?.reason ?? "",
    note: period?.note ?? "",
    firstMonthKey: monthKeyToInput(period?.firstMonthKey),
    firstMonthAmount:
      period?.firstMonthAmount != null ? String(period.firstMonthAmount) : "",
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
      // Boshlang'ich (birinchi oy) summasi va uning to'lov oyi. Bo'sh yuborilsa
      // server null qiladi → odatiy hisobga qaytadi.
      firstMonthKey: firstMonthKey || null,
      firstMonthAmount: firstMonthAmount || null,
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
        label="Boshlanish (kirgan) sanasi"
        value={startDate}
        description="O'quvchi qachon kelgani — kun aniqligida"
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

      {/* ── Boshlang'ich (birinchi oy) summasi ── */}
      <div className="space-y-3.5 rounded-xl bg-gray-50 p-3">
        <p className="text-xs font-medium text-gray-500">
          Boshlang'ich to'lov — belgilangan oyga aynan shu summa qarz sifatida
          yoziladi (kun-proratsiyasiz). Bo'sh qolsa — tarif bo'yicha hisoblanadi.
        </p>
        <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
          <InputField
            type="month"
            name="firstMonthKey"
            label="Birinchi to'lov oyi"
            value={firstMonthKey}
            onChange={(e) => setField("firstMonthKey", e.target.value)}
          />
          <InputField
            min="0"
            step="0.01"
            type="number"
            name="firstMonthAmount"
            label="Birinchi oy to'lovi (so'm)"
            value={firstMonthAmount}
            placeholder="Masalan: 300000"
            onChange={(e) => setField("firstMonthAmount", e.target.value)}
          />
        </div>
        <p className="text-[11px] text-gray-400">
          Summa o'zgartirilsa, o'sha oy hisob-fakturasini "Qayta shakllantirish"
          bilan yangilang.
        </p>
      </div>

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
