// Utils
import { cn } from "@/shared/utils/cn";

// Components
import Input from "@/shared/components/ui/input/Input";
import Button from "@/shared/components/ui/button/Button";
import CallButton from "@/shared/components/ui/CallButton";

// Data
import { MARK_STATUS_OPTIONS, MARK_SELECTED_COLORS } from "../data/attendance.data";

/**
 * Davomat belgilash/o'zgartirish jadvali (boshqariladigan komponent).
 * O'quvchilar va xodimlar uchun bir xil dizaynda ishlatiladi.
 *
 * ⚠️ Sabab KATEGORIYASI bu yerda YO'Q. Avval "Sababli" tanlanganda
 * katalogdan kategoriya tanlash majburiy edi — kelmagan bolani "keldi"
 * ga o'tkazmoqchi bo'lgan xodim shu tanlovga qadalib qolardi. Endi bitta
 * IXTIYORIY izoh maydoni bor va u har qanday holatda ochiq turadi.
 *
 * @param {Array} people - [{ id, name, subtitle, role, phone, parentPhone, originalStatus, originalNote }]
 * @param {Object} marks - { [id]: { status, note } }
 * @param {boolean} showPhone - "Telefon" ustuni (qo'ng'iroq tugmasi) - o'quvchilar uchun
 * @param {Function} onStatusChange - (id, status) => void
 * @param {Function} onNoteChange - (id, note) => void
 */
const AttendanceMarkTable = ({
  people = [],
  marks = {},
  showPhone = false,
  onStatusChange,
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
            {showPhone && <th className="text-left px-4 py-3">Telefon</th>}
            <th className="text-left px-4 py-3">Holat</th>
            <th className="text-left px-4 py-3">Izoh</th>
          </tr>
        </thead>
        <tbody>
          {people.map((person) => {
            const mark = marks[person.id] || {};
            const current = mark.status || null;

            const changed =
              current !== (person.originalStatus || null) ||
              (mark.note || "").trim() !== (person.originalNote || "").trim();

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

                {/* Telefon (o'quvchi va ota-ona) - qo'ng'iroq tugmasi */}
                {showPhone && (
                  <td className="px-4 py-3">
                    <CallButton
                      compact
                      phone={person.phone}
                      parentPhone={person.parentPhone}
                    />
                  </td>
                )}

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

                {/* Izoh — IXTIYORIY, har qanday holatda ochiq */}
                <td className="px-4 py-3">
                  <Input
                    value={mark.note || ""}
                    maxLength={300}
                    placeholder="Izoh (ixtiyoriy)"
                    onChange={(e) => onNoteChange(person.id, e.target.value)}
                    className="h-9 w-full min-w-[12rem]"
                  />
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
