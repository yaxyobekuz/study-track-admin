// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// Components
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import Button from "@/shared/components/ui/button/Button";
import Input from "@/shared/components/ui/input/Input";
import Select from "@/shared/components/ui/select/Select";
import FormRow from "./FormRow";

// Hooks
import useModal from "@/shared/hooks/useModal";
import useObjectState from "@/shared/hooks/useObjectState";

// Data & queries
import { KIOSK_MODES } from "../data/faceId.data";
import { useCreateKiosk, useUpdateKiosk } from "../queries/faceId.mutations";

/**
 * KIOSK QO'SHISH / TAHRIRLASH.
 *
 * ⚠️ YARATISHDA PIN MAJBURIY, TAHRIRLASHDA SO'RALMAYDI. PIN kioskdagi
 * "Sozlamalar" ekranini qulflaydi va uni almashtirish alohida amal
 * (`faceKioskPin`): bitta formada ikkalasi bo'lsa, nomini tuzatayotgan
 * odam PIN maydonini bo'sh qoldirib, parolni tasodifan o'chirib
 * yuborishi mumkin edi.
 *
 * ⚠️ FILIAL SO'RALMAYDI — har doim JORIY filial (server ham shunday
 * qiladi). Tanlov qo'yilsa, Chilonzorda huquqi bor xodim Yunusobodga
 * kiosk ochib qo'ya olardi: ruxsatlar har filialda alohida
 * (root `CLAUDE.md`).
 */
const KioskModal = () => (
  <ResponsiveModal
    name="faceKiosk"
    title="Kiosk"
    description="Kirish eshigidagi kompyuter — yuz bilan davomatdan o'tish uchun"
    className="max-w-lg"
  >
    <KioskForm />
  </ResponsiveModal>
);

const EMPTY = { name: "", location: "", mode: "both", note: "", setupPin: "" };

/** Tahrirlashda forma kiosk qatoridan to'ldiriladi. */
const initialFrom = (kiosk) =>
  kiosk
    ? {
        name: kiosk.name ?? "",
        location: kiosk.location ?? "",
        mode: kiosk.mode ?? "both",
        note: kiosk.note ?? "",
        setupPin: "",
      }
    : EMPTY;

const KioskForm = ({ close, setIsLoading, kiosk }) => {
  const isEdit = Boolean(kiosk?.id);
  const { state, setFields } = useObjectState(initialFrom(kiosk));
  const [syncedId, setSyncedId] = useState(kiosk?.id ?? null);
  const { openModal } = useModal();

  const create = useCreateKiosk();
  const update = useUpdateKiosk();

  /**
   * ⚠️ RENDER PAYTIDA MOSLASH, `useEffect` EMAS. Oyna bitta nusxada
   * yashaydi (`ResponsiveModal` uni qayta yaratmaydi), ya'ni boshqa
   * kiosk bilan ochilganda formani qo'lda to'ldirish kerak. Effektda
   * qilinsa eski kioskning nomi bir kadr ko'rinib ketardi — tahrirlash
   * oynasida bu "boshqa qurilmani tahrirlayapman" degan xatoga olib
   * kelishi mumkin edi.
   */
  if ((kiosk?.id ?? null) !== syncedId) {
    setSyncedId(kiosk?.id ?? null);
    setFields(initialFrom(kiosk));
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!state.name.trim()) return toast.error("Kiosk nomini kiriting");
    if (!isEdit && !/^\d{4}$/.test(state.setupPin)) {
      return toast.error("Sozlama PIN kodi 4 raqamdan iborat bo'lishi kerak");
    }

    setIsLoading(true);

    const payload = {
      name: state.name.trim(),
      location: state.location.trim(),
      mode: state.mode,
      note: state.note.trim(),
    };

    const onError = (error) =>
      toast.error(error?.response?.data?.message || "Saqlanmadi");

    if (isEdit) {
      return update.mutate(
        { id: kiosk.id, data: payload },
        {
          onSuccess: () => {
            toast.success("Kiosk saqlandi");
            close();
          },
          onError,
          onSettled: () => setIsLoading(false),
        },
      );
    }

    return create.mutate(
      { ...payload, setupPin: state.setupPin },
      {
        onSuccess: (result) => {
          close();
          // ⚠️ Kod DARHOL ko'rsatiladi: u 30 daqiqa yashaydi va bazada
          // hash bilan yotadi, ya'ni keyin qayta ko'rsatib bo'lmaydi.
          openModal("faceKioskPairingCode", { kiosk: result.kiosk, ...result });
        },
        onError,
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormRow label="Nomi" required>
        <Input
          autoFocus
          value={state.name}
          onChange={(e) => setFields({ name: e.target.value })}
          placeholder="Asosiy kirish eshigi"
          maxLength={80}
        />
      </FormRow>

      <FormRow label="Qayerda turadi">
        <Input
          value={state.location}
          onChange={(e) => setFields({ location: e.target.value })}
          placeholder="1-qavat, qo'riqchi yonida"
          maxLength={120}
        />
      </FormRow>

      <FormRow
        label="Kimni o'tkazadi"
        hint="Kirish eshigidagi kiosk ikkalasini ham, o'qituvchilar xonasidagi faqat xodimni o'tkazadi."
      >
        <Select
          value={state.mode}
          options={KIOSK_MODES}
          onChange={(mode) => setFields({ mode })}
        />
      </FormRow>

      {!isEdit && (
        <FormRow
          label="Sozlama PIN kodi"
          required
          hint="Kioskdagi «Sozlamalar» ekrani shu kod bilan ochiladi. 4 raqam."
        >
          <Input
            inputMode="numeric"
            autoComplete="off"
            value={state.setupPin}
            onChange={(e) =>
              setFields({ setupPin: e.target.value.replace(/\D/g, "").slice(0, 4) })
            }
            placeholder="0000"
            className="max-w-28 tracking-[0.4em]"
          />
        </FormRow>
      )}

      <FormRow label="Izoh">
        <Input
          value={state.note}
          onChange={(e) => setFields({ note: e.target.value })}
          placeholder="Ixtiyoriy"
          maxLength={500}
        />
      </FormRow>

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" onClick={() => close()}>
          Bekor qilish
        </Button>
        <Button type="submit">{isEdit ? "Saqlash" : "Qo'shish va kod olish"}</Button>
      </div>
    </form>
  );
};

export default KioskModal;
