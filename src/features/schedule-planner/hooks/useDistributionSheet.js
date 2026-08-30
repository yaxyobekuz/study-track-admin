// Toast
import { toast } from "sonner";

// React
import { useCallback, useEffect, useMemo, useState } from "react";

// Data
import {
  cellKey,
  backupKey,
  storageKey,
  SHEET_VERSION,
  createEmptySheet,
} from "../data/distribution.data";

/**
 * localStorage'dan varaqni o'qiydi.
 *
 * ⚠️ Buzilgan yoki eski versiyadagi nusxa JIM TASHLANMAYDI: u avval
 * `<kalit>:backup` ga ko'chiriladi va foydalanuvchiga aytiladi. Aks holda
 * sxema keyingi safar o'zgarganda odamning butun ishi bilinmay yo'q bo'lardi.
 */
const readStorage = (branchId) => {
  const key = storageKey(branchId);

  let raw;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    return { sheet: null, recovered: false };
  }
  if (!raw) return { sheet: null, recovered: false };

  try {
    const parsed = JSON.parse(raw);
    if (parsed && parsed.version === SHEET_VERSION && parsed.values) {
      return {
        sheet: {
          version: SHEET_VERSION,
          values: parsed.values,
          hiddenColumns: parsed.hiddenColumns ?? [],
          hiddenRows: parsed.hiddenRows ?? [],
          rev: parsed.rev ?? 0,
        },
        recovered: false,
      };
    }
  } catch {
    // pastdagi zaxira yo'liga tushamiz
  }

  try {
    window.localStorage.setItem(backupKey(branchId), raw);
    window.localStorage.removeItem(key);
  } catch {
    // zaxira ham imkonsiz — hech bo'lmasa ekran ishlaydi
  }
  return { sheet: null, recovered: true };
};

/**
 * DARS TAQSIMOTI VARAG'INING HOLATI.
 *
 * Ustunlar va qatorlar TIZIMDAN keladi (parametr sifatida), varaq esa faqat
 * katak qiymatlarini saqlaydi. Shu sababli sinf nomi o'zgarsa yoki yangi fan
 * qo'shilsa, kiritilgan soatlar joyida qoladi — ular id ga bog'langan.
 *
 * Haqiqat manbai — localStorage (avtomatik, 300ms debounce). Serverga
 * saqlash IXTIYORIY va alohida tugma orqali.
 */
