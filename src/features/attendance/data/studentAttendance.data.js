export const STATUS_LABELS = {
  present: "Keldi",
  late: "Kech keldi",
  absent: "Kelmadi",
  excused: "Sababli",
};

export const STATUS_COLORS = {
  present: "bg-green-100 text-green-700",
  late: "bg-yellow-100 text-yellow-700",
  absent: "bg-red-100 text-red-700",
  excused: "bg-blue-100 text-blue-700",
};

// Oylik jadval (kun matritsasi) uchun nuqta ranglari
export const STATUS_DOT_COLORS = {
  present: "bg-green-500",
  late: "bg-yellow-500",
  absent: "bg-red-500",
  excused: "bg-blue-500",
};

export const MONTH_OPTIONS = [
  { label: "Yanvar", value: 1 },
  { label: "Fevral", value: 2 },
  { label: "Mart", value: 3 },
  { label: "Aprel", value: 4 },
  { label: "May", value: 5 },
  { label: "Iyun", value: 6 },
  { label: "Iyul", value: 7 },
  { label: "Avgust", value: 8 },
  { label: "Sentyabr", value: 9 },
  { label: "Oktyabr", value: 10 },
  { label: "Noyabr", value: 11 },
  { label: "Dekabr", value: 12 },
];

/**
 * Kunlik va belgilash sahifalaridagi yig'indi kartalari.
 *
 * "Kelganlar" = keldi + kech keldi — kech kelgan ham maktabda.
 * "Kelmaganlar" = jami − kelganlar — belgilanmaganlar ham SHU yerga kiradi:
 * bola hali belgilanmagani uchun "maktabda bor" bo'lib qolmasligi kerak.
 * Server `summary` ham, belgilash sahifasidagi jonli `counts` ham aynan
 * shu kalitlarni beradi.
 */
export const SUMMARY_CARDS = [
  { key: "total", label: "Jami o'quvchi", color: "bg-gray-100 text-gray-700" },
  { key: "came", label: "Kelganlar", color: "bg-green-100 text-green-700" },
  { key: "notCame", label: "Kelmaganlar", color: "bg-red-100 text-red-700" },
  {
    key: "late",
    label: "Shundan kech kelgan",
    color: "bg-yellow-100 text-yellow-700",
  },
  {
    key: "absent",
    label: "Kelmadi (sababsiz)",
    color: "bg-rose-50 text-rose-600",
  },
  { key: "excused", label: "Sababli", color: "bg-blue-100 text-blue-700" },
  {
    key: "unmarked",
    label: "Belgilanmagan",
    color: "bg-gray-100 text-gray-500",
  },
];

// 7 ta karta: katta ekranda bir qatorda, planshetda ikki qatorda
export const SUMMARY_CARDS_GRID = "sm:grid-cols-4 lg:grid-cols-7";

// Xodimlarni belgilash sahifasi uchun xuddi shu kartalar — faqat "jami"
// yorlig'i xodimlarga mos (aks holda xodimlar ustida "Jami o'quvchi" turardi)
export const MARK_STAFF_SUMMARY_CARDS = SUMMARY_CARDS.map((card) =>
  card.key === "total" ? { ...card, label: "Jami xodim" } : card,
);

/**
 * Bitta foydalanuvchining oylik yig'masi uchun kartalar — faqat to'rt holat.
 * "Jami / Kelganlar / Belgilanmagan" bu yerda yo'q — ular sinf/ro'yxat
 * kesimida ma'noga ega.
 */
export const USER_SUMMARY_ITEMS = ["present", "late", "absent", "excused"].map(
  (key) => ({ key, label: STATUS_LABELS[key], color: STATUS_COLORS[key] }),
);

// Yil filtri optionlari (joriy yil va oldingi 2 yil)
export const YEAR_OPTIONS = (() => {
  const current = new Date().getFullYear();
  return Array.from({ length: 3 }, (_, i) => ({
    label: String(current - i),
    value: current - i,
  }));
})();
