// React
import { useState } from "react";

/**
 * Davomat belgilash holatini boshqaradi (o'quvchilar va xodimlar uchun umumiy).
 *
 * `people` - [{ id, role, originalStatus, defaultStatus, originalNote }]
 *   - originalStatus: bazadagi joriy status (dirty hisoblash uchun, belgilanmagan bo'lsa null)
 *   - defaultStatus: dastlabki tanlov (belgilanmagan bo'lsa null — avtomatik "Keldi" YO'Q)
 *   - originalNote: yozuvdagi izoh (ixtiyoriy, har qanday holatda yoziladi)
 * `syncKey` - ma'lumot yangilanganda marks ni qayta tiklash kaliti (masalan, query.dataUpdatedAt)
 *
 * @returns {{ marks, setStatus, setNote, setAll, dirty, counts }}
 */
const useMarkAttendance = (people, syncKey) => {
  const [marks, setMarks] = useState({});
  const [syncedKey, setSyncedKey] = useState(null);

  // Yangi ma'lumot kelganda marks ni qayta tiklaymiz (render vaqtida, effektsiz)
  if (syncKey != null && syncKey !== syncedKey) {
    setSyncedKey(syncKey);
    setMarks(
      Object.fromEntries(
        people.map((p) => [
          p.id,
          {
            status: p.defaultStatus ?? p.originalStatus ?? null,
            note: p.originalNote || "",
          },
        ]),
      ),
    );
  }

  const setStatus = (id, status) =>
    setMarks((prev) => ({ ...prev, [id]: { ...prev[id], status } }));

  const setNote = (id, note) =>
    setMarks((prev) => ({ ...prev, [id]: { ...prev[id], note } }));

  /**
   * "Barchasini belgilash": `ids` berilsa faqat shu qatorlar (filtrlangan,
   * ko'rinib turganlar), berilmasa hammasi. Qolganlarning tanlovi saqlanadi.
   */
  const setAll = (status, ids) =>
    setMarks((prev) => {
      const only = ids ? new Set(ids) : null;
      const next = { ...prev };
      for (const p of people) {
        if (only && !only.has(p.id)) continue;
        next[p.id] = { ...prev[p.id], status };
      }
      return next;
    });

  // Bazadagidan farq qiladigan (saqlanadigan) yozuvlar.
  // Izoh HAR QANDAY holatda hisobga olinadi: faqat izohni to'g'rilash ham
  // saqlanishi kerak (kategoriya endi umuman yo'q).
  const dirty = people.filter((p) => {
    const m = marks[p.id] || {};
    const current = m.status || null;
    if (!current) return false;
    if (current !== (p.originalStatus || null)) return true;
    return (m.note || "").trim() !== (p.originalNote || "").trim();
  });

  // Joriy tanlovlar bo'yicha yig'indi (jonli). Kalitlar server `summary` bilan
  // bir xil: kelganlar = keldi + kech keldi, kelmaganlar = jami − kelganlar
  // (belgilanmaganlar ham kelmaganlar hisobiga kiradi).
  const counts = {
    total: people.length,
    came: 0,
    notCame: 0,
    present: 0,
    late: 0,
    absent: 0,
    excused: 0,
    unmarked: 0,
  };
  for (const p of people) {
    const status = marks[p.id]?.status;
    if (status && counts[status] !== undefined) counts[status]++;
    else counts.unmarked++;
  }
  counts.came = counts.present + counts.late;
  counts.notCame = counts.total - counts.came;

  return { marks, setStatus, setNote, setAll, dirty, counts };
};

export default useMarkAttendance;
