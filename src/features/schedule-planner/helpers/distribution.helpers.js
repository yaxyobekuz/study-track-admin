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

// ─────────────────────────────────────────────────────────────────────────
// O'QITUVCHILAR BO'YICHA TAQSIMOT (fan qatori ostidagi ochiluvchi panel)
// ─────────────────────────────────────────────────────────────────────────
//
// Varaqdagi katak "shu sinfda shu fandan HAFTASIGA NECHA SOAT" degan TALABni
// bildiradi. Panel esa "o'sha soatlarni KIM beradi" degan savolga javob
// yozadi. Ya'ni panel varaqning o'ziga emas, rejalashtirishning haqiqiy
// yuklama jadvaliga (`PlannerLoad`) yozadi — aks holda taqsimot faqat
// chiroyli ko'rinish bo'lib qolib, jadval shakllantirishda ishlatilmasdi.

/** Panel katagining kaliti: o'qituvchi + sinf. */
export const splitKey = (teacherId, classId) => `${teacherId}|${classId}`;

/**
 * Bitta fan uchun taqsimot holati.
 *
 * @param {object} input
 * @param {string} input.subjectId
 * @param {Array}  input.columns  - ko'rinadigan sinflar [{ id, name }]
 * @param {object} input.values   - varaq kataklari { "fanId|sinfId": soat }
 * @param {Array}  input.loadRows - `GET /planner/loads` dagi `rows`
 * @param {object} input.draft    - saqlanmagan qoralama { "ustozId|sinfId": soat|null }
 */
export const buildSubjectSplit = ({
  subjectId,
  columns,
  values,
  loadRows = [],
  draft = {},
}) => {
  const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

  // Talab — varaqdan. Katak bo'sh bo'lsa 0, ya'ni "bu sinfda bu fan o'qilmaydi".
  const need = {};
  for (const column of columns) {
    const raw = values[`${subjectId}|${column.id}`];
    need[column.id] = typeof raw === "number" ? raw : 0;
  }

  const teachers = loadRows
    .filter((row) => row.subject.id === subjectId)
    .map((row) => {
      // Serverdagi holat + qoralama. Qoralamadagi `null` — "sinf olib tashlandi".
      const merged = new Map(row.classes.map((cls) => [cls.id, cls.weeklyHours]));
      for (const [key, value] of Object.entries(draft)) {
        const [teacherId, classId] = key.split("|");
        if (teacherId !== row.teacher.id) continue;
        if (value === null) merged.delete(classId);
        else merged.set(classId, value);
      }

      const cells = {};
      let visibleTotal = 0;
      for (const column of columns) {
        if (!merged.has(column.id)) continue;
        cells[column.id] = merged.get(column.id);
        visibleTotal += merged.get(column.id);
      }

      // ⚠️ `total` MERGED bo'yicha, ko'rinadigan ustunlar bo'yicha emas:
      // yashirilgan sinfdagi soat ham o'qituvchining haqiqiy yuklamasi.
      let total = 0;
      for (const value of merged.values()) total += value;

      return {
        id: row.teacher.id,
        fullName: row.teacher.fullName,
        weeklyHours: row.weeklyHours,
        serverClasses: row.classes,
        cells,
        total,
        hiddenTotal: total - visibleTotal,
      };
    })
    .sort((a, b) => a.fullName.localeCompare(b.fullName, "uz"));

  const assigned = {};
  for (const column of columns) {
    assigned[column.id] = teachers.reduce(
      (sum, teacher) => sum + (has(teacher.cells, column.id) ? teacher.cells[column.id] : 0),
      0,
    );
  }

  let needTotal = 0;
  let assignedTotal = 0;
  for (const column of columns) {
    needTotal += need[column.id];
    assignedTotal += assigned[column.id];
  }

  return {
    teachers,
    need,
    assigned,
    needTotal,
    assignedTotal,
    restTotal: needTotal - assignedTotal,
  };
};

/**
 * Bitta o'qituvchi satri uchun `PUT /planner/loads` yuki.
 *
 * ⚠️ Boshlang'ich nuqta — SERVERDAGI sinflar ro'yxati, panel kataklari emas.
 * Panelda faqat ko'rinadigan sinflar bor; yashirilgan sinfdagi soat esa
 * saqlashda jimgina o'chib ketmasligi kerak (server butun ro'yxatni
 * almashtiradi).
 *
 * `weeklyHours` (satrning standart soati) TEGILMAYDI — u "Asosiy" tabning
 * qiymati, panel esa har sinf uchun aniq soat yozadi.
 */
export const buildSplitPayload = (teacher, subjectId, draft = {}) => {
  const merged = new Map(teacher.serverClasses.map((cls) => [cls.id, cls.weeklyHours]));

  for (const [key, value] of Object.entries(draft)) {
    const [teacherId, classId] = key.split("|");
    if (teacherId !== teacher.id) continue;
    if (value === null) merged.delete(classId);
    else merged.set(classId, value);
  }

  return {
    teacherId: teacher.id,
    subjectId,
    weeklyHours: teacher.weeklyHours ?? 0,
    classes: [...merged.entries()].map(([classId, weeklyHours]) => ({
      classId,
      weeklyHours,
    })),
  };
};