const useDistributionSheet = ({ branchId, columns, rows }) => {
  const [sheet, setSheet] = useState(() => createEmptySheet());
  const [savedRev, setSavedRev] = useState(0);
  const [loadedBranch, setLoadedBranch] = useState(null);
  // Zaxiraga ko'chirilgan filial id'si — toast shu o'zgarganda bir marta chiqadi.
  const [recoveredBranch, setRecoveredBranch] = useState(null);

  // Filial aniq bo'lgach (yoki almashgach) o'sha filialning varag'i o'qiladi.
  //
  // Bu RENDER paytida bajariladi, effektda emas: effektdagi setState kaskad
  // render beradi va varaq bir zum bo'sh bo'lib ko'rinib ketardi. localStorage
  // dan o'qish — sof o'qish amali, shuning uchun render paytida xavfsiz.
  // Bu React tavsiya qiladigan "prop o'zgarganda holatni to'g'rilash" naqshi.
  if (branchId && loadedBranch !== branchId) {
    setLoadedBranch(branchId);
    const { sheet: stored, recovered } = readStorage(branchId);
    setSheet(stored ?? createEmptySheet());
    setSavedRev(stored?.rev ?? 0);
    setRecoveredBranch(recovered ? branchId : null);
  }

  // Toast — yagona haqiqiy nojo'ya ta'sir, shuning uchun effektda.
  useEffect(() => {
    if (!recoveredBranch) return;
    toast.warning(
      "Saqlangan varaq eski ko'rinishda edi — u zaxiraga ko'chirildi va varaq tozalandi",
    );
  }, [recoveredBranch]);

  // localStorage'ga yozish — debounce bilan.
  useEffect(() => {
    if (!branchId || sheet.rev === 0) return;

    const timer = setTimeout(() => {
      try {
        window.localStorage.setItem(storageKey(branchId), JSON.stringify(sheet));
      } catch {
        // Kvota to'lgan yoki privat rejim — varaq ekranda ishlashda davom etadi.
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [sheet, branchId]);

  // Har o'zgarish reviziyani oshiradi — shu tufayli "saqlanmagan o'zgarish
  // bormi?" degan savol sahifa yangilangandan keyin ham to'g'ri javob beradi.
  const mutate = useCallback((updater) => {
    setSheet((prev) => {
      const next = updater(prev);
      return next === prev ? prev : { ...next, rev: prev.rev + 1 };
    });
  }, []);

  const setValue = useCallback(
    (subjectId, classId, raw) =>
      mutate((prev) => {
        const key = cellKey(subjectId, classId);
        const values = { ...prev.values };

        // Bo'sh = katakni tozalash. Nol SAQLANADI: "ataylab 0 soat" va
        // "belgilanmagan" bu domenda boshqa-boshqa narsa.
        if (raw === "" || raw === null || raw === undefined) delete values[key];
        else {
          const num = Number(raw);
          if (!Number.isFinite(num)) return prev;
          values[key] = Math.max(0, Math.min(99, Math.trunc(num)));
        }

        return { ...prev, values };
      }),
    [mutate],
  );

  const setManyValues = useCallback(
    (entries) =>
      mutate((prev) => {
        const values = { ...prev.values };
        for (const [key, value] of entries) {
          if (value === null) delete values[key];
          else values[key] = value;
        }
        return { ...prev, values };
      }),
    [mutate],
  );

  const toggleColumn = useCallback(
    (classId) =>
      mutate((prev) => {
        const hidden = new Set(prev.hiddenColumns);
        if (hidden.has(classId)) hidden.delete(classId);
        else hidden.add(classId);
        return { ...prev, hiddenColumns: [...hidden] };
      }),
    [mutate],
  );

  const toggleRow = useCallback(
    (subjectId) =>
      mutate((prev) => {
        const hidden = new Set(prev.hiddenRows);
        if (hidden.has(subjectId)) hidden.delete(subjectId);
        else hidden.add(subjectId);
        return { ...prev, hiddenRows: [...hidden] };
      }),
    [mutate],
  );

  const showAll = useCallback(
    () => mutate((prev) => ({ ...prev, hiddenColumns: [], hiddenRows: [] })),
    [mutate],
  );

  const clearValues = useCallback(
    () => mutate((prev) => ({ ...prev, values: {} })),
    [mutate],
  );

  const replaceSheet = useCallback(
    (next) =>
      mutate(() => ({
        version: SHEET_VERSION,
        values: next?.values && typeof next.values === "object" ? next.values : {},
        hiddenColumns: Array.isArray(next?.hiddenColumns) ? next.hiddenColumns : [],
        hiddenRows: Array.isArray(next?.hiddenRows) ? next.hiddenRows : [],
        rev: 0,
      })),
    [mutate],
  );

  const markSaved = useCallback(() => setSavedRev(sheet.rev), [sheet.rev]);

  // ── Ko'rinadigan ustun/qatorlar ──
  const visibleColumns = useMemo(() => {
    const hidden = new Set(sheet.hiddenColumns);
    return columns.filter((c) => !hidden.has(c.id));
  }, [columns, sheet.hiddenColumns]);

  const visibleRows = useMemo(() => {
    const hidden = new Set(sheet.hiddenRows);
    return rows.filter((r) => !hidden.has(r.id));
  }, [rows, sheet.hiddenRows]);

  // ── Yig'indilar ──
  //
  // Bitta o'tishda. Yig'indi HUJJATDA saqlanmaydi: birinchi tahrirdan keyin
  // u darhol yolg'onga aylanardi.
  const totals = useMemo(() => {
    const byRow = {};
    const byColumn = {};
    let grand = 0;

    for (const row of visibleRows) byRow[row.id] = 0;
    for (const column of visibleColumns) byColumn[column.id] = 0;

    for (const [key, value] of Object.entries(sheet.values)) {
      const [subjectId, classId] = key.split("|");
      // Yashirilgan yoki tizimdan o'chirilgan ustun/qator hisobga kirmaydi.
      if (!(subjectId in byRow) || !(classId in byColumn)) continue;
      byRow[subjectId] += value;
      byColumn[classId] += value;
      grand += value;
    }

    const students = visibleColumns.reduce(
      (sum, c) => sum + (c.studentCount || 0),
      0,
    );

    return { byRow, byColumn, grand, students };
  }, [sheet.values, visibleRows, visibleColumns]);

  return {
    sheet,
    totals,
    visibleColumns,
    visibleRows,
    dirtyForServer: sheet.rev !== savedRev,
    markSaved,
    setValue,
    setManyValues,
    toggleColumn,
    toggleRow,
    showAll,
    clearValues,
    replaceSheet,
  };
};

export default useDistributionSheet;
