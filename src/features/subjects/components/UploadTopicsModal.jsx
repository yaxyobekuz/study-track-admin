// Toast
import { toast } from "sonner";

// React
import { useState, useRef } from "react";

// Components
import Select from "@/shared/components/ui/select/Select";
import Button from "@/shared/components/ui/button/Button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Icons
import {
  X,
  Info,
  XCircle,
  CheckCircle2,
  TriangleAlert,
  FileSpreadsheet,
} from "lucide-react";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import { useSubjects } from "@/features/subjects/queries/subjects.queries";
import { useUploadTopics } from "@/features/subjects/queries/topics.mutations";

// Server hisobotidagi ustun kalitlari → shablondagi nomi (tartib bilan).
// T/R yo'q: u platforma uchun o'qilmaydi va server uni qaytarmaydi.
const COLUMN_LABELS = [
  ["level", "Daraja"],
  ["book", "Kitob"],
  ["name", "Mavzu"],
  ["description", "Nimalar o'rgatiladi"],
];

// Bitta varaqda ko'rsatiladigan eng ko'p ogohlantirish (qolgani soni bilan)
const MAX_WARNINGS = 50;

const UploadTopicsModal = () => (
  <ResponsiveModal
    name="uploadTopics"
    title="Mavzular yuklash"
    className="max-w-lg"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading }) => {
  const { data: subjects = [] } = useSubjects();
  const { mutate: uploadTopics } = useUploadTopics();

  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const { state, setField } = useObjectState({
    uploadMode: "all",
    subjectId: "",
  });

  // Yuklash natijasi — har varaq bo'yicha. ⚠️ Oyna darhol YOPILMAYDI, agar
  // aytadigan gap bo'lsa (bo'sh ixtiyoriy ustun, yuklanmagan qator yoki
  // varaq): ilgari faqat birinchi 3 xabar toast bo'lib bir necha soniyada
  // yo'qolardi va admin nima yuklanmaganini bilmay qolardi.
  const [report, setReport] = useState(null);

  // Upload mode options
  const uploadModeOptions = [
    { value: "all", label: "Barcha fanlar (Ko'p sahifali Excel)" },
    { value: "single", label: "Bitta fan" },
  ];

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  // Validate and set file
  const validateAndSetFile = (file) => {
    // Check file extension
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(".xlsx")) {
      toast.error("Faqat .xlsx formatdagi fayllar qabul qilinadi");
      return;
    }

    // Check file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      toast.error("Fayl hajmi juda katta. Maksimal 20MB.");
      return;
    }

    setSelectedFile(file);
  };

  // Remove file
  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  // Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error("Iltimos, Excel faylni tanlang");
      return;
    }

    if (state.uploadMode === "single" && !state.subjectId) {
      toast.error("Iltimos, fanni tanlang");
      return;
    }

    setIsLoading(true);

    const subjectId = state.uploadMode === "single" ? state.subjectId : null;

    uploadTopics(
      { file: selectedFile, subjectId },
      {
        onSuccess: (data) => {
          toast.success(data.message);

          const sheets = data.data?.sheets ?? [];
          const hasDetails = sheets.some(
            (sheet) =>
              sheet.status !== "loaded" ||
              sheet.notes?.length > 0 ||
              sheet.warnings?.length > 0,
          );

          if (hasDetails) {
            setReport({ ok: true, message: data.message, sheets });
          } else {
            close();
          }
        },
        onError: (error) => {
          const body = error.response?.data;
          const message = body?.message || "Mavzularni yuklashda xatolik";
          toast.error(message);

          // Server sababni varaqlar kesimida `details` da qaytaradi
          const sheets = body?.details?.sheets ?? [];
          if (sheets.length > 0) setReport({ ok: false, message, sheets });
        },
        onSettled: () => setIsLoading(false),
      },
    );
  };

  if (report) {
    return (
      <UploadReport
        report={report}
        onClose={close}
        onRetry={() => {
          setReport(null);
          handleRemoveFile();
        }}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Upload Mode */}
      <Select
        label="Yuklash usuli"
        value={state.uploadMode}
        onChange={(value) => {
          setField("uploadMode", value);
          setField("subjectId", "");
        }}
        options={uploadModeOptions}
        required
      />

      {/* Subject Selection (only for single mode) */}
      {state.uploadMode === "single" && (
        <Select
          label="Fan"
          value={state.subjectId}
          onChange={(value) => setField("subjectId", value)}
          options={subjects.map((subject) => ({
            label: subject.name,
            value: subject.id,
          }))}
          required
        />
      )}

      {/* File Upload Area */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Excel fayl <span className="text-red-500">*</span>
        </label>

        {!selectedFile ? (
          <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
            }`}
          >
            <FileSpreadsheet
              className="mx-auto h-12 w-12 text-gray-400 mb-3"
              strokeWidth={1.5}
            />
            <p className="text-sm text-gray-600 mb-1">
              Excel faylni bu yerga tashlang yoki
            </p>
            <p className="text-sm font-medium text-blue-600">
              Faylni tanlash uchun bosing
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Faqat .xlsx formatdagi fayllar (maksimal 20MB)
            </p>
          </div>
        ) : (
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileSpreadsheet
                  className="h-8 w-8 text-green-600"
                  strokeWidth={1.5}
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="text-red-600 hover:text-red-800"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">
          Excel fayl formati:
        </h4>
        <ul className="text-xs text-blue-800 space-y-1">
          {state.uploadMode === "all" ? (
            <>
              <li>• Har bir varaq (sheet) — bitta fan</li>
              <li>• Varaq nomi fan nomi bilan bir xil bo'lishi kerak</li>
            </>
          ) : (
            <li>• Faqat birinchi varaq (sheet) o'qiladi</li>
          )}
          <li>
            • 1-qatorda ustun nomlari: <b>Daraja, Kitob, Mavzu, Nimalar
            o'rgatiladi</b>
          </li>
          <li>
            • Faqat <b>Mavzu</b> majburiy. Daraja, Kitob va Nimalar
            o'rgatiladi — ixtiyoriy: ustun yo'q yoki katak bo'sh bo'lsa ham
            mavzu yuklanadi
          </li>
          <li>
            • Ustunlar nomi bo'yicha topiladi, tartibi muhim emas. Boshqa
            ustunlar (masalan T/R) e'tiborga olinmaydi. Eski shablon (Mavzu
            nomi, Tavsif) ham qabul qilinadi
          </li>
          <li>
            • Mavzu raqamini platforma o'zi beradi — fayldagi qatorlar
            tartibida
          </li>
          <li>
            • Yuklash shu fanning mavjud mavzular ro'yxatini almashtiradi
          </li>
        </ul>
      </div>

      {/* Buttons */}
      <div className="flex flex-col-reverse gap-3.5 w-full mt-5 xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          onClick={close}
          variant="secondary"
          className="w-full xs:w-32"
        >
          Bekor qilish
        </Button>

        <Button
          autoFocus
          variant="default"
          className="w-full xs:w-32"
          disabled={isLoading || !selectedFile}
        >
          Yuklash
          {isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

/**
 * YUKLASH NATIJASI — har varaq bo'yicha: qaysi fanga, nechta mavzu, qaysi
 * ustunlar o'qildi, nima bo'sh (ixtiyoriy — xato emas) va nima yuklanmadi
 * (sababi bilan). Matnlarni server yozadi — ikki joyda ikki xil sabab
 * turmasin.
 */
const UploadReport = ({ report, onClose, onRetry }) => (
  <div className="space-y-4">
    <div
      className={`flex items-start gap-2.5 rounded-lg border p-3 ${
        report.ok
          ? "border-green-200 bg-green-50 text-green-900"
          : "border-red-200 bg-red-50 text-red-900"
      }`}
    >
      {report.ok ? (
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" strokeWidth={1.5} />
      ) : (
        <XCircle className="mt-0.5 size-4 shrink-0" strokeWidth={1.5} />
      )}
      <p className="text-sm font-medium">{report.message}</p>
    </div>

    <div className="max-h-[55vh] space-y-3 overflow-y-auto pr-1 show-scrollbar">
      {report.sheets.map((sheet) => (
        <SheetReport key={sheet.sheet} sheet={sheet} />
      ))}
    </div>

    <div className="flex flex-col-reverse gap-3.5 w-full xs:flex-row xs:justify-end">
      <Button
        type="button"
        variant="secondary"
        onClick={onRetry}
        className="w-full xs:w-auto xs:px-4"
      >
        Boshqa fayl yuklash
      </Button>
      <Button type="button" onClick={onClose} className="w-full xs:w-32">
        Yopish
      </Button>
    </div>
  </div>
);

const SheetReport = ({ sheet }) => {
  const loaded = sheet.status === "loaded";
  const notes = sheet.notes ?? [];
  const warnings = sheet.warnings ?? [];
  const columns = COLUMN_LABELS.filter(([key]) => sheet.columns?.[key]).map(
    ([key, label]) => `${label} (${sheet.columns[key]})`,
  );

  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 break-words">
            Varaq: {sheet.sheet}
          </p>
          {sheet.subject && (
            <p className="text-xs text-gray-500">Fan: {sheet.subject.name}</p>
          )}
        </div>

        <span
          className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${
            loaded ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          {loaded ? `${sheet.topicCount} ta mavzu yuklandi` : "Yuklanmadi"}
        </span>
      </div>

      {/* Nega yuklanmadi */}
      {sheet.reason && (
        <p className="mt-2 text-xs text-red-700 break-words">{sheet.reason}</p>
      )}
      {!loaded && sheet.subject && (
        <p className="mt-1 text-xs text-gray-500">
          Bu fanning mavjud mavzulari o'zgarmadi
        </p>
      )}

      {columns.length > 0 && (
        <p className="mt-2 text-[11px] text-gray-500">
          O'qilgan ustunlar: {columns.join(", ")}
        </p>
      )}

      {/* Ixtiyoriy ma'lumot bo'shligi — xato EMAS */}
      {notes.length > 0 && (
        <ul className="mt-2 space-y-1">
          {notes.map((note) => (
            <li key={note} className="flex items-start gap-1.5 text-xs text-blue-800">
              <Info className="mt-0.5 size-3.5 shrink-0" strokeWidth={1.5} />
              <span>{note}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Yuklanmay qolgan qatorlar */}
      {warnings.length > 0 && (
        <div className="mt-2 rounded-md bg-amber-50 p-2">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-amber-800">
            <TriangleAlert className="size-3.5 shrink-0" strokeWidth={1.5} />
            Diqqat ({warnings.length})
          </p>
          <ul className="space-y-0.5">
            {warnings.slice(0, MAX_WARNINGS).map((warning, index) => (
              <li key={index} className="text-xs text-amber-900 break-words">
                • {warning}
              </li>
            ))}
          </ul>
          {warnings.length > MAX_WARNINGS && (
            <p className="mt-1 text-xs text-amber-700">
              … va yana {warnings.length - MAX_WARNINGS} ta
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadTopicsModal;
