// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// Components
import Button from "@/shared/components/ui/button/Button";
import Input from "@/shared/components/ui/input/Input";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Mutations
import { useCancelAttendance } from "../queries/attendance.mutations";

// Data & utils
import { STATUS_LABELS } from "../data/attendance.data";
import { formatDateUz, formatTimeUz } from "@/shared/utils/date.utils";

/**
 * XODIM DAVOMATINI BEKOR QILISH.
 *
 * ⚠️ Bu "holatni to'g'rilash" EMAS: kun BUTUNLAY o'chadi va xodim o'sha
 * kuni hech qachon belgilanmagandek bo'ladi. Kiosk begona odamni tanigan,
 * xodim boshqa filialda bo'lgan yoki "Men keldim" bexosdan bosilgan kunni
 * "keldi" ham, "kelmadi" ham deb qo'yib bo'lmaydi — ikkalasi ham yolg'on
 * fakt bo'lardi.
 *
 * Oqibatlari ro'yxat bilan OLDINDAN aytiladi: ish vaqti yo'qoladi,
 * kelmagan kun ayirmasi qaytadi va o'sha kungi davomat jarimasi bekor
 * qilinadi. Sabab MAJBURIY — qator o'chgandan keyin "nega bu kun bo'sh"
 * degan savolga javob faqat shu matnda qoladi.
 *
 * `openModal("cancelAttendance", { user, date, status, checkIn, checkOut })`
 */
const CancelAttendanceModal = () => (
  <ResponsiveModal
    name="cancelAttendance"
    title="Davomatni bekor qilish"
    description="Kun belgilanmagan holatiga qaytadi — ish vaqti hisoblanmaydi"
    className="max-w-md"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({
  close,
  isLoading,
  setIsLoading,
  user = null,
  date = null,
  status = null,
  checkIn = null,
  checkOut = null,
}) => {
  const [reason, setReason] = useState("");
  const { mutateAsync: cancelAttendance } = useCancelAttendance();

  const submit = async (event) => {
    event.preventDefault();

    const clean = reason.trim();
    if (!clean) return toast.error("Bekor qilish sababini yozing");

    setIsLoading(true);
    try {
      await cancelAttendance({
        userId: user.id,
        data: { date, reason: clean },
      });
      toast.success("Davomat bekor qilindi");
      close();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Bekor qilib bo'lmadi",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const name = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
  const times = [
    checkIn && `keldi ${formatTimeUz(checkIn)}`,
    checkOut && `ketdi ${formatTimeUz(checkOut)}`,
  ].filter(Boolean);

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="rounded-xl bg-gray-50 px-3 py-2.5 text-sm">
        <p className="font-medium text-gray-900">{name || "Xodim"}</p>
        <p className="mt-0.5 text-gray-500">
          {formatDateUz(date)}
          {status && ` · ${STATUS_LABELS[status] || status}`}
          {times.length > 0 && ` · ${times.join(", ")}`}
        </p>
      </div>

      {/* Oqibatlari OLDINDAN — bosilgandan keyin emas */}
      <ul className="space-y-1 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
        <li>· Bu kun uchun ish vaqti hisoblanmaydi</li>
        <li>· Kelmagan kun uchun oylikdan ayirma qaytariladi</li>
        <li>· Shu kungi davomat jarimasi bekor qilinadi, ball qaytadi</li>
        <li>· Xodim yana &quot;Men keldim&quot; tugmasini bosa oladi</li>
      </ul>

      <div className="space-y-1.5">
        <label htmlFor="reason" className="text-sm font-medium text-gray-700">
          Sabab <span className="text-red-500">*</span>
        </label>
        <Input
          id="reason"
          name="reason"
          type="textarea"
          value={reason}
          maxLength={300}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Masalan: kiosk boshqa odamni tanidi"
          className="min-h-20"
        />
      </div>

      <div className="flex gap-2.5">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={close}
        >
          Yopish
        </Button>
        <Button
          type="submit"
          variant="destructive"
          className="flex-1"
          disabled={isLoading}
        >
          Bekor qilish
        </Button>
      </div>
    </form>
  );
};

export default CancelAttendanceModal;
