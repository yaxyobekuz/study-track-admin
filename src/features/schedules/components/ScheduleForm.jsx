// Data
import { days } from "@/shared/data/days.data";

// Toast
import { toast } from "sonner";

// React
import { useState, useMemo, useRef, useEffect, useCallback } from "react";

// Router
import { useNavigate } from "react-router-dom";

// Icons
import {
  Plus,
  Trash2,
  History,
  CloudOff,
  CloudCheck,
  CloudUpload,
  TriangleAlert,
  ExternalLink,
} from "lucide-react";

// Hooks
import useDebounce from "@/shared/hooks/useDebounce";

// Utils
import { formatDateTimeUz, formatTimeUz } from "@/shared/utils/date.utils";

// Queries
import {
  useSaveClassSchedule,
  useSaveScheduleDraft,
  useDeleteScheduleDraft,
} from "@/features/schedules/queries/schedules.mutations";
import { useTeacherOptions } from "@/features/schedules/queries/schedules.queries";
import { useSubjects } from "@/features/subjects/queries/subjects.queries";
import { usePeriods } from "@/features/schedule-settings/queries/scheduleSettings.queries";

// Helpers
import { isSheetModeError } from "@/features/schedule-sync/helpers/scheduleSync.helpers";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import SelectField from "@/shared/components/ui/select/SelectField";
import ConfirmPopover from "@/shared/components/ui/ConfirmPopover";

// Tahrir tinchigach qoralama shuncha kutib yoziladi. Har bosishda so'rov
// yubormaslik uchun, lekin odam sahifadan chiqib ketguncha ulgurish uchun
// qisqa: bir soniya.
const DRAFT_DEBOUNCE_MS = 1000;

// Sheet rejimi xabari — avtomatik zaxira va "Saqlash" bir vaqtda rad
// etilsa ham ekranda BITTA xabar turadi (sonner `id` bo'yicha birlashtiradi).
const SHEET_MODE_TOAST_ID = "schedule-sheet-mode";
const SHEET_MODE_MESSAGE =
  "Jadval Google Sheets orqali boshqarilmoqda — platformadagi o'zgarishni saqlab bo'lmaydi";

const createEmptyLesson = (order) => ({
  subject: "",
  teacher: "",
  order,
  startTime: "",
  endTime: "",
});

const toLessonShape = (subj, index) => ({
  subject: typeof subj.subject === "object" ? subj.subject?.id : subj.subject,
  teacher: typeof subj.teacher === "object" ? subj.teacher?.id : subj.teacher,
  order: subj.order ?? index + 1,
  startTime: subj.startTime || "",
  endTime: subj.endTime || "",
});

/** Bo'sh hafta — barcha kunlar bor, darslar yo'q. */
const emptyWeek = () =>
  Object.fromEntries(days.map((day) => [day.value, []]));

/** Saqlangan jadvaldan forma holatini quradi. */
const weekFromSchedules = (schedules = []) => {
  const week = emptyWeek();
  for (const day of days) {
    const schedule = schedules.find((s) => s.day === day.value);
    week[day.value] = (schedule?.subjects || []).map(toLessonShape);
  }
  return week;
};

/** Qoralamadan forma holatini quradi (serverdan hamma maydon matn keladi). */
const weekFromDraft = (draftWeek) => {
  const week = emptyWeek();
  for (const day of days) {
    const lessons = draftWeek?.[day.value];
    if (!Array.isArray(lessons)) continue;
    week[day.value] = lessons.map((lesson, index) => ({
      subject: lesson?.subject || "",
      teacher: lesson?.teacher || "",
      order: lesson?.order ?? index + 1,
      startTime: lesson?.startTime || "",
      endTime: lesson?.endTime || "",
    }));
  }
  return week;
};

/**
 * Haftaning IMZOSI — "o'zgardimi?" degan savolga yagona javob.
 *
 * ⚠️ `JSON.stringify(week)` YARAMAYDI: `order` inputdan matn ("3"), jadvaldan
 * son (3) bo'lib keladi va bir xil hafta ikki xil satr berardi — qoralama
 * hech qachon "tinch" holatga kelmasdi.
 */
