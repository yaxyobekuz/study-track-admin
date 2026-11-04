/**
 * QABUL ZINAPOYASI — 6 pog'ona.
 *
 * ⚠️ YORLIQLAR SERVERDAN KELADI (`GET /leads/stages` →
 * `leadsQueries.stages()`), chunki zinapoya serverda yagona joyda:
 * `helpers/leadStage.helpers.js`. Bu yerdagi ro'yxat faqat ZAXIRA —
 * so'rov hali kelmaganda ekran bo'sh qolmasligi uchun. Ikkalasini
 * o'zgartirganda server tomoni ASOSIY: u yozuvni ham, tahlilni ham
 * boshqaradi.
 */
export const LEAD_STAGES_FALLBACK = [
  { stage: 1, status: "interested", label: "Qiziqish bildirdi", short: "Qiziqdi" },
  { stage: 2, status: "trial", label: "Sinov darsiga yozildi", short: "Yozildi" },
  { stage: 3, status: "visited", label: "Keldi", short: "Keldi" },
  { stage: 4, status: "attended", label: "Darsga kirdi", short: "Darsga kirdi" },
  { stage: 5, status: "liked", label: "Dars yoqdi", short: "Yoqdi" },
  { stage: 6, status: "enrolled", label: "To'lov qildi", short: "To'ladi" },
];

/** Zinapoyadan chiqish — pog'ona emas, undan chiqish. */
export const LEAD_EXIT_STATUSES = [
  { status: "rejected", label: "Rad etdi" },
  { status: "lost", label: "Yo'qoldi" },
  { status: "postponed", label: "Keyinga qoldirildi" },
];

export const leadStatusLabels = {
  new: "Yangi",
  contacted: "Bog'lanildi",
  interested: "Qiziqish bildirdi",
  trial: "Sinov darsiga yozildi",
  visited: "Keldi",
  // Zinapoyaning yangi pog'onalari: "keldi" bilan "darsga kirdi" ni
  // ajratmasak, yo'qotish qaysi qadamda bo'lgani ko'rinmaydi
  attended: "Darsga kirdi",
  liked: "Dars yoqdi",
  negotiation: "Muzokara",
  enrolled: "To'lov qildi",
  rejected: "Rad etdi",
  lost: "Yo'qoldi",
  postponed: "Keyinga qoldirildi",
};

export const leadStatusColors = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-cyan-100 text-cyan-700",
  interested: "bg-indigo-100 text-indigo-700",
  trial: "bg-amber-100 text-amber-700",
  visited: "bg-purple-100 text-purple-700",
  attended: "bg-violet-100 text-violet-700",
  liked: "bg-teal-100 text-teal-700",
  negotiation: "bg-orange-100 text-orange-700",
  // ⚠️ YASHIL faqat oxirgi pog'onada: "to'lov qildi" — qabul qilindi
  enrolled: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  lost: "bg-gray-100 text-gray-500",
  postponed: "bg-yellow-100 text-yellow-700",
};

// Holat filtri — "HOZIR qaysi holatda turibdi". Pog'ona filtri bilan
// chalkashmasin: u "shu pog'onaga YETGANLAR" (ikkisi boshqa savol).
export const leadStatusOptions = [
  { value: "all", label: "Barcha holatlar" },
  { value: "new", label: "Yangi" },
  { value: "contacted", label: "Bog'lanildi" },
  { value: "interested", label: "Qiziqish bildirdi" },
  { value: "trial", label: "Sinov darsiga yozildi" },
  { value: "visited", label: "Keldi" },
  { value: "attended", label: "Darsga kirdi" },
  { value: "liked", label: "Dars yoqdi" },
  { value: "negotiation", label: "Muzokara" },
  { value: "enrolled", label: "To'lov qildi" },
  { value: "rejected", label: "Rad etdi" },
  { value: "lost", label: "Yo'qoldi" },
  { value: "postponed", label: "Keyinga qoldirildi" },
];

/** Pog'ona filtri — "shu pog'onagacha yetganlar". */
export const leadStageOptions = [
  { value: "all", label: "Barcha pog'onalar" },
  ...LEAD_STAGES_FALLBACK.map((s) => ({
    value: String(s.stage),
    label: `${s.stage}. ${s.label} — yetganlar`,
  })),
];

export const leadStatusChartColors = {
  new: "#3b82f6",
  contacted: "#06b6d4",
  interested: "#6366f1",
  trial: "#f59e0b",
  visited: "#a855f7",
  attended: "#8b5cf6",
  liked: "#14b8a6",
  negotiation: "#f97316",
  enrolled: "#22c55e",
  rejected: "#ef4444",
  lost: "#6b7280",
  postponed: "#eab308",
};

export const periodOptions = [
  { value: "7", label: "Oxirgi 7 kun" },
  { value: "30", label: "Oxirgi 30 kun" },
  { value: "90", label: "Oxirgi 90 kun" },
  { value: "180", label: "Oxirgi 6 oy" },
  { value: "365", label: "Oxirgi 1 yil" },
  { value: "custom", label: "Maxsus muddat" },
];

export const groupByOptions = [
  { value: "day", label: "Kunlik" },
  { value: "week", label: "Haftalik" },
  { value: "month", label: "Oylik" },
];

// Status tabs for analytics breakdown
export const analyticsTabOptions = [
  { value: "overview", label: "Umumiy" },
  { value: "funnel", label: "Funnel" },
  // XODIMLAR — "kim nechta olib keldi va nechtasi qoldi"
  { value: "staff", label: "Xodimlar" },
  { value: "sources", label: "Manbalar" },
  { value: "directions", label: "Yo'nalishlar" },
  { value: "categories", label: "Toifalar" },
  { value: "trends", label: "Trendlar" },
];

// Chart bar colors (consistent palette)
export const chartBarColors = [
  "#3b82f6",
  "#06b6d4",
  "#6366f1",
  "#a855f7",
  "#f59e0b",
  "#f97316",
  "#22c55e",
  "#ef4444",
  "#ec4899",
  "#14b8a6",
];

export const leadActivityTypeLabels = {
  call: "Qo'ng'iroq",
  meeting: "Uchrashuv",
  note: "Izoh",
  status_change: "Status o'zgarishi",
  visit: "Tashrif",
};

export const leadActivityTypeColors = {
  call: "bg-blue-100 text-blue-700",
  meeting: "bg-purple-100 text-purple-700",
  note: "bg-gray-100 text-gray-700",
  status_change: "bg-amber-100 text-amber-700",
  visit: "bg-green-100 text-green-700",
};

/** Lid formasidagi maydon chegaralari — server bilan AYNI (`lead.service.js`). */
export const LEAD_FIELD_LIMITS = {
  name: 60,
  phone: 30,
  school: 120,
  note: 1000,
};
