// Bo'lim kaliti → lucide ikonkasi.
// Faqat frontend uchun — server katalogida (`server/src/utils/permissions.js`)
// bunday maydon yo'q, shuning uchun `permissions.data.js` dan alohida turadi.

// Icons
import {
  Hash,
  Users,
  Store,
  Crown,
  Coins,
  School,
  Monitor,
  BookOpen,
  UserPlus,
  ListChecks,
  BookMarked,
  ShieldCheck,
  ChartColumn,
  CalendarOff,
  CalendarDays,
  CalendarCog,
  CalendarCheck,
  MessageSquare,
  TriangleAlert,
  ClipboardList,
  GraduationCap,
} from "lucide-react";

// Data
import { SECTIONS } from "./permissions.data";

/** `{ [bo'lim kaliti]: IkonkaKomponenti }` */
export const SECTION_ICONS = {
  [SECTIONS.USERS]: Users,
  [SECTIONS.STATISTICS]: ChartColumn,
  [SECTIONS.ATTENDANCE]: CalendarCheck,
  [SECTIONS.GRADES]: GraduationCap,
  [SECTIONS.SCHEDULES]: CalendarDays,
  [SECTIONS.PLANNER]: CalendarCog,
  [SECTIONS.TOPICS]: BookOpen,
  [SECTIONS.CLASSES]: School,
  [SECTIONS.SUBJECTS]: BookMarked,
  [SECTIONS.TESTS]: ListChecks,
  [SECTIONS.MARKET]: Store,
  [SECTIONS.TASKS]: ClipboardList,
  [SECTIONS.PENALTIES]: TriangleAlert,
  [SECTIONS.PREMIUM]: Crown,
  [SECTIONS.COINS]: Coins,
  [SECTIONS.HOLIDAYS]: CalendarOff,
  [SECTIONS.MONITORS]: Monitor,
  [SECTIONS.MESSAGES]: MessageSquare,
  [SECTIONS.SOCIAL]: Hash,
  [SECTIONS.LEADS]: UserPlus,
};

/** Bo'lim ikonkasi; topilmasa — umumiy qalqon. */
export const sectionIcon = (section) => SECTION_ICONS[section] || ShieldCheck;
