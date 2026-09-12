// Google Sheets jadvali bo'limining statik ma'lumotlari — sahifa va
// komponentlar ichida yozilmaydi (admin CLAUDE.md qoidasi).

// Icons
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";

/** Yorliq ranglari — bo'lim bo'ylab BITTA to'plam. */
const TONE = {
  gray: "bg-gray-100 text-gray-600 ring-gray-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-800 ring-amber-200",
  orange: "bg-orange-50 text-orange-700 ring-orange-200",
  red: "bg-red-50 text-red-700 ring-red-200",
};

/** Ogohlantirish kartalari — rang + ikonka. */
export const NOTICE_TONES = {
  info: {
    card: "border border-blue-200 bg-blue-50/60",
    icon: "text-blue-600",
    Icon: Info,
  },
  success: {
    card: "border border-emerald-200 bg-emerald-50/60",
    icon: "text-emerald-600",
    Icon: CircleCheck,
  },
  warning: {
    card: "border border-amber-200 bg-amber-50/70",
    icon: "text-amber-600",
    Icon: TriangleAlert,
  },
  danger: {
    card: "border border-red-200 bg-red-50/60",
    icon: "text-red-600",
    Icon: CircleAlert,
  },
};

// Sahifa bo'limlari. Tartib ISH KETMA-KETLIGI bo'yicha: holat → nima
// o'zgargani → nomlarni moslash → versiyalar → tarix.
export const SYNC_TABS = [
  { value: "status", label: "Holat" },
  { value: "changes", label: "O'zgarishlar" },
  { value: "mapping", label: "Moslash" },
  { value: "versions", label: "Versiyalar" },
  { value: "history", label: "Tarix" },
];

export const DEFAULT_TAB = "status";

/** Ro'yxatlarda bir sahifadagi qatorlar soni (server chegarasi — 50). */
export const PAGE_LIMIT = 20;

/** Jadval manbai. */
export const MODE_META = {
  platform: { label: "Platforma", className: TONE.blue },
  sheet: { label: "Google Sheets", className: TONE.emerald },
};

/** O'qilgan holat (revision) holati. */
export const REVISION_STATUS = {
  pending: { label: "Ko'rib chiqilmagan", className: TONE.amber },
  applied: { label: "Qo'llangan", className: TONE.emerald },
  rejected: { label: "Rad etilgan", className: TONE.red },
  superseded: { label: "Eskirgan", className: TONE.gray },
};

/**
 * Sheet'dagi nom platformadagi yozuvga qanday bog'langani.
 *
 * `selectable` — tanlagichda joriy qiymat sifatida ko'rsatiladimi.
 * ⚠️ Taklif va noaniq holatda qiymat KO'RSATILMAYDI: aks holda odam
 * tasdiqlanmagan taklifni "allaqachon bog'langan" deb o'ylardi.
 */
export const RESOLUTION_STATUS = {
  manual: { label: "Qo'lda", className: TONE.blue, selectable: true },
  auto: { label: "Avtomatik", className: TONE.emerald, selectable: true },
  suggested: { label: "Taklif", className: TONE.amber, selectable: false },
  ambiguous: { label: "Noaniq", className: TONE.orange, selectable: false },
  unresolved: { label: "Topilmadi", className: TONE.red, selectable: false },
  missing_target: { label: "O'chirilgan", className: TONE.red, selectable: false },
  archived_target: { label: "Arxivlangan", className: TONE.red, selectable: false },
};

/** Odam aralashuvi kerak bo'lgan holatlar ("O'zgarishlar" tabida chiqadi). */
export const PROBLEM_STATUSES = [
  "suggested",
  "ambiguous",
  "unresolved",
  "missing_target",
  "archived_target",
];

/**
 * Moslash turlari.
 *
 * ⚠️ `bulkConfirm` O'QITUVCHIDA YO'Q: ism o'xshashligi bo'yicha taklif
 * noto'g'ri odamga dars (va oylik) yozib yuborishi mumkin — har bir qator
 * alohida ko'rib tasdiqlanadi.
 */
