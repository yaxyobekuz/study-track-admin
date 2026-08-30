/**
 * DARS TAQSIMOTI VARAG'I — sof yordamchilar.
 *
 * Bu yerda React ham, DOM ham yo'q: faqat "matndan matritsa", "keyingi katak
 * qayerda" kabi hisoblar. Shu sababli ularni alohida o'qib va tekshirib
 * bo'ladi, komponent esa faqat chizish bilan shug'ullanadi.
 */

/**
 * Clipboard matnini matritsaga aylantiradi.
 *
 * Excel va Google Sheets nusxa ko'chirganda TSV beradi: ustunlar TAB bilan,
 * qatorlar \n bilan. Bitta katak nusxa qilinsa ham shu format —
 * ya'ni oddiy yopishtirishning o'zi ham shu yo'ldan o'tadi.
 *
 * @param {string} text
 * @returns {string[][]}
 */
export const parseClipboardMatrix = (text) => {
  if (typeof text !== "string" || text === "") return [];

  // Windows (\r\n) va eski Mac (\r) qator ajratgichlarini birxillashtiramiz.
  const normalized = text.replace(/\r\n?/g, "\n");

  // Oxiridagi bo'sh qator — Excel deyarli doim qo'shadi, u katak emas.
  const lines = normalized.replace(/\n+$/, "").split("\n");

  return lines.map((line) => line.split("\t"));
};

/**
 * Matndan katak qiymatini oladi.
 *
 * Excel'dan kelgan matnda bo'sh joy, ming ajratgichi (1 234) yoki vergulli
 * kasr (1,5) bo'lishi mumkin. Dars soati butun son, shuning uchun kasr
 * yaxlitlanadi.
 *
 * @returns {number|null} null = katakni tozalash
 */
export const parseCellValue = (raw) => {
  if (raw === null || raw === undefined) return null;

  const text = String(raw).trim().replace(/\s/g, "").replace(",", ".");
  if (text === "" || text === "-") return null;

  const num = Number(text);
  if (!Number.isFinite(num)) return null;

  return Math.max(0, Math.min(99, Math.round(num)));
};

/**
 * Yopishtirilgan matritsani katak yozuvlariga aylantiradi.
 *
 * Anchor katakdan boshlab o'ngga va pastga yoyiladi.
 *
 * Uch xil natija bo'ladi va uchalasi ham sanaladi:
 *   applied — katakka yozildi (yoki bo'sh matn kelib, tozalandi)
 *   skipped — varaqdan TASHQARIDA qoldi. Yangi ustun/qator O'ZI
 *             yaratilmaydi: tasodifan katta blok yopishtirilganda nomsiz
 *             ustunlar paydo bo'lib, jadval axlatga to'lardi.
 *   ignored — son emas edi (masalan sarlavha matni), shuning uchun katakka
 *             TEGILMADI. ⚠️ Bu ataylab: avval bunday katak jimgina
 *             tozalanardi, ya'ni Excel'dan sarlavhasi bilan nusxa ko'chirgan
 *             odam bir qator ma'lumotini bilmay yo'qotardi.
 *
 * @returns {{entries: Array<[string, number|null]>, applied: number, skipped: number, ignored: number}}
 */
export const buildPasteEntries = (matrix, rows, columns, anchorRow, anchorCol) => {
  const entries = [];
  let applied = 0;
  let skipped = 0;
  let ignored = 0;

  for (let r = 0; r < matrix.length; r += 1) {
    const rowIndex = anchorRow + r;

    for (let c = 0; c < matrix[r].length; c += 1) {
      const colIndex = anchorCol + c;

      if (rowIndex >= rows.length || colIndex >= columns.length) {
        skipped += 1;
        continue;
      }

      const raw = matrix[r][c];
      const isBlank = String(raw ?? "").trim() === "";
      const value = parseCellValue(raw);

      // Bo'sh emas-u, son ham emas — tegmaymiz.
      if (value === null && !isBlank) {
        ignored += 1;
        continue;
      }

      entries.push([`${rows[rowIndex].id}|${columns[colIndex].id}`, value]);
      applied += 1;
    }
  }

  return { entries, applied, skipped, ignored };
};

/**
 * Klaviatura bosilganda keyingi katak koordinatasi.
 *
 * Chegaradan chiqmaydi (aylanma harakat YO'Q): spreadsheet'da oxirgi
 * ustundan o'ngga bosganda keyingi qatorga sakrash chalkashtiradi.
 *
 * @returns {{row: number, col: number}|null} null = harakat yo'q
 */
export const nextCell = (key, shiftKey, row, col, rowCount, colCount) => {
  const clamp = (value, max) => Math.max(0, Math.min(max - 1, value));
  const at = (r, c) => ({ row: clamp(r, rowCount), col: clamp(c, colCount) });

  switch (key) {
    case "ArrowUp":
      return at(row - 1, col);
    case "ArrowDown":
      return at(row + 1, col);
    case "ArrowLeft":
      return at(row, col - 1);
    case "ArrowRight":
      return at(row, col + 1);
    case "Enter":
      return at(shiftKey ? row - 1 : row + 1, col);
    // Tab — YAGONA o'ralib o'tadigan tugma: qator oxirida keyingi qatorning
    // boshiga sakraydi (Excel'dagi kabi). Eng oxirgi katakda `null` qaytadi,
    // ya'ni brauzer fokusni jadvaldan olib chiqadi — aks holda klaviatura
    // bilan ishlaydigan foydalanuvchi jadval ichida qamalib qolardi.
    case "Tab": {
      const flat = row * colCount + col + (shiftKey ? -1 : 1);
      if (flat < 0 || flat >= rowCount * colCount) return null;
      return { row: Math.floor(flat / colCount), col: flat % colCount };
    }
    case "Home":
      return at(row, 0);
    case "End":
      return at(row, colCount - 1);
    default:
      return null;
  }
};
