// Toast
import { toast } from "sonner";

// Icons
import { Clock, Copy, KeyRound, MonitorSmartphone } from "lucide-react";

// Components
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import Button from "@/shared/components/ui/button/Button";

// Utils
import { formatTimeUz } from "@/shared/utils/date.utils";

/**
 * BIRIKTIRISH KODI — bir martalik.
 *
 * ⚠️ KOD FAQAT SHU OYNADA KO'RINADI. Bazada u HASH bilan yotadi:
 * reyestrni o'qib kiosk biriktirib olish mumkin bo'lmasligi kerak.
 * Shuning uchun "keyin ham ko'rsam bo'ladi" degan qulaylik YO'Q va
 * oyna buni matnda aytadi — yo'qotilsa yangi kod olinadi.
 *
 * ⚠️ TOAST'DA EMAS, MODALDA: odam kodni boshqa kompyuterga qo'lda
 * ko'chirib yozadi va 4 soniyada yo'qoladigan toast uni kodni qaytadan
 * so'rashga majbur qilardi (`EnrollCodeModal` bilan bir xil qaror).
 */
const PairingCodeModal = () => (
  <ResponsiveModal
    name="faceKioskPairingCode"
    title="Biriktirish kodi"
    description="Kodni kiosk dasturining birinchi ekraniga kiriting"
    className="max-w-lg"
  >
    <PairingCodeBody />
  </ResponsiveModal>
);

const PairingCodeBody = ({ close, kiosk, pairingCode, expiresAt }) => {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(pairingCode);
      toast.success("Kod nusxalandi");
    } catch {
      // ⚠️ Clipboard HTTPS siz va ba'zi brauzerlarda ishlamaydi — kod
      // ekranda baribir turadi, shuning uchun bu to'siq emas.
      toast.error("Nusxalanmadi — kodni qo'lda yozib oling");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2.5 rounded-xl bg-gray-50 px-4 py-3">
        <MonitorSmartphone className="mt-0.5 size-4 shrink-0 text-gray-500" />
        <div className="min-w-0">
          <p className="text-[12.5px] font-medium text-gray-900">{kiosk?.name}</p>
          <p className="mt-0.5 text-[11.5px] text-gray-500">
            {kiosk?.location || "Joyi ko'rsatilmagan"}
          </p>
        </div>
      </div>

      {/* ── Kodning o'zi ── */}
      <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 px-4 py-6 text-center">
        <KeyRound className="mx-auto size-5 text-primary" />
        <p className="mt-3 select-all font-mono text-[28px] font-bold tracking-[0.25em] text-gray-900">
          {pairingCode}
        </p>

        {expiresAt && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-amber-700">
            <Clock className="size-3.5" />
            {formatTimeUz(expiresAt)} gacha amal qiladi
          </p>
        )}
      </div>

      {/* ── Nima qilish kerak ── */}
      <ol className="space-y-1.5 text-[12.5px] text-gray-600">
        <li>1. Kiosk kompyuterida dasturni ishga tushiring.</li>
        <li>2. Birinchi ekranga shu kodni kiriting.</li>
        <li>
          3. Dastur filialni va sozlamani o'zi oladi — qo'lda hech narsa
          kiritish kerak emas.
        </li>
      </ol>

      <div className="rounded-xl bg-amber-50 px-4 py-3">
        <p className="text-[11.5px] leading-snug text-amber-800">
          Kod <b>bir marta</b> ishlaydi va shu oyna yopilgandan keyin qayta
          ko'rsatilmaydi — u bazada ochiq saqlanmaydi. Yo'qotilsa, kiosk
          qatoridagi kalit tugmasi bilan yangisini oling.
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={copy} className="gap-1.5">
          <Copy className="size-4" />
          Nusxalash
        </Button>
        <Button type="button" onClick={() => close()}>
          Tushunarli
        </Button>
      </div>
    </div>
  );
};

export default PairingCodeModal;
