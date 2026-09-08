// Toaster
import { toast } from "sonner";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import SelectField from "@/shared/components/ui/select/SelectField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Queries
import { myAttendanceQueries } from "../queries/myAttendance.queries";
import { useCreateMyExcuse } from "../queries/myAttendance.mutations";

/** Bugungi kun — `<input type="date">` uchun ISO qiymat (format emas). */
const todayInputValue = () => new Date().toISOString().split("T")[0];

const MyExcuseRequestModal = () => (
  <ResponsiveModal name="myExcuseRequest" title="Uzrli yo'qlik so'rovi">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close }) => {
  const { date, absenceReason, reason, setField, resetState } = useObjectState({
    date: "",
    absenceReason: "",
    reason: "",
  });

  const { data: reasons = [], isLoading } = useQuery(
    myAttendanceQueries.absenceReasons(),
  );
  const createExcuse = useCreateMyExcuse();

  const reasonOptions = reasons.map((item) => ({
    label: item.title,
    value: item.id,
  }));

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!date) return toast.warning("Sanani tanlang");
    if (!absenceReason) return toast.warning("Sababni tanlang");

    // Kelasi kun uchun — oldindan, o'tgan yoki bugun uchun — keyindan.
    // Chegara SANADA: ikkalasi ham `@db.Date`, ya'ni ISO satrlarni
    // taqqoslash yetarli va vaqt mintaqasi aralashmaydi.
    const type = date > todayInputValue() ? "advance" : "after";

    createExcuse.mutate(
      { date, absenceReason, reason, type },
      {
        onSuccess: () => {
          toast.success("So'rov yuborildi");
          resetState();
          close?.();
        },
        onError: (error) =>
          toast.error(error?.response?.data?.message || "Xatolik yuz berdi"),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField
        required
        type="date"
        label="Sana"
        name="excuseDate"
        value={date}
        onChange={(event) => setField("date", event.target.value)}
      />

      {!isLoading && reasonOptions.length === 0 ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          Sizning rolingiz uchun kelmaslik sabablari kiritilmagan. Davomat
          bo&apos;limidagi &laquo;Kelmaslik sabablari&raquo; ro&apos;yxatiga shu
          rol qo&apos;shilishi kerak.
        </p>
      ) : (
        <SelectField
          required
          label="Sabab"
          name="absenceReason"
          isLoading={isLoading}
          value={absenceReason}
          options={reasonOptions}
          placeholder="Sababni tanlang"
          onChange={(value) => setField("absenceReason", value)}
        />
      )}

      <InputField
        type="textarea"
        maxLength={500}
        value={reason}
        name="excuseNote"
        label="Qo'shimcha izoh (ixtiyoriy)"
        onChange={(event) => setField("reason", event.target.value)}
        description={
          <span className="block text-right text-xs text-gray-400">
            {reason.length}/500
          </span>
        }
      />

      <Button
        className="w-full"
        disabled={createExcuse.isPending || reasonOptions.length === 0}
      >
        Yuborish{createExcuse.isPending && "..."}
      </Button>
    </form>
  );
};

export default MyExcuseRequestModal;
