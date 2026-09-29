// React
import { useMemo, useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import { Check } from "lucide-react";

// Components
import Input from "@/shared/components/ui/input/Input";
import Button from "@/shared/components/ui/button/Button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Utils
import { cn } from "@/shared/utils/cn";
import { downloadBlob, readBlobErrorMessage } from "@/shared/utils/download.utils";

// Queries & API
import { useClasses } from "@/features/classes/queries/classes.queries";
import { studentSystemsAPI } from "../api/studentSystems.api";

// Data
import {
  EXPORT_LIST_OPTIONS,
  EXPORT_SCOPE,
  EXPORT_SCOPE_OPTIONS,
} from "../data/studentSystems.data";

// Sinflar ko'p bo'lsa qidiruv chiqadi
const CLASS_SEARCH_FROM = 8;

/**
 * ERP VA KUNDALIK.COM → EXCEL.
 *
 * Qamrov: butun maktab yoki tanlangan sinf(lar). Ro'yxat: to'liq hisobot
 * (har ro'yxat alohida varaqda + sinflar kesimi) yoki bitta "bor / yo'q"
 * ro'yxati. Fayl nomini server beradi (`downloadBlob`).
 *
 * `openModal("exportStudentSystems", { defaultClassIds, defaultList })` —
 * sahifa joriy sinf va tizim filtrini oldindan tanlab ochadi.
 */
const ExportStudentSystemsModal = () => (
  <ResponsiveModal
    name="exportStudentSystems"
    title="Excelga yuklash"
    description="ERP va Kundalik.com ro'yxatlari — butun maktab yoki sinflar bo'yicha"
    className="max-w-lg"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({
  close,
  isLoading,
  setIsLoading,
  defaultClassIds = [],
  defaultList = "all",
}) => {
  const { data: classes = [], isLoading: classesLoading } = useClasses();

  const [scope, setScope] = useState(
    defaultClassIds.length > 0 ? EXPORT_SCOPE.CLASSES : EXPORT_SCOPE.SCHOOL,
  );
  const [selected, setSelected] = useState(() => new Set(defaultClassIds));
  const [list, setList] = useState(defaultList);
  const [classSearch, setClassSearch] = useState("");

  const visibleClasses = useMemo(() => {
    const term = classSearch.trim().toLowerCase();
    return term
      ? classes.filter((cls) => cls.name.toLowerCase().includes(term))
      : classes;
  }, [classes, classSearch]);

  // Mavjud bo'lmagan (o'chirilgan) sinf tanlovda qolib ketmasin
  const selectedIds = classes
    .filter((cls) => selected.has(cls.id))
    .map((cls) => cls.id);

  const isClassScope = scope === EXPORT_SCOPE.CLASSES;
  const canSubmit = !isLoading && (!isClassScope || selectedIds.length > 0);

  const toggleClass = (classId) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(classId)) next.delete(classId);
      else next.add(classId);
      return next;
    });

  const allVisibleSelected =
    visibleClasses.length > 0 && visibleClasses.every((cls) => selected.has(cls.id));

  const toggleAllVisible = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      for (const cls of visibleClasses) {
        if (allVisibleSelected) next.delete(cls.id);
        else next.add(cls.id);
      }
      return next;
    });

  const handleExport = async () => {
    if (!canSubmit) return;
    setIsLoading(true);

    try {
      const response = await studentSystemsAPI.exportExcel({
        list,
        scope,
        ...(isClassScope && { classIds: selectedIds.join(",") }),
      });
      downloadBlob(response, "ERP_va_Kundalik.xlsx");
      toast.success("Fayl yuklab olindi");
      close();
    } catch (error) {
      toast.error(await readBlobErrorMessage(error, "Excel faylni yuklab bo'lmadi"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Qamrov */}
      <Section title="Qamrov">
        <div role="radiogroup" aria-label="Qamrov" className="grid grid-cols-1 gap-2 xs:grid-cols-2">
          {EXPORT_SCOPE_OPTIONS.map((option) => (
            <OptionCard
              key={option.value}
              option={option}
              checked={scope === option.value}
              disabled={isLoading}
              onSelect={() => setScope(option.value)}
            />
          ))}
        </div>

        {isClassScope && (
          <div className="mt-3 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-3 py-2">
              <span className="text-sm text-gray-600">
                Tanlangan: <b className="text-gray-900">{selectedIds.length}</b> ta sinf
              </span>
              <button
                type="button"
                disabled={isLoading || visibleClasses.length === 0}
                onClick={toggleAllVisible}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 disabled:text-gray-400"
              >
                {allVisibleSelected ? "Belgilarni olib tashlash" : "Hammasini belgilash"}
              </button>
            </div>

            {classes.length >= CLASS_SEARCH_FROM && (
              <div className="border-b border-gray-100 p-2">
                <Input
                  type="search"
                  value={classSearch}
                  placeholder="Sinf nomi bo'yicha qidirish..."
                  onChange={(e) => setClassSearch(e.target.value)}
                  className="h-9"
                />
              </div>
            )}

            <div className="max-h-56 overflow-y-auto p-1.5">
              {classesLoading ? (
                <p className="px-2 py-3 text-sm text-gray-500">Sinflar yuklanmoqda...</p>
              ) : visibleClasses.length === 0 ? (
                <p className="px-2 py-3 text-sm text-gray-500">Sinf topilmadi</p>
              ) : (
                <div className="grid grid-cols-2 gap-1 xs:grid-cols-3">
                  {visibleClasses.map((cls) => (
                    <label
                      key={cls.id}
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={selected.has(cls.id)}
                        disabled={isLoading}
                        onChange={() => toggleClass(cls.id)}
                        className="size-4 shrink-0 cursor-pointer accent-blue-600"
                      />
                      <span className="truncate" title={cls.name}>
                        {cls.name}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Section>

      {/* Ro'yxat */}
      <Section title="Ro'yxat">
        <div role="radiogroup" aria-label="Ro'yxat" className="space-y-2">
          {EXPORT_LIST_OPTIONS.map((option) => (
            <OptionCard
              key={option.value}
              option={option}
              checked={list === option.value}
              disabled={isLoading}
              onSelect={() => setList(option.value)}
            />
          ))}
        </div>
      </Section>

      {/* Actions */}
      <div className="flex w-full flex-col-reverse gap-3.5 xs:flex-row xs:justify-end">
        <Button
          type="button"
          variant="secondary"
          className="w-full xs:w-32"
          onClick={close}
        >
          Bekor qilish
        </Button>
        <Button
          type="button"
          className="w-full xs:w-32"
          disabled={!canSubmit}
          onClick={handleExport}
        >
          {isLoading ? "Yuklanmoqda..." : "Yuklash"}
        </Button>
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div>
    <p className="mb-2 text-sm font-medium text-gray-700">{title}</p>
    {children}
  </div>
);

/** Radio variant — sarlavha + ixtiyoriy izoh. */
const OptionCard = ({ option, checked, disabled, onSelect }) => (
  <button
    type="button"
    role="radio"
    aria-checked={checked}
    disabled={disabled}
    onClick={onSelect}
    className={cn(
      "flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors disabled:cursor-not-allowed",
      checked
        ? "border-blue-500 bg-blue-50"
        : "border-gray-200 bg-white hover:border-gray-300",
    )}
  >
    <span
      className={cn(
        "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
        checked ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300",
      )}
    >
      {checked && <Check className="size-3" strokeWidth={3} />}
    </span>
    <span>
      <span className="block text-sm font-medium text-gray-900">{option.label}</span>
      {option.description && (
        <span className="mt-0.5 block text-xs text-gray-500">{option.description}</span>
      )}
    </span>
  </button>
);

export default ExportStudentSystemsModal;
