// UI
import { toast } from "sonner";

// API
import { usersAPI } from "@/features/users/api/users.api";

// React
import { useState } from "react";

// Components
import Select from "@/shared/components/ui/select/Select";
import Button from "@/shared/components/ui/button/Button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Hooks
import { useClasses } from "@/features/classes/queries/classes.queries";

// Utils
import { readBlobErrorMessage } from "@/shared/utils/download.utils";

// Data
import {
  ACTUAL_GRADE_NONE,
  EXPORT_ROLE_OPTIONS,
  STUDENT_ARCHIVE_OPTIONS,
  formatGrade,
  getActualGradeExportOptions,
} from "../data/users.data";

const ALL_CLASSES = "all";

/** Fayl nomida ishlatib bo'lmaydigan belgilar olib tashlanadi. */
const toFileNamePart = (text = "") =>
  text
    .replace(/[\\/:*?"<>|]+/g, "")
    .trim()
    .replace(/\s+/g, "_");

/**
 * Foydalanuvchilarni Excel'ga yuklash.
 *
 * "Faqat o'quvchilar" tanlansa — sinf va ARXIV HOLATI ham tanlanadi: joriy va
 * arxivlangan o'quvchilar bitta faylda yoki alohida-alohida. Ikkala tanlagich
 * boshqa turlarda ko'rinmaydi va so'rovga ham qo'shilmaydi — server ikkisini
 * ham faqat o'quvchilar eksportida qabul qiladi.
 *
 * IKKI MUSTAQIL KESIM: "Sinf" — o'quvchi QAYSI GURUHDA o'qiydi,
 * "Asl sinfi" — u NECHANCHI SINF o'quvchisi (1-sinf … 11-sinf). Ikkalasi
 * tanlansa shart KESISHADI ("IT 1 da o'qiydigan 5-sinf o'quvchilari"),
 * bittasi tanlansa faqat o'sha qo'llanadi — ikkisi bir-birini bekor
 * qilmaydi, chunki ular bir narsaning ikki o'qilishi EMAS.
 *
 * ⚠️ "Faqat arxivlangan" da SINF tanlagichi yo'qoladi: arxivlangan
 * o'quvchi arxivlashda barcha sinflardan chiqariladi, ya'ni bu juftlik har
 * doim bo'sh fayl bo'lardi (server ham rad etadi). ASL SINFGA bu tegishli
 * EMAS — daraja arxivlashda saqlanadi.
 *
 * `openModal("exportUsers", { defaultRole, defaultClassId,
 * defaultActualGrade, defaultArchived })` — O'quvchilar sahifasi shu bilan
 * joriy filtrlarini va ochiq tabni oldindan tanlab ochadi.
 */
const ExportUsersModal = () => (
  <ResponsiveModal name="exportUsers" title="Foydalanuvchilarni yuklash">
    <Content />
  </ResponsiveModal>
);

const Content = ({
  close,
  isLoading,
  setIsLoading,
  defaultRole = "all",
  defaultClassId = ALL_CLASSES,
  defaultActualGrade = "",
  defaultArchived = "all",
}) => {
  const [exportType, setExportType] = useState(defaultRole);
  const [classId, setClassId] = useState(defaultClassId || ALL_CLASSES);
  const [actualGrade, setActualGrade] = useState(defaultActualGrade || "");
  const [archived, setArchived] = useState(defaultArchived || "all");
  const { data: classes = [], isLoading: classesLoading } = useClasses();

  const isStudentExport = exportType === "student";
  // Arxivlangan o'quvchi barcha sinflardan chiqarilgan — sinf tanlagichi
  // ma'nosini yo'qotadi. Asl sinf (daraja) esa saqlanadi, shuning uchun u
  // bu yerda ham qoladi.
  const onlyArchived = isStudentExport && archived === "true";
  const selectedClassId =
    isStudentExport && !onlyArchived && classId !== ALL_CLASSES ? classId : null;
  const selectedGrade = isStudentExport && actualGrade ? actualGrade : null;
  const selectedClass = selectedClassId
    ? classes.find((cls) => cls.id === selectedClassId)
    : null;

  const classOptions = [
    { value: ALL_CLASSES, label: "Barcha sinflar" },
    ...classes.map((cls) => ({ value: cls.id, label: cls.name })),
  ];

  const handleExport = async () => {
    setIsLoading(true);

    try {
      const response = await usersAPI.exportUsers(exportType, {
        // Ikki mustaqil kesim: ikkalasi berilsa shart kesishadi
        classId: selectedClassId,
        actualGrade: selectedGrade,
        // Arxiv tanlovi faqat o'quvchilarda — boshqa rolda server rad etadi
        archived: isStudentExport ? archived : null,
      });
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Generate filename
      const today = new Date().toISOString().split("T")[0];
      const baseName =
        EXPORT_ROLE_OPTIONS.find((option) => option.value === exportType)
          ?.fileName ?? "users";
      // Arxiv tanlovi fayl NOMIDA ham ko'rinadi: ikki fayl papkada yonma-yon
      // turganda qaysi biri arxiv ekani nomidan bilinsin
      const archivePart = isStudentExport
        ? (STUDENT_ARCHIVE_OPTIONS.find((option) => option.value === archived)
            ?.suffix ?? "")
        : "";
      // Kesimlar fayl NOMIDA ham ko'rinadi: bir nechta fayl papkada
      // yonma-yon turganda qaysi biri nima ekani nomidan bilinsin
      const classPart = toFileNamePart(selectedClass?.name);
      const gradePart =
        selectedGrade === ACTUAL_GRADE_NONE
          ? "asl_belgilanmagan"
          : toFileNamePart(formatGrade(selectedGrade));
      const parts = [baseName + archivePart, classPart, gradePart, today].filter(
        Boolean,
      );
      link.download = `${parts.join("_")}.xlsx`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Fayl muvaffaqiyatli yuklandi");
      close();
    } catch (error) {
      toast.error(
        await readBlobErrorMessage(error, "Eksport qilishda xatolik yuz berdi"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Export Type Select */}
      <div className="space-y-1.5">
        <span className="block text-sm font-medium text-gray-700">
          Yuklab olish turi
        </span>
        <Select
          size="lg"
          required
          value={exportType}
          options={EXPORT_ROLE_OPTIONS}
          disabled={isLoading}
          onChange={setExportType}
          placeholder="Turni tanlang"
        />
      </div>

      {/* Arxiv holati — faqat o'quvchilar eksportida */}
      {isStudentExport && (
        <div className="space-y-1.5">
          <span className="block text-sm font-medium text-gray-700">
            O'quvchilar holati
          </span>
          <Select
            size="lg"
            required
            value={archived}
            options={STUDENT_ARCHIVE_OPTIONS}
            disabled={isLoading}
            onChange={setArchived}
            placeholder="Holatni tanlang"
          />
        </div>
      )}

      {/* SINF — o'quvchi qaysi guruhda o'qiydi. Arxivlanganlar barcha
          sinflardan chiqarilgani uchun "faqat arxiv" da ko'rinmaydi. */}
      {isStudentExport && !onlyArchived && (
        <div className="space-y-1.5">
          <span className="block text-sm font-medium text-gray-700">Sinf</span>
          <Select
            size="lg"
            value={classId}
            options={classOptions}
            isLoading={classesLoading}
            disabled={isLoading}
            onChange={setClassId}
            placeholder="Sinfni tanlang"
          />
        </div>
      )}

      {/* ASL SINF — o'quvchi nechanchi sinf o'quvchisi. Sinfdan MUSTAQIL:
          ikkalasi tanlansa shart kesishadi, bittasi tanlansa faqat o'sha
          qo'llanadi. Daraja arxivlashda saqlanadi, shuning uchun bu
          tanlagich "faqat arxiv" da ham qoladi. */}
      {isStudentExport && (
        <div className="space-y-1.5">
          <span className="block text-sm font-medium text-gray-700">
            Asl sinfi
          </span>
          <Select
            size="lg"
            value={actualGrade}
            options={getActualGradeExportOptions()}
            disabled={isLoading}
            onChange={setActualGrade}
            placeholder="Asl sinfni tanlang"
          />
        </div>
      )}

      {isStudentExport && (
        <p className="text-xs text-gray-500">
          {selectedClassId && selectedGrade
            ? "Ikkala shartga ham mos keladigan o'quvchilar yuklanadi."
            : selectedGrade
              ? "Tanlangan asl sinfdagi o'quvchilar yuklanadi — qaysi guruhda o'qishidan qat'i nazar."
              : selectedClassId
                ? "Tanlangan sinfda o'qiyotgan o'quvchilar yuklanadi."
                : "Barcha o'quvchilar yuklanadi."}
          {onlyArchived &&
            " Arxivlanganlar barcha sinflardan chiqarilgani uchun sinf bo'yicha tanlov qo'llanmaydi."}
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3.5 w-full mt-5 xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          className="w-full xs:w-32"
          variant="secondary"
          onClick={close}
        >
          Bekor qilish
        </Button>

        <Button
          autoFocus
          onClick={handleExport}
          className="w-full xs:w-32"
          variant="default"
          disabled={isLoading}
        >
          Yuklash
          {isLoading && "..."}
        </Button>
      </div>
    </div>
  );
};

export default ExportUsersModal;
