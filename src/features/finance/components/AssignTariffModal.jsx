// Toast
import { toast } from "sonner";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import {
  useAssignTariff,
  useBulkAssignTariff,
} from "../queries/finance.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import SelectSearch from "@/shared/components/ui/select/SelectSearch";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Helpers
import {
  currentMonthKey,
  inputValueToMonthKey,
  monthKeyToInputValue,
} from "@/shared/helpers/month.helpers";

// Queries
import { classesQueries } from "@/features/classes/queries/classes.queries";

const SCOPE_OPTIONS = [
  { label: "Bitta o'quvchi", value: "student" },
  { label: "Butun sinf", value: "class" },
];

/**
 * Tarifga o'quvchi biriktirish — tarif detalidan ochiladi, shuning uchun
 * tarifning o'zi tanlanmaydi (`tariff` modal ma'lumoti bilan keladi).
 *
 * Ommaviy biriktirishda bitta o'quvchidagi xato butun paketni to'xtatmaydi:
 * server `skipped` ro'yxatini qaytaradi va u foydalanuvchiga ko'rsatiladi.
 */
const AssignTariffModal = () => (
  <ResponsiveModal name="assignTariff" title="O'quvchi biriktirish">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, tariff }) => {
  const { mutate: assignTariff } = useAssignTariff();
  const { mutate: bulkAssign } = useBulkAssignTariff();

  const { scope, classId, studentId, startMonth, endMonth, setField } =
    useObjectState({
      scope: "student",
      classId: "",
      studentId: "",
      startMonth: monthKeyToInputValue(currentMonthKey()),
      // Bo'sh = butun o'qish davri
      endMonth: "",
    });

  const { data: classes = [] } = useQuery(classesQueries.list());
  const { data: students = [] } = useQuery(classesQueries.students(classId));

  const handleError = (err) =>
    toast.error(err.response?.data?.message || "Xatolik yuz berdi");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!tariff) return;

    if (scope === "student" && !studentId)
      return toast.error("O'quvchini tanlang");
    if (scope === "class" && !classId) return toast.error("Sinfni tanlang");

    setIsLoading(true);

    const payload = {
      tariffId: tariff.id,
      startMonth: inputValueToMonthKey(startMonth),
      endMonth: inputValueToMonthKey(endMonth),
    };

    const onSuccess = (result, message) => {
      close();
      toast.success(message);
      // Narx belgilanmagan bo'lsa — bloklamaymiz, ogohlantiramiz
      result?.warnings?.forEach((warning) => toast.warning(warning));
    };

    if (scope === "class") {
      bulkAssign(
        { ...payload, classId },
        {
          onSuccess: (result) => {
            const created = result?.created?.length ?? 0;
            const skipped = result?.skipped?.length ?? 0;
            onSuccess(
              result,
              skipped
                ? `${created} ta o'quvchiga biriktirildi, ${skipped} tasi o'tkazib yuborildi`
                : `${created} ta o'quvchiga biriktirildi`,
            );
          },
          onError: handleError,
          onSettled: () => setIsLoading(false),
        },
      );
      return;
    }

    assignTariff(
      { ...payload, studentId },
      {
        onSuccess: (result) => onSuccess(result, "Tarif biriktirildi"),
        onError: handleError,
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <InputGroup onSubmit={handleSubmit} as="form">
      {tariff && (
        <div className="rounded-xl bg-gray-50 p-3 text-sm">
          <p className="text-gray-500">Tarif</p>
          <p className="font-medium text-gray-900">{tariff.name}</p>
        </div>
      )}

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
          value={classId}
          placeholder="Sinfni tanlang"
          options={classes.map((c) => ({ label: c.name, value: c.id }))}
          onChange={(v) => {
            setField("classId", v);
            setField("studentId", "");
          }}
        />
      </div>

      {scope === "student" && (
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-gray-700">O'quvchi</p>
          <SelectSearch
            value={studentId}
            disabled={!classId}
            placeholder={classId ? "O'quvchini tanlang" : "Avval sinfni tanlang"}
            onChange={(v) => setField("studentId", v)}
            options={students.map((s) => ({
              label: `${s.firstName} ${s.lastName ?? ""}`.trim(),
              value: s.id,
            }))}
          />
        </div>
      )}

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

      <p className="text-xs text-gray-500">
        "Qaysi oygacha" bo'sh qolsa — tarif butun o'qish davriga biriktiriladi.
        Bitta oy uchun ikkala maydonga bir xil oy tanlang.
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
          Biriktirish
          {isLoading && "..."}
        </Button>
      </div>
    </InputGroup>
  );
};

export default AssignTariffModal;
