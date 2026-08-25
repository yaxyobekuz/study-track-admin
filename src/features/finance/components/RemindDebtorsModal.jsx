// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Utils
import { formatMoney } from "@/shared/utils/formatMoney";

// Queries
import { useRemindDebtors } from "../queries/finance.mutations";

/**
 * Qarzdorlarga Telegram eslatmasi.
 *
 * `openModal("remindDebtors", { students: [{ id, fullName, debt }] })`
 *
 * Bitta o'quvchiga ham, ro'yxatdagi hammaga ham shu oyna ishlatiladi —
 * farqi faqat ro'yxat uzunligida. Tasdiqlash MAJBURIY: xabar maktabdan
 * TASHQARIGA, ota-onaning telefoniga boradi va uni orqaga qaytarib
 * bo'lmaydi.
 *
 * ⚠️ Summa serverga YUBORILMAYDI. Ekran ochilgandan keyin to'lov tushgan
 * bo'lishi mumkin, shuning uchun qarz yuborish paytida qayta hisoblanadi
 * va allaqachon yopilgan qarz uchun xabar ketmaydi.
 */
const RemindDebtorsModal = () => (
  <ResponsiveModal name="remindDebtors" title="Eslatma yuborish">
    <Content />
  </ResponsiveModal>
);

// Ro'yxatda nechta ism ko'rsatiladi — qolgani "va yana N ta" bo'lib yig'iladi
const PREVIEW_LIMIT = 5;

const Content = ({ close, isLoading, setIsLoading, students = [] }) => {
  const [note, setNote] = useState("");
  const { mutate: remindDebtors } = useRemindDebtors();

  const isBulk = students.length > 1;
  const preview = students.slice(0, PREVIEW_LIMIT);
  const rest = students.length - preview.length;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (students.length === 0) return;

    setIsLoading(true);

    remindDebtors(
      { studentIds: students.map((s) => s.id), note: note.trim() },
      {
        onSuccess: (result) => {
          close();

          if (result.sentTo === 0) {
            toast.error("Hech kimga yuborilmadi — quyida sababi ko'rsatilgan");
          } else {
            toast.success(
              isBulk
                ? `${result.sentTo} ta o'quvchiga eslatma navbatga qo'shildi`
                : "Eslatma navbatga qo'shildi",
            );
          }

          // Yuborilmagan holatlar JIM QOLMAYDI: xodim kimga xabar
          // yetmaganini bilishi kerak, aks holda "yubordim" deb o'ylaydi.
          const noTelegram = result.skipped?.noTelegram ?? [];
          const noDebt = result.skipped?.noDebt ?? [];

          if (noTelegram.length > 0) {
            toast.warning(
              `Telegramga ulanmagan: ${noTelegram.slice(0, 3).join(", ")}` +
                (noTelegram.length > 3 ? ` va yana ${noTelegram.length - 3} ta` : ""),
            );
          }

          if (noDebt.length > 0) {
            toast.info(
              `Qarzi yopilgan, o'tkazib yuborildi: ${noDebt.length} ta o'quvchi`,
            );
          }
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <InputGroup onSubmit={handleSubmit} as="form">
      <p className="text-sm text-gray-600">
        {isBulk
          ? `${students.length} ta o'quvchining ota-onasiga qarz haqida Telegram xabari yuboriladi.`
          : "O'quvchining ota-onasiga qarz haqida Telegram xabari yuboriladi."}
      </p>

      {/* Kimga ketishi — bosishdan OLDIN ko'rinadi */}
      <ul className="space-y-1 rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
        {preview.map((student) => (
          <li key={student.id} className="flex justify-between gap-3">
            <span className="truncate">{student.fullName}</span>
            {student.debt != null && (
              <span className="shrink-0 font-medium text-red-600">
                {formatMoney(student.debt)}
              </span>
            )}
          </li>
        ))}
        {rest > 0 && <li className="text-gray-400">va yana {rest} ta o'quvchi</li>}
      </ul>

      <InputField
        name="note"
        label="Qo'shimcha izoh"
        value={note}
        maxLength={300}
        placeholder="Masalan: to'lovni 5-sanagacha amalga oshirishingizni so'raymiz"
        description="Ixtiyoriy. Xabar oxiriga qo'shiladi."
        onChange={(e) => setNote(e.target.value)}
      />

      <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
        Xabar darhol navbatga tushadi va bekor qilib bo'lmaydi. Qarzi
        yopilganlar va Telegramga ulanmaganlar avtomatik o'tkazib yuboriladi.
      </p>

      <div className="mt-5 flex w-full flex-col-reverse gap-3.5 xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          onClick={close}
          variant="secondary"
          className="w-full xs:w-32"
        >
          Yopish
        </Button>

        <Button className="w-full xs:w-40" disabled={isLoading}>
          Yuborish
          {isLoading && "..."}
        </Button>
      </div>
    </InputGroup>
  );
};

export default RemindDebtorsModal;
