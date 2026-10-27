// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// Components
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import Button from "@/shared/components/ui/button/Button";
import Input from "@/shared/components/ui/input/Input";
import FormRow from "./FormRow";

// Queries
import { useUpdateKioskPin } from "../queries/faceId.mutations";

/**
 * SOZLAMA PIN KODINI ALMASHTIRISH.
 *
 * ⚠️ TOKEN TIRIK QOLADI. PIN kioskdagi "Sozlamalar" ekranini qulflaydi,
 * qurilmaning o'zini emas: PIN almashtirilgan payt davomat ishlashda
 * davom etishi kerak. Qurilmani uzish — alohida amal (`revoke`).
 *
 * ⚠️ YANGI PIN KIOSKKA KEYINGI HEARTBEAT bilan yetib boradi (bir
 * daqiqa ichida). Shu paytgacha kioskda eski PIN ishlaydi — u lokal
 * keshdagi hash bilan tekshiriladi (oflayn rejim uchun). Buni ekranda
 * aytib qo'yish kerak: aks holda admin yangi PIN ishlamadi deb o'ylab
 * qaytadan almashtirib yurardi.
 */
const KioskPinModal = () => (
  <ResponsiveModal
    name="faceKioskPin"
    title="Sozlama PIN kodi"
    description="Kioskdagi «Sozlamalar» ekrani shu kod bilan ochiladi"
    className="max-w-md"
  >
    <KioskPinForm />
  </ResponsiveModal>
);

const KioskPinForm = ({ close, setIsLoading, kiosk }) => {
  const [pin, setPin] = useState("");
  const [repeat, setRepeat] = useState("");

  const { mutate: updatePin } = useUpdateKioskPin();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!/^\d{4}$/.test(pin)) return toast.error("PIN 4 raqamdan iborat bo'lishi kerak");
    if (pin !== repeat) return toast.error("Kodlar mos kelmadi");

    setIsLoading(true);
    updatePin(
      { id: kiosk.id, setupPin: pin },
      {
        onSuccess: () => {
          toast.success("PIN almashtirildi");
          close();
        },
        onError: (error) =>
          toast.error(error?.response?.data?.message || "Almashtirilmadi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-[12.5px] text-gray-600">
        <b>{kiosk?.name}</b> — {kiosk?.location || "joyi ko'rsatilmagan"}
      </p>

      <FormRow label="Yangi PIN" required>
        <Input
          autoFocus
          inputMode="numeric"
          autoComplete="off"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          placeholder="0000"
          className="max-w-28 tracking-[0.4em]"
        />
      </FormRow>

      <FormRow label="Takrorlang" required>
        <Input
          inputMode="numeric"
          autoComplete="off"
          value={repeat}
          onChange={(e) => setRepeat(e.target.value.replace(/\D/g, "").slice(0, 4))}
          placeholder="0000"
          className="max-w-28 tracking-[0.4em]"
        />
      </FormRow>

      <div className="rounded-xl bg-gray-50 px-4 py-3">
        <p className="text-[11.5px] leading-snug text-gray-600">
          Yangi kod kioskka bir daqiqa ichida yetib boradi. Shu paytgacha
          qurilmada eski kod ishlaydi — kiosk internetsiz ham PIN'ni
          tekshira olishi uchun uni o'zida saqlaydi.
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => close()}>
          Bekor qilish
        </Button>
        <Button type="submit">Almashtirish</Button>
      </div>
    </form>
  );
};

export default KioskPinModal;