export const MAPPING_KINDS = [
  {
    kind: "class",
    label: "Sinflar",
    description: "Sheet'dagi ustun nomi → platformadagi sinf.",
    optionsKey: "classes",
    placeholder: "Sinfni tanlang",
    bulkConfirm: true,
  },
  {
    kind: "subject",
    label: "Fanlar",
    description: "Sheet'dagi fan nomi → platformadagi fan.",
    optionsKey: "subjects",
    placeholder: "Fanni tanlang",
    bulkConfirm: true,
  },
  {
    kind: "teacher",
    label: "O'qituvchilar",
    description:
      "Sheet'dagi ism → platformadagi o'qituvchi. Takliflar har qatorda alohida tasdiqlanadi.",
    optionsKey: "teachers",
    placeholder: "O'qituvchini tanlang",
    bulkConfirm: false,
  },
];

/** Bitta PUT /mappings so'rovidagi eng ko'p qator (server chegarasi). */
export const MAPPING_BATCH_LIMIT = 500;

/** Farq turi. */
export const DIFF_TYPE = {
  added: { label: "Yangi", className: TONE.emerald },
  removed: { label: "Olib tashlanadi", className: TONE.red },
  changed: { label: "O'zgaradi", className: TONE.amber },
};

/** Farq jami — qaysi ko'rsatkich qanday nomlanadi. */
export const DIFF_TOTALS = [
  { key: "added", label: "Yangi dars" },
  { key: "removed", label: "Olib tashlanadigan dars" },
  { key: "changed", label: "O'zgaradigan dars" },
  { key: "teacherOnly", label: "Faqat o'qituvchisi o'zgargan" },
  { key: "subjectOnly", label: "Faqat fani o'zgargan" },
  { key: "classesChanged", label: "O'zgargan sinf" },
];

/** Sheet'dagi vaqt → dars tartibi. */
export const SLOT_STATUS = {
  ok: { label: "Mos", className: TONE.emerald },
  no_period: { label: "Dars vaqti yo'q", className: TONE.red },
  ambiguous: { label: "Noaniq", className: TONE.amber },
};

/** O'rinbosarlikka ta'sir turi (asosiy matn serverdan keladi). */
export const SUBSTITUTION_KIND = {
  stale: { label: "Eskiradi", className: TONE.gray },
  retargeted: { label: "Boshqa darsga o'tadi", className: TONE.amber },
  owner_moved: { label: "Dars egasi o'zgaradi", className: TONE.amber },
  substitute_busy: { label: "O'rinbosar band", className: TONE.red },
};

/** Oylik / soat ta'siri yorliqlari. */
export const PAYROLL_FLAGS = {
  hourPaid: { label: "Soatbay oylik", className: TONE.amber },
  payrollSealed: { label: "Oylik muhrlangan", className: TONE.gray },
};

/** Sheet'da yo'q sinf platformada ham o'chirilgan (faqat darslari qolgan). */
export const ORPHAN_CLASS_META = { label: "Sinf o'chirilgan", className: TONE.gray };

/** Moslash qatorida saqlanmagan tahrir. */
export const EDITED_META = { label: "Saqlanmagan", className: TONE.blue };

/** Tarixdagi eng oxirgi o'qilgan holat. */
export const LATEST_META = { label: "Oxirgi", className: TONE.blue };

/** Oxirgi tekshiruv natijasi. */
export const CHECK_RESULT = {
  ok: { label: "Muvaffaqiyatli", className: TONE.emerald },
  failed: { label: "Xato", className: TONE.red },
};

/** Tekshiruv yangiligi (qo'llash va sheet'ga o'tish uchun shart). */
export const CHECK_FRESHNESS = {
  fresh: { label: "Yangi", className: TONE.emerald },
  stale: { label: "15 daqiqadan eski", className: TONE.amber },
};

/** Versiya turi — server `kindLabel` bermasa. */
export const SNAPSHOT_KIND_LABELS = {
  platform_archive: "Platforma jadvali (arxiv)",
  sheet_archive: "Sheet jadvali (arxiv)",
  before_apply: "Sheet o'zgarishidan oldingi holat",
  before_restore: "Tiklashdan oldingi holat",
};

