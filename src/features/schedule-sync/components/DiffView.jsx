// React
import { useState } from "react";

// Icons
import { ArrowRight, ChevronRight } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Components
import Card from "@/shared/components/ui/Card";
import Notice from "./Notice";
import Pill from "./Pill";

// Helpers & data
import { isDiffUnknown } from "../helpers/scheduleSync.helpers";
import { DIFF_TOTALS, DIFF_TYPE, DIFF_UNKNOWN_TEXT } from "../data/scheduleSync.data";

/** Sinf qatorining barqaror kaliti. */
const classKeyOf = (cls, index) =>
  cls.classId || cls.sheetLabel || cls.className || `class-${index}`;

/**
 * Farq jami — nechta dars qo'shiladi, olib tashlanadi, o'zgaradi.
 * @param {{ totals?: object }} props
 */
const DiffTotals = ({ totals }) => (
  <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
    {DIFF_TOTALS.map(({ key, label }) => (
      <div
        key={key}
        className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2"
      >
        <dt className="text-xs text-gray-500">{label}</dt>
        <dd className="text-lg font-semibold text-gray-900">
          {totals?.[key] ?? 0}
        </dd>
      </div>
    ))}
  </dl>
);

/**
 * Bitta dars katagi: fan · o'qituvchi · vaqt.
 *
 * O'zgargan qism ajratiladi (oldingisida ustidan chizilgan, keyingisida
 * belgilangan): "o'zgaradi" yorlig'i yonida NIMA o'zgargani ko'rinmasa,
 * odam ikki qatorni harfma-harf solishtirib o'tirardi.
 */
const CellText = ({ cell, other, side }) => {
  if (!cell) return <span className="text-gray-400">Dars yo'q</span>;

  const mark =
    side === "before"
      ? "line-through decoration-red-400"
      : "rounded bg-amber-100 px-0.5";
  const subjectChanged = other && other.subjectId !== cell.subjectId;
  const teacherChanged = other && other.teacherId !== cell.teacherId;
  const timeChanged =
    other &&
    (other.startTime !== cell.startTime || other.endTime !== cell.endTime);

  return (
    <span className={side === "before" ? "text-gray-500" : "text-gray-900"}>
      <span className="sr-only">{side === "before" ? "Hozir: " : "Keyin: "}</span>
      <span className={cn(subjectChanged && mark)}>{cell.subjectName}</span>
      {" · "}
      <span className={cn(teacherChanged && mark)}>{cell.teacherName}</span>
      {cell.startTime && (
        <>
          {" · "}
          <span className={cn(timeChanged && mark)}>
            {cell.startTime}–{cell.endTime}
          </span>
        </>
      )}
    </span>
  );
};

const DiffChange = ({ change }) => (
  <li className="rounded-lg bg-gray-50 px-3 py-2 text-xs">
    <div className="mb-1 flex flex-wrap items-center gap-2">
      <span className="font-medium text-gray-900">
        {change.dayLabel}, {change.order}-dars
      </span>
      {DIFF_TYPE[change.type] && <Pill meta={DIFF_TYPE[change.type]} />}
    </div>

    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
      <CellText cell={change.before} other={change.after} side="before" />
      <ArrowRight
        className="hidden size-3.5 shrink-0 text-gray-400 sm:block"
        aria-hidden="true"
      />
      <CellText cell={change.after} other={change.before} side="after" />
    </div>
  </li>
);

const DiffClass = ({ cls, isOpen, onToggle }) => {
  const changes = cls.changes ?? [];
  const counts = changes.reduce((acc, change) => {
    acc[change.type] = (acc[change.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <li>
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left hover:bg-gray-50"
      >
        <span className="flex min-w-0 items-center gap-2">
          <ChevronRight
            className={cn(
              "size-4 shrink-0 text-gray-400 transition-transform",
              isOpen && "rotate-90",
            )}
            aria-hidden="true"
          />
          <span className="truncate text-sm font-medium text-gray-900">
            {cls.className}
          </span>
          {cls.sheetLabel && cls.sheetLabel !== cls.className && (
            <span className="truncate text-xs text-gray-500">
              sheet'da: {cls.sheetLabel}
            </span>
          )}
        </span>

        <span className="flex shrink-0 flex-wrap justify-end gap-1">
          {Object.entries(counts).map(([type, count]) => (
            <Pill key={type} meta={DIFF_TYPE[type]}>
              {DIFF_TYPE[type]?.label ?? type}: {count}
            </Pill>
          ))}
        </span>
      </button>

      {isOpen && (
        <ul className="space-y-1.5 px-3.5 pb-3">
          {changes.map((change, index) => (
            <DiffChange
              key={`${change.day}-${change.order}-${change.type}-${index}`}
              change={change}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

/**
 * Farq — sinflar bo'yicha guruhlangan, har sinf alohida ochiladi.
 *
 * Butun maktab jadvali yuzlab qatorli farq berishi mumkin: hammasini
 * birdaniga chizish sahifani og'irlashtirib, eng muhimini (jami va
 * ogohlantirishlar) ko'rinmas qilardi.
 *
 * @param {object} props
 * @param {object|null} props.diff - `Diff`
 * @param {string} [props.title]
 * @param {string} [props.emptyText]
 * @param {string} [props.className]
 */
const DiffView = ({
  diff,
  title = "Nima o'zgaradi",
  emptyText = "Amaldagi jadval bilan farq yo'q",
  className = "",
}) => {
  const classes = diff?.classes ?? [];
  const [openKeys, setOpenKeys] = useState(() => new Set());
  const allOpen = classes.length > 0 && openKeys.size === classes.length;

  const toggle = (key) =>
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const toggleAll = () =>
    setOpenKeys(allOpen ? new Set() : new Set(classes.map(classKeyOf)));

  return (
    <Card className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold text-gray-900">{title}</h2>
        {classes.length > 1 && (
          <button
            type="button"
            onClick={toggleAll}
            className="text-xs font-medium text-blue-600 hover:text-blue-800"
          >
            {allOpen ? "Hammasini yopish" : "Hammasini ochish"}
          </button>
        )}
      </div>

      <DiffTotals totals={diff?.totals} />

      {classes.length === 0 ? (
        <p className="text-sm text-gray-500">{emptyText}</p>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100">
          {classes.map((cls, index) => {
            const key = classKeyOf(cls, index);
            return (
              <DiffClass
                key={key}
                cls={cls}
                isOpen={openKeys.has(key)}
                onToggle={() => toggle(key)}
              />
            );
          })}
        </ul>
      )}
    </Card>
  );
};

/**
 * Farq bo'limi: hisoblangan bo'lsa — to'liq farq (`DiffView`), aks holda
 * NEGA yo'qligi.
 *
 * ⚠️ Hisoblanmagan farq (`newHash`/`diff`/`hasChanges` — `null`) nol jami
 * bilan chizilmaydi: "0 ta o'zgarish" odamni "hech narsa o'zgarmaydi" deb
 * aldardi, aslida esa farq umuman ma'lum emas.
 *
 * @param {object} props
 * @param {object} props.view - `Review` yoki `SnapshotReview`
 * @param {string} [props.unknownText] - farq hisoblanmaganda
 * @param {string} [props.title]
 * @param {string} [props.className] - faqat farq kartasiga
 */
export const DiffSection = ({
  view,
  unknownText = DIFF_UNKNOWN_TEXT.errors,
  title,
  className = "",
}) =>
  isDiffUnknown(view) ? (
    <Notice tone="info" title={unknownText} />
  ) : (
    <DiffView diff={view.diff} title={title} className={className} />
  );

export default DiffView;
