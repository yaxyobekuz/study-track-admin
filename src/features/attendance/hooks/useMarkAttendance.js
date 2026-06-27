// React
import { useState } from "react";

/**
 * Davomat belgilash holatini boshqaradi (o'quvchilar va xodimlar uchun umumiy).
 *
 * `people` - [{ id, originalStatus, defaultStatus, originalReason }]
 *   - originalStatus: bazadagi joriy status (dirty hisoblash uchun, belgilanmagan bo'lsa null)
 *   - defaultStatus: dastlabki tanlov (o'quvchilarda "present", xodimlarda null bo'lishi mumkin)
 * `syncKey` - ma'lumot yangilanganda (yangi query natijasi) marks ni qayta tiklash kaliti
 *   (masalan, query.dataUpdatedAt). null bo'lsa tiklash o'tkazilmaydi.
 *
 * @returns {{ marks, setStatus, setReason, setAll, dirty, counts }}
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
            excuseReason: p.originalReason || "",
          },
        ]),
      ),
    );
  }

  const setStatus = (id, status) =>
    setMarks((prev) => ({ ...prev, [id]: { ...prev[id], status } }));

  const setReason = (id, excuseReason) =>
    setMarks((prev) => ({ ...prev, [id]: { ...prev[id], excuseReason } }));

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
    if (
      current === "excused" &&
      (m.excuseReason || "") !== (p.originalReason || "")
    ) {
      return true;
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

  return { marks, setStatus, setReason, setAll, dirty, counts };
};

export default useMarkAttendance;
