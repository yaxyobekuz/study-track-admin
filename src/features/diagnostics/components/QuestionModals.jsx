// React
import { useRef, useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle2 } from "lucide-react";

// Components
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import SelectField from "@/shared/components/ui/select/SelectField";
import Button from "@/shared/components/ui/button/Button";

// Hooks
import { useSubjects } from "@/features/subjects/queries/subjects.queries";

// Queries
import {
  useDeleteQuestion,
  useImportQuestions,
} from "../queries/diagnostics.mutations";

// Data
import { IMPORT_COLUMNS } from "../data/diagnostics.data";

/**
 * SAVOLNI O'CHIRISH.
 *
 * ⚠️ ISHLATILGAN SAVOL ARXIVLANADI (server qarori) — oyna buni OLDINDAN
 * aytadi. Foydalanuvchi "o'chirdim" deb o'ylab, savol ro'yxatda qolganini
 * ko'rsa, tizim buzuq deb o'ylardi.
 */
export const DeleteQuestionModal = () => (
  <ResponsiveModal name="deleteDiagnosticQuestion" title="Savolni o'chirish">
    <DeleteContent />
  </ResponsiveModal>
);

const DeleteContent = ({ close, isLoading, setIsLoading, question }) => {
  const { mutate: deleteQuestion } = useDeleteQuestion();
  const willArchive = (question?.usageCount ?? 0) > 0;

  const handleDelete = () => {
    setIsLoading(true);
    deleteQuestion(question.id, {
      onSuccess: (res) => {
        close();
        toast.success(res?.message || "Savol o'chirildi");
      },
      onError: (err) =>
        toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      onSettled: () => setIsLoading(false),
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        <span className="font-medium text-gray-900">{question?.code}</span> —{" "}
        {question?.text?.slice(0, 120)}
        {question?.text?.length > 120 ? "…" : ""}
      </p>

      {willArchive && (
        <div className="flex gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          <AlertTriangle className="size-4 shrink-0" strokeWidth={1.5} />
          <span>
            Bu savol {question.usageCount} marta testlarda ishlatilgan. U
            <b> o'chirilmaydi, arxivlanadi</b> — o'tgan natijalar tarixi
            saqlanadi va savol yangi testlarga tushmaydi.
          </span>
        </div>
      )}

      <div className="flex flex-col-reverse gap-3.5 xs:flex-row xs:justify-end">
        <Button variant="secondary" className="w-full xs:w-32" onClick={close}>
          Bekor qilish
        </Button>
        <Button
          variant="destructive"
          className="w-full xs:w-36"
          disabled={isLoading}
          onClick={handleDelete}
        >
          {willArchive ? "Arxivlash" : "O'chirish"}
          {isLoading && "..."}
        </Button>
      </div>
    </div>
  );
};

/**
 * EXCEL/CSV DAN IMPORT.
 *
 * ⚠️ NATIJA HISOBOTI KO'RSATILADI VA OYNA O'ZI YOPILMAYDI: 300 qatorli
 * faylda 5 tasi xato bo'lsa, foydalanuvchi qaysi qatorlar o'tmaganini
 * ko'rishi kerak. Jimgina yopilish "hammasi o'tdi" degan taassurot
 * qoldirardi.
 */
export const ImportQuestionsModal = () => (
  <ResponsiveModal
    name="importDiagnosticQuestions"
    title="Savollarni import qilish"
    className="max-w-xl"
  >
    <ImportContent />
  </ResponsiveModal>
);

const ImportContent = ({ close, isLoading, setIsLoading }) => {
  const { data: subjects = [] } = useSubjects();
  const { mutate: importQuestions } = useImportQuestions();

  const fileRef = useRef(null);
  const [subjectId, setSubjectId] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const handleImport = () => {
    if (!subjectId) return toast.error("Fanni tanlang");
    if (!file) return toast.error("Faylni tanlang");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("subjectId", subjectId);

    setIsLoading(true);
    importQuestions(formData, {
      onSuccess: (res) => {
        setResult(res.data);
        if (res.data.created > 0) toast.success(res.message);
        else toast.error("Birorta savol qo'shilmadi");
      },
      onError: (err) =>
        toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      onSettled: () => setIsLoading(false),
    });
  };

  if (result) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
          <CheckCircle2 className="size-8 text-emerald-500" strokeWidth={1.5} />
          <div>
            <p className="font-semibold text-gray-900">
              {result.created} ta savol qo'shildi
            </p>
            <p className="text-sm text-gray-500">
              Jami {result.total} qator o'qildi
              {result.failed > 0 ? `, ${result.failed} tasida xato` : ""}
            </p>
          </div>
        </div>

        {result.errors?.length > 0 && (
          <div className="max-h-64 space-y-1.5 overflow-y-auto rounded-xl bg-rose-50 p-3">
            {result.errors.map((error, i) => (
              <p key={i} className="text-xs text-rose-800">
                {error.line ? `${error.line}-qator: ` : ""}
                {error.message}
              </p>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-400">
          Qo'shilgan savollar <b>qoralama</b> holatida — testlarga tushishi
          uchun ularni tasdiqlash kerak.
        </p>

        <div className="flex justify-end">
          <Button className="w-full xs:w-32" onClick={close}>
            Yopish
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      <SelectField
        required
        inline
        name="subjectId"
        label="Fan"
        placeholder="Tanlang"
        value={subjectId}
        options={subjects.map((s) => ({ value: s.id, label: s.name }))}
        onChange={setSubjectId}
      />

      <div>
        <p className="mb-1.5 text-sm font-medium text-gray-700">Fayl</p>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex w-full items-center gap-3 rounded-xl border border-dashed border-gray-300 p-4 text-left transition-colors hover:border-primary"
        >
          <FileSpreadsheet className="size-6 shrink-0 text-gray-400" strokeWidth={1.5} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-gray-900">
              {file ? file.name : "Faylni tanlang"}
            </span>
            <span className="block text-xs text-gray-400">
              .xlsx, .xls yoki .csv
            </span>
          </span>
          <Upload className="size-4 shrink-0 text-gray-400" strokeWidth={1.5} />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </div>

      <details className="rounded-xl bg-gray-50 p-3">
        <summary className="cursor-pointer text-sm font-medium text-gray-700">
          Fayl ustunlari qanday bo'lishi kerak?
        </summary>
        <div className="mt-2 space-y-1">
          {IMPORT_COLUMNS.map((col) => (
            <p key={col.key} className="text-xs text-gray-500">
              <code className="rounded bg-white px-1 py-0.5 font-medium text-gray-800">
                {col.label}
              </code>
              {col.required && <span className="text-rose-500"> *</span>} —{" "}
              {col.hint}
            </p>
          ))}
        </div>
      </details>

      <div className="mt-5 flex flex-col-reverse gap-3.5 xs:m-0 xs:flex-row xs:justify-end">
        <Button variant="secondary" className="w-full xs:w-32" onClick={close}>
          Bekor qilish
        </Button>
        <Button
          className="w-full xs:w-32"
          disabled={isLoading}
          onClick={handleImport}
        >
          Yuklash
          {isLoading && "..."}
        </Button>
      </div>
    </div>
  );
};
