// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// Components
import Input from "@/shared/components/ui/input/Input";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Queries
import { useSubjects } from "@/features/subjects/queries/subjects.queries";
import {
  useCreateCertificateTrack,
  useUpdateCertificateTrack,
} from "../queries/certificates.mutations";

const NO_SUBJECT = "none";

/**
 * YO'NALISH — qo'shish / tahrirlash.
 *
 * ⚠️ FANGA BOG'LANISH — MAVZU PROGRESSINING yagona kaliti. Bog'langanda
 * o'quvchiga "sinfi mavzuning nechanchisiga yetdi" ko'rsatiladi,
 * bog'lanmaganda esa ekranda OCHIQ "mavzu ro'yxati bog'lanmagan" deb
 * turadi — IELTS ning maktab mavzulari yo'q va soxta foiz chiqarilmaydi.
 *
 * `openModal("certificateTrack")` / `openModal("certificateTrack", { track })`
 */
const CertificateTrackModal = () => (
  <ResponsiveModal
    name="certificateTrack"
    title="Sertifikat yo'nalishi"
    description="Yo'nalish nomi va mavzu progressi uchun maktab fani"
    className="max-w-md"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, track = null }) => {
  const isEdit = Boolean(track);

  const { data: subjects = [] } = useSubjects();
  const { mutateAsync: createTrack } = useCreateCertificateTrack();
  const { mutateAsync: updateTrack } = useUpdateCertificateTrack();

  const [name, setName] = useState(track?.name ?? "");
  const [subjectId, setSubjectId] = useState(track?.subjectId ?? NO_SUBJECT);

  const subjectOptions = [
    { value: NO_SUBJECT, label: "Bog'lanmagan (progress ko'rsatilmaydi)" },
    ...subjects
      .filter((subject) => subject.isActive !== false)
      .map((subject) => ({ value: subject.id, label: subject.name })),
  ];

  const submit = async (event) => {
    event.preventDefault();

    const clean = name.trim();
    if (!clean) return toast.error("Yo'nalish nomini yozing");

    setIsLoading(true);
    try {
      const payload = {
        name: clean,
        subjectId: subjectId === NO_SUBJECT ? null : subjectId,
      };

      if (isEdit) {
        await updateTrack({ id: track.id, ...payload });
        toast.success("Yo'nalish yangilandi");
      } else {
        await createTrack(payload);
        toast.success("Yo'nalish qo'shildi");
      }

      close();
    } catch (error) {
      toast.error(error.response?.data?.message || "Yo'nalishni saqlab bo'lmadi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="trackName" className="text-sm font-medium text-gray-700">
          Nomi <span className="text-red-500">*</span>
        </label>
        <Input
          id="trackName"
          name="trackName"
          value={name}
          maxLength={80}
          onChange={(event) => setName(event.target.value)}
          placeholder="IELTS, CEFR, Ona tili..."
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Maktab fani</label>
        <Select
          name="subjectId"
          value={subjectId}
          onChange={setSubjectId}
          options={subjectOptions}
          placeholder="Fan"
          triggerClassName="w-full"
        />
        <p className="text-xs text-gray-500">
          Fan bog'langanda o'quvchi mavzu progressini ko'radi (nechanchi
          mavzuga yetdi, qancha qoldi). IELTS/SAT kabi tashqi imtihonlarni
          bog'lamasa ham bo'ladi.
        </p>
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

export default CertificateTrackModal;
