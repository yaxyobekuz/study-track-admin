export const genderOptions = [
  { value: "male", label: "Erkak" },
  { value: "female", label: "Ayol" },
];

/** Jins kaliti → o'zbekcha yorliq ("—" noma'lum bo'lsa). */
export const getGenderLabel = (gender) =>
  genderOptions.find((option) => option.value === gender)?.label ?? "—";

// ── Ro'yxat jadvallari ────────────────────────────
//
// Xodim va o'quvchi uchun ustunlar boshqacha: xodimda ish vaqti va rol muhim,
// o'quvchida esa sinf va tangalar. Shuning uchun ikkita alohida ro'yxat.

export const STAFF_TABLE_COLUMNS = [
  "Xodim",
  "Rol",
  "Ish vaqti",
  "Jarimalar",
  "",
];

export const STUDENT_TABLE_COLUMNS = [
  "O'quvchi",
  "Sinflar",
  "Tangalar",
  "Jarimalar",
  "",
];

/**
 * Excel eksport turlari.
 * `fileName` — yuklab olinadigan faylning nomi (sanasiz).
 * "staff" — rol emas, guruh: o'quvchilardan boshqa hamma.
 */
export const EXPORT_ROLE_OPTIONS = [
  { value: "all", label: "Barcha foydalanuvchilar", fileName: "users" },
  { value: "staff", label: "Faqat xodimlar", fileName: "staff" },
  { value: "teacher", label: "Faqat o'qituvchilar", fileName: "teachers" },
  { value: "student", label: "Faqat o'quvchilar", fileName: "students" },
];

/** Rol badge'i uchun rang — o'qituvchi ajralib tursin. */
export const getRoleBadgeClass = (role) => {
  if (role === "owner") return "bg-purple-100 text-purple-700";
  if (role === "teacher") return "bg-green-100 text-green-700";
  if (role === "student") return "bg-blue-100 text-blue-700";
  return "bg-gray-100 text-gray-600";
};

/**
 * Ism-familiyadan bosh harflar (avatar o'rnida).
 * @param {{firstName?: string, lastName?: string, fullName?: string}} user
 */
export const getInitials = (user) => {
  const first = user?.firstName?.[0] ?? user?.fullName?.[0] ?? "";
  const last = user?.lastName?.[0] ?? "";
  return `${first}${last}`.toUpperCase() || "?";
};
