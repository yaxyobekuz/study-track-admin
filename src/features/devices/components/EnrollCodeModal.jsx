// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import { Copy, KeyRound, ShieldCheck } from "lucide-react";

// Components
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import Button from "@/shared/components/ui/button/Button";
import StudentPicker from "./StudentPicker";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatTimeUz } from "@/shared/utils/date.utils";

// Tokens & queries
import { SURFACE, T } from "../data/guard.tokens";
import { useIssueEnrollmentCode } from "../queries/devices.mutations";

/**
 * QURILMA BIRIKTIRISH — bir martalik kod.
 *
 * ⚠️ BIRIKTIRISH IKKI TOMONLAMA IMZO va oyna buni MATNDA AYTADI:
 * kodni katta odam beradi, telefonga esa o'quvchining o'zi kiritadi.
 * Masofadan, bola bilmagan holda qurilma biriktirib bo'lmaydi
 * (`devices.md` §0.4) — bu cheklov emas, modulning asosi, shuning
 * uchun u ekranda tushuntiriladi.
 *
 * ⚠️ KOD BIR MARTA KO'RSATILADI va keshga yozilmaydi: u qisqa
 * muddatli. Nusxa olish tugmasi shu sababli — admin uni telefonga
 * yozib berishi yoki aytishi kerak.
 */
const EnrollCodeModal = () => (
  <ResponsiveModal
    name="deviceEnrollCode"
    title="Qurilma biriktirish"
    description="O'quvchiga bir martalik kod bering — u kodni o'z telefonidagi MBSI ilovasiga kiritadi."
    className="max-w-lg"
  >
    <EnrollCodeForm />
  </ResponsiveModal>
);

const EnrollCodeForm = ({ close, setIsLoading }) => {
  const [studentIds, setStudentIds] = useState([]);
  const [issued, setIssued] = useState(null);

  const { mutate: issueCode } = useIssueEnrollmentCode();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (studentIds.length === 0) return toast.error("O'quvchini tanlang");

    setIsLoading(true);
    issueCode(studentIds[0], {
      onSuccess: (data) => setIssued(data),
      onError: (err) => toast.error(err.response?.data?.message || "Kod berilmadi"),
      onSettled: () => setIsLoading(false),
    });
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(issued.code);
      toast.success("Kod nusxalandi");
    } catch {
      // ⚠️ Clipboard HTTPS siz va ba'zi brauzerlarda ishlamaydi — kod
      // baribir ekranda katta harflar bilan turadi, shuning uchun bu
      // xato emas, shunchaki qo'shimcha qulaylik.
      toast.error("Nusxalab bo'lmadi — kodni ekrandan o'qing");
    }
  };

  if (issued) {
    return (
      <div className="space-y-4">
        <div className={cn(SURFACE.inset, "px-4 py-5 text-center")}>
          <p className={T.label}>Bir martalik kod</p>
          <p className="mt-2 font-mono text-[34px] font-semibold tracking-[0.2em] text-slate-900">
            {issued.code}
          </p>
          <p className={cn(T.hint, "mt-2")}>
            {formatTimeUz(issued.expiresAt)} gacha amal qiladi
          </p>
        </div>

        <ol className="space-y-2 text-[12.5px] leading-relaxed text-slate-600">
          <li>1. O'quvchi o'z telefonidagi MBSI ilovasiga kiradi.</li>
          <li>2. «Qurilmani biriktirish» bo'limiga o'tib shu kodni kiritadi.</li>
          <li>
            3. Ilova telefonda maxsus ruxsat so'raydi — ruxsat berilgach panelda
            «Himoyada» bo'lib ko'rinadi.
          </li>
        </ol>

        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={copy}>
            <Copy className="size-4" />
            Nusxalash
          </Button>
          <Button type="button" className="flex-1" onClick={() => close()}>
            Yopish
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-start gap-2.5 rounded-xl bg-sky-50 px-3.5 py-3">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-sky-600" strokeWidth={2} />
        <p className="text-[12px] leading-relaxed text-sky-900">
          Kodni siz berasiz, telefonga esa o'quvchining o'zi kiritadi. Shuning
          uchun qurilma bola bilmagan holda biriktirilmaydi.
        </p>
      </div>

      <div>
        <p className={cn(T.label, "mb-1.5")}>O'quvchi</p>
        <StudentPicker value={studentIds} onChange={setStudentIds} />
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={() => close()}>
          Bekor qilish
        </Button>
        <Button type="submit" className="flex-1" disabled={studentIds.length === 0}>
          <KeyRound className="size-4" />
          Kod berish
        </Button>
      </div>
    </form>
  );
};

export default EnrollCodeModal;
