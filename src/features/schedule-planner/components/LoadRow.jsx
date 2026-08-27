// React
import { useEffect, useState } from "react";

// Icons
import { ChevronRight, TriangleAlert } from "lucide-react";

// Components
import { Td, Tr } from "@/shared/components/ui/Table";
import Input from "@/shared/components/ui/input/Input";
import MultiSelect from "@/shared/components/form/multi-select";
import Tooltip from "@/shared/components/ui/tooltip/Tooltip";

// Hooks
import useDebounce from "@/shared/hooks/useDebounce";

// Utils
import { cn } from "@/shared/utils/cn";

/**
 * "Asosiy" tabdagi bitta satr: o'qituvchi × fan.
 *
 * SAQLASH TUGMASI YO'Q — soat yozilgach avtomat saqlanadi (600ms), sinf
 * tanlangach darhol. 40 ta satrni bitta-bitta "saqlash" bilan to'ldirish
 * ish emas, azob bo'lardi.
 *
 * ⚠️ O'qituvchi ustuni `rowSpan` bilan BIRLASHTIRILMAYDI: satr ochilganda
 * (sinfga xos soat) qatorlar soni o'zgaradi va `rowSpan` jadvalni buzib
 * qo'yardi. Buning o'rniga ism faqat guruhning birinchi satrida yoziladi,
 * qolganida katak bo'sh qoladi — ko'rinishi bir xil, xatosi yo'q.
 */
const LoadRow = ({
  row,
  classOptions,
  teacherTotal,
  isFirstOfTeacher,
  onSave,
  canEdit,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [hours, setHours] = useState(String(row.weeklyHours ?? 0));
  const debouncedHours = useDebounce(hours, 600);

  // Serverdan yangi qiymat kelsa inputni moslaymiz — LEKIN render paytida,
  // effekt ichida emas: effektdagi setState kaskad render beradi.
  const [syncedHours, setSyncedHours] = useState(row.weeklyHours);
  if (syncedHours !== row.weeklyHours) {
    setSyncedHours(row.weeklyHours);
    setHours(String(row.weeklyHours ?? 0));
  }

  const buildClasses = (ids, overrides = {}) => {
    const previous = new Map(row.classes.map((cls) => [cls.id, cls]));
    return ids.map((id) => {
      if (Object.prototype.hasOwnProperty.call(overrides, id)) {
        return { classId: id, weeklyHours: overrides[id] };
      }
      const existing = previous.get(id);
      return {
        classId: id,
        weeklyHours: existing?.isOverride ? existing.weeklyHours : null,
      };
    });
  };

  // Soatni avtosaqlash — faqat haqiqatan o'zgargan bo'lsa.
  useEffect(() => {
    const next = Number(debouncedHours);
    if (!Number.isInteger(next) || next < 0 || next > 40) return;
    if (next === row.weeklyHours) return;

    onSave({
      teacherId: row.teacher.id,
      subjectId: row.subject.id,
      weeklyHours: next,
      classes: buildClasses(row.classes.map((cls) => cls.id)),
    });
    // `onSave` va `row` har renderda yangilanadi — qaramlikka qo'shsak
    // saqlash sikliga tushib qolardi.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedHours]);

  const save = (ids, overrides) =>
    onSave({
      teacherId: row.teacher.id,
      subjectId: row.subject.id,
      weeklyHours: Number(hours) || 0,
      classes: buildClasses(ids, overrides),
    });

  const classIds = row.classes.map((cls) => cls.id);
  const overloaded = teacherTotal && teacherTotal.total > teacherTotal.available;

  return (
    <>
      <Tr className={cn(isFirstOfTeacher && "border-t-2 border-gray-200")}>
        <Td className="align-top font-medium">
          {isFirstOfTeacher ? row.teacher.fullName : ""}
        </Td>

        <Td>
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            disabled={row.classes.length === 0}
            className="flex items-center gap-1.5 text-left disabled:cursor-default"
          >
            <ChevronRight
              size={16}
              strokeWidth={1.5}
              className={cn(
                "shrink-0 text-gray-400 transition-transform",
                expanded && "rotate-90",
                row.classes.length === 0 && "opacity-0",
              )}
            />
            {row.subject.name}
          </button>
        </Td>

        <Td>
          <Input
            min={0}
            max={40}
            type="number"
            value={hours}
            disabled={!canEdit}
            className="h-9 w-20"
            onChange={(e) => setHours(e.target.value)}
          />
        </Td>

        <Td nowrap={false} className="min-w-64">
          <MultiSelect
            disabled={!canEdit}
            value={classIds}
            onChange={(ids) => save(ids)}
            options={classOptions}
            placeholder="Sinflarni tanlang..."
          />
        </Td>

        <Td align="center" className="font-medium">
          {row.total}
        </Td>

        <Td align="center">
          {isFirstOfTeacher && teacherTotal ? (
            <Tooltip
              content={`Haftalik talab ${teacherTotal.total} soat, bo'sh katak ${teacherTotal.available} ta`}
            >
              <span
                className={cn(
                  "inline-flex rounded-lg px-2 py-0.5 text-sm font-medium",
                  overloaded
                    ? "bg-red-50 text-red-700"
                    : "bg-emerald-50 text-emerald-700",
                )}
              >
                {teacherTotal.total}/{teacherTotal.available}
              </span>
            </Tooltip>
          ) : (
            ""
          )}
        </Td>

        <Td align="center">
          {row.warnings.length > 0 && (
            <Tooltip content={row.warnings.join(". ")}>
              <TriangleAlert
                size={18}
                strokeWidth={1.5}
                className="mx-auto text-amber-500"
              />
            </Tooltip>
          )}
        </Td>
      </Tr>

      {expanded &&
        row.classes.map((cls) => (
          <ClassOverrideRow
            key={cls.id}
            cls={cls}
            canEdit={canEdit}
            defaultHours={row.weeklyHours}
            onCommit={(value) => save(classIds, { [cls.id]: value })}
          />
        ))}
    </>
  );
};

/**
 * Sinfga xos soat — ASOSIY satr ochilganda chiqadi.
 *
 * Bu yerda debounce emas, `onBlur` ishlatiladi: istisno kamdan-kam
 * kiritiladi va har harfda so'rov yuborish ortiqcha bo'lardi.
 */
const ClassOverrideRow = ({ cls, defaultHours, canEdit, onCommit }) => {
  const [value, setValue] = useState(cls.isOverride ? String(cls.weeklyHours) : "");

  const commit = () => {
    const next = value === "" ? null : Number(value);
    if (next !== null && (!Number.isInteger(next) || next < 0 || next > 40)) return;
    if (next === (cls.isOverride ? cls.weeklyHours : null)) return;
    onCommit(next);
  };

  return (
    <Tr className="bg-gray-50/60">
      <Td />
      <Td className="pl-10 text-gray-500">{cls.name}</Td>
      <Td>
        <Input
          min={0}
          max={40}
          type="number"
          value={value}
          disabled={!canEdit}
          className="h-9 w-20"
          placeholder={String(defaultHours)}
          onBlur={commit}
          onChange={(e) => setValue(e.target.value)}
        />
      </Td>
      <Td nowrap={false} className="text-sm text-gray-500">
        {cls.isOverride
          ? "Shu sinf uchun alohida soat"
          : `Standart soat (${defaultHours})`}
      </Td>
      <Td align="center" className="text-gray-500">
        {cls.weeklyHours}
      </Td>
      <Td />
      <Td />
    </Tr>
  );
};

export default LoadRow;
