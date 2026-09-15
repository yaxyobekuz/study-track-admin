/**
 * AI YORDAMCHI — statik matnlar va ro'yxatlar.
 *
 * ⚠️ HOLAT VA XAVF YORLIQLARI SERVERDAN KELADI (`statusLabel`, `riskLabel`).
 * Bu yerdagi nusxa faqat filtr tugmalari uchun (server javobidan oldin
 * chiziladi) — kartada doim server yorlig'i ko'rsatiladi, ikki joyda ikki
 * xil matn chiqib qolmasligi uchun.
 */

/** Bo'sh suhbatdagi takliflar. Matn to'g'ridan-to'g'ri yuboriladi. */
export const SUGGESTIONS = [
  {
    id: "health",
    title: "Umumiy tahlil",
    description: "Moliya, ta'lim va operatsiyalar bo'yicha hozirgi holat va muammolar",
    prompt:
      "Platformaning to'liq tahlilini qiling: umumiy holat, yaxshi ishlayotgan yo'nalishlar, muammolar va tavsiyalar.",
  },
  {
    id: "debts",
    title: "To'lovlar va qarzdorlik",
    description: "Joriy oyda yig'ilgan to'lovlar va eng katta qarzdorlar",
    prompt: "Joriy oy bo'yicha to'lovlar qanchalik yig'ilgan? Eng katta qarzdorlarni ko'rsating.",
  },
  {
    id: "payroll",
    title: "Oylik majburiyatlari",
    description: "Xodimlarga hisoblangan, to'langan va qarz qolgan oylik",
    prompt: "Bu oy xodimlarga qancha oylik hisoblangan, qanchasi to'langan va kimlarga qarzdormiz?",
  },
  {
    id: "attendance",
    title: "Bugungi davomat",
    description: "O'quvchi va xodimlar davomati, eng ko'p kelmagan sinflar",
    prompt: "Bugungi davomat qanday? Eng ko'p kelmagan sinflarni va kelmagan xodimlarni ayting.",
  },
  {
    id: "schedule",
    title: "Dars jadvali",
    description: "Bugungi darslar, o'rinbosarlar va jadvaldagi to'qnashuvlar",
    prompt: "Bugungi dars jadvalida muammo bormi? Faol o'rinbosarliklar va to'qnashuvlarni ko'rsating.",
  },
  {
    id: "control",
    title: "Nazorat va xavfsizlik",
    description: "Muddati o'tgan topshiriqlar, ogohlantirishlar, xabar navbati",
    prompt:
      "Muddati o'tgan topshiriqlar, ochiq xavfsizlik ogohlantirishlari va Telegram xabar navbatidagi muammolarni tekshiring.",
  },
];

/** Amallar tarixi filtrlari. `value` — server `status` parametri. */
export const ACTION_STATUS_FILTERS = [
  { value: "", label: "Hammasi" },
  { value: "pending", label: "Tasdiq kutilmoqda" },
  { value: "succeeded", label: "Bajarildi" },
  { value: "failed", label: "Bajarilmadi" },
  { value: "rejected", label: "Bekor qilindi" },
  { value: "expired", label: "Muddati o'tdi" },
];

/** Suhbatlar ro'yxati guruhlari (oxirgi xabar vaqti bo'yicha). */
export const CONVERSATION_GROUPS = [
  { key: "today", label: "Bugun" },
  { key: "yesterday", label: "Kecha" },
  { key: "week", label: "Oxirgi 7 kun" },
  { key: "older", label: "Avvalroq" },
];

/** Standart chegaralar — `/status` javobi kelguncha (server bilan bir xil). */
export const DEFAULT_LIMITS = {
  maxTextLength: 4000,
  maxVoiceSeconds: 300,
  maxVoiceBytes: 10 * 1024 * 1024,
};

/** Hisoblagich shu belgidan keyin ko'rinadi. */
export const COUNTER_THRESHOLD = 3500;

/** Ovozli xabar: bundan qisqasi tashlanadi (tasodifiy bosish). */
export const MIN_VOICE_MS = 700;

/** Ro'yxatlar sahifa hajmi. */
export const CONVERSATIONS_PAGE_SIZE = 30;
export const ACTIONS_PAGE_SIZE = 20;