const weekSignature = (week) =>
  JSON.stringify(
    days.map((day) =>
      (week[day.value] || []).map((lesson) => [
        lesson.subject || "",
        lesson.teacher || "",
        String(lesson.order ?? ""),
        lesson.startTime || "",
        lesson.endTime || "",
      ]),
    ),
  );

/**
 * Sinfning butun haftalik dars jadvalini tahrirlash formasi.
 *
 * ⚠️ TAHRIR AVTOMATIK ZAXIRALANADI (qoralama). Jadval saqlashda butunligicha
 * tekshiriladi — o'qituvchi boshqa sinfda o'sha tartibda band bo'lsa, butun
 * hafta rad etiladi. Konfliktni bartaraf qilish uchun BOSHQA sinf jadvaliga
 * o'tish kerak bo'ladi va ilgari shu payt qilingan ish yo'q bo'lardi.
 * Endi tahrir serverda turadi: odam xohlagan joyiga borib qaytadi va o'sha
 * joydan davom etadi. Qoralamani faqat uni yozgan odam ko'radi.
 *
 * @param {object} props
 * @param {string} props.classId
 * @param {Array} [props.initialSchedules] - saqlangan jadval ([{ day, subjects }])
 * @param {object} [props.draft] - tiklanadigan qoralama ({ week, baseHash, updatedAt })
 * @param {string} [props.currentHash] - saqlangan jadvalning joriy imzosi
 * @param {boolean} [props.isStale] - qoralama tuzilgandan keyin jadval o'zgarganmi
 */
