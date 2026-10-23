/**
 * FILIALLAR KESIMI — "bu raqamning qanchasi qaysi filialdan".
 *
 * Umumiy ("barcha filiallar") rejimida server so'rovni har filialda alohida
 * bajarib, javoblarni birlashtiradi. Sanoqchi qo'shiladi, foiz esa
 * o'rtachalanadi — ya'ni ekranda BITTA raqam turadi va "461 o'quvchi"
 * degan yozuv "qayerda?" degan savolni javobsiz qoldirardi.
 *
 * Shuning uchun server jami raqam YONIDA kesimni ham yuboradi
 * (`meta.aggregate.byBranch`, `helpers/aggregateMerge.helpers.js`):
 *
 *   { branches: [{id, code, name, shortName}, ...],
 *     values:   { "data.students": [120, 90, null, 251] } }
 *
 * Bu modul o'sha kesimni javobdan olib, ma'lumot obyektining O'ZIGA
 * yozadi — panel komponenti uni `branchSplitOf(data, "students")` bilan
 * o'qiydi.
 *
 * ⚠️ MAYDON ENUMERABLE va bu ATAYLAB. TanStack Query javoblarni
 * "strukturaviy ulashadi": ma'lumot o'zgarganda u YANGI obyekt yasab,
 * eskisining faqat SANAB O'TILADIGAN kalitlarini ko'chiradi. Yashirin
 * (non-enumerable) maydon o'sha ko'chirishda jimgina yo'qolardi va kesim
 * birinchi yangilanishdayoq ekrandan g'oyib bo'lardi. Nomi `_branch`
 * bilan AYNI naqshda — server qo'shadigan, pastki chiziqli xizmat maydoni.
 *
 * ⚠️ FAQAT OBYEKT JAVOBGA yoziladi. Ro'yxatda kesimning hojati yo'q: u
 * yerda har qator allaqachon `_branch` bilan belgilangan.
 */

/** Ma'lumot obyektidagi xizmat maydoni. */
export const AGGREGATE_FIELD = "_aggregate";

/**
 * Server yo'llari `data.` bilan boshlanadi (javob konverti), panel esa
 * ma'lumotning O'ZI bilan ishlaydi — prefiks shu yerda olib tashlanadi.
 */
const DATA_PREFIX = "data.";

/**
 * Javobdagi kesimni ma'lumot obyektiga yozadi.
 *
 * @param {*} payload - `response.data` (javob konverti)
 */
export const attachAggregateMeta = (payload) => {
  const byBranch = payload?.meta?.aggregate?.byBranch;
  if (!byBranch?.branches?.length || !byBranch.values) return;

  const data = payload.data;
  if (!data || typeof data !== "object" || Array.isArray(data)) return;

  const values = {};
  for (const [path, line] of Object.entries(byBranch.values)) {
    if (!Array.isArray(line)) continue;
    const key = path.startsWith(DATA_PREFIX) ? path.slice(DATA_PREFIX.length) : path;
    values[key] = line;
  }

  data[AGGREGATE_FIELD] = {
    branches: byBranch.branches,
    values,
    // "Nechta odam bir nechta filialda sanalgan" — kesim yig'indisi
    // jamidan katta chiqqanda sababini aytish uchun (`shared`).
    shared: payload.meta.aggregate.shared ?? null,
  };
};

/**
 * Bitta raqamning filiallar kesimi.
 *
 * @param {object} data - so'rov qaytargan ma'lumot obyekti
 * @param {string} path - kalit yo'li (`"students"`, `"kpi.income.value"`)
 * @returns {Array<{branch: object, value: *}>|null} kesim yoki `null`
 */
export const branchSplitOf = (data, path) => {
  const meta = data?.[AGGREGATE_FIELD];
  if (!meta?.branches?.length || !path) return null;

  const line = meta.values?.[path];
  if (!Array.isArray(line)) return null;

  return meta.branches.map((branch, index) => ({
    branch,
    value: line[index] ?? null,
  }));
};

/**
 * Nechta odam bir nechta filialda sanalgan.
 *
 * ⚠️ FAQAT SERVER AYTGANDA chiqadi va panel uni O'ZI hisoblamaydi: kesim
 * yig'indisidan jamini ayirish "nega qo'shilmayapti" degan savolga
 * TAXMINIY javob bo'lardi — haqiqiy sabab (bir odam ikki filialda) esa
 * faqat serverga ma'lum.
 *
 * @param {object} data
 * @param {string} key - sanoqchi kaliti ("workers")
 * @returns {number} 0 — takrorlanish yo'q yoki ma'lumot yo'q
 */
export const branchSharedOf = (data, key) => {
  const shared = data?.[AGGREGATE_FIELD]?.shared?.[key];
  return Number.isFinite(shared) && shared > 0 ? shared : 0;
};
