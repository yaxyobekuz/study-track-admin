// Toast
import { toast } from "sonner";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateUz } from "@/shared/utils/date.utils";

// Components
import Input from "@/shared/components/ui/input/Input";
import Button from "@/shared/components/ui/button/Button";
import CallButton from "@/shared/components/ui/CallButton";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import { useMarkStudentAttendance } from "../queries/attendance.mutations";

// Data
import { MARK_STATUS_OPTIONS, MARK_SELECTED_COLORS } from "../data/attendance.data";

// O'quvchining sinf nomi: yozuvdagi sinf, bo'lmasa birinchi sinfi
const resolveClassName = (student, classId) => {
  const classes = Array.isArray(student?.classes) ? student.classes : [];
  const cls = classes.find((c) => c?.id === classId) || classes[0];
  return cls?.name || "—";
};

/**
 * Kunlik davomat sahifasida qatorga bosilganda ochiladigan tahrirlash oynasi.
 *
 * Belgilanmagan o'quvchi uchun ham ishlaydi — saqlash `mark` orqali yozuv
 * yaratadi yoki mavjudini yangilaydi (idempotent). Telefon raqamlari shu
 * yerda to'liq ko'rinadi: kelmagan bolaning ota-onasiga darhol qo'ng'iroq
 * qilish uchun ro'yxatdan chiqib ketish shart emas.
 *
 * ⚠️ Sabab KATEGORIYASI so'ralmaydi: holatni to'g'rilash uchun ro'yxatdan
 * nimadir tanlash shart emas, bitta IXTIYORIY izoh yetadi.
 *
 * `openModal("editStudentAttendance", { row, date })` — `row` server `row`
 * shakli (`{ student, attendance, classId }`), `date` — `YYYY-MM-DD`.
 */
const EditStudentAttendanceModal = () => (
  <ResponsiveModal name="editStudentAttendance" title="Davomatni tahrirlash">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, row, date }) => {
  const student = row?.student;
  const attendance = row?.attendance;

  // Yopilganda oyna unmount bo'ladi - har ochilishda qatordagi holat yangidan olinadi
  const { status, note, setField } = useObjectState({
    status: attendance?.status || null,
    note: attendance?.excuseReason || "",
  });

  const { mutate: save } = useMarkStudentAttendance();

  if (!student) return null;

  const handleSave = () => {
    if (!status) {
      toast.warning("Holatni tanlang");
      return;
    }
    if (!row.classId) {
      toast.warning("O'quvchining sinfi yo'q - avval sinfga biriktiring");
      return;
    }

    setIsLoading(true);
    save(
      {
        classId: row.classId,
        date,
        // Izoh ixtiyoriy va har qanday holatda yuboriladi (kategoriya yo'q)
        records: [{ studentId: student.id, status, excuseReason: note || "" }],
      },
      {
        onSuccess: () => {
          close();
          toast.success("Davomat saqlandi");
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <div className="space-y-4">
      {/* O'quvchi, sinf va sana */}
      <div className="text-sm space-y-1">
        <p className="font-semibold text-gray-900">
          {student.lastName} {student.firstName}
        </p>
        <p className="text-gray-500">
          {resolveClassName(student, row.classId)} · {formatDateUz(date)}
        </p>
      </div>

      {/* Telefon raqamlari - to'liq ko'rinishda (raqam bilan) */}
      <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">
        <p className="text-xs text-gray-500 mb-1.5">Qo&apos;ng&apos;iroq</p>
        <CallButton phone={student.phone} parentPhone={student.parentPhone} />
      </div>

      {/* Holat tugmalari */}
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700">Holat</p>
        <div className="flex flex-wrap items-center gap-2">
          {MARK_STATUS_OPTIONS.map((opt) => {
            const selected = status === opt.value;
            return (
              <Button
                key={opt.value}
                type="button"
                variant="outline"
                onClick={() => setField("status", opt.value)}
                className={cn(
                  selected &&
                    cn(
                      MARK_SELECTED_COLORS[opt.value],
                      "border-transparent shadow-sm",
                    ),
                )}
              >
                {opt.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Izoh — IXTIYORIY va har qanday holatda ochiq */}
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700">
          Izoh <span className="font-normal text-gray-400">(ixtiyoriy)</span>
        </p>
        <Input
          value={note}
          maxLength={300}
          placeholder="Masalan: kechikib keldi, ota-onasi ogohlantirdi"
          onChange={(e) => setField("note", e.target.value)}
        />
      </div>

      <div className="flex flex-col-reverse gap-4 xs:flex-row xs:justify-end">
        <Button
          type="button"
          onClick={close}
          variant="secondary"
          className="w-full xs:w-28"
        >
          Bekor qilish
        </Button>

        <Button
          type="button"
          disabled={isLoading}
          onClick={handleSave}
          className="w-full xs:w-28"
        >
          {isLoading ? "Saqlanmoqda..." : "Saqlash"}
        </Button>
      </div>
    </div>
  );
};

export default EditStudentAttendanceModal;
