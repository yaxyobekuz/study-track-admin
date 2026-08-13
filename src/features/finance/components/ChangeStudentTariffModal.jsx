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
  nextMonthKey,
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
 */
const ChangeStudentTariffModal = () => (
  <ResponsiveModal name="changeStudentTariff" title="Tarifni almashtirish">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, assignment }) => {
  const { mutate: changeTariff } = useChangeAssignmentTariff();
  const { data: tariffs = [] } = useQuery(financeQueries.assignableTariffs());

  const { tariffId, fromMonth, note, setField } = useObjectState({
    tariffId: "",
    // Almashtirish faqat kelajakdagi oydan boshlanadi — o'tgan davrni
    // kesib tashlamaslik uchun (server ham shuni talab qiladi).
    fromMonth: monthKeyToInputValue(nextMonthKey(currentMonthKey())),
    note: "",
  });

  const fromMonthKey = inputValueToMonthKey(fromMonth);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!assignment) return;
    if (!tariffId) return toast.error("Yangi tarifni tanlang");

    setIsLoading(true);

    changeTariff(
      { id: assignment.id, data: { tariffId, fromMonth: fromMonthKey, note } },
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
        onChange={(e) => setField("fromMonth", e.target.value)}
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
          Joriy tarif {formatMonthKey(prevMonthKey(fromMonthKey))} oyida
          yopiladi, yangisi {formatMonthKey(fromMonthKey)} oyidan boshlanadi.
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
