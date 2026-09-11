// Toast
import { toast } from "sonner";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import {
  useAssignService,
  useUpdateServiceAssignment,
} from "../queries/finance.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";
import SelectSearch from "@/shared/components/ui/select/SelectSearch";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Utils & helpers
import { formatMoney } from "@/shared/utils/formatMoney";
import {
  currentMonthKey,
  inputValueToMonthKey,
  monthKeyToInputValue,
} from "@/shared/helpers/month.helpers";

// Queries
import { financeQueries } from "../queries/finance.queries";
import { classesQueries } from "@/features/classes/queries/classes.queries";

/**
 * Xizmat biriktirish — "Qo'shimcha xizmatlar" sahifasidagi o'quvchilar
 * jadvalidan ochiladi (`{ student }` bilan, o'quvchi qulflangan) yoki
 * toolbar'dan (`{}` — o'quvchi sinf orqali tanlanadi).
 *
 * Saqlangach server o'sha oyning to'lanmagan hisob-fakturasini AVTOMATIK
 * qayta hisoblaydi — xizmat summasi tarif ustiga qo'shilib qarzda ko'rinadi.
 */
const AssignServiceModal = () => (
  <ResponsiveModal name="assignService" title="Xizmat biriktirish">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, student, service }) => {
  const { mutate: assignService } = useAssignService();

  const isStudentLocked = Boolean(student?.id);

  const { serviceId, classId, studentId, customAmount, startMonth, endMonth, note, setField } =
    useObjectState({
      serviceId: service?.id ?? "",
      classId: "",
      studentId: student?.id ?? "",
      // Bo'sh = katalog narxi
      customAmount: "",
      startMonth: monthKeyToInputValue(currentMonthKey()),
      // Bo'sh = ochiq davr
      endMonth: "",
      note: "",
    });

  const { data: services = [] } = useQuery(financeQueries.serviceList({}));
  const { data: classes = [] } = useQuery(classesQueries.list());
  const { data: students = [] } = useQuery(classesQueries.students(classId));

  const selectedService = services.find((s) => s.id === serviceId) ?? null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!serviceId) return toast.error("Xizmatni tanlang");
    if (!studentId) return toast.error("O'quvchini tanlang");

    setIsLoading(true);

    assignService(
      {
        studentId,
        serviceId,
        startMonth: inputValueToMonthKey(startMonth),
        endMonth: inputValueToMonthKey(endMonth),
        customAmount: customAmount.trim(),
        note,
      },
      {
        onSuccess: () => {
          close();
          toast.success(
            "Xizmat biriktirildi — hisob-faktura avtomatik yangilanadi",
          );
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <InputGroup onSubmit={handleSubmit} as="form">
      {/* Qulflangan o'quvchi — kontekst sifatida ko'rsatiladi */}
      {isStudentLocked && (
        <div className="rounded-xl bg-gray-50 p-3 text-sm">
          <p className="text-gray-500">O'quvchi</p>
          <p className="font-medium text-gray-900">
            {student.fullName ||
              `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim()}
          </p>
        </div>
      )}

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700">Xizmat</p>
        <SelectSearch
          inline
          value={serviceId}
          placeholder="Xizmatni tanlang"
          onChange={(v) => setField("serviceId", v)}
          options={services
            .filter((s) => !s.isArchived)
            .map((s) => ({
              label: `${s.name} — ${formatMoney(s.monthlyAmount)}`,
              value: s.id,
            }))}
        />
        {services.length === 0 && (
          <p className="text-xs text-amber-700">
            Xizmat yo'q — avval katalogda xizmat yarating (masalan "Yotoqxona").
          </p>
        )}
      </div>

      {!isStudentLocked && (
        <>
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-gray-700">Sinf</p>
            <SelectSearch
              inline
              value={classId}
              placeholder="Sinfni tanlang"
              options={classes.map((c) => ({ label: c.name, value: c.id }))}
              onChange={(v) => {
                setField("classId", v);
                setField("studentId", "");
              }}
            />
          </div>

          <div className="space-y-1.5">
            <p className="text-sm font-medium text-gray-700">O'quvchi</p>
            <SelectSearch
              inline
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

      {/* Individual narx — shu o'quvchi uchun katalogdan boshqa summa */}
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
        label="Izoh"
        value={note}
        placeholder="Ixtiyoriy"
        onChange={(e) => setField("note", e.target.value)}
      />

      {selectedService && (
        <p className="text-xs text-gray-500">
          Oylik narx: <b>{formatMoney(selectedService.monthlyAmount)}</b>.
          Bu summa o'quvchining tarif narxi USTIGA qo'shiladi va qarzdorlarda
          birga ko'rinadi.
        </p>
      )}

      <p className="text-xs text-gray-500">
        "Qaysi oygacha" bo'sh qolsa — xizmat yopilguncha davom etadi.
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

/**
 * Biriktirmani tahrirlash — individual narx, tugash oyi, izoh.
 * Amaldagi yozuvda boshlanish oyi o'zgarmaydi (server rad etadi).
 */
export const EditServiceAssignmentModal = () => (
  <ResponsiveModal name="editServiceAssignment" title="Biriktirmani tahrirlash">
    <EditContent />
  </ResponsiveModal>
);

const EditContent = ({ close, isLoading, setIsLoading, assignment }) => {
  const { mutate: updateAssignment } = useUpdateServiceAssignment();

  const { customAmount, endMonth, note, setField } = useObjectState({
    customAmount: assignment?.customAmount ?? "",
    endMonth: assignment?.endMonth ? monthKeyToInputValue(assignment.endMonth) : "",
    note: assignment?.note ?? "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    updateAssignment(
      {
        id: assignment.id,
        data: {
          customAmount: String(customAmount).trim(),
          endMonth: inputValueToMonthKey(endMonth),
          note,
        },
      },
      {
        onSuccess: () => {
          close();
          toast.success("Biriktirma yangilandi — hisob-faktura avtomatik qayta hisoblanadi");
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <InputGroup onSubmit={handleSubmit} as="form">
      <div className="rounded-xl bg-gray-50 p-3 text-sm">
        <p className="text-gray-500">{assignment?.service?.name ?? "Xizmat"}</p>
        <p className="font-medium text-gray-900">
          {assignment?.student?.fullName ?? ""}
        </p>
      </div>

      <InputField
        type="number"
        name="customAmount"
        label="Individual narx (so'm)"
        value={customAmount}
        placeholder="Bo'sh qolsa — katalog narxi"
        onChange={(e) => setField("customAmount", e.target.value)}
      />

      <InputField
        type="month"
        name="endMonth"
        label="Qaysi oygacha"
        value={endMonth}
        onChange={(e) => setField("endMonth", e.target.value)}
      />

      <InputField
        name="note"
        label="Izoh"
        value={note}
        onChange={(e) => setField("note", e.target.value)}
      />

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

export default AssignServiceModal;
