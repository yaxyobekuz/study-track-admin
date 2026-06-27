// Utils
import { cn } from "@/shared/utils/cn";

// Components
import Input from "@/shared/components/ui/input/Input";
import Button from "@/shared/components/ui/button/Button";

// Data
import { MARK_STATUS_OPTIONS, MARK_SELECTED_COLORS } from "../data/attendance.data";

/**
 * Davomat belgilash/o'zgartirish jadvali (boshqariladigan komponent).
 * O'quvchilar va xodimlar uchun bir xil dizaynda ishlatiladi.
 *
 * @param {Array} people - [{ id, name, subtitle, originalStatus, originalReason }]
 * @param {Object} marks - { [id]: { status, excuseReason } }
 * @param {Function} onStatusChange - (id, status) => void
 * @param {Function} onReasonChange - (id, reason) => void
 */
const AttendanceMarkTable = ({
  people = [],
  marks = {},
  onStatusChange,
  onReasonChange,
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
            const reason = mark.excuseReason || "";

            const changed =
              current !== (person.originalStatus || null) ||
              (current === "excused" &&
                reason !== (person.originalReason || ""));

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

                {/* Sabab (faqat "Sababli" holatda) */}
                <td className="px-4 py-3">
                  {current === "excused" ? (
                    <Input
                      value={reason}
                      maxLength={300}
                      placeholder="Sabab kiriting..."
                      onChange={(e) =>
                        onReasonChange(person.id, e.target.value)
                      }
                      className="h-9 w-full max-w-xs"
                    />
                  ) : (
                    <span className="text-gray-300">-</span>
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
