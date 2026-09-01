// Toast
import { toast } from "sonner";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import { useCloseEnrollment } from "../queries/enrollment.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Utils
import { formatDateUZ } from "@/shared/utils/date.utils";

// Data
import { END_REASON_OPTIONS } from "../data/enrollment.data";

const todayInputValue = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

/**
 * O'qish davrini yopish — "o'quvchi maktabdan ketdi".
 *
 * Ketgan oy TO'LIQ to'lanadi (proratsiya faqat kirishda), keyingi oylarga
 * esa hisob-faktura umuman yozilmaydi. Foydalanuvchi buni bosishdan oldin
 * ko'rishi kerak.
 *
 * `openModal("closeEnrollment", { period })`
 */
const CloseEnrollmentModal = () => (
  <ResponsiveModal name="closeEnrollment" title="O'qish davrini yopish">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, period }) => {
  const { mutate: closeEnrollment } = useCloseEnrollment();

  const { endDate, endReason, reason, setField } = useObjectState({
    endDate: todayInputValue(),
    endReason: "",
    reason: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!endReason) return toast.error("Ketish sababini tanlang");

    setIsLoading(true);

    closeEnrollment(
      { id: period.id, data: { endDate, endReason, reason } },
      {
        onSuccess: (result) => {
          close();
          toast.success("O'qish davri yopildi");
          result?.warnings?.forEach((warning) => toast.warning(warning));
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <InputGroup onSubmit={handleSubmit} as="form">
      {period && (
        <div className="rounded-xl bg-gray-50 p-3 text-sm">
          <p className="text-gray-500">Davr boshlangan</p>
          <p className="font-medium text-gray-900">
            {formatDateUZ(period.startDate)}
          </p>
        </div>
      )}

      <InputField
        required
        autoFocus
        type="date"
        name="endDate"
        label="Oxirgi o'qigan kun"
        value={endDate}
        min={period?.startDate}
        onChange={(e) => setField("endDate", e.target.value)}
      />

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700">Ketish sababi</p>
        <Select searchable
          value={endReason}
          placeholder="Sababni tanlang"
          options={END_REASON_OPTIONS}
          onChange={(v) => setField("endReason", v)}
        />
      </div>

      <InputField
        name="reason"
        label="Izoh"
        value={reason}
        placeholder="Masalan: oila boshqa shaharga ko'chdi"
        onChange={(e) => setField("reason", e.target.value)}
      />

      <ul className="space-y-1 rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
        <li className="flex gap-2">
          <span className="text-gray-400">•</span>
          <span>Ketgan oy <b>to'liq</b> to'lanadi — proratsiya faqat kirishda</span>
        </li>
        <li className="flex gap-2">
          <span className="text-gray-400">•</span>
          <span>Keyingi oylarga hisob-faktura yozilmaydi</span>
        </li>
        <li className="flex gap-2">
          <span className="text-gray-400">•</span>
          <span>Allaqachon chiqarilgan hisob-fakturalar avtomatik bekor qilinmaydi</span>
        </li>
      </ul>

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
          Yopish
          {isLoading && "..."}
        </Button>
      </div>
    </InputGroup>
  );
};

export default CloseEnrollmentModal;
