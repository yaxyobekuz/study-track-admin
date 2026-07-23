// Utils
import { cn } from "@/shared/utils/cn";

// Components
import Input from "@/shared/components/ui/input/Input";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";

// Data
import { MARK_STATUS_OPTIONS, MARK_SELECTED_COLORS } from "../data/attendance.data";
import { reasonsForRole } from "../data/absenceReason.data";

/**
 * Davomat belgilash/o'zgartirish jadvali (boshqariladigan komponent).
 * O'quvchilar va xodimlar uchun bir xil dizaynda ishlatiladi.
 *
 * @param {Array} people - [{ id, name, subtitle, role, originalStatus, originalReasonId, originalNote }]
 * @param {Object} marks - { [id]: { status, absenceReasonId, note } }
 * @param {Array} reasons - barcha aktiv "Kelmaslik sabablari" (rol bo'yicha filtrlash uchun)
 * @param {Function} onStatusChange - (id, status) => void
 * @param {Function} onReasonChange - (id, absenceReasonId) => void
 * @param {Function} onNoteChange - (id, note) => void
 */
const AttendanceMarkTable = ({
  people = [],
  marks = {},
  reasons = [],
  onStatusChange,
  onReasonChange,
  onNoteChange,
}) => {
  if (!people.length) {
    return (
      <div className="text-center py-12 text-gray-500">
        Ma&apos;lumot topilmadi
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg">
      <table className="min-w-full text-sm">
        <thead>
          <tr>
            <th className="text-left px-4 py-3">Foydalanuvchi</th>
            <th className="text-left px-4 py-3">Holat</th>
            <th className="text-left px-4 py-3">Sabab</th>
          </tr>
        </thead>
        <tbody>
          {people.map((person) => {
            const mark = marks[person.id] || {};
            const current = mark.status || null;
            const isExcused = current === "excused";

            const changed =
              current !== (person.originalStatus || null) ||
              (isExcused &&
                ((mark.absenceReasonId || null) !==
                  (person.originalReasonId || null) ||
                  (mark.note || "") !== (person.originalNote || "")));

            // Shu foydalanuvchi roliga tegishli sabablar
            const reasonOptions = reasonsForRole(reasons, person.role).map(
              (r) => ({ label: r.title, value: r.id }),
            );

            return (
              <tr
                key={person.id}
                className={cn(
                  "border-t border-gray-100",
                  changed && "bg-amber-50/60",
                )}
              >
                {/* Ism + (rol/sinf) */}
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{person.name}</p>
                  {person.subtitle && (
                    <p className="text-xs text-gray-500">{person.subtitle}</p>
                  )}
                </td>

                {/* Holat tugmalari */}
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {MARK_STATUS_OPTIONS.map((opt) => {
                      const selected = current === opt.value;
                      return (
                        <Button
                          key={opt.value}
                          type="button"
                          variant="outline"
                          onClick={() => onStatusChange(person.id, opt.value)}
                          className={cn(
                            selected &&
                              cn(
                                MARK_SELECTED_COLORS[opt.value],
                                "border-transparent shadow-sm",
                              ),
                          )}
                        >
                          {opt.label}
                        </Button>
                      );
                    })}
                  </div>
                </td>

                {/* Sabab: faqat "Sababli" holatda - kategoriya (majburiy) + izoh (ixtiyoriy) */}
                <td className="px-4 py-3">
                  {!isExcused ? (
                    <span className="text-gray-300">-</span>
                  ) : reasonOptions.length === 0 ? (
                    <span className="text-xs text-red-500">
                      Bu rol uchun sabab yo&apos;q - avval qo&apos;shing
                    </span>
                  ) : (
                    <div className="space-y-1.5 min-w-[12rem]">
                      <Select
                        value={mark.absenceReasonId || undefined}
                        options={reasonOptions}
                        placeholder="Sabab tanlang"
                        triggerClassName="h-9 w-full"
                        onChange={(v) => onReasonChange(person.id, v)}
                      />
                      <Input
                        value={mark.note || ""}
                        maxLength={300}
                        placeholder="Izoh (ixtiyoriy)"
                        onChange={(e) => onNoteChange(person.id, e.target.value)}
                        className="h-9 w-full"
                      />
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceMarkTable;
