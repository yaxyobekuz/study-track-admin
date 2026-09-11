// Components
import InputField from "@/shared/components/ui/input/InputField";

/**
 * SANA ORALIG'I — tahlil sahifalarining umumiy filtri.
 *
 * ⚠️ `<input type="date">` QIYMATI ISO (`2026-09-09`) — bu FORMAT emas,
 * MASHINA O'QIYDIGAN qiymat va `.claude/rules/dates.md` unga ataylab
 * ruxsat beradi. Ekranga chiqadigan sana esa har joyda `formatDateUz`
 * bilan yoziladi.
 */
const DateRangeFilter = ({ from, to, onChange }) => (
  <>
    <div className="w-[150px]">
      <InputField
        type="date"
        label="Boshlanish"
        value={from || ""}
        max={to || undefined}
        onChange={(e) => onChange({ from: e.target.value, to })}
      />
    </div>

    <div className="w-[150px]">
      <InputField
        type="date"
        label="Tugash"
        value={to || ""}
        min={from || undefined}
        onChange={(e) => onChange({ from, to: e.target.value })}
      />
    </div>
  </>
);

export default DateRangeFilter;
