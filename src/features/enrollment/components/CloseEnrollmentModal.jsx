// Toast
import { toast } from "sonner";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import { useCloseEnrollment } from "../queries/enrollment.mutations";

// Components
import EnrollmentInvoiceImpact from "./EnrollmentInvoiceImpact";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Utils
import { formatDateUz, todayInputValue } from "@/shared/utils/date.utils";

// Helpers
import { notifyInvoiceImpact } from "../helpers/invoiceImpact.helpers";

// Data
import { END_REASON_OPTIONS } from "../data/enrollment.data";

/**
 * O'qish davrini yopish — "o'quvchi maktabdan ketdi".
 *
 * Ketgan oy TO'LIQ to'lanadi (proratsiya faqat kirishda), keyingi oylarga
 * esa hisob-faktura yozilmaydi — allaqachon yozilgani server tomonida bekor
 * qilinadi. Qaysi oy to'lanishi va nima bekor bo'lishi bosishdan OLDIN
 * ko'rsatiladi (`EnrollmentInvoiceImpact`).
 *
 * Ikki joydan ochiladi — profil ("O'qish davrlari") va kunlik davomat
 * (profilga kirmasdan). Davomatdan ochilganda kimning davri yopilayotgani
 * ko'rinishi uchun `student` beriladi, davomatdagi izoh (masalan "boshqa
 * maktabga o'tyapti") esa `note` bilan izohga oldindan yoziladi.
 *
 * `openModal("closeEnrollment", { period, student?, note? })`
 * — `period`: `{ id, startDate }` (YYYY-MM-DD);
 * — `student`: `{ firstName, lastName, classes? }`.
 */
const CloseEnrollmentModal = () => (
  <ResponsiveModal name="closeEnrollment" title="O'qish davrini yopish">
    <Content />
  </ResponsiveModal>
);

/** "9-A, 10-B" — sinflar bo'lmasa bo'sh. */
const formatClassNames = (classes) =>
  (Array.isArray(classes) ? classes : [])
    .map((cls) => cls?.name)
    .filter(Boolean)
    .join(", ");

const Content = ({ close, isLoading, setIsLoading, period, student, note }) => {
  const { mutate: closeEnrollment } = useCloseEnrollment();

  const { endDate, endReason, reason, setField } = useObjectState({
    endDate: todayInputValue(),
    endReason: "",
    reason: note?.trim() || "",
  });

  const classNames = formatClassNames(student?.classes);

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
          notifyInvoiceImpact(result?.invoiceImpact);
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
      {(student || period) && (
        <div className="space-y-2 rounded-xl bg-gray-50 p-3 text-sm">
          {student && (
            <div>
              <p className="font-semibold text-gray-900">
                {student.lastName} {student.firstName}
              </p>
              {classNames && <p className="text-gray-500">{classNames}</p>}
            </div>
          )}

          {period && (
            <div>
              <p className="text-gray-500">Davr boshlangan</p>
              <p className="font-medium text-gray-900">
                {formatDateUz(period.startDate)}
              </p>
            </div>
          )}
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
        description="Shu kun tushgan oy to'liq to'lanadi"
        onChange={(e) => setField("endDate", e.target.value)}
      />

      {period && (
        <EnrollmentInvoiceImpact
          periodId={period.id}
          endDate={endDate}
          onPickEndDate={(value) => setField("endDate", value)}
        />
      )}

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
          <span>
            Keyingi oylarga hisob-faktura yozilmaydi, allaqachon chiqarilgani
            bekor qilinadi — to'langan pul depozitga qaytadi
          </span>
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
