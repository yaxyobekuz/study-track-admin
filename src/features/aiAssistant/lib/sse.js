/**
 * SSE (Server-Sent Events) KADR PARSERI — sof funksiya, DOM'siz.
 *
 * ⚠️ NATIVE `EventSource` ISHLATILMAYDI: u faqat GET yuboradi va sarlavha
 * qo'sha olmaydi, server esa tokenni faqat `Authorization` dan o'qiydi.
 * Shu sababli oqim `fetch` + `ReadableStream` bilan o'qiladi va kadrlarni
 * shu parser ajratadi.
 *
 * ⚠️ BO'LAK CHEGARASI HECH NARSAGA TAYANMAYDI. Tarmoq baytlarni istalgan
 * joyda bo'ladi: kadr o'rtasida, `\r\n` ning `\r` va `\n` orasida, hatto
 * ko'p baytli UTF-8 harfning ichida ("—", "‘", kirill). Baytlar
 * `TextDecoder` ga `stream: true` bilan beriladi (harf yarmi keyingi
 * bo'lakni kutadi), satr esa to'liq qator kelmaguncha buferda turadi.
 *
 * Qoidalar WHATWG spetsifikatsiyasi bo'yicha: `:` bilan boshlangan qator —
 * izoh (serverning `: ping` yurak urishi), bo'sh qator — kadrni yuboradi,
 * bir nechta `data:` qatori `\n` bilan qo'shiladi, maydon nomidan keyingi
 * BITTA probel tashlanadi.
 */

/**
 * @typedef {{ event: string, data: string }} SseFrame
 */

/**
 * Oqimli parser: `push(matn)` → tayyor kadrlar ro'yxati.
 * @returns {{ push: (chunk: string) => SseFrame[], finish: () => SseFrame[] }}
 */
export const createSseParser = () => {
  let buffer = "";
  let eventName = "";
  let dataLines = [];
  let hasData = false;

  const reset = () => {
    eventName = "";
    dataLines = [];
    hasData = false;
  };

  const dispatch = (frames) => {
    if (hasData) {
      frames.push({ event: eventName || "message", data: dataLines.join("\n") });
    }
    reset();
  };

  const processLine = (line, frames) => {
    if (line === "") {
      dispatch(frames);
      return;
    }
    if (line.startsWith(":")) return;

    const colon = line.indexOf(":");
    const field = colon === -1 ? line : line.slice(0, colon);
    let value = colon === -1 ? "" : line.slice(colon + 1);
    if (value.startsWith(" ")) value = value.slice(1);

    if (field === "event") {
      eventName = value;
    } else if (field === "data") {
      dataLines.push(value);
      hasData = true;
    }
    // `id` va `retry` — bu oqim qayta ulanmaydi, ular e'tiborsiz qoldiriladi.
  };

  const push = (chunk) => {
    const frames = [];
    if (!chunk) return frames;
    buffer += chunk;

    let start = 0;
    for (;;) {
      // ⚠️ `indexOf` bilan qidiriladi, belgi-belgi sikl bilan emas: katta
      // kadr (yakuniy xabar JSON'i) ko'p bo'lakda kelsa, har bo'lakda
      // butun buferni qayta aylanib chiqish kvadratik bo'lardi.
      const lf = buffer.indexOf("\n", start);
      const cr = buffer.indexOf("\r", start);
      if (lf === -1 && cr === -1) break;

      const end = cr === -1 ? lf : lf === -1 ? cr : Math.min(lf, cr);

      // ⚠️ Bufer oxiridagi `\r` — keyingi bo'lak `\n` bilan boshlanishi
      // mumkin. Hozir qator deb olinsa, `\n` ikkinchi (bo'sh) qator bo'lib,
      // kadrni vaqtidan oldin yuborib yuborardi.
      if (buffer[end] === "\r" && end === buffer.length - 1) break;

      processLine(buffer.slice(start, end), frames);
      start = buffer[end] === "\r" && buffer[end + 1] === "\n" ? end + 2 : end + 1;
    }

    buffer = buffer.slice(start);
    return frames;
  };

  /**
   * Oqim tugaganda. Buferda qolgan yakka `\r` endi aniq qator oxiri (keyingi
   * `\n` kelmaydi). Spetsifikatsiya bo'yicha bo'sh qator bilan yopilmagan
   * oxirgi kadr esa YUBORILMAYDI — yarim kelgan JSON'ni ishlatgandan ko'ra
   * "oqim uzildi" deb bilgan yaxshi.
   */
  const finish = () => {
    const frames = [];
    if (buffer.endsWith("\r")) processLine(buffer.slice(0, -1), frames);
    buffer = "";
    reset();
    return frames;
  };

  return { push, finish };
};

/**
 * Bayt oqimini SSE kadrlariga aylantiradi.
 *
 * ⚠️ ISTE'MOLCHI ERTA TO'XTASA (`break` / `return`) oqim BEKOR QILINADI
 * (`reader.cancel()`), faqat qulf bo'shatilmaydi: aks holda ulanish ochiq
 * qolib, server javobni yozishda davom etardi.
 *
 * @param {ReadableStream<Uint8Array>} body
 * @returns {AsyncGenerator<SseFrame>}
 */
export async function* readSseFrames(body) {
  const reader = body.getReader();
  const decoder = new TextDecoder("utf-8");
  const parser = createSseParser();
  let finished = false;

  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      for (const frame of parser.push(decoder.decode(value, { stream: true }))) {
        yield frame;
      }
    }
    finished = true;
    for (const frame of parser.push(decoder.decode())) yield frame;
    for (const frame of parser.finish()) yield frame;
  } finally {
    if (!finished) {
      // Xato yoki erta chiqish — ulanish yopiladi. `cancel` o'zi rad
      // etilishi mumkin (oqim allaqachon xatoda), bu yerda muhim emas.
      reader.cancel().catch(() => {});
    }
    reader.releaseLock();
  }
}
