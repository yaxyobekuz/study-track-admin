// React
import { useState } from "react";

/**
 * BELGILASH HOLATI — tanlov, holat tugmalari va izohlar.
 *
 * ⚠️ KARTALARDAGI SANOQ BU YERDAN OLINMAYDI. Server `summary` si butun
 * qamrov bo'yicha va FILTRDAN OLDIN hisoblanadi; ro'yxatda esa faqat
 * filtrga mos qatorlar bor, ya'ni "Kelmadi" filtri turganda jonli sanoqni
 * to'g'ri hisoblashning iloji yo'q — u "jami 1 o'quvchi" deb ko'rsatardi.
 * Shuning uchun kartalar SAQLANGAN faktni ko'rsatadi, saqlanmagan
 * o'zgarishlarni esa panel "N ta o'zgarish" deb aytadi (`DormMarkToolbar`).
 *
 * ⚠️ `syncKey` bilan qayta tiklanadi (render paytida, effektsiz): sana yoki
 * sinf almashganda eski tanlovlar yangi ro'yxatga yopishib qolmasin.
 *
 * @param {Array} rows - `[{ student, status, note }]` (server qatorlari)
 * @param {unknown} syncKey - ma'lumot yangilanganini bildiruvchi kalit
 */
const useDormMarks = (rows, syncKey) => {
  const [marks, setMarks] = useState({});
  const [selected, setSelected] = useState(() => new Set());
  const [syncedKey, setSyncedKey] = useState(null);

  if (syncKey != null && syncKey !== syncedKey) {
    setSyncedKey(syncKey);
    setMarks(
      Object.fromEntries(
        rows.map((row) => [
          row.student.id,
          { status: row.status ?? null, note: row.note ?? "" },
        ]),
      ),
    );
    setSelected(new Set());
  }

  const setStatus = (id, status) =>
    setMarks((prev) => ({ ...prev, [id]: { ...prev[id], status } }));

  const setNote = (id, note) =>
    setMarks((prev) => ({ ...prev, [id]: { ...prev[id], note } }));

  /** Berilgan id larga bitta holatni qo'yadi (tanlangan yoki ko'rinayotganlar). */
  const setMany = (ids, status) =>
    setMarks((prev) => {
      const next = { ...prev };
      for (const id of ids) next[id] = { ...next[id], status };
      return next;
    });

  const toggleSelect = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  /** Sarlavhadagi katakcha: ko'rinayotganlarning hammasini belgilaydi/bo'shatadi. */
  const toggleSelectAll = (ids) =>
    setSelected((prev) => {
      const all = ids.length > 0 && ids.every((id) => prev.has(id));
      const next = new Set(prev);
      for (const id of ids) {
        if (all) next.delete(id);
        else next.add(id);
      }
      return next;
    });

  const clearSelection = () => setSelected(new Set());

  /**
   * Saqlanadigan qatorlar: holat yoki izoh SAQLANGANIDAN farq qilsa.
   * Holat tanlanmagan qator (`null`) yuborilmaydi — "belgilanmagan" holati
   * serverda yo'q va bo'lmasligi kerak (yozuvning o'zi yo'q demakdir).
   */
  const dirty = rows.filter((row) => {
    const mark = marks[row.student.id];
    if (!mark?.status) return false;
    if (mark.status !== (row.status ?? null)) return true;
    return (mark.note || "").trim() !== (row.note || "").trim();
  });

  return {
    marks,
    selected,
    setStatus,
    setNote,
    setMany,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    dirty,
  };
};

export default useDormMarks;
