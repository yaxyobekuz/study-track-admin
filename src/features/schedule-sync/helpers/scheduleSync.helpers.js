// Toast
import { toast } from "sonner";

// Data
import {
  STALE_REASONS,
  NO_SUBJECT_LABEL,
  RESOLUTION_STATUS,
  NO_CHANGES_BLOCKER,
  SNAPSHOT_KIND_LABELS,
  VIEW_REFRESH_REASONS,
} from "../data/scheduleSync.data";

// ── Xato javobi ───────────────────────────────
//
// Server konverti: `{ success: false, message, details: { reason, ... } }`.
// `details.reason` — mashina o'qiydigan kod; matn parse qilinmaydi.

export const errorStatus = (err) => err?.response?.status ?? null;

const errorDetails = (err) => err?.response?.data?.details ?? {};

export const errorReason = (err) => errorDetails(err)?.reason ?? null;

export const errorMessage = (err, fallback = "Xatolik yuz berdi") =>
  err?.response?.data?.message || fallback;

/** Ko'rsatilgan ko'rinish eskirgan (xeshlar, rejim yoki tekshiruv). */
export const isStaleConflict = (err) =>
  errorStatus(err) === 409 && STALE_REASONS.includes(errorReason(err));

/**
 * 400 — yangi tasdiq talab qilindi yoki xato paydo bo'ldi: ko'rinishni
 * qayta o'qish kerak (yangi tasdiq katagi chiqishi uchun).
 */
export const isViewRefreshError = (err) =>
  errorStatus(err) === 400 && VIEW_REFRESH_REASONS.includes(errorReason(err));

/** Sheet rejimida platformadagi tahrir rad etildi. */
export const isSheetModeError = (err) =>
  errorStatus(err) === 409 && errorReason(err) === "sheet_mode";

/**
 * Qo'llash / almashtirish / tiklash xatosini foydalanuvchiga aytadi.
 *
 * ⚠️ So'rov QAYTA YUBORILMAYDI. Eskirgan ko'rinishni mutatsiya hook'i
 * qayta o'qitadi (invalidatsiya), odam esa yangi holatni ko'rib qaytadan
 * tasdiqlaydi — xato javobidagi xeshlar bilan "jimgina" qo'llash yo'q.
 *
 * @param {unknown} err
 * @param {{
 *   onAckRequired?: (codes: string[], acks: object[]) => void,
 *   onValidation?: (issues: object[]) => void,
 * }} [handlers]
 */
export const notifySyncError = (err, handlers = {}) => {
  const status = errorStatus(err);
  const details = errorDetails(err);
  const message = errorMessage(err);

  if (isStaleConflict(err)) {
    toast.warning("Ma'lumot o'zgargan — qayta ko'rib chiqing", {
      description: err?.response?.data?.message,
    });
    return;
  }

  // `details.acks` — yetishmayotgan tasdiqlarning matni: ko'rinish qayta
  // o'qilguncha ham katak darhol chiqadi
  if (status === 400 && details.reason === "ack_required") {
    handlers.onAckRequired?.(details.required ?? [], details.acks ?? []);
    toast.error(message);
    return;
  }

  if (status === 400 && details.reason === "validation") {
    handlers.onValidation?.(details.errors ?? []);
    toast.error(message);
    return;
  }

  toast.error(message);
};

// ── Ko'rinish ─────────────────────────────────

/**
 * `@db.Date` qiymatining kun qismi ("2026-09-11") — `formatDateUz` uni
 * lokal kun deb o'qiydi va sana siljimaydi.
 */
export const dayOf = (value) => String(value ?? "").split("T")[0];

/** `UserRef | string | null` → ism. */
export const nameOf = (value, fallback = "—") => {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  return value.name || fallback;
};

/** Talab qilingan barcha ogohlantirishlar belgilanganmi. */
export const allAcknowledged = (requiredAcks = [], acked) =>
  requiredAcks.every((ack) => acked.has(ack.code));

/**
 * Farq HISOBLANMAGANmi (xato, eski tahrir yoki buzuq versiya).
 * ⚠️ `hasChanges === false` bilan chalkashtirmang — u "farq yo'q" degani.
 *
 * @param {{ newHash?: string|null, diff?: object|null, hasChanges?: boolean|null }} view
 */
export const isDiffUnknown = (view) =>
  view?.newHash == null || view?.diff == null || view?.hasChanges == null;

/** To'siq matni — server satr yoki `{ code, message }` yuborishi mumkin. */
export const blockerText = (blocker) =>
  typeof blocker === "string" ? blocker : blocker?.message ?? "";

/**
 * Platformaga qaytishdagi to'siqlar: "o'zgarish yo'q" chiqarib tashlanadi —
 * arxivdagi jadval amaldagisi bilan bir xil bo'lsa ham qaytish mumkin.
 */
