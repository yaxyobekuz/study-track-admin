/**
 * FACE ID — STATIK MA'LUMOT.
 *
 * ⚠️ Tablar, yorliqlar va natija nomlari komponent ichida yozilmaydi:
 * bir xil ro'yxat ikki joyda paydo bo'lsa, biri o'zgarib ikkinchisi
 * eskirardi (`devices.data.js` bilan bir xil qoida).
 *
 * ⚠️ NATIJA YORLIQLARI SERVER ENUMI BILAN BIR XIL BO'LISHI SHART
 * (`FaceCheckResult`, `prisma/schema.prisma`). Server yangi natija
 * qo'shsa, u bu ro'yxatga ham qo'shiladi — aks holda jurnalda xom
 * `low_quality` matni chiqib qolardi.
 */

/* ─────────────────────── TABLAR ─────────────────────── */

/**
 * ⚠️ TARTIB — SAVOL TARTIBI: "qurilmalar ishlayaptimi?" → "kim
 * ro'yxatda?" → "kirish eshigida nima bo'ldi?" → "sozlama". Yon
 * menyudagi tartib ham AYNI shunday.
 */
export const FACE_ID_TABS = [
  {
    to: "/face-id/kiosks",
    label: "Kiosklar",
    title: "Face ID",
    can: "faceId.view",
  },
  {
    // ⚠️ Alohida ruxsat (`faceId.enroll`): yuz namunasini olish
    // biometrika yozish degani.
    to: "/face-id/enroll",
    label: "Ro'yxatga olish",
    title: "Face ID",
    can: "faceId.view",
  },
  {
    // ⚠️ Alohida ruxsat (`faceId.events`): jurnal kirish eshigidagi
    // kamera KADRLARINI ko'rsatadi, ya'ni shaxsiy ma'lumot.
    to: "/face-id/events",
    label: "Jurnal",
    title: "Face ID",
    can: "faceId.events",
  },
  {
    to: "/face-id/settings",
    label: "Sozlamalar",
    title: "Face ID",
    can: "faceId.settings",
  },
];

/* ─────────────────────── KIOSK HOLATI ─────────────────────── */

/**
 * ⚠️ `pending` va `revoked` IKKI XIL holat va ularni bitta rangga
 * yig'ish xato bo'lardi: birinchisi "hali o'rnatilmagan" (normal,
 * kutilayotgan ish), ikkinchisi "uzilgan" (e'tibor talab qiladi).
 */
