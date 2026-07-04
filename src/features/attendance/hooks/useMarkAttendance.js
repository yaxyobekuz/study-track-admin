// React
import { useState } from "react";

/**
 * Davomat belgilash holatini boshqaradi (o'quvchilar va xodimlar uchun umumiy).
 *
 * `people` - [{ id, role, originalStatus, defaultStatus, originalReasonId, originalNote }]
 *   - originalStatus: bazadagi joriy status (dirty hisoblash uchun, belgilanmagan bo'lsa null)
 *   - defaultStatus: dastlabki tanlov (o'quvchilarda "present", xodimlarda null bo'lishi mumkin)
 *   - originalReasonId / originalNote: "Sababli" holatdagi tanlangan sabab va izoh
 * `syncKey` - ma'lumot yangilanganda marks ni qayta tiklash kaliti (masalan, query.dataUpdatedAt)
 *
 * @returns {{ marks, setStatus, setReason, setNote, setAll, dirty, counts }}
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
            absenceReasonId: p.originalReasonId || null,
            note: p.originalNote || "",
          },
        ]),
      ),
    );
  }

  const setStatus = (id, status) =>
    setMarks((prev) => ({ ...prev, [id]: { ...prev[id], status } }));

  const setReason = (id, absenceReasonId) =>
    setMarks((prev) => ({ ...prev, [id]: { ...prev[id], absenceReasonId } }));

  const setNote = (id, note) =>
    setMarks((prev) => ({ ...prev, [id]: { ...prev[id], note } }));

  const setAll = (status) =>
    setMarks((prev) => {
      const next = {};
      for (const p of people) next[p.id] = { ...prev[p.id], status };
      return next;
    });

  // Bazadagidan farq qiladigan (saqlanadigan) yozuvlar
  const dirty = people.filter((p) => {
    const m = marks[p.id] || {};
    const current = m.status || null;
    if (!current) return false;
    if (current !== (p.originalStatus || null)) return true;
    if (current === "excused") {
      if ((m.absenceReasonId || null) !== (p.originalReasonId || null)) return true;
      if ((m.note || "") !== (p.originalNote || "")) return true;
    }
    return false;
  });

  // Joriy tanlovlar bo'yicha yig'indi (jonli)
  const counts = { present: 0, late: 0, absent: 0, excused: 0, unmarked: 0 };
  for (const p of people) {
    const status = marks[p.id]?.status;
    if (status && counts[status] !== undefined) counts[status]++;
    else counts.unmarked++;
  }

  return { marks, setStatus, setReason, setNote, setAll, dirty, counts };
};

export default useMarkAttendance;
