// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Hooks
import useAuth from "@/shared/hooks/useAuth";

// API
import { studentSystemsAPI } from "../api/studentSystems.api";

// Keys
import { studentSystemsKeys } from "./studentSystems.queries";

/**
 * Ro'yxat keshidagi qatorlarga belgini qo'llaydi va kartalar sanog'ini
 * HAQIQATAN o'zgargan qatorlar bo'yicha suradi.
 *
 * Sahifadagi har qator kartalar qamrovining (sinf filtri) ichida bo'ladi,
 * shuning uchun sanoqni shu yerda to'g'rilash xavfsiz.
 *
 * @param {object} page - `{ data, pagination, summary }`
 * @param {Set<string>} ids
 * @param {string} system
 * @param {(row: object) => object|null} nextMark
 */
const patchPage = (page, ids, system, nextMark) => {
  if (!page?.data) return page;

  let delta = 0;
  const data = page.data.map((row) => {
    if (!ids.has(row.id)) return row;
    const before = row.systems?.[system] ?? null;
    const after = nextMark(row);
    if (Boolean(before) !== Boolean(after)) delta += after ? 1 : -1;
    return { ...row, systems: { ...row.systems, [system]: after } };
  });

  const counts = page.summary?.systems?.[system];
  const summary =
    counts && delta !== 0
      ? {
          ...page.summary,
          systems: {
            ...page.summary.systems,
            [system]: { yes: counts.yes + delta, no: counts.no - delta },
          },
        }
      : page.summary;

  return { ...page, data, summary };
};

/**
 * "BOR / YO'Q" BELGISI — bitta katakcha ham, sahifadagi hammasi ham.
 *
 * ⚠️ OPTIMISTIK va ro'yxat DARHOL qayta yuklanmaydi. Filtr "ERP da yo'q"
 * turganda har belgidan keyin ro'yxat yangilansa, belgilangan qator
 * yo'qolib, keyingisi kursor ostiga siljiydi — navbatdagi bosish BOSHQA
 * o'quvchini belgilab qo'yardi. Shu sababli sahifa joyida qoladi, kesh esa
 * eskirgan deb belgilanadi: sahifa yoki filtr almashganda server holati
 * olinadi.
 *
 * ⚠️ Xatoda faqat SHU amal qaytariladi (qator-baqator), butun kesh surati
 * EMAS: ketma-ket bosishlarda oldingi muvaffaqiyatli belgilar o'chib
 * ketmasligi uchun.
 *
 * ⚠️ `scope` — so'rovlar serverga NAVBAT BILAN boradi (optimistik holat esa
 * darhol). Parallel yuborilsa, "belgila → olib tashla" tez bosilganda
 * ikkinchisi birinchisidan oldin yetib, bazada ekrandagining teskarisi
 * qolishi mumkin edi.
 */
export const useSetStudentSystemMarks = () => {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    scope: { id: "student-system-marks" },
    mutationFn: (payload) =>
      studentSystemsAPI.setMarks(payload).then((r) => r.data),

    onMutate: async ({ studentIds, system, present }) => {
      await qc.cancelQueries({ queryKey: studentSystemsKeys.lists() });

      const ids = new Set(studentIds);
      const previous = new Map();
      for (const [, page] of qc.getQueriesData({
        queryKey: studentSystemsKeys.lists(),
      })) {
        for (const row of page?.data ?? []) {
          if (ids.has(row.id) && !previous.has(row.id)) {
            previous.set(row.id, row.systems?.[system] ?? null);
          }
        }
      }

      const optimistic = {
        markedAt: new Date().toISOString(),
        markedBy: user
          ? { id: user.id, firstName: user.firstName, lastName: user.lastName }
          : null,
      };

      qc.setQueriesData({ queryKey: studentSystemsKeys.lists() }, (page) =>
        patchPage(page, ids, system, (row) =>
          // Allaqachon "bor" — server ham birinchi belgilaganni saqlaydi
          present ? (row.systems?.[system] ?? optimistic) : null,
        ),
      );

      return { ids, system, previous };
    },

    onError: (_error, _payload, context) => {
      if (!context) return;
      const { ids, system, previous } = context;
      qc.setQueriesData({ queryKey: studentSystemsKeys.lists() }, (page) =>
        patchPage(page, ids, system, (row) => previous.get(row.id) ?? null),
      );
    },

    onSettled: () =>
      qc.invalidateQueries({
        queryKey: studentSystemsKeys.lists(),
        refetchType: "none",
      }),
  });
};
