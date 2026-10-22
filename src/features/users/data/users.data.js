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
  // O'quvchining O'Z sinfi — u o'qiyotgan guruhdan farq qilishi mumkin
  "Haqiqiy sinfi",
  "Telefon",
  "Tangalar",
  "Jarimalar",
  "",
];

// ── HAQIQIY SINF ────────────────────────────
//
// O'quvchi bilimi yaxshi bo'lgani uchun katta guruhda o'qishi mumkin:
// "Sinflar" — u HOZIR O'QIYOTGAN guruh(lar), "Haqiqiy sinfi" — uning O'Z
// sinfi. Ikkalasi ham AYNI katalogdan (`useClasses`) tanlanadi — ikkinchi
// sinflar ro'yxati yo'q.
//
// ⚠️ Bu A'ZOLIK EMAS, BELGI: bu yerda sinf almashtirilsa o'quvchi o'sha
// sinfga qo'shilmaydi, jurnalga ham yozilmaydi va shuning uchun SABAB
// SO'RALMAYDI (sinf a'zoligidan farqi aynan shu).

/** Server bilan AYNI so'z: "haqiqiy sinfi belgilanmaganlar" filtri. */
export const ACTUAL_CLASS_NONE = "none";

/**
 * O'quvchilar ro'yxatidagi "Haqiqiy sinf" filtrining variantlari.
 *
 * Yorliqlarda "Haqiqiy:" prefiksi bor — yonida turgan oddiy sinf filtri
 * bilan bir xil nomni ko'rsatib, qaysi biri tanlanganini noaniq qoldirmasin.
 *
 * @param {{id: string, name: string}[]} classes
 */
export const getActualClassFilterOptions = (classes = []) => [
  { value: "", label: "Haqiqiy sinf: barchasi" },
  ...classes.map((cls) => ({ value: cls.id, label: `Haqiqiy: ${cls.name}` })),
  { value: ACTUAL_CLASS_NONE, label: "Haqiqiy: belgilanmagan" },
];

/**
 * TANGA USTUNINING KESIMI.
 *
 * `total` — hozirgi QOLDIQ (`coinBalance`, sarflangani ayrilgan), `week` —
 * TANLANGAN haftada (dushanbadan yakshanbagacha) TOPILGAN tanga; qaysi
 * hafta ekanini `coinWeek` langari aytadi, bo'lmasa joriy hafta. Kalitlar
 * serverning `coinPeriod` so'rov parametri bilan AYNI
 * (`coin.service.js` → `resolveCoinPeriod`).
 *
 * ⚠️ Ikkalasi boshqa savolga javob beradi va bir-birini almashtirmaydi:
 * qoldiq — do'kon uchun, haftalik — faollik uchun.
 */
export const COIN_PERIOD_TOTAL = "total";
export const COIN_PERIOD_WEEK = "week";

export const COIN_PERIOD_OPTIONS = [
  { value: COIN_PERIOD_TOTAL, label: "Tangalar: umumiy" },
  { value: COIN_PERIOD_WEEK, label: "Tangalar: haftalik" },
];

/**
 * O'quvchilar jadvalining ustunlari — tanga kesimiga qarab sarlavha
 * o'zgaradi: "Tangalar" ustunida boshqa raqam turgani ekranning o'zidan
 * ko'rinib tursin.
 *
 * @param {string} [coinPeriod]
 */
export const getStudentTableColumns = (coinPeriod = COIN_PERIOD_TOTAL) =>
  STUDENT_TABLE_COLUMNS.map((column) =>
    column === "Tangalar" && coinPeriod === COIN_PERIOD_WEEK
      ? "Tangalar (hafta)"
      : column,
  );

/**
 * EKSPORT KESIMI — tanlangan sinf QAYSI MA'NODA olinadi.
 *
 * "Sinf" — o'quvchi QAYERDA o'qiydi, "Haqiqiy sinf" — u ASLIDA kimniki,
 * "Ikkalasi" — shu sinfga ALOQADOR HAMMA (birlashma).
 *
 * ⚠️ SINF BITTA, MA'NO BITTA: ikkinchi sinf tanlagichi yo'q, shuning uchun
 * "A da o'qiydigan, aslida B niki" degan hech kim so'ramagan kesim paydo
 * bo'la olmaydi. "Ikkalasi" da ikkala shartga tushgan o'quvchi faylga BIR
 * MARTA tushadi — bu birlashma, qo'shish emas.
 */
