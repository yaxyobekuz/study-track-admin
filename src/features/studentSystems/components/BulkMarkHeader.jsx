// React
import { useEffect, useRef } from "react";

// Components
import ConfirmPopover from "@/shared/components/ui/ConfirmPopover";

/**
 * Ustun sarlavhasi + SAHIFADAGI hammasini belgilash katakchasi.
 *
 * Holati sahifadagi qatorlardan: hammasi "bor" — belgilangan, bir qismi —
 * oraliq (indeterminate), hech biri — bo'sh. Bosilganda tasdiq so'raladi:
 * bir bosishda 50 ta belgi o'zgaradi va u tasodifiy bosish bo'lmasligi kerak.
 *
 * ⚠️ Faqat HOLATI O'ZGARADIGAN qatorlar yuboriladi — allaqachon "bor"
 * o'quvchining birinchi belgilagan xodimi va sanasi saqlanib qoladi.
 *
 * @param {object} props
 * @param {string} props.label - "ERP" / "Kundalik.com"
 * @param {string} props.system
 * @param {object[]} props.rows - joriy sahifa qatorlari
 * @param {boolean} props.canMark
 * @param {(studentIds: string[], present: boolean) => void} props.onApply
 */
const BulkMarkHeader = ({ label, system, rows, canMark, onApply }) => {
  const checkboxRef = useRef(null);

  const markedCount = rows.filter((row) => row.systems?.[system]).length;
  const allMarked = rows.length > 0 && markedCount === rows.length;
  const someMarked = markedCount > 0 && !allMarked;

  // `indeterminate` — faqat DOM xossasi, atribut sifatida berib bo'lmaydi
  useEffect(() => {
    if (checkboxRef.current) checkboxRef.current.indeterminate = someMarked;
  }, [someMarked]);

  if (!canMark || rows.length === 0) return label;

  const present = !allMarked;
  const targets = rows
    .filter((row) => Boolean(row.systems?.[system]) !== present)
    .map((row) => row.id);

  return (
    <div className="flex items-center justify-center gap-2">
      <ConfirmPopover
        tooltip="Sahifadagi hammasini belgilash"
        title={
          present
            ? `${targets.length} ta o'quvchi "${label} da bor" deb belgilansinmi?`
            : `${targets.length} ta o'quvchidan ${label} belgisi olib tashlansinmi?`
        }
        description="Faqat shu sahifada ko'rinib turgan o'quvchilarga tegadi."
        confirmLabel={present ? "Belgilash" : "Olib tashlash"}
        danger={!present}
        onConfirm={() => onApply(targets, present)}
      >
        <input
          ref={checkboxRef}
          type="checkbox"
          checked={allMarked}
          // Holat faqat TASDIQDAN keyin o'zgaradi — bosishning o'zi emas
          onChange={() => {}}
          aria-label={`Sahifadagi hammasi — ${label}`}
          className="size-4 cursor-pointer accent-emerald-500"
        />
      </ConfirmPopover>
      <span>{label}</span>
    </div>
  );
};

export default BulkMarkHeader;
