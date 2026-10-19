// React
import { useState } from "react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Toast
import { toast } from "sonner";

// Components
import Input from "@/shared/components/ui/input/Input";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import StudentPicker from "./StudentPicker";

// Queries & data
import { certificatesQueries } from "../queries/certificates.queries";
import {
  useCreateCertificatePlan,
  useUpdateCertificatePlan,
} from "../queries/certificates.mutations";
import { dueToInputValue } from "../data/certificates.data";

/**
 * REJA QO'SHISH / TAHRIRLASH.
 *
 * Muddat surilishi ham, yo'nalishning o'zgarishi ham ODATIY hol: o'quvchi
 * formani to'ldirgandan keyin fikri aniqlashadi.
 *
 * ⚠️ YO'NALISH O'ZGARTIRILSA SERVER YANGI QATOR yozadi, eskisi esa
 * "almashtirilgan" bo'lib registrda QOLADI — "o'quvchi IELTS ni
 * rejalashtirgan edi" degan fakt yo'qolmaydi va ayni faylni qayta yuklash
 * tuzatilgan yo'nalishni qayta tiklamaydi. Oyna buni oldindan aytadi.
 *
 * ⚠️ YANGI REJA `openModal("certificatePlan", { plan: null })` BILAN
 * ochiladi, ma'lumotsiz EMAS. Modal holati `openModal(name)` ni
 * ma'lumotsiz chaqirganda AVVALGISINI saqlaydi (`ModalProvider` izohi):
 * tahrirdan keyin "Reja qo'shish" bosilsa, oyna eski o'quvchi va yo'nalish
 * bilan, tahrirlab bo'lmaydigan holatda ochilardi.
 *
 * `openModal("certificatePlan", { plan })` — tahrirlash.
 */
const CertificatePlanModal = () => (
  <ResponsiveModal
    name="certificatePlan"
    title="Sertifikat rejasi"
    description="O'quvchi qaysi sertifikatni qachon topshirmoqchi"
    className="max-w-lg"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, plan = null }) => {
  const isEdit = Boolean(plan);

  const { data: tracks = [] } = useQuery(certificatesQueries.tracks());
  const { mutateAsync: createPlan } = useCreateCertificatePlan();
  const { mutateAsync: updatePlan } = useUpdateCertificatePlan();

  const [student, setStudent] = useState(plan?.student ?? null);
  const [trackId, setTrackId] = useState(plan?.track?.id ?? "");
  const [dueDate, setDueDate] = useState(dueToInputValue(plan?.dueDate));
  const [note, setNote] = useState(plan?.note ?? "");

  const trackChanged = isEdit && trackId !== plan.track?.id;

  const trackOptions = tracks.map((track) => ({
    value: track.id,
    label: track.subject ? `${track.name} · ${track.subject.name}` : track.name,
  }));

  const submit = async (event) => {
    event.preventDefault();

    if (!isEdit && !student) return toast.error("O'quvchini tanlang");
    if (!trackId) return toast.error("Yo'nalishni tanlang");

    setIsLoading(true);
    try {
      const payload = {
        trackId,
        // Muddat bo'sh qoldirilsa — "aniq sanani bilmayman" holati
        dueDate: dueDate || null,
        note: note.trim() || null,
      };

      if (isEdit) {
        await updatePlan({ id: plan.id, ...payload });
        toast.success(trackChanged ? "Yo'nalish almashtirildi" : "Reja yangilandi");
      } else {
        await createPlan({ studentId: student.id, ...payload });
        toast.success("Reja qo'shildi");
      }

      close();
    } catch (error) {
      toast.error(error.response?.data?.message || "Rejani saqlab bo'lmadi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">O'quvchi</label>
        {isEdit ? (
          <p className="rounded-xl bg-gray-50 px-3 py-2.5 text-sm text-gray-900">
            {plan.student?.fullName || "—"}
            {plan.student?.classes?.length > 0 && (
              <span className="text-gray-500">
                {" · "}
                {plan.student.classes.map((cls) => cls.name).join(", ")}
              </span>
            )}
          </p>
        ) : (
          <StudentPicker value={student} onChange={setStudent} />
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Yo'nalish</label>
        <Select
          name="trackId"
          value={trackId}
          onChange={setTrackId}
          options={trackOptions}
          placeholder="Sertifikat yo'nalishi"
          triggerClassName="w-full"
        />
        {trackChanged && (
          <p className="text-xs text-amber-700">
            Yo'nalish o'zgardi: yangi reja yoziladi, "{plan.track?.name}"
            esa registrda almashtirilgan bo'lib qoladi.
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="dueDate" className="text-sm font-medium text-gray-700">
          Topshirish muddati
        </label>
        <Input
          id="dueDate"
          name="dueDate"
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
        />
        <p className="text-xs text-gray-500">
          Bo'sh qoldirilsa — "muddati aniq emas" bo'lib ko'rinadi.
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="note" className="text-sm font-medium text-gray-700">
          Izoh
        </label>
        <Input
          id="note"
          name="note"
          type="textarea"
          value={note}
          maxLength={500}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Ixtiyoriy"
          className="min-h-20"
        />
      </div>

      <div className="flex gap-2.5">
        <Button type="button" variant="outline" className="flex-1" onClick={close}>
          Bekor qilish
        </Button>
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isEdit ? "Saqlash" : "Qo'shish"}
        </Button>
      </div>
    </form>
  );
};

export default CertificatePlanModal;