const ScheduleForm = ({
  classId,
  initialSchedules = [],
  draft = null,
  currentHash = null,
  isStale = false,
}) => {
  const navigate = useNavigate();
  const { data: subjects = [] } = useSubjects();
  const { data: teachers = [] } = useTeacherOptions();

  // Dars tartibi -> standart { startTime, endTime } sozlamalari
  const { data: periods = [] } = usePeriods();

  const periodMap = useMemo(() => {
    const map = new Map();
    for (const p of periods) {
      map.set(Number(p.order), { startTime: p.startTime, endTime: p.endTime });
    }
    return map;
  }, [periods]);

  // O'qituvchilar: id bo'yicha va FAN bo'yicha. Fan bo'yicha ro'yxat —
  // formaning butun mohiyati: fan tanlangach faqat shu fandan dars
  // beradiganlar ko'rinadi.
  const teacherIndex = useMemo(() => {
    const byId = new Map();
    const bySubject = new Map();
    const unassigned = [];

    for (const teacher of teachers) {
      byId.set(teacher.id, teacher);
      const subjectIds = teacher.subjectIds || [];

      // ⚠️ Fani UMUMAN belgilanmagan xodim HAR QANDAY fanda ko'rinadi —
      // server ham aynan shunday yo'l qo'yadi. Bu "noto'g'ri fan" emas,
      // "ma'lumot to'liq emas" holati: uni ro'yxatdan chiqarib tashlasak,
      // fanlar biriktirilmagan maktabda jadval tuzib bo'lmay qolardi.
      // Yorliqdagi izoh esa ma'lumotni to'ldirishga undaydi.
      if (subjectIds.length === 0) {
        unassigned.push({
          value: teacher.id,
          label: `${teacher.fullName} — fani belgilanmagan`,
        });
        continue;
      }

      for (const subjectId of subjectIds) {
        if (!bySubject.has(subjectId)) bySubject.set(subjectId, []);
        bySubject
          .get(subjectId)
          .push({ value: teacher.id, label: teacher.fullName });
      }
    }

    return { byId, bySubject, unassigned };
  }, [teachers]);

  /**
   * Bitta qator uchun o'qituvchilar ro'yxati.
   *
   * ⚠️ Allaqachon tanlangan o'qituvchi ro'yxatga TUSHMASA ham ko'rsatiladi
   * (izoh bilan): eski jadvalda fan biriktirilishidan oldin qo'yilgan dars
   * bo'lishi mumkin va uni ro'yxatdan yashirsak, qator bo'sh ko'rinib,
   * odam nima o'chganini bilmay qolardi.
   */
  const teacherOptionsFor = (subjectId, teacherId) => {
    if (!subjectId) return [];

    // Shu fandan dars beradiganlar BIRINCHI, fani belgilanmaganlar keyin
    const matching = teacherIndex.bySubject.get(subjectId) || [];
    const options = [...matching, ...teacherIndex.unassigned];

    if (!teacherId || options.some((o) => o.value === teacherId)) {
      return options;
    }

    const known = teacherIndex.byId.get(teacherId);
    return [
      {
        value: teacherId,
        label: known
          ? `${known.fullName} — bu fanga biriktirilmagan`
          : "Noma'lum o'qituvchi",
      },
      ...options,
    ];
  };

  /**
   * O'qituvchi ro'yxati ostidagi izoh — nega ro'yxat shunday ekanini
   * aytadi. Bo'sh ro'yxat oldida odam "tizim ishlamayapti" deb o'ylardi.
   */
  const teacherHint = (subjectId, options) => {
    if (!subjectId) return "";
    if (options.length === 0) {
      return "Bu fanga biriktirilgan o'qituvchi yo'q. Xodimlar bo'limida fanni biriktiring";
    }
    const matching = teacherIndex.bySubject.get(subjectId) || [];
    if (matching.length === 0) {
      return "Bu fanga biriktirilgan o'qituvchi yo'q — ro'yxatda fani belgilanmaganlar ko'rsatilgan";
    }
    return "";
  };

  // ── Forma holati ──
  //
  // Qoralama bo'lsa — o'shandan, aks holda saqlangan jadvaldan boshlanadi.
  // Bu FAQAT birinchi renderda o'qiladi: keyin proplar yangilansa ham
  // odamning yozayotgani orqaga tashlanmaydi.
  const [week, setWeek] = useState(() =>
    draft?.week ? weekFromDraft(draft.week) : weekFromSchedules(initialSchedules),
  );

  // Saqlangan jadvalning imzosi — "qoralama umuman kerakmi?" degan mezon.
  const savedSignature = useMemo(
    () => weekSignature(weekFromSchedules(initialSchedules)),
    [initialSchedules],
  );

  const currentSignature = useMemo(() => weekSignature(week), [week]);
  const debouncedSignature = useDebounce(currentSignature, DRAFT_DEBOUNCE_MS);

  // SERVERDAGI qoralama: `{ signature, updatedAt }` yoki `null` (qoralama yo'q).
  //
  // ⚠️ Holat ATAYLAB shu ko'rinishda: "zaxiralandimi?" degan savolga javob
  // `null` bilan ham beriladi. Alohida `hasDraft` bayrog'i bo'lsa, u imzo
  // bilan bir-biriga mos kelmay qolishi mumkin edi.
  const [serverDraft, setServerDraft] = useState(() =>
    draft
      ? {
          signature: weekSignature(weekFromDraft(draft.week)),
          updatedAt: draft.updatedAt,
        }
      : null,
  );
  const [conflicts, setConflicts] = useState([]);

  // Qoralama QAYSI jadval ustiga qurilgani. Tiklangan qoralamaning tayanchi
  // saqlanadi: aks holda har avtomatik yozuvda u joriy holatga surilib,
  // "jadval boshqa odam tomonidan o'zgartirilgan" ogohlantirishi jimgina
  // yo'qolib ketardi.
  const baseHashRef = useRef(draft?.baseHash || currentHash || null);

  const saveMutation = useSaveClassSchedule();
  const draftMutation = useSaveScheduleDraft();
  const dropDraftMutation = useDeleteScheduleDraft();

  /**
   * Jadval manbai Google Sheets'ga o'tgan (409 `sheet_mode`): bu yerdagi
   * tahrir endi saqlanmaydi. Manba so'rovini mutatsiya hook'i yangilaydi,
   * forma esa odamni jadval sahifasiga qaytaradi.
   */
  const leaveOnSheetMode = () => {
    toast.error(SHEET_MODE_MESSAGE, { id: SHEET_MODE_TOAST_ID });
    navigate(`/schedules/${classId}`);
  };

  // Serverda turgan holat: qoralama bo'lsa — o'sha, aks holda saqlangan
  // jadvalning o'zi. Shu tufayli "tahrirni qaytarib, jadvalga tenglashtirdim"
  // holati ham avtomat ravishda "zaxiralanadigan narsa yo'q" bo'lib chiqadi.
  const syncedSignature = serverDraft ? serverDraft.signature : savedSignature;
  const isPending = currentSignature !== syncedSignature;

  // ── Avtomatik zaxiralash ──
  //
  // ⚠️ Holat bu yerda TO'G'RIDAN-TO'G'RI o'zgartirilmaydi — faqat so'rov
  // javobida. "Yozilyapti" va "yozilmadi" belgilari mutatsiyaning o'z
  // holatidan olinadi (pastda), shuning uchun ular hech qachon haqiqatdan
  // ajralib qolmaydi.
  useEffect(() => {
    // Tahrir hali tinchimagan — keyingi urinishni kutamiz. Aks holda
    // eskirgan surat yozilib qolardi.
    if (debouncedSignature !== currentSignature) return;
    if (debouncedSignature === syncedSignature) return;

    const snapshot = debouncedSignature;

    // Saqlangan jadval bilan farq yo'q — serverdagi qoralama endi keraksiz.
    // (Bu shoxga faqat qoralama BOR bo'lganda tushiladi: aks holda
    // `syncedSignature` allaqachon shu imzo bo'lardi.)
    if (snapshot === savedSignature) {
      dropDraftMutation.mutate(classId, {
        onSuccess: () => setServerDraft(null),
      });
      return;
    }

    draftMutation.mutate(
      { classId, week, baseHash: baseHashRef.current },
      {
        onSuccess: (res) =>
          setServerDraft({
            signature: snapshot,
            updatedAt: res?.data?.updatedAt || new Date().toISOString(),
          }),
        onError: (err) => {
          if (isSheetModeError(err)) leaveOnSheetMode();
        },
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSignature, currentSignature, syncedSignature, savedSignature]);

  // Zaxiralanmagan o'zgarish bilan sahifani yopishdan ogohlantirish —
  // debounce oynasiga tushib qolgan oxirgi bir soniyalik ish uchun.
  useEffect(() => {
    if (!isPending) return;
    const handler = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isPending]);

  /**
   * Sahifadan chiqishdan OLDIN qoralamani darhol yozadi.
   *
   * Debounce oynasi tugamasdan bosilgan havola oxirgi o'zgarishni olib
   * ketardi — konfliktni tuzatgani boshqa sinfga o'tish aynan shunday
   * bosish bo'ladi.
   */
  const flushDraft = useCallback(async () => {
    if (currentSignature === syncedSignature) return;
    try {
      if (currentSignature === savedSignature) {
        await dropDraftMutation.mutateAsync(classId);
        setServerDraft(null);
      } else {
        const res = await draftMutation.mutateAsync({
          classId,
          week,
          baseHash: baseHashRef.current,
        });
        setServerDraft({
          signature: currentSignature,
          updatedAt: res?.data?.updatedAt || new Date().toISOString(),
        });
      }
    } catch (err) {
      // Sahifadan baribir chiqilyapti — faqat sababni aytamiz. Sheet
      // rejimida qoralama ham yozilmaydi (tahrirning o'zi yopiq).
      if (isSheetModeError(err)) {
        toast.error(SHEET_MODE_MESSAGE, { id: SHEET_MODE_TOAST_ID });
      } else {
        toast.error("Qoralamani zaxiralab bo'lmadi");
      }
    }
  }, [
    week,
    classId,
    savedSignature,
    syncedSignature,
    currentSignature,
    draftMutation,
    dropDraftMutation,
  ]);

  /** Zaxirani yozib, keyin ko'rsatilgan manzilga o'tadi. */
  const leaveTo = async (path) => {
    await flushDraft();
    navigate(path);
  };

  /** Qoralamani tashlab, saqlangan jadvalga qaytish. */
  const discardDraft = () => {
    dropDraftMutation.mutate(classId, {
      onSuccess: () => {
        setWeek(weekFromSchedules(initialSchedules));
        setServerDraft(null);
        setConflicts([]);
        baseHashRef.current = currentHash || null;
        toast.success("Qoralama tashlandi — saqlangan jadval tiklandi");
      },
      onError: () => toast.error("Qoralamani o'chirib bo'lmadi"),
    });
  };

  const addLesson = (day) => {
    setWeek((prev) => {
      const lessons = prev[day];
      const nextOrder =
        Math.max(0, ...lessons.map((s) => Number(s.order) || 0)) + 1;
      const lesson = createEmptyLesson(nextOrder);
      // Sozlamada shu tartib uchun standart vaqtlar bo'lsa, avto to'ldiramiz
      const preset = periodMap.get(nextOrder);
      if (preset) {
        lesson.startTime = preset.startTime;
        lesson.endTime = preset.endTime;
      }
      return { ...prev, [day]: [...lessons, lesson] };
    });
  };

  const removeLesson = (day, index) => {
    setWeek((prev) => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index),
    }));
  };

  const updateLesson = (day, index, field, value) => {
    setWeek((prev) => {
      const lessons = [...prev[day]];
      let updated = { ...lessons[index], [field]: value };

      // Dars tartibi o'zgarganda, sozlamadagi standart vaqtlarni avto to'ldiramiz
      if (field === "order") {
        const preset = periodMap.get(Number(value));
        if (preset) {
          updated = {
            ...updated,
            startTime: preset.startTime,
            endTime: preset.endTime,
          };
        }
      }

      // ⚠️ Fan almashsa, unga biriktirilmagan o'qituvchi TUSHIRILADI.
      // Aks holda "matematika o'qituvchisi ingliz tilidan dars beradi"
      // degan qator ekranda to'g'ri ko'rinib turib, saqlashda rad etilardi.
      if (field === "subject" && updated.teacher) {
        const allowed = teacherOptionsFor(value, "");
        if (!allowed.some((o) => o.value === updated.teacher)) {
          updated = { ...updated, teacher: "" };
        }
      }

      lessons[index] = updated;
      return { ...prev, [day]: lessons };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setConflicts([]);

    const payload = [];

    for (const day of days) {
      const lessons = week[day.value];

      // ⚠️ To'ldirilmagan qator JIMGINA TASHLANMAYDI. Qoralama tufayli
      // yarim to'ldirilgan dars endi odatiy hol va uni sezdirmay yo'q
      // qilish — odamning ishini yo'qotish bilan bir xil.
      const incomplete = lessons
        .map((s, i) => (!s.subject || !s.teacher ? `${i + 1}-dars` : null))
        .filter(Boolean);
      if (incomplete.length > 0) {
        return toast.error(
          `${day.label}: ${incomplete.join(", ")} to'liq emas. Fan va o'qituvchini tanlang yoki darsni o'chiring`,
        );
      }

      // Order numbers must be unique within the day
      const orders = lessons.map((s) => Number(s.order));
      if (new Set(orders).size !== orders.length) {
        return toast.error(
          `${day.label}: dars tartib raqamlari takrorlanmasligi kerak`,
        );
      }

      payload.push({
        day: day.value,
        subjects: lessons.map((s) => ({ ...s, order: Number(s.order) })),
      });
    }

    if (payload.every((d) => d.subjects.length === 0)) {
      return toast.error("Kamida bitta kun uchun dars jadvali kiriting");
    }

    saveMutation.mutate(
      { classId, schedules: payload },
      {
        onSuccess: () => {
          // Server saqlash bilan birga qoralamani ham o'chiradi — bu yerda
          // faqat ekrandagi holat tozalanadi.
          setServerDraft(null);
          toast.success("Dars jadvali saqlandi");
          navigate(`/schedules/${classId}`);
        },
        onError: (err) => {
          if (isSheetModeError(err)) return leaveOnSheetMode();

          const data = err.response?.data;
          setConflicts(data?.details?.conflicts || []);
          toast.error(data?.message || "Xatolik yuz berdi");
        },
      },
    );
  };

  // ── Zaxira holati ──
  //
  // Holat ALOHIDA `useState` da saqlanmaydi: u so'rovlarning o'z holatidan
  // va serverdagi qoralamadan kelib chiqadi. Shu sababli ekrandagi belgi
  // haqiqatdan hech qachon ajralib qolmaydi.
  const isSyncing = draftMutation.isPending || dropDraftMutation.isPending;
  const hasSyncError = draftMutation.isError || dropDraftMutation.isError;

  const draftStatus = isSyncing
    ? "saving"
    : hasSyncError
      ? "error"
      : serverDraft
        ? "saved"
        : "idle";

  // Qoralama tiklangan holat: sahifa ochilganda qoralama BOR edi va u
  // hozircha ham turibdi (tashlanmagan, saqlanmagan).
  const showRestored = Boolean(draft) && Boolean(serverDraft);

  const statusText = {
    idle: "O'zgarishlar avtomatik zaxiralanadi",
    saving: "Zaxiralanmoqda...",
    saved: serverDraft?.updatedAt
      ? `Zaxiralandi ${formatTimeUz(serverDraft.updatedAt)}`
      : "Zaxiralandi",
    error: "Zaxiralanmadi — ulanishni tekshiring",
  }[draftStatus];

  const StatusIcon = {
    idle: CloudUpload,
    saving: CloudUpload,
    saved: CloudCheck,
    error: CloudOff,
  }[draftStatus];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Tiklangan qoralama haqida xabar */}
      {showRestored && (
        <Card className="flex flex-col gap-3 border border-blue-200 bg-blue-50/60 xs:flex-row xs:items-center xs:justify-between">
          <div className="flex items-start gap-2.5">
            <History className="mt-0.5 size-4 shrink-0 text-blue-600" />
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-gray-900">
                Tugallanmagan tahrir tiklandi
              </p>
              <p className="text-xs text-gray-600">
                Oxirgi zaxira: {formatDateTimeUz(draft?.updatedAt)}. Bu nusxani
                faqat siz ko'rasiz — saqlaguningizcha jadval o'zgarmaydi
              </p>
            </div>
          </div>

          <ConfirmPopover
            danger
            title="Qoralama tashlansinmi?"
            description="Saqlanmagan o'zgarishlar butunlay o'chadi va saqlangan jadval qaytariladi."
            confirmLabel="Tashlash"
            onConfirm={discardDraft}
          >
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="shrink-0"
            >
              Qoralamani tashlash
            </Button>
          </ConfirmPopover>
        </Card>
      )}

      {/* Qoralama eskirgan — jadval boshqa odam tomonidan o'zgartirilgan */}
      {isStale && showRestored && (
        <Card className="flex items-start gap-2.5 border border-amber-200 bg-amber-50/70">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <p className="text-xs leading-relaxed text-gray-700">
            Siz tahrirni boshlaganingizdan keyin bu sinf jadvali boshqa xodim
            tomonidan o'zgartirilgan. Saqlasangiz o'sha o'zgarishlar bekor
            bo'ladi — qoralamani tashlab, yangi jadvaldan boshlash mumkin
          </p>
        </Card>
      )}

      {/* Saqlashda aniqlangan to'qnashuvlar */}
      {conflicts.length > 0 && (
        <Card className="space-y-2.5 border border-red-200 bg-red-50/60">
          <div className="flex items-start gap-2.5">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-red-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                O'qituvchi o'sha vaqtda boshqa sinfda band
              </p>
              <p className="text-xs text-gray-600">
                Quyidagi darslarni o'zgartiring yoki boshqa sinf jadvalidan
                o'sha darsni oling. Tahriringiz zaxiralangan — qaytib
                kelganingizda shu joydan davom etasiz
              </p>
            </div>
          </div>

          <ul className="space-y-1.5">
            {conflicts.map((conflict, index) => (
              <li
                key={`${conflict.day}-${conflict.order}-${index}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-xs"
              >
                <span className="text-gray-700">
                  <b className="font-medium text-gray-900">
                    {conflict.dayLabel}, {conflict.order}-dars
                  </b>{" "}
                  — {conflict.teacherName} "{conflict.className}" sinfida band
                </span>

                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 gap-1.5 px-2 text-blue-600"
                  onClick={() => leaveTo(`/schedules/${conflict.classId}/edit`)}
                >
                  <ExternalLink className="size-3.5" strokeWidth={1.5} />
                  O'sha sinfni ochish
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {days.map((day) => {
          const lessons = week[day.value];

          return (
            <Card key={day.value} className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {day.label}
              </h3>

              {lessons.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-2">
                  Bu kun uchun dars yo'q
                </p>
              )}

              {lessons.map((subj, index) => {
                const teacherOptions = teacherOptionsFor(
                  subj.subject,
                  subj.teacher,
                );

                return (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-xl"
                  >
                    <div className="flex justify-between items-center px-4 py-2 rounded-t-lg bg-gray-100">
                      <h4 className="font-medium text-gray-900">
                        {index + 1}-dars
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeLesson(day.value, index)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="size-4" strokeWidth={1.5} />
                      </button>
                    </div>

                    <InputGroup className="grid-cols-2 p-1.5">
                      <InputField
                        min={1}
                        max={100}
                        required
                        type="number"
                        label="Dars tartibi"
                        placeholder="1, 2, 3, ..."
                        value={subj.order}
                        onChange={(e) =>
                          updateLesson(
                            day.value,
                            index,
                            "order",
                            e.target.value,
                          )
                        }
                      />

                      <SelectField
                        required
                        searchable
                        label="Fan"
                        placeholder="Fanni tanlang"
                        value={subj.subject}
                        onChange={(v) =>
                          updateLesson(day.value, index, "subject", v)
                        }
                        options={subjects.map((s) => ({
                          label: s?.name,
                          value: s?.id,
                        }))}
                      />

                      {/* ⚠️ O'qituvchilar ro'yxati TANLANGAN FANGA bog'liq:
                          matematika o'qituvchisiga ingliz tilidan dars
                          qo'yib bo'lmaydi. Fan tanlanmaguncha ro'yxat
                          yopiq — aks holda tanlov keyin jimgina tushib
                          ketardi. */}
                      <SelectField
                        required
                        searchable
                        className="col-span-2"
                        label="O'qituvchi"
                        disabled={!subj.subject}
                        placeholder={
                          subj.subject
                            ? "O'qituvchini tanlang"
                            : "Avval fanni tanlang"
                        }
                        emptyText="Bu fanga biriktirilgan o'qituvchi yo'q"
                        value={subj.teacher}
                        onChange={(v) =>
                          updateLesson(day.value, index, "teacher", v)
                        }
                        options={teacherOptions}
                        description={teacherHint(subj.subject, teacherOptions)}
                      />

                      <div className="grid grid-cols-2 gap-1.5 col-span-2">
                        <InputField
                          required
                          type="time"
                          label="Boshlanish vaqti"
                          value={subj.startTime}
                          onChange={(e) =>
                            updateLesson(
                              day.value,
                              index,
                              "startTime",
                              e.target.value,
                            )
                          }
                        />

                        <InputField
                          required
                          type="time"
                          label="Tugash vaqti"
                          value={subj.endTime}
                          onChange={(e) =>
                            updateLesson(
                              day.value,
                              index,
                              "endTime",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </InputGroup>
                  </div>
                );
              })}

              {/* Add lesson button */}
              <Button
                type="button"
                variant="outline"
                onClick={() => addLesson(day.value)}
                className="w-full border-2 border-dashed text-gray-600 hover:border-blue-500 hover:text-blue-500"
              >
                <Plus className="size-4" strokeWidth={1.5} />
                Dars qo'shish
              </Button>
            </Card>
          );
        })}
      </div>

      {/* Action buttons (fixed bottom bar) */}
      <div className="sticky bottom-0 z-20 -mx-4 mt-4 flex flex-col gap-3 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur xs:flex-row xs:items-center xs:justify-between">
        <p
          className={`flex items-center gap-1.5 text-xs ${
            draftStatus === "error" ? "text-red-600" : "text-gray-500"
          }`}
        >
          <StatusIcon className="size-3.5 shrink-0" strokeWidth={1.5} />
          {statusText}
        </p>

        <div className="flex flex-col-reverse gap-3.5 xs:flex-row xs:justify-end">
          {/* ⚠️ "Chiqish" — tahrirni O'CHIRMAYDI. Zaxira serverda qoladi va
              qaytib kelganda o'sha joydan davom etiladi. Tashlash uchun
              yuqoridagi "Qoralamani tashlash" bor. */}
          <Button
            type="button"
            variant="secondary"
            className="w-full xs:w-32"
            onClick={() => leaveTo(`/schedules/${classId}`)}
          >
            Chiqish
          </Button>

          <Button className="w-full xs:w-32" disabled={saveMutation.isPending}>
            Saqlash
            {saveMutation.isPending && "..."}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ScheduleForm;
