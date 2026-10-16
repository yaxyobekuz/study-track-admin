/**
 * UMUMIY KO'RINISH — "barcha filiallar birga" rejimi (faqat tizim egasi).
 *
 * ⚠️ Qiymat SERVER bilan bir xil bo'lishi SHART (`utils/constants.js` dagi
 * `ALL_BRANCHES_ID`): almashtirgich shu id ni yuboradi, `/auth/me` esa shu
 * id bilan qaytadi. 24-hex EMAS, ya'ni haqiqiy filial id si bilan hech
 * qachon to'qnashmaydi.
 */
export const ALL_BRANCHES_ID = "__all__";

/** Joriy filial umumiy ko'rinishmi? */
export const isAggregateBranch = (branch) =>
  Boolean(branch) && (branch.id === ALL_BRANCHES_ID || branch.isAggregate === true);

// Filial bazasining holati — server `Branch.status` enumi bilan bir xil.
export const BRANCH_STATUSES = {
  provisioning: {
    label: "Tayyorlanmoqda",
    description: "Baza yaratilmoqda va migratsiyalar qo'llanmoqda",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  ready: {
    label: "Ishlayapti",
    description: "Filial to'liq ishga tayyor",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  failed: {
    label: "Xato",
    description: "Baza tayyorlanmadi — sababni ko'rib, qayta urining",
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

export const branchStatus = (status) =>
  BRANCH_STATUSES[status] ?? {
    label: status ?? "—",
    description: "",
    className: "bg-gray-50 text-gray-600 border-gray-200",
  };

// Filial kodi — schema nomiga aylanadi, shuning uchun qoida qat'iy va
// server bilan bir xil (`branch.service.js` dagi CODE_PATTERN).
export const BRANCH_CODE_PATTERN = /^[a-z][a-z0-9_]{1,30}$/;

export const BRANCH_CODE_HINT =
  "Lotin kichik harf bilan boshlanib, 2–31 belgi: harf, raqam, pastki chiziq. " +
  "Keyin o'zgartirib bo'lmaydi — baza shu koddan hosil qilinadi.";

/**
 * Kiritilgan nomdan taxminiy kod taklif qiladi ("Chilonzor filiali" → "chilonzor").
 *
 * Faqat TAKLIF: foydalanuvchi uni tahrirlashi mumkin va yakuniy tekshiruv
 * baribir serverda. Mos kod chiqmasa bo'sh satr qaytadi — noto'g'ri qiymatni
 * maydonga tiqib qo'ymaymiz.
 */
export const suggestCode = (name = "") => {
  const base = String(name)
    .toLowerCase()
    .replace(/[ʻ'’‘`]/g, "") // o'zbekcha apostroflar tashlanadi: o'quv → oquv
    .replace(/[^a-z0-9\s_]/g, " ")
    .trim()
    .split(/\s+/)[0] // "chilonzor filiali" → "chilonzor"
    .slice(0, 31);

  return BRANCH_CODE_PATTERN.test(base) ? base : "";
};
