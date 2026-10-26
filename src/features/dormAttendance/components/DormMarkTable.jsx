// Router
import { Link } from "react-router-dom";

// Components
import Input from "@/shared/components/ui/input/Input";
import Button from "@/shared/components/ui/button/Button";
import Table, { Td, Tr } from "@/shared/components/ui/Table";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatTimeUz } from "@/shared/utils/date.utils";

// Data
import { DORM_STATUS_COLORS, DORM_STATUS_OPTIONS } from "../data/dormAttendance.data";

/**
 * BELGILASH JADVALI (boshqariladigan komponent).
 *
 * ⚠️ TANLASH KATAKCHASI bor: tarbiyachi ro'yxatdan o'zi kerakligini
 * belgilab, so'ng panel tugmasi bilan hammasiga bitta holat qo'yadi
 * (`DormMarkToolbar`). Usiz 170 qatorli ro'yxatda har bolani alohida
 * bosish kerak bo'lardi.
 *
 * ⚠️ KIM BELGILAGANI ko'rinadi: yotoqxonada bir nechta tarbiyachi
 * ishlaydi va boshqaning qarori jim bosilib ketmasligi kerak
 * (o'qituvchi davomati bilan AYNI mulohaza).
 *
 * ⚠️ Izoh maydoni HAR QANDAY holatda ochiq va IXTIYORIY — kelmaslik
 * sabablari katalogi bu yerda ataylab yo'q (`AttendanceMarkTable`
 * izohidagi sabab): tanlovga qadab qo'yish oddiy tuzatishni to'sardi.
 *
 * @param {object} props
 * @param {Array} props.rows - server qatorlari `[{ student, classId, className, status, note, markedAt, markedBy }]`
 * @param {Object} props.marks - `{ [studentId]: { status, note } }`
 * @param {Set<string>} props.selected
 * @param {boolean} [props.canMark] - false → faqat ko'rish
 * @param {Function} props.onStatusChange
 * @param {Function} props.onNoteChange
 * @param {Function} props.onToggleSelect
 * @param {Function} props.onToggleSelectAll
 */
const DormMarkTable = ({
  rows = [],
  marks = {},
  selected,
  canMark = false,
  onStatusChange,
  onNoteChange,
  onToggleSelect,
  onToggleSelectAll,
}) => {
  const visibleIds = rows.map((row) => row.student.id);
  const allSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));

  const columns = [
    ...(canMark
      ? [
          {
            key: "select",
            className: "w-12",
            align: "center",
            label: (
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() => onToggleSelectAll(visibleIds)}
                aria-label="Ko'rinayotgan o'quvchilarni belgilash"
                className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
            ),
          },
        ]
      : []),
    { key: "no", label: "#", className: "w-14" },
    { key: "student", label: "O'quvchi" },
    { key: "class", label: "Sinf" },
    { key: "status", label: "Holat" },
    { key: "note", label: "Izoh" },
    { key: "markedBy", label: "Kim belgilagan" },
  ];

  return (
    <Table columns={columns}>
      {rows.map((row, index) => {
        const id = row.student.id;
        const mark = marks[id] ?? {};
        const current = mark.status ?? null;
        const changed =
          Boolean(current) &&
          (current !== (row.status ?? null) ||
            (mark.note || "").trim() !== (row.note || "").trim());

        return (
          <Tr key={id} className={cn(changed && "bg-amber-50/60")}>
            {canMark && (
              <Td align="center">
                <input
                  type="checkbox"
                  checked={selected.has(id)}
                  onChange={() => onToggleSelect(id)}
                  aria-label={`${row.student.lastName} ${row.student.firstName} — tanlash`}
                  className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
              </Td>
            )}

            <Td className="text-gray-500">{index + 1}</Td>

            <Td>
              <Link
                to={`/users/${id}`}
                className="font-medium text-gray-900 hover:text-blue-600"
              >
                {[row.student.lastName, row.student.firstName]
                  .filter(Boolean)
                  .join(" ") || "—"}
              </Link>
              <p className="text-xs text-gray-500">@{row.student.username}</p>
            </Td>

            <Td className="text-gray-700">
              {row.className || <span className="text-gray-400">Sinfsiz</span>}
            </Td>

            <Td>
              <div className="flex flex-wrap items-center gap-1.5">
                {DORM_STATUS_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={!canMark}
                    onClick={() => onStatusChange(id, option.value)}
                    className={cn(
                      current === option.value &&
                        cn(
                          DORM_STATUS_COLORS[option.value],
                          "border-transparent shadow-sm",
                        ),
                    )}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </Td>

            <Td nowrap={false}>
              <Input
                value={mark.note || ""}
                maxLength={300}
                disabled={!canMark}
                placeholder="Izoh (ixtiyoriy)"
                onChange={(e) => onNoteChange(id, e.target.value)}
                className="h-9 w-full min-w-[11rem]"
              />
            </Td>

            <Td className="text-xs text-gray-500">
              {row.markedBy ? (
                <>
                  <span className={cn(row.markedBy.isMe && "text-gray-700")}>
                    {row.markedBy.isMe ? "Siz" : row.markedBy.name}
                  </span>
                  {row.markedAt && (
                    <span className="text-gray-400"> · {formatTimeUz(row.markedAt)}</span>
                  )}
                </>
              ) : (
                <span className="text-gray-300">—</span>
              )}
            </Td>
          </Tr>
        );
      })}
    </Table>
  );
};

export default DormMarkTable;