export const COPY = {
  pageTitle: "AI yordamchi",
  newConversation: "Yangi suhbat",
  conversations: "Suhbatlar",
  actionsHistory: "Amallar tarixi",
  assistantName: "Yordamchi",

  emptyTitle: "Platforma bo'yicha savol bering yoki topshiriq bering",
  emptyHint:
    "Yordamchi faqat shu platforma ma'lumotlari bilan ishlaydi. O'zgartirishlar siz tasdiqlaganingizdan keyingina bajariladi.",

  composerPlaceholder: "Savol yoki topshiriq yozing…",
  composerNote: "Amallar faqat siz tasdiqlaganingizdan keyin bajariladi.",
  composerBusyElsewhere: "Boshqa suhbatda javob yozilmoqda — u tugashini kuting",
  composerTooLong: "Xabar juda uzun",
  turnInProgress: "Javob hali yozilmoqda — u tugashini kuting",

  notConfigured: "AI sozlanmagan: serverda OPENAI_API_KEY kiritilmagan. Yordamchi hozircha ishlamaydi.",

  thinking: "Tahlil qilinmoqda",
  transcribing: "Ovozli xabar matnga aylantirilmoqda",
  sending: "Yuborilmoqda",
  transcript: "Matni",

  interrupted: "Javob to'xtatildi",
  connectionLost: "Aloqa uzildi — javob to'liq yetib kelmadi",
  errorTitle: "Javob yakunlanmadi",
  retry: "Qayta yuborish",
  genericError: "Xatolik yuz berdi",
  networkError: "Serverga ulanib bo'lmadi. Internet aloqasini tekshiring.",

  notFoundTitle: "Suhbat topilmadi",
  notFoundHint: "U o'chirilgan yoki boshqa filialga tegishli bo'lishi mumkin.",
  loadError: "Suhbatni yuklab bo'lmadi",

  noConversations: "Hali suhbat yo'q",
  noSearchResults: "Hech narsa topilmadi",
  loadMore: "Ko'proq yuklash",
  searchPlaceholder: "Suhbatlardan qidirish",
  streamingMeta: "Javob yozilmoqda",

  scrollToBottom: "Pastga",
  threadLabel: "Suhbat",
  reload: "Qayta urinish",
  loadFailed: "Ma'lumotni yuklab bo'lmadi",
  listLoadFailed: "Ro'yxatni yuklab bo'lmadi",
  close: "Yopish",
  conversationsSheetHint: "AI yordamchi bilan suhbatlar ro'yxati",

  recordVoice: "Ovozli xabar yozish",
  recordingLabel: "Ovozli xabar yozilmoqda",
  micConnecting: "Mikrofon ulanmoqda",
  stopAnswer: "Javobni to'xtatish",
  send: "Yuborish",
  sendHint: "Yuborish (Enter)",
  cancel: "Bekor qilish",

  ownerOnlyTitle: "Ruxsat yo'q",
  ownerOnlyHint: "Bu bo'lim faqat tizim egasi uchun.",
};

export const VOICE_COPY = {
  permissionDenied: "Mikrofondan foydalanishga ruxsat berilmagan",
  notFound: "Mikrofon topilmadi",
  insecure: "Ovoz yozish uchun xavfsiz ulanish (HTTPS) kerak",
  unsupported: "Brauzer ovoz yozishni qo'llab-quvvatlamaydi",
  busy: "Mikrofon boshqa dastur tomonidan band",
  failed: "Ovoz yozishni boshlab bo'lmadi",
  tooShort: "Ovozli xabar juda qisqa",
  tooLarge: "Ovozli xabar juda katta",
  limitReached: "Ovozli xabar vaqt chegarasiga yetdi va yuborildi",
  playbackBlocked: "Brauzer ovozni ijro etishga ruxsat bermadi. Qayta bosing.",
  playbackFailed: "Audio faylni ijro etib bo'lmadi",
  loadFailed: "Audio faylni yuklab bo'lmadi",
};

export const ACTION_COPY = {
  columns: { indicator: "Ko'rsatkich", before: "Hozir", after: "Keyin" },
  effects: "Oqibatlar",
  warnings: "Diqqat",
  acknowledge: "Oqibatlarini tushundim",
  confirm: "Tasdiqlash",
  reject: "Bekor qilish",
  executing: "Bajarilmoqda",
  waitForAnswer: "Javob yakunlangach tasdiqlash mumkin",
  previewChanged: "Ma'lumot o'zgargan — yangilangan ko'rinishni tekshirib, qayta tasdiqlang",
  expiredHint: "Taklif muddati o'tdi. Kerak bo'lsa, yordamchidan qayta taklif qilishni so'rang.",
  rejectedHint: "Taklif bekor qilindi. Hech narsa o'zgarmadi.",
  failedTitle: "Amal bajarilmadi",
  expiredLabel: "Muddati o'tdi",
  expiresSoon: "1 daqiqadan kam vaqt qoldi",
};

export const ACTIONS_PAGE_COPY = {
  title: "Amallar tarixi",
  hint: "Yordamchi taklif qilgan o'zgarishlar, sizning qarorlaringiz va natijalar",
  filterLabel: "Holat bo'yicha filtr",
  columns: ["Sana", "Amal", "Xavf", "Holat", "Natija", "Suhbat"],
  empty: "Bu holatda amal yo'q",
  emptyAll: "Yordamchi hali hech qanday amal taklif qilmagan",
  openConversation: "Suhbatni ochish",
  deletedConversation: "Suhbat o'chirilgan",
  sheetTitle: "Amal tafsilotlari",
  createdAt: "Taklif qilingan",
  executedAt: "Bajarilgan",
  conversation: "Suhbat",
};
