// ─────────────────────────────────────────────
// RUXSATLAR KATALOGI (bo'lim darajasi)
// ─────────────────────────────────────────────
// Kalitlar server `server/src/utils/permissions.js` bilan bir xil bo'lishi
// SHART (ikki alohida repo — qo'lda sinxron saqlanadi).

/** Grant qilinadigan ruxsatlar — modal checkbox'lari shu ro'yxatdan chiziladi. */
export const PERMISSION_CATALOG = [
  { key: "users", label: "Foydalanuvchilar", group: "Asosiy" },
  { key: "statistics", label: "Statistika", group: "Asosiy" },
  { key: "attendance", label: "Davomat", group: "Ta'lim" },
  { key: "grades", label: "Baholar jurnali", group: "Ta'lim" },
  { key: "schedules", label: "Dars jadvali", group: "Ta'lim" },
  { key: "topics", label: "Dars mavzulari", group: "Ta'lim" },
  { key: "classes", label: "Sinflar", group: "Ta'lim" },
  { key: "subjects", label: "Fanlar", group: "Ta'lim" },
  { key: "tests", label: "Testlar", group: "Ta'lim" },
  { key: "market", label: "Do'kon", group: "Do'kon" },
  { key: "tasks", label: "Topshiriqlar", group: "Topshiriqlar" },
  { key: "penalties", label: "Jarimalar", group: "Jarimalar" },
  { key: "premium", label: "MBSI Premium", group: "Premium" },
  { key: "coins", label: "Tangalar", group: "Tangalar" },
  { key: "holidays", label: "Dam olish kunlari", group: "Boshqaruv" },
  { key: "monitors", label: "Monitorlar", group: "Boshqaruv" },
  { key: "messages", label: "Xabarlar", group: "Ijtimoiy" },
  { key: "social", label: "Ijtimoiy tarmoqlar", group: "Ijtimoiy" },
  { key: "leads", label: "Sotuvlar", group: "Sotuvlar" },
];

export const PERMISSION_KEYS = PERMISSION_CATALOG.map((p) => p.key);

/** `{ [group]: [{ key, label, group }] }` — modal UI ni guruhlab chizish uchun. */
export const PERMISSION_CATALOG_BY_GROUP = PERMISSION_CATALOG.reduce(
  (acc, item) => {
    (acc[item.group] ||= []).push(item);
    return acc;
  },
  {},
);

/** Ruxsat kaliti bo'yicha label. */
export const permissionLabel = (key) =>
  PERMISSION_CATALOG.find((p) => p.key === key)?.label || key;

// Route prefiks → ruxsat kaliti. Sidebar filtri va route guard shu jadvaldan
// foydalanadi. `/roles` va `/permissions` grant qilinmaydi — kalitlari katalogda
// yo'q, shuning uchun can() ular uchun faqat owner'ga true qaytaradi (owner-only).
const ROUTE_PERMISSIONS = [
  { prefix: "/users", key: "users" },
  { prefix: "/statistics", key: "statistics" },
  { prefix: "/attendance", key: "attendance" },
  { prefix: "/grades", key: "grades" },
  { prefix: "/schedules", key: "schedules" },
  { prefix: "/schedule-settings", key: "schedules" },
  { prefix: "/topics", key: "topics" },
  { prefix: "/classes", key: "classes" },
  { prefix: "/subjects", key: "subjects" },
  { prefix: "/test-seasons", key: "tests" },
  { prefix: "/test-settings", key: "tests" },
  { prefix: "/market", key: "market" },
  { prefix: "/tasks", key: "tasks" },
  { prefix: "/penalties", key: "penalties" },
  { prefix: "/premium", key: "premium" },
  { prefix: "/coin-distribution", key: "coins" },
  { prefix: "/coin-settings", key: "coins" },
  { prefix: "/holidays", key: "holidays" },
  { prefix: "/monitors", key: "monitors" },
  { prefix: "/messages", key: "messages" },
  { prefix: "/social-networks", key: "social" },
  { prefix: "/leads", key: "leads" },
  { prefix: "/roles", key: "roles" },
  { prefix: "/permissions", key: "permissions" },
];

/**
 * Berilgan yo'l (pathname yoki sidebar url) uchun talab qilinadigan ruxsat
 * kalitini qaytaradi. Hech bir prefiks mos kelmasa `null` (masalan "/",
 * "/profile" — doim ochiq). Eng aniq (uzun) mos kelgan prefiks tanlanadi.
 * @param {string} pathname
 * @returns {string|null}
 */
export const permissionForPath = (pathname = "") => {
  let match = null;
  for (const route of ROUTE_PERMISSIONS) {
    const hit = pathname === route.prefix || pathname.startsWith(`${route.prefix}/`);
    if (hit && (!match || route.prefix.length > match.prefix.length)) {
      match = route;
    }
  }
  return match?.key || null;
};
