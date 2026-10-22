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
import { TabsButtons } from "@/shared/components/ui/tabs/Tabs";

// Hooks
import { useClasses } from "@/features/classes/queries/classes.queries";

// Utils
import { readBlobErrorMessage } from "@/shared/utils/download.utils";

// Data
import {
  EXPORT_ROLE_OPTIONS,
  STUDENT_ARCHIVE_OPTIONS,
  STUDENT_EXPORT_SCOPE_ACTUAL,
  STUDENT_EXPORT_SCOPE_BOTH,
  STUDENT_EXPORT_SCOPE_CLASS,
  STUDENT_EXPORT_SCOPE_FILE_PART,
  STUDENT_EXPORT_SCOPE_HINTS,
  STUDENT_EXPORT_SCOPE_OPTIONS,
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
 * KESIM — tanlangan sinf QAYSI MA'NODA olinadi: "Sinf" (shu sinfda
 * o'qiyotganlar), "Haqiqiy sinf" (aslida shu sinfniki bo'lganlar) yoki
 * "Ikkalasi" (birlashma — shu sinfga aloqador hamma, takrorlanmasdan).
 *
 * ⚠️ SINF TANLAGICHI BITTA: ikkinchi sinf tanlanmaydi, shuning uchun
 * "A da o'qiydigan, aslida B niki" degan hech kim so'ramagan kesim paydo
 * bo'la olmaydi.
 *
 * ⚠️ "Faqat arxivlangan" + "Sinf" — sinf tanlagichi yo'qoladi: arxivlangan
 * o'quvchi arxivlashda barcha sinflardan chiqariladi, ya'ni bu juftlik har
 * doim bo'sh fayl bo'lardi (server ham rad etadi). "Haqiqiy sinf" va
 * "Ikkalasi" ga bu tegishli EMAS — belgi arxivlashda saqlanadi.
 *
 * `openModal("exportUsers", { defaultRole, defaultScope, defaultClassId,
 * defaultArchived })` — O'quvchilar sahifasi shu bilan joriy filtrini
 * (sinf yoki haqiqiy sinf) va ochiq tabni oldindan tanlab ochadi.
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
  defaultScope = STUDENT_EXPORT_SCOPE_CLASS,
  defaultClassId = ALL_CLASSES,
  defaultArchived = "all",
}) => {
  const [exportType, setExportType] = useState(defaultRole);
  const [scope, setScope] = useState(defaultScope || STUDENT_EXPORT_SCOPE_CLASS);
  const [classId, setClassId] = useState(defaultClassId || ALL_CLASSES);
  const [archived, setArchived] = useState(defaultArchived || "all");
  const { data: classes = [], isLoading: classesLoading } = useClasses();

  const isStudentExport = exportType === "student";
  const byActual = scope === STUDENT_EXPORT_SCOPE_ACTUAL;
  const byBoth = scope === STUDENT_EXPORT_SCOPE_BOTH;
  // Arxiv cheklovi FAQAT sof a'zolik kesimiga tegishli (haqiqiy sinf belgisi
  // arxivlashda saqlanadi), shuning uchun kesim ham shartga kiradi
  const onlyArchived = isStudentExport && archived === "true";
  const classPickerHidden =
    onlyArchived && scope === STUDENT_EXPORT_SCOPE_CLASS;
  const selectedClassId =
    isStudentExport && !classPickerHidden && classId !== ALL_CLASSES
      ? classId
      : null;
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
        // Sinf BITTA, ma'nosini `classScope` aytadi
        classId: selectedClassId,
        classScope: scope,
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
      // Kesim fayl NOMIDA ham ko'rinadi: "IT 1 da o'qiydiganlar" va "aslida
      // IT 1 niki" fayllari papkada yonma-yon turganda farqi bilinsin
      const classPart = toFileNamePart(selectedClass?.name);
      const scopePart = classPart
        ? (STUDENT_EXPORT_SCOPE_FILE_PART[scope] ?? "")
        : "";
      link.download = classPart
        ? `${baseName}${archivePart}_${scopePart}${classPart}_${today}.xlsx`
        : `${baseName}${archivePart}_${today}.xlsx`;

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

      {/* KESIM — uchta variant, segment tugmalari bilan: tanlov bir
          qarashda ko'rinib tursin (ochiladigan ro'yxat uni yashirardi) */}
      {isStudentExport && (
        <div className="space-y-2">
          <span className="block text-sm font-medium text-gray-700">
            Kesim
          </span>

          <TabsButtons
            value={scope}
            onChange={setScope}
            items={STUDENT_EXPORT_SCOPE_OPTIONS}
            listClassName="w-full"
            triggerClassName="flex-1"
          />

          {/* Kesim faqat SINF TANLANGANDA ma'noga ega — buni jim qoldirsak,
              "Barcha sinflar" da tanlov ishlayotgandek ko'rinardi */}
          <p className="text-xs text-gray-500">
            {selectedClassId
              ? STUDENT_EXPORT_SCOPE_HINTS[scope]
              : "Kesim pastdan sinf tanlangach qo'llanadi — hozir barcha o'quvchilar yuklanadi."}
          </p>
        </div>
      )}

      {/* Class Select — faqat o'quvchilar eksportida; sinf a'zoligi kesimida
          arxivlanganlar sinflardan chiqarilgani uchun ko'rinmaydi */}
      {isStudentExport && !classPickerHidden && (
        <div className="space-y-1.5">
          <span className="block text-sm font-medium text-gray-700">
            {byActual ? "Haqiqiy sinfi" : byBoth ? "Sinf (ikkalasi ham)" : "Sinf"}
          </span>
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

      {classPickerHidden && (
        <p className="text-xs text-gray-500">
          Arxivlangan o'quvchilar arxivlashda barcha sinflardan chiqariladi —
          shuning uchun sinf bo'yicha tanlov qo'llanmaydi. Haqiqiy sinf
          kesimi esa arxivlanganlarda ham ishlaydi.
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
