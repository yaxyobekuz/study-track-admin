// Panellar — server'dagi `ChangelogPanel` enum bilan bir xil tartibda.
export const PANEL_OPTIONS = [
  { value: "admin", label: "Admin panel" },
  { value: "teacher", label: "O'qituvchi paneli" },
  { value: "student", label: "O'quvchi paneli" },
  { value: "server", label: "Server" },
  { value: "bot", label: "Telegram bot" },
];

// Filtr uchun — "barchasi" varianti bilan
export const PANEL_FILTER_OPTIONS = [
  { value: "all", label: "Barcha panellar" },
  ...PANEL_OPTIONS,
];

// Sarlavhadagi versiya kartochkalari tartibi
export const PANEL_ORDER = PANEL_OPTIONS.map((option) => option.value);

// Panel nishonchasi (badge) uchun nom va rang
export const PANEL_META = {
  admin: { label: "Admin", className: "bg-blue-100 text-blue-800" },
  teacher: { label: "O'qituvchi", className: "bg-purple-100 text-purple-800" },
  student: { label: "O'quvchi", className: "bg-green-100 text-green-800" },
  server: { label: "Server", className: "bg-orange-100 text-orange-800" },
  bot: { label: "Bot", className: "bg-cyan-100 text-cyan-800" },
};

// O'zgarish darajasi — versiya shu asosda oshadi
export const BUMP_OPTIONS = [
  { value: "patch", label: "Kichik — tuzatish, mayda yaxshilash" },
  { value: "minor", label: "O'rtacha — yangi imkoniyat" },
  { value: "major", label: "Katta — yirik o'zgarish" },
];

export const BUMP_META = {
  patch: { label: "Kichik", className: "bg-gray-100 text-gray-700" },
  minor: { label: "O'rtacha", className: "bg-amber-100 text-amber-800" },
  major: { label: "Katta", className: "bg-red-100 text-red-800" },
};

// Sahifa tablari — birinchisi standart (URL'da `tab` parametri bo'lmaydi)
export const CHANGELOG_TABS = [
  { value: "today", label: "Bugun" },
  { value: "all", label: "Barchasi" },
  { value: "settings", label: "Sozlamalar" },
];

// Panel filtri "Barchasi" tabida oy tanlash bilan yonma-yon turadi
export const ALL_MONTHS_OPTION = { value: "all", label: "Barcha oylar" };

export const DEFAULT_SEND_TIME = "09:00";

// "Chat qo'shish" bosilganda qo'shiladigan bo'sh qator
export const DEFAULT_RECIPIENT = { chatId: "", label: "", isActive: true };

// Yuborish jurnalidagi holat nishonchalari
export const NOTIFICATION_STATUS_META = {
  sent: { label: "Yuborildi", className: "bg-green-100 text-green-800" },
  failed: { label: "Xato", className: "bg-red-100 text-red-800" },
};

export const NOTIFICATION_KIND_META = {
  daily: { label: "Kunlik" },
  weekly: { label: "Haftalik" },
  manual: { label: "Qo'lda" },
};