export const switchBackBlockers = (blockers = []) =>
  blockers.filter(
    (blocker) =>
      blocker?.code !== NO_CHANGES_BLOCKER.code &&
      blockerText(blocker) !== NO_CHANGES_BLOCKER.message,
  );

/** Versiya turi nomi — serverdan kelgani ustun. */
export const snapshotKindLabel = (snapshot) =>
  snapshot?.kindLabel || SNAPSHOT_KIND_LABELS[snapshot?.kind] || "Versiya";

// ── Moslash ───────────────────────────────────

/** Qator kaliti — tur + server bergan `key` (nom EMAS). */
export const mappingRowId = (row) => `${row.kind}|${row.key}`;

/**
 * Bitta tur uchun jadval qatorlari: oxirgi o'qilgan holatdagi nomlar +
 * saqlangan, lekin oxirgi holatda UCHRAMAGAN moslashlar.
 *
 * Ikkinchisi ham ko'rsatiladi: eski moslash keyingi o'qishda yana ishga
 * tushadi va uni ko'rmasdan tuzatib (yoki o'chirib) bo'lmasdi.
 *
 * @param {string} kind - "class" | "subject" | "teacher"
 * @param {object[]} resolution - `Review.resolution[kind]`
 * @param {object[]} stored - `GET /mappings` → `items`
 */
export const buildMappingRows = (kind, resolution, stored) => {
  const storedOfKind = (stored ?? []).filter((item) => item.kind === kind);
  const storedByKey = new Map(storedOfKind.map((item) => [item.key, item]));
  const seen = new Set();

  const rows = (resolution ?? []).map((res) => {
    seen.add(res.key);
    return {
      kind,
      key: res.key,
      label: res.label,
      count: res.count ?? null,
      cells: res.cells ?? [],
      status: res.status,
      targetId: res.targetId ?? null,
      targetName: res.targetName ?? null,
      candidates: res.candidates ?? [],
      stored: storedByKey.get(res.key) ?? null,
      inRevision: true,
    };
  });

  for (const item of storedOfKind) {
    if (seen.has(item.key)) continue;
    rows.push({
      kind,
      key: item.key,
      label: item.label,
      count: null,
      cells: [],
      status: item.targetMissing ? "missing_target" : "manual",
      targetId: item.targetId ?? null,
      targetName: item.targetName ?? null,
      candidates: [],
      stored: item,
      inRevision: false,
    });
  }

  return rows;
};

/** Taklif qilingan yozuv id si (tasdiqlash tugmasi uchun). */
export const suggestionOf = (row) =>
  row.status === "suggested"
    ? row.targetId || row.candidates?.[0]?.id || null
    : null;

/** Tanlagichdagi joriy (saqlangan) qiymat. */
export const baseTargetOf = (row) =>
  RESOLUTION_STATUS[row.status]?.selectable ? row.targetId ?? "" : "";

/**
 * O'qituvchi yorlig'i: "Ism (login) — fanlar".
 *
 * ⚠️ Adash o'qituvchilar faqat shu bilan ajraladi: ism bir xil bo'lsa,
 * noto'g'ri odamga dars (va soatbay oylik) yozilib ketardi. Login butun
 * tizimda yagona.
 */
const teacherLabel = (teacher, subjectNameById) => {
  const who = teacher.username ? `${teacher.name} (${teacher.username})` : teacher.name;
  const subjects = (teacher.subjectIds ?? [])
    .map((id) => subjectNameById.get(id))
    .filter(Boolean);
  return `${who} — ${subjects.length ? subjects.join(", ") : NO_SUBJECT_LABEL}`;
};

/**
 * Tanlagich variantlari `{ value, label }`. O'qituvchilarda — adashlarni
 * ajratadigan yorliq (`teacherLabel`).
 *
 * @param {string} kind - "class" | "subject" | "teacher"
 * @param {object[]} options - `GET /mappings` → `options[...]`
 * @param {object[]} subjects - `options.subjects` (o'qituvchi fanlari uchun)
 */
export const buildOptionList = (kind, options, subjects) => {
  const list = options ?? [];
  if (kind !== "teacher") {
    return list.map((option) => ({ value: option.id, label: option.name }));
  }
  const subjectNameById = new Map((subjects ?? []).map((s) => [s.id, s.name]));
  return list.map((teacher) => ({
    value: teacher.id,
    label: teacherLabel(teacher, subjectNameById),
  }));
};

/**
 * Nomzod yorlig'i — tanlagichdagi bilan AYNI (adashlar ajraladi). Ro'yxatda
 * yo'q bo'lsa (masalan arxivlangan) — ism va login.
 *
 * @param {{ id: string, name: string, username?: string }} candidate
 * @param {Map<string, string>} labelById - `buildOptionList` natijasidan
 */
export const candidateLabel = (candidate, labelById) =>
  labelById.get(candidate.id) ||
  (candidate.username ? `${candidate.name} (${candidate.username})` : candidate.name);