export const KIOSK_STATUS = {
  pending: {
    label: "Biriktirilmagan",
    hint: "Kod berilgan, kompyuterga hali o'rnatilmagan",
    tone: "bg-sky-50 text-sky-700",
    dot: "bg-sky-500",
  },
  active: {
    label: "Ishlayapti",
    hint: "Qurilma biriktirilgan va davomat qabul qilyapti",
    tone: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  suspended: {
    label: "To'xtatilgan",
    hint: "Token tirik, lekin server so'rovlarni rad etyapti",
    tone: "bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  revoked: {
    label: "Bekor qilingan",
    hint: "Token o'ldirilgan — qayta biriktirish kerak",
    tone: "bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
  },
};

export const KIOSK_STATUS_FILTERS = [
  { value: "all", label: "Barcha holatlar" },
  { value: "active", label: "Ishlayapti" },
  { value: "pending", label: "Biriktirilmagan" },
  { value: "suspended", label: "To'xtatilgan" },
  { value: "revoked", label: "Bekor qilingan" },
];

/**
 * Kiosk rejimi — `KioskMode` enumi.
 *
 * Kirish eshigidagi kiosk ikkalasini ham, o'qituvchilar xonasidagi faqat
 * xodimni o'tkazadi: bir binoda ikki xil joy, ikki xil siyosat.
 */
export const KIOSK_MODES = [
  { value: "both", label: "Xodim va o'quvchi" },
  { value: "staffOnly", label: "Faqat xodimlar" },
  { value: "studentOnly", label: "Faqat o'quvchilar" },
];

/** Qurilma shuncha daqiqa jim bo'lsa "aloqa yo'q" deb ko'rsatiladi. */
export const KIOSK_OFFLINE_AFTER_MIN = 5;

/* ─────────────────────── JURNAL ─────────────────────── */

/**
 * NATIJA YORLIQLARI — `FaceCheckResult` enumining nusxasi.
 *
 * ⚠️ `no_match` va `ambiguous` ALOHIDA yorliqda: birinchisi "ro'yxatga
 * olish kerak", ikkinchisi "qo'lda belgilash kerak". Ikkalasini
 * "tanilmadi" deb ko'rsatish xodimni noto'g'ri ishga yuborardi.
 */
export const CHECK_RESULTS = {
  marked: { label: "Belgilandi", tone: "bg-emerald-50 text-emerald-700", ok: true },
  cooldown: { label: "Allaqachon o'tgan", tone: "bg-gray-100 text-gray-600" },
  already: { label: "Allaqachon qayd etilgan", tone: "bg-gray-100 text-gray-600" },
  no_match: { label: "Tanilmadi", tone: "bg-amber-50 text-amber-700" },
  ambiguous: { label: "Noaniq (o'xshash)", tone: "bg-orange-50 text-orange-700" },
  spoof: { label: "Tiriklik rad etdi", tone: "bg-rose-50 text-rose-700" },
  low_quality: { label: "Kadr sifatsiz", tone: "bg-amber-50 text-amber-700" },
  not_enrolled: { label: "Sinf/davr yo'q", tone: "bg-orange-50 text-orange-700" },
  blocked: { label: "Ruxsat yo'q", tone: "bg-rose-50 text-rose-700" },
  rejected: { label: "Darvoza rad etdi", tone: "bg-rose-50 text-rose-700" },
  error: { label: "Xato", tone: "bg-rose-50 text-rose-700" },
};

export const CHECK_RESULT_FILTERS = [
  { value: "all", label: "Barcha natijalar" },
  ...Object.entries(CHECK_RESULTS).map(([value, meta]) => ({ value, label: meta.label })),
];

/** `FaceCheckKind` enumining nusxasi. */
export const CHECK_KINDS = {
  checkIn: { label: "Kelish" },
  checkOut: { label: "Ketish" },
  studentMark: { label: "O'quvchi davomati" },
  enroll: { label: "Ro'yxatga olish" },
  unknown: { label: "Aniqlanmagan" },
};

export const CHECK_KIND_FILTERS = [
  { value: "all", label: "Barcha amallar" },
  ...Object.entries(CHECK_KINDS).map(([value, meta]) => ({ value, label: meta.label })),
];

/* ─────────────────────── RO'YXATGA OLISH ─────────────────────── */

export const PERSON_ROLE_FILTERS = [
  { value: "all", label: "Hamma" },
  { value: "staff", label: "Xodimlar" },
  { value: "student", label: "O'quvchilar" },
];

export const ENROLLED_FILTERS = [
  { value: "all", label: "Ro'yxatdan qat'i nazar" },
  { value: "false", label: "Ro'yxatga olinmaganlar" },
  { value: "true", label: "Ro'yxatga olinganlar" },
];

/**
 * ⚠️ KAMIDA SHUNCHA KADR tavsiya etiladi. Bitta vektor bilan ko'zoynak
 * kiygan odam har kuni "tanilmadi" bo'lardi — shuning uchun ekranda
 * ochiq maslahat turadi.
 */
export const RECOMMENDED_SAMPLES = 3;

/**
 * SOZLAMA MAYDONLARINING IZOHLARI.
 *
 * ⚠️ "Nima uchun" ekranda turishi SHART: chegarani o'zgartiradigan odam
 * `0.62` raqamining ma'nosini bilmaydi va tasodifan 0.95 qo'yib butun
 * maktabni "tanilmadi" holatiga tushirishi mumkin.
 */
export const SETTING_FIELDS = [
  {
    group: "Taqqoslash",
    items: [
      {
        key: "matchThreshold",
        label: "Mos kelish chegarasi",
        hint: "Yuz shu darajadan yuqori o'xshasa — odam tanildi. Yuqori qiymat xato tanishni kamaytiradi, lekin \"tanilmadi\" holatini ko'paytiradi.",
        percent: true,
      },
      {
        key: "marginThreshold",
        label: "Noaniqlik darvozasi",
        hint: "Birinchi va ikkinchi o'rin orasidagi minimal farq. 0 qilinsa aka-uka yoki egizak bir-birining davomatini belgilab ketishi mumkin.",
        percent: true,
      },
      {
        key: "minFaceQuality",
        label: "Kadr sifati",
        hint: "Bundan past ishonchli kadr taqqoslanmaydi — \"yaqinroq turing\" deb ko'rsatiladi.",
        percent: true,
      },
    ],
  },
  {
    group: "Tiriklik (anti-spoof)",
    items: [
      {
        key: "antispoofThreshold",
        label: "Rasm/ekran tekshiruvi",
        hint: "0 qilinsa telefondagi rasm bilan davomatdan o'tish mumkin bo'ladi.",
        percent: true,
        danger: true,
      },
      {
        key: "livenessThreshold",
        label: "Tiriklik tekshiruvi",
        hint: "Kadrdagi yuz tirik odamnikimi. Kamerasi sifatsiz qurilmada pasaytirish kerak bo'lishi mumkin.",
        percent: true,
        danger: true,
      },
    ],
  },
  {
    group: "Takror skaner",
    items: [
      {
        key: "cooldownSeconds",
        label: "Kutish oynasi (soniya)",
        hint: "Shu oynada ayni odamga ikkinchi qayd yozilmaydi — kameraga bir necha marta tushish bitta qayd beradi.",
      },
      {
        key: "checkoutMinMinutes",
        label: "Ketishga o'tish (daqiqa)",
        hint: "Kelishdan keyin shuncha vaqt o'tmaguncha avtomatik \"ketish\" yozilmaydi. Xodim \"Ketish\" tugmasini bosib vaqtni kutmasligi ham mumkin.",
      },
    ],
  },
  {
    group: "Ro'yxatga olish",
    items: [
      {
        key: "maxSamplesPerPerson",
        label: "Bir odamga kadr soni",
        hint: "Chegaradan oshsa eng eski kadr o'chiriladi — soch, ko'zoynak va soqol o'zgarishini ushlab turish uchun.",
      },
      {
        key: "duplicateThreshold",
        label: "Dublikat chegarasi",
        hint: "Yangi kadr boshqa odamga shu darajadan yuqori o'xshasa — rad etiladi. Mos kelish chegarasidan yuqori bo'lmasligi kerak.",
        percent: true,
      },
    ],
  },
  {
    group: "O'quvchilar",
    items: [
      {
        key: "studentLateGraceMinutes",
        label: "Kechikish imtiyozi (daqiqa)",
        hint: "Sinfning birinchi darsi boshlanganidan shuncha vaqt o'tgach kelgan o'quvchi \"kechikdi\" bo'ladi.",
      },
    ],
  },
  {
    group: "Maxfiylik",
    items: [
      {
        key: "snapshotRetentionDays",
        label: "Kadrlarni saqlash (kun)",
        hint: "Muddatdan keyin kadr o'chiriladi, jurnal qatori esa qoladi.",
      },
    ],
  },
];

/** Bayroqlar — slayder emas, kalit. */
export const SETTING_TOGGLES = [
  {
    key: "staffEnabled",
    label: "Xodimlar uchun yoqilgan",
    hint: "O'chirilsa kiosk xodimlarni o'tkazmaydi (panel va telefon yo'li ishlashda davom etadi).",
  },
  {
    key: "studentEnabled",
    label: "O'quvchilar uchun yoqilgan",
    hint: "O'chirilsa kiosk o'quvchilarni o'tkazmaydi.",
  },
  {
    key: "storeSnapshots",
    label: "Kadrlarni saqlash",
    hint: "O'chirilsa jurnalda rasm bo'lmaydi — faqat ism, vaqt va natija.",
  },
  {
    key: "offlineGalleryEnabled",
    label: "Oflayn rejim",
    hint: "O'chirilsa yuz vektorlari kompyuterda saqlanmaydi, lekin kiosk internetsiz ishlamaydi.",
  },
];
