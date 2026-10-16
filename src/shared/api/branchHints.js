/**
 * UMUMIY KO'RINISHDA YOZUV QAYSI FILIALGA KETADI — id → filial xaritasi.
 *
 * Umumiy ("barcha filiallar") rejimida ro'yxatlar birlashgan holda keladi va
 * server har qatorga `_branch` ni yozadi. Yozuv amali esa AYNAN BITTA
 * filialda bajarilishi kerak. Shu modul o'qilgan qatorlardan "bu id — shu
 * filialda" degan belgini eslab qoladi va keyingi yozuv so'roviga
 * `X-Branch-Id` sarlavhasini qo'yadi.
 *
 * ⚠️ BU FAQAT MASLAHAT, HIMOYA EMAS. Server sarlavhani baribir o'z
 * ro'yxatiga solishtiradi (`aggregateScope.resolveWriteBranch`) va qator
 * haqiqatan o'sha filialda ekanini yo'ldagi id bo'yicha o'zi ham tekshira
 * oladi. Shuning uchun xarita eskirsa yoki bo'sh bo'lsa — eng yomoni
 * "filialni tanlang" degan toza xato, jim xato EMAS.
 *
 * ⚠️ IKKI XIL FILIAL TOPILSA — SARLAVHA YUBORILMAYDI. Bir amalda ikki
 * filialning qatori qatnashsa (masalan boshqa filialdagi o'quvchiga shu
 * filialdagi qatorni bog'lash) buni "to'g'rilab" yuborish mumkin emas:
 * server aniq filial so'raydi.
 */

/** Xarita hajmi: eski yozuvlar o'chiriladi (xotira cheksiz o'smasin). */
const MAX_ENTRIES = 5000;

/** Javobni qanchalik chuqur kuzatish — qatorlar odatda 1-2 qavatda. */
const MAX_DEPTH = 3;

/** 24-hex id (loyihadagi barcha id lar shunday). */
const ID_PATTERN = /^[0-9a-fA-F]{24}$/;

/** id → branchId */
const hints = new Map();

const remember = (id, branchId) => {
  if (!id || !branchId) return;
  if (hints.has(id)) hints.delete(id); // tartibni yangilash (LRU)
  hints.set(id, branchId);
  if (hints.size > MAX_ENTRIES) {
    const oldest = hints.keys().next().value;
    hints.delete(oldest);
  }
};

/**
 * Javobdagi `_branch` belgilarini eslab qoladi.
 *
 * @param {*} payload - `response.data`
 */
export const rememberBranchHints = (payload) => {
  const walk = (node, depth) => {
    if (!node || depth > MAX_DEPTH) return;

    if (Array.isArray(node)) {
      for (const item of node) walk(item, depth + 1);
      return;
    }

    if (typeof node !== "object") return;

    if (node._branch?.id && typeof node.id === "string") {
      remember(node.id, node._branch.id);
    }

    for (const value of Object.values(node)) {
      if (value && typeof value === "object") walk(value, depth + 1);
    }
  };

  walk(payload, 0);
};

/** Filial almashganda xarita ma'nosini yo'qotadi. */
export const clearBranchHints = () => hints.clear();

/** Faqat sinov va nosozlik tekshiruvi uchun. */
export const branchHintFor = (id) => hints.get(id) ?? null;

/**
 * So'rov uchun filialni taxmin qiladi: yo'ldagi va tanadagi id lar bo'yicha.
 *
 * @param {{url?: string, data?: *}} config - axios so'rov konfiguratsiyasi
 * @returns {string|null} filial id si yoki `null`
 */
export const resolveRequestBranch = ({ url = "", data } = {}) => {
  const found = new Set();

  const take = (id) => {
    const branchId = typeof id === "string" ? hints.get(id) : null;
    if (branchId) found.add(branchId);
  };

  // 1) Yo'ldagi id lar — eng aniq manba (`/users/<id>/archive`)
  for (const part of String(url).split(/[/?&=]/)) {
    if (ID_PATTERN.test(part)) take(part);
  }

  // 2) Tanadagi id maydonlari (`studentId`, `ids: [...]`) — detal oynasidan
  //    yangi yozuv qo'shilganda yo'lda id bo'lmaydi, lekin tanada bo'ladi.
  //    ⚠️ `FormData` ham tekshiriladi: fayl yuklaydigan oynalar (topshiriq,
  //    zarar, rasm) tanani shu shaklda yuboradi va JSON kabi o'qilmaydi.
  const entries = bodyEntries(data);
  for (const [key, value] of entries) {
    if (!/^(id|ids|.*Id|.*Ids)$/.test(key)) continue;
    if (typeof value === "string") take(value);
    else if (Array.isArray(value)) value.forEach(take);
  }

  // ⚠️ Bittadan ko'p filial topilsa — taxmin qilmaymiz.
  return found.size === 1 ? [...found][0] : null;
};

/**
 * So'rov tanasidan `[kalit, qiymat]` juftlari.
 *
 * JSON obyekt, JSON matn va `FormData` — uchtasi ham qo'llanadi; qolgan
 * turlar (Blob, stream) uchun bo'sh ro'yxat qaytadi.
 */
const bodyEntries = (data) => {
  if (!data) return [];
  if (typeof FormData !== "undefined" && data instanceof FormData) {
    return [...data.entries()];
  }
  const body = typeof data === "string" ? safeParse(data) : data;
  if (!body || typeof body !== "object" || Array.isArray(body)) return [];
  return Object.entries(body);
};

const safeParse = (raw) => {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};
