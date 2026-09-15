/**
 * SUHBAT OYNASI UCHUN SOF FUNKSIYALAR (DOM'siz, sinovga qulay).
 */

/** Jonli yordamchi javobining vaqtinchalik id si (server id si kelguncha). */
export const LIVE_ASSISTANT_ID = "live-assistant";

/**
 * Server xabarlari + jonli tur → ekranda chiziladigan ro'yxat.
 *
 * ⚠️ JONLI QISM "SERVER YETIB OLGUNCHA" KO'RSATILADI, "tur tugaguncha"
 * emas. Tur tugagach suhbat qayta so'raladi; javob kelguncha (yoki
 * to'xtatilgan tur serverda endi saqlanayotgan bo'lsa) jonli nusxa turadi,
 * server nusxasi paydo bo'lishi bilan esa o'zi yashirinadi. Shu sababli
 * keshni qayta so'rov ustiga yozib yuborsa ham xabar ko'zdan g'oyib
 * bo'lmaydi.
 *
 * ⚠️ `renderKey` — TUR DAVOMIDA O'ZGARMAYDIGAN React kaliti. Jonli xabar
 * vaqtinchalik id bilan boshlanadi va oxirida server id sini oladi; kalit
 * id bo'lsa, shu lahzada komponent qayta o'rnatilib, kirish animatsiyasi
 * ikkinchi marta o'ynardi va ochilgan "manbalar" ro'yxati yopilib qolardi.
 *
 * @param {object[]} serverMessages - suhbat keshidagi xabarlar (vaqt bo'yicha)
 * @param {object|null} live - `useAssistantChat` holatidagi jonli tur
 * @returns {object[]}
 */
export const buildThread = (serverMessages, live) => {
  const messages = serverMessages ?? [];
  if (!live) return messages;

  const userKey = `turn-${live.turnId}-user`;
  const assistantKey = `turn-${live.turnId}-assistant`;
  const out = messages.slice();

  const userId = live.userMessage?.id;
  const userIndex = userId ? messages.findIndex((message) => message.id === userId) : -1;
  if (userIndex === -1) {
    if (live.userMessage) out.push({ ...live.userMessage, renderKey: userKey });
  } else {
    out[userIndex] = { ...messages[userIndex], renderKey: userKey };
  }

  // Server shu savolga javobni allaqachon saqlaganmi (yakuniy, xato yoki to'xtatilgan)?
  const finalId = live.final?.id;
  let answerIndex = -1;
  if (finalId) {
    answerIndex = messages.findIndex((message) => message.id === finalId);
  } else if (userIndex !== -1) {
    const offset = messages.slice(userIndex + 1).findIndex((message) => message.role === "assistant");
    answerIndex = offset === -1 ? -1 : userIndex + 1 + offset;
  }

  if (answerIndex !== -1) {
    out[answerIndex] = { ...messages[answerIndex], renderKey: assistantKey };
  } else if (live.final) {
    out.push({ ...live.final, renderKey: assistantKey });
  } else if (live.assistant) {
    out.push({ ...live.assistant, renderKey: assistantKey });
  }
  return out;
};

/**
 * Xabardan oldingi egasi xabari — "Qayta yuborish" shu matnni yuboradi.
 * @returns {string|null}
 */
export const previousUserText = (messages, index) => {
  for (let i = index - 1; i >= 0; i -= 1) {
    if (messages[i].role === "user") return messages[i].content?.trim() || null;
  }
  return null;
};

/**
 * Vosita qadamlarining qisqa xulosasi.
 * @param {object[]} steps
 */
export const summarizeSteps = (steps = []) => {
  let read = 0;
  let actions = 0;
  let failed = 0;
  let running = null;
  for (const step of steps) {
    if (step.kind === "read") read += 1;
    if (step.kind === "action") actions += 1;
    if (step.status === "error") failed += 1;
    if (step.status === "running") running = step;
  }
  const parts = [];
  if (read) parts.push(`${read} ta manba tekshirildi`);
  if (actions) parts.push(`${actions} ta taklif tayyorlandi`);
  if (!parts.length) parts.push(`${steps.length} ta qadam bajarildi`);
  return { text: parts.join(", "), failed, running };
};

/** Mahalliy kun boshi (ms). */
const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Suhbatlarni "Bugun / Kecha / Oxirgi 7 kun / Avvalroq" ga ajratadi.
 *
 * ⚠️ Faqat taqqoslash — sana MATNI bu yerda yig'ilmaydi (u serverning
 * `lastMessageAtLabel` i). Kun chegarasi brauzerning mahalliy vaqti bo'yicha,
 * ya'ni ega ko'rib turgan soat bilan bir xil.
 *
 * @param {object[]} conversations
 * @param {number} nowMs
 * @returns {Record<"today"|"yesterday"|"week"|"older", object[]>}
 */
export const groupConversations = (conversations, nowMs) => {
  const today = startOfDay(new Date(nowMs));
  const groups = { today: [], yesterday: [], week: [], older: [] };
  for (const conversation of conversations) {
    const time = new Date(conversation.lastMessageAt).getTime();
    if (Number.isNaN(time)) {
      groups.older.push(conversation);
    } else if (time >= today) {
      groups.today.push(conversation);
    } else if (time >= today - DAY_MS) {
      groups.yesterday.push(conversation);
    } else if (time >= today - 6 * DAY_MS) {
      groups.week.push(conversation);
    } else {
      groups.older.push(conversation);
    }
  }
  return groups;
};

/** Ovoz davomiyligi: 83 400 ms → "1:23". */
export const formatClock = (ms) => {
  const total = Math.max(0, Math.floor((Number(ms) || 0) / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = String(total % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
};

/**
 * Qadam davomiyligi: 1234 → "1,2 s", 420 → "0,4 s", 65 000 → "65 s", 12 → "<0,1 s".
 *
 * ⚠️ 100 ms DAN QISQASI "<0,1 s". Yuvarlab "0,0 s" yozilsa, qadam umuman
 * bajarilmagandek o'qiladi.
 */
export const formatSeconds = (ms) => {
  const value = Math.max(0, Number(ms) || 0);
  if (value < 100) return "<0,1 s";
  const tenths = Math.round(value / 100) / 10;
  if (tenths >= 10) return `${Math.round(value / 1000)} s`;
  return `${tenths.toFixed(1).replace(".", ",")} s`;
};

/** Butun son guruhlab: 3612 → "3 612" (tor probel emas, oddiy probel). */
export const formatCount = (value) => String(Math.round(Number(value) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
