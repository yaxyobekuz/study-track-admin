// Toast
import { toast } from "sonner";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import { useChangeAssignmentTariff } from "../queries/finance.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";
import SelectSearch from "@/shared/components/ui/select/SelectSearch";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Helpers
import {
  currentMonthKey,
  formatMonthKey,
  inputValueToMonthKey,
  monthKeyToInputValue,
  prevMonthKey,
} from "@/shared/helpers/month.helpers";

// Queries
import { financeQueries } from "../queries/finance.queries";

/**
 * O'quvchining tarifini almashtirish.
 *
 * Server buni bitta tranzaksiyada bajaradi: eskisi `fromMonth - 1` da
 * yopiladi, yangisi `fromMonth` dan ochiladi. Ikki alohida so'rov qilinsa,
 * oraliqda o'quvchi tarifsiz qolib ketardi.
 *
 * Boshlanish oyi JORIY oy ham bo'la oladi — chegara o'tgan oyda. Joriy oy
 * hisob-fakturasi allaqachon shakllangan bo'lsa, u muhrlangan bo'lib qoladi
 * va server ogohlantirish qaytaradi (uni qayta shakllantirish kerak).
 */
const ChangeStudentTariffModal = () => (
  <ResponsiveModal name="changeStudentTariff" title="Tarifni almashtirish">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, assignment }) => {
  const { mutate: changeTariff } = useChangeAssignmentTariff();
  const { data: tariffs = [] } = useQuery(financeQueries.assignableTariffs());

  const { tariffId, fromMonth, customAmount, note, setField } = useObjectState({
    tariffId: "",
    // Odatda tarif joriy oydan almashtiriladi — narx bugun kelishiladi.
    // O'tgan oy yopiq (server ham shuni talab qiladi): u yerdagi
    // hisob-fakturalar muhrlangan fakt.
    fromMonth: monthKeyToInputValue(currentMonthKey()),
    // Individual (maxsus) narx — bo'sh bo'lsa yangi tarif katalog narxi
    customAmount: "",
    note: "",
  });

  const fromMonthKey = inputValueToMonthKey(fromMonth);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!assignment) return;
    if (!tariffId) return toast.error("Yangi tarifni tanlang");

    setIsLoading(true);

    changeTariff(
      {
        id: assignment.id,
        data: {
          tariffId,
          fromMonth: fromMonthKey,
          customAmount: customAmount.trim(),
          note,
        },
      },
      {
        onSuccess: (result) => {
          close();
          toast.success("Tarif almashtirildi");
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
      {assignment && (
        <div className="rounded-xl bg-gray-50 p-3 text-sm">
          <p className="text-gray-500">
            {assignment.student
              ? `${assignment.student.firstName} ${assignment.student.lastName ?? ""}`.trim()
              : "O'quvchi"}
          </p>
          <p className="font-medium text-gray-900">
            Joriy tarif: {assignment.tariff?.name ?? "—"}
          </p>
        </div>
      )}

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700">Yangi tarif</p>
        <SelectSearch
          inline
          value={tariffId}
          placeholder="Tarifni tanlang"
          onChange={(v) => setField("tariffId", v)}
          options={tariffs
            .filter((t) => t.id !== assignment?.tariffId)
            .map((t) => ({ label: t.name, value: t.id }))}
        />
      </div>

      <InputField
        required
        type="month"
        name="fromMonth"
        label="Qaysi oydan"
        value={fromMonth}
        min={monthKeyToInputValue(currentMonthKey())}
        onChange={(e) => setField("fromMonth", e.target.value)}
      />

      {/* Individual narx — bu o'quvchi uchun katalog narxidan farqli doimiy
          summa. Bo'sh qolsa yangi tarifning katalog narxi ishlaydi. */}
      <InputField
        type="number"
        name="customAmount"
        label="Individual narx (so'm)"
        value={customAmount}
        placeholder="Bo'sh qolsa — katalog narxi"
        onChange={(e) => setField("customAmount", e.target.value)}
      />

      <InputField
        name="note"
        value={note}
        label="Izoh"
        placeholder="Ixtiyoriy"
        onChange={(e) => setField("note", e.target.value)}
      />

      {fromMonthKey && (
        <p className="text-xs text-gray-500">
          {fromMonthKey === assignment?.startMonth
            ? // Eskisiga birorta oy qolmaydi — u yopilmaydi, almashtiriladi.
              `Joriy tarif ${formatMonthKey(fromMonthKey)} oyidan boshlab butunlay yangisiga almashtiriladi.`
            : `Joriy tarif ${formatMonthKey(prevMonthKey(fromMonthKey))} oyida yopiladi, yangisi ${formatMonthKey(fromMonthKey)} oyidan boshlanadi.`}
        </p>
      )}

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
          Almashtirish
          {isLoading && "..."}
        </Button>
      </div>
    </InputGroup>
  );
};

export default ChangeStudentTariffModal;
