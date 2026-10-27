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
  // O'quvchining maktab darajasi — u o'qiydigan guruhdan farq qilishi mumkin
  "Asl sinfi",
  "Telefon",
  "Tangalar",
  "Jarimalar",
  "",
];

// ── ASL SINF (daraja) ────────────────────────────
//
// O'quvchi bilimi yaxshi bo'lgani uchun katta guruhda o'qishi mumkin:
// "Sinflar" — u HOZIR O'QIYOTGAN guruh(lar), "Asl sinfi" — u NECHANCHI
// SINF o'quvchisi (1-sinf … 11-sinf).
//
// ⚠️ SINFLAR KATALOGI EMAS: katalogda "IT 1", "Union 2", "Bog'cha — katta
// guruh" bor va ulardagi raqam guruh tartibi, daraja emas. Shuning uchun
// ro'yxat katalogdan EMAS, shu yerdagi doimiy darajalardan quriladi.
//
// ⚠️ Bu A'ZOLIK EMAS, BELGI: bu yerda daraja almashtirilsa o'quvchi hech
// qaysi sinfga qo'shilmaydi, jurnalga ham yozilmaydi va shuning uchun
// SABAB SO'RALMAYDI (sinf a'zoligidan farqi aynan shu).
//
// ⚠️ Serverdagi `helpers/grade.helpers.js` bilan QO'LDA SINXRON (ikki
// alohida repo): chegara ham, "N-sinf" shakli ham o'sha yerda.

export const MIN_GRADE = 1;
export const MAX_GRADE = 11;

/** [1 … 11] */
export const GRADES = Array.from(
  { length: MAX_GRADE - MIN_GRADE + 1 },
  (_, i) => MIN_GRADE + i,
);

/** Server bilan AYNI so'z: "asl sinfi belgilanmaganlar". */
export const ACTUAL_GRADE_NONE = "none";

/** Darajaning YAGONA matn ko'rinishi — "5-sinf". */
export const formatGrade = (grade) =>
  GRADES.includes(Number(grade)) ? `${Number(grade)}-sinf` : null;

/** Tahrirlash oynasi va yaratish formasi uchun — "1-sinf" … "11-sinf". */
export const getGradeOptions = () =>
  GRADES.map((grade) => ({ value: String(grade), label: formatGrade(grade) }));

/**
 * O'quvchilar ro'yxatidagi "Asl sinf" filtrining variantlari.
 *
 * Yorliqlarda "Asl:" prefiksi bor — yonida turgan sinf filtri bilan
 * chalkashmasin (ikkalasi ham sinf haqida).
 */
export const getActualGradeFilterOptions = () => [
  { value: "", label: "Asl sinf: barchasi" },
  ...GRADES.map((grade) => ({
    value: String(grade),
    label: `Asl: ${formatGrade(grade)}`,
  })),
  { value: ACTUAL_GRADE_NONE, label: "Asl: belgilanmagan" },
];

/** Eksport oynasidagi tanlagich — "barchasi" va "belgilanmagan" bilan. */
export const getActualGradeExportOptions = () => [
  { value: "", label: "Barcha asl sinflar" },
  ...getGradeOptions(),
  { value: ACTUAL_GRADE_NONE, label: "Belgilanmagan" },
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