/**
 * 409 sabablari — "ko'rsatilgan ma'lumot eskirgan". Ko'rinish qayta
 * o'qiladi va odamdan qayta tasdiq so'raladi; so'rov o'z-o'zidan
 * TAKRORLANMAYDI.
 */
export const STALE_REASONS = [
  "stale_active",
  "stale_review",
  "not_latest",
  "mode_changed",
  "stale_check",
];

/**
 * 400 sabablari — ko'rinish eskirgan bo'lishi mumkin (yangi tasdiq talab
 * qilindi yoki xato paydo bo'ldi): ko'rinish qayta o'qiladi, odamning
 * belgilagan tasdiqlari saqlanadi (xeshlar o'zgarmasa).
 */
export const VIEW_REFRESH_REASONS = ["ack_required", "validation"];

/**
 * Farq HISOBLANMAGAN holat (`newHash`/`diff`/`hasChanges` — `null`).
 * ⚠️ Bu "farq yo'q" EMAS: nol jami va yashil belgi odamni "hech narsa
 * o'zgarmaydi" deb aldardi.
 */
export const DIFF_UNKNOWN_TEXT = {
  errors: "Farqni hisoblab bo'lmadi — avval xatolarni tuzating",
  old: "Eski tahrir — farq ko'rsatilmaydi",
  snapshot: "Bu versiya uchun farqni hisoblab bo'lmadi",
};

/**
 * Versiya ko'rinishidagi "o'zgarish yo'q" to'sig'i. Platformaga QAYTISHDA
 * u to'siq emas: o'zgarishsiz qaytish ham ruxsat etilgan.
 */
export const NO_CHANGES_BLOCKER = {
  code: "no_changes",
  message: "Amaldagi jadval bu nusxa bilan bir xil",
};

/** Almashtirish oynasida ko'rilayotgan tahrir haqida ogohlantirish. */
export const REVISION_ATTENTION = {
  created: "Bu yangi tahrir — uni hali hech kim ko'rib chiqmagan",
  rejected: "Bu tahrir rad etilgan",
  applied: "Bu tahrir allaqachon qo'llangan",
  superseded: "Bu tahrir eskirgan — yangisi bor",
};

/**
 * Server talab qilgan, lekin matni hali kelmagan tasdiq (eski server
 * `details.acks` bermasa) — katak baribir chiqadi, aks holda tugma
 * sababsiz yopiq qolardi.
 */
export const ACK_FALLBACK = {
  title: "Qo'shimcha tasdiq talab qilinadi",
  message: "Ko'rinish yangilanmoqda — tafsilot birozdan keyin chiqadi.",
};

/** O'qituvchi tanlovida fani yo'q xodim. */
export const NO_SUBJECT_LABEL = "fan belgilanmagan";

/** Rad etish sababi uzunligi (server chegarasi). */
export const REJECT_REASON_MAX = 500;

/** Ro'yxatda birdaniga ko'rsatiladigan xato / ogohlantirishlar. */
export const ISSUE_PREVIEW_LIMIT = 8;

// ── Jadval ustunlari ──────────────────────────

export const MAPPING_COLUMNS = [
  "Sheet'dagi nom",
  { label: "Uchraydi", align: "center" },
  "Holat",
  "Platformadagi yozuv",
  { label: "", align: "right" },
];

export const SLOT_COLUMNS = ["Sheet'dagi vaqt", "Dars tartibi", "Holat"];

export const PAYROLL_COLUMNS = [
  "O'qituvchi",
  { label: "Hozir", align: "center" },
  { label: "Keyin", align: "center" },
  "Izoh",
];

export const SNAPSHOT_COLUMNS = [
  "Versiya",
  "Saqlangan",
  "Kim",
  { label: "Sinf", align: "center" },
  { label: "Dars", align: "center" },
  "Izoh",
  { label: "", align: "right" },
];

export const REVISION_COLUMNS = [
  "Holat",
  "O'qilgan",
  "Kim o'qidi",
  "Ko'rib chiqdi",
  { label: "Sinf / dars", align: "center" },
  { label: "Muammo", align: "center" },
  "Izoh",
];
