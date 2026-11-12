// Toast
import { toast } from "sonner";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import { useUpdateClass } from "@/features/classes/queries/classes.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import InputField from "@/shared/components/ui/input/InputField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Data — o'quv tili (server bilan qo'lda sinxron)
import {
  DEFAULT_TEACHING_LANGUAGE,
  teachingLanguageOptions,
} from "@/shared/data/teachingLanguage.data";

// Icons
import { TriangleAlert } from "lucide-react";

const EditClassModal = () => (
  <ResponsiveModal name="editClass" title="Sinfni tahrirlash">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, ...classData }) => {
  const { mutate: updateClass } = useUpdateClass();

  const { name, capacity, language, setField } = useObjectState({
    name: classData.name || "",
    capacity: classData.capacity != null ? String(classData.capacity) : "",
    language: classData.language || DEFAULT_TEACHING_LANGUAGE,
  });

  const handleEditClass = (e) => {
    e.preventDefault();
    setIsLoading(true);

    updateClass(
      { id: classData.id, data: { name, capacity, language } },
      {
        onSuccess: () => {
          close();
          toast.success("Sinf tahrirlandi");
        },
        onError: (err) => {
          toast.error(err.response?.data?.message || "Xatolik yuz berdi");
        },
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <form onSubmit={handleEditClass} className="space-y-3.5">
      <InputField
        required
        name="name"
        value={name}
        maxLength={32}
        label="Sinf nomi"
        placeholder="1-A, 3-C, ..."
        onChange={(e) => setField("name", e.target.value)}
      />

      <InputField
        type="number"
        min={0}
        name="capacity"
        value={capacity}
        label="Sig'im (ixtiyoriy)"
        placeholder="Masalan: 30"
        onChange={(e) => setField("capacity", e.target.value)}
      />

      <Select
        label="O'quv tili"
        value={language}
        onChange={(value) => setField("language", value)}
        options={teachingLanguageOptions}
        required
      />

      {/* ⚠️ TILNI O'ZGARTIRISH — ONGLI QAROR. Mavzu ankorlari O'SHA tildagi
          ro'yxatning raqamiga tegishli: til almashsa, raqam boshqa
          kitobning mavzusiga tushadi. Tizim ankorlarni JIM QAYTA
          YOZMAYDI — fan ekranida ogohlantirish chiqadi va admin mavzuni
          qayta biriktiradi. */}
      {language !== (classData.language || DEFAULT_TEACHING_LANGUAGE) && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <TriangleAlert
            className="mt-0.5 size-4 shrink-0 text-amber-600"
            strokeWidth={1.5}
          />
          <p className="text-xs text-amber-900">
            Til o'zgaradi: guruhning mavzulari endi boshqa ro'yxatdan
            sanaladi. Biriktirilgan mavzular avtomatik ko'chmaydi — "Dars
            mavzulari → Fan" ekranida ularni qayta biriktirish kerak.
          </p>
        </div>
      )}

      <div className="flex flex-col-reverse gap-3.5 w-full mt-5 xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          className="w-full xs:w-32"
          variant="secondary"
          onClick={close}
        >
          Bekor qilish
        </Button>

        <Button autoFocus className="w-full xs:w-32" disabled={isLoading}>
          Yangilash
          {isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

export default EditClassModal;
