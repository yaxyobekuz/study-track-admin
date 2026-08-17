// Bitta foydalanuvchining davomat paneli uchun statik ma'lumotlar.
//
// Yorliqlar va ranglar `studentAttendance.data.js` dan olinadi — status
// nomlanishi butun panelda bitta manbadan kelishi kerak, aks holda jadval
// bilan kalendar bir xil holatni turlicha ataydi.

// Icons
import { Check, Info, TriangleAlert, X } from "lucide-react";

// Data
import {
  STATUS_COLORS,
  STATUS_DOT_COLORS,
  STATUS_LABELS,
} from "./studentAttendance.data";

/** Faqat rangga tayanmaslik uchun har bir holatga belgi biriktiriladi. */
const STATUS_ICONS = {
  present: Check,
  late: TriangleAlert,
  absent: X,
  excused: Info,
};

/** Holat kaliti → { label, className, dot, Icon }. */
export const ATTENDANCE_STATUS_META = Object.fromEntries(
  Object.keys(STATUS_LABELS).map((status) => [
    status,
    {
      label: STATUS_LABELS[status],
      className: STATUS_COLORS[status],
      dot: STATUS_DOT_COLORS[status],
      Icon: STATUS_ICONS[status],
    },
  ]),
);

/** Yig'ma kartalar — bosilganda ro'yxat shu holat bo'yicha filtrlanadi. */
export const SUMMARY_FILTERS = ["present", "late", "absent", "excused"];

/** Kalendar sarlavhasi — hafta dushanbadan boshlanadi. */
export const CALENDAR_WEEKDAYS = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];
