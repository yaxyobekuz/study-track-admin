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
import { EXPORT_ROLE_OPTIONS } from "../data/users.data";

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
 * "Faqat o'quvchilar" tanlansa — sinf ham tanlanadi: bitta sinf yoki hammasi.
 * Sinf tanlagichi boshqa turlarda ko'rinmaydi va so'rovga ham qo'shilmaydi —
 * server sinfni faqat o'quvchilar eksportida qabul qiladi.
 *
 * `openModal("exportUsers", { defaultRole, defaultClassId })` — O'quvchilar
 * sahifasi shu bilan joriy sinf filtrini oldindan tanlab ochadi.
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
}) => {
  const [exportType, setExportType] = useState(defaultRole);
  const [classId, setClassId] = useState(defaultClassId || ALL_CLASSES);
  const { data: classes = [], isLoading: classesLoading } = useClasses();

  const isStudentExport = exportType === "student";
  const selectedClassId =
    isStudentExport && classId !== ALL_CLASSES ? classId : null;
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
        classId: selectedClassId,
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
      const classPart = toFileNamePart(selectedClass?.name);
      link.download = classPart
        ? `${baseName}_${classPart}_${today}.xlsx`
        : `${baseName}_${today}.xlsx`;

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

      {/* Class Select — faqat o'quvchilar eksportida */}
      {isStudentExport && (
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