export const STUDENT_EXPORT_SCOPE_CLASS = "class";
export const STUDENT_EXPORT_SCOPE_ACTUAL = "actual";
export const STUDENT_EXPORT_SCOPE_BOTH = "both";

/** Segment tugmalari — yorliqlar QISQA (uchtasi bir qatorga sig'sin). */
export const STUDENT_EXPORT_SCOPE_OPTIONS = [
  { value: STUDENT_EXPORT_SCOPE_CLASS, label: "Sinf" },
  { value: STUDENT_EXPORT_SCOPE_ACTUAL, label: "Haqiqiy sinf" },
  { value: STUDENT_EXPORT_SCOPE_BOTH, label: "Ikkalasi" },
];

/** Tanlangan kesim nima qilishini odam tilida aytadi (tugmalar ostida). */
export const STUDENT_EXPORT_SCOPE_HINTS = {
  [STUDENT_EXPORT_SCOPE_CLASS]: "Tanlangan sinfda o'qiyotgan o'quvchilar.",
  [STUDENT_EXPORT_SCOPE_ACTUAL]:
    "Haqiqiy sinfi tanlangan sinf bo'lgan o'quvchilar.",
  [STUDENT_EXPORT_SCOPE_BOTH]:
    "Ikkalasi ham: shu sinfda o'qiyotganlar va haqiqiy sinfi shu bo'lganlar — bitta ro'yxatda, takrorlanmasdan.",
};

/** Fayl nomidagi kesim belgisi ("students_haqiqiy_IT_1_...") */
export const STUDENT_EXPORT_SCOPE_FILE_PART = {
  [STUDENT_EXPORT_SCOPE_CLASS]: "",
  [STUDENT_EXPORT_SCOPE_ACTUAL]: "haqiqiy_",
  [STUDENT_EXPORT_SCOPE_BOTH]: "umumiy_",
};

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

/**
 * O'quvchilar eksportidagi ARXIV tanlovi (faqat o'quvchilarda — boshqa
 * rollar eksportiga arxivlangan xodim umuman tushmaydi).
 *
 * `all` — ikkalasi bitta faylda, qatorni ajratish uchun "Holat" ustuni bilan.
 * `suffix` — fayl nomiga qo'shiladi, server bergan nom bilan AYNI.
 */
export const STUDENT_ARCHIVE_OPTIONS = [
  { value: "all", label: "Joriy va arxivlangan (hammasi)", suffix: "" },
  { value: "false", label: "Faqat joriy o'quvchilar", suffix: "_active" },
  {
    value: "true",
    label: "Faqat arxivlangan o'quvchilar",
    suffix: "_archived",
  },
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

// ── Telefon raqamlari ────────────────────────────
//
// Maydon nomi ikkala rolda bitta (`phone`, `parentPhone`), ma'nosi esa
// rolga qarab: o'quvchida ikkinchisi ota-ona, xodimda qo'shimcha raqam.
// Yorliq shu yerda hal qilinadi — karta, modal va yaratish formasi bir xil
// so'zni ishlatsin.

/** Rolga qarab telefon maydonlarining yorliqlari (forma va karta uchun). */
export const getPhoneLabels = (role) =>
  role === "student"
    ? {
        phone: "O'quvchi telefoni",
        parentPhone: "Ota-ona telefoni",
        phoneShort: "O'quvchi",
        parentPhoneShort: "Ota-ona",
      }
    : {
        phone: "Telefon",
        parentPhone: "Qo'shimcha telefon",
        phoneShort: "Telefon",
        parentPhoneShort: "Qo'shimcha",
      };

/**
 * Maskali telefon inputidan chiqqan qiymatni payload'ga tayyorlash.
 *
 * Bo'sh qoldirilgan maydon `null` bo'lib ketadi (server raqamni o'chiradi).
 * Faqat `+998` prefiksi qolgan holat ham bo'sh hisoblanadi — uni maska
 * o'zi yozadi, foydalanuvchi raqam kiritmagan. Qolgan hollarda xom qiymat
 * ketadi: normalizatsiya va tekshiruv serverda.
 *
 * @param {string|null|undefined} value
 * @returns {string|null}
 */
export const maskedPhoneOrNull = (value) => {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits.length > 3 ? value : null;
};
