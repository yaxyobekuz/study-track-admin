// Toast
import { toast } from "sonner";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import {
  useAssignDiscount,
  useBulkAssignDiscount,
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

// Data & queries
import { DISCOUNT_RULES_HINT } from "../data/finance.data";
import { financeQueries } from "../queries/finance.queries";
import { classesQueries } from "@/features/classes/queries/classes.queries";

const SCOPE_OPTIONS = [
  { label: "Bitta o'quvchi", value: "student" },
  { label: "Butun sinf", value: "class" },
];

/**
 * O'quvchiga chegirma biriktirish.
 *
 * Ikki joydan ochiladi: "Chegirmalar" tabidan (chegirma oldindan
 * tanlangan) va o'quvchi kartasidan (o'quvchi oldindan tanlangan) —
 * shuning uchun `discount` ham, `student` ham ixtiyoriy.
 *
 * Server bir xil chegirmani bir davrga ikki marta biriktirishga yo'l
 * qo'ymaydi va "yakka" (grant) chegirmalarni boshqalari bilan
 * aralashtirmaydi — xato xabari to'g'ridan-to'g'ri ko'rsatiladi.
 */
const AssignDiscountModal = () => (
  <ResponsiveModal name="assignDiscount" title="Chegirma biriktirish">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, discount, student }) => {
  const { mutate: assignDiscount } = useAssignDiscount();
  const { mutate: bulkAssign } = useBulkAssignDiscount();

  const isStudentLocked = Boolean(student?.id);

  const { scope, discountId, classId, studentId, startMonth, endMonth, note, setField } =
    useObjectState({
      scope: "student",
      discountId: discount?.id ?? "",
      classId: "",
      studentId: student?.id ?? "",
      startMonth: monthKeyToInputValue(currentMonthKey()),
      // Bo'sh = butun o'qish davri
      endMonth: "",
      note: "",
    });

  const { data: discounts = [] } = useQuery(financeQueries.assignableDiscounts());
  const { data: classes = [] } = useQuery(classesQueries.list());
  const { data: students = [] } = useQuery(classesQueries.students(classId));

  const handleError = (err) =>
    toast.error(err.response?.data?.message || "Xatolik yuz berdi");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!discountId) return toast.error("Chegirmani tanlang");
    if (scope === "student" && !studentId) return toast.error("O'quvchini tanlang");
    if (scope === "class" && !classId) return toast.error("Sinfni tanlang");

    setIsLoading(true);

    const payload = {
      discountId,
      startMonth: inputValueToMonthKey(startMonth),
      endMonth: inputValueToMonthKey(endMonth),
      note,
    };

    const onSuccess = (result, message) => {
      close();
      toast.success(message);
      // Chiqarilgan hisob-faktura arzonlashmaydi — buni admin bilishi kerak
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

    assignDiscount(
      { ...payload, studentId },
      {
        onSuccess: (result) => onSuccess(result, "Chegirma biriktirildi"),
        onError: handleError,
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <InputGroup onSubmit={handleSubmit} as="form">
      {student && (
        <div className="rounded-xl bg-gray-50 p-3 text-sm">
          <p className="text-gray-500">O'quvchi</p>
          <p className="font-medium text-gray-900">
            {student.fullName || student.studentName}
          </p>
        </div>
      )}

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700">Chegirma</p>
        <SelectSearch
          value={discountId}
          placeholder="Chegirmani tanlang"
          onChange={(v) => setField("discountId", v)}
          options={discounts.map((d) => ({
            label: `${d.name} — ${d.valueLabel}`,
            value: d.id,
          }))}
        />
      </div>

      {!isStudentLocked && (
        <>
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
        </>
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

      <InputField
        name="note"
        label="Izoh"
        value={note}
        placeholder="Masalan: direktor ruxsati bilan"
        onChange={(e) => setField("note", e.target.value)}
      />

      <p className="text-xs text-gray-500">
        "Qaysi oygacha" bo'sh qolsa — chegirma butun o'qish davriga amal qiladi.{" "}
        {DISCOUNT_RULES_HINT}
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
          Biriktirish
          {isLoading && "..."}
        </Button>
      </div>
    </InputGroup>
  );
};

export default AssignDiscountModal;
