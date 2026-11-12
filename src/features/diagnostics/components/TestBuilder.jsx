// React
import { useCallback, useMemo, useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import { Loader2, Plus, ScanSearch, Users } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import Input from "@/shared/components/ui/input/Input";
import TestBlueprintTable from "./TestBlueprintTable";
import TestPlanCard from "./TestPlanCard";
import StudentPlanCard from "./StudentPlanCard";

// Hooks
import { useSubjects } from "@/features/subjects/queries/subjects.queries";
import {
  usePreviewTest,
  usePreviewStudentTest,
} from "../queries/diagnostics.mutations";

// Data
import { TEST_MODES } from "../data/diagnostics.data";

// Utils
import { cn } from "@/shared/utils/cn";

/**
 * YANGI TEST YIG'GICH.
 *
 * ⚠️ TO'RT QADAM VA TARTIB QAT'IY: KIM (sinf) → NIMA (fanlar, mavzu
 * qamrovi, qiyinlik va manba) → QACHON (nom, sana, vaqt) → TEKSHIRUV.
 * Ikkinchi qadam birinchisisiz ma'nosiz: mavzu chegarasi SINFNING
 * joriy mavzusidan chiqadi.
 *
 * ⚠️ TEKSHIRUVSIZ YARATILMAYDI va bu ataylab. Yaratish qaytarib
 * bo'lmaydigan ikki narsaga tegadi — pullik model chaqiruvlariga va
 * bankka yoziladigan savollarga. Odam avval sinf qaysi mavzuga
 * kelganini va nechta savol qayerdan olinishini ko'rishi kerak
 * (loyihadagi `preview` → `confirm` naqshi).
 *
 * ⚠️ O'QUVCHI SINFI VA SAVOL BAZASI SINFI — IKKI BOSHQA NARSA.
 * 7-sinf o'quvchisiga 6-sinf bazasidan savol berish odatiy hol
 * (takrorlash, bo'shliqni yopish), shuning uchun har fan qatorida
 * "Sinf (baza)" alohida tanlanadi.
 *
 * ⚠️ IKKI REJIM, BITTA FORMA (2026-11-12):
 *   · "Butun guruhga bitta to'plam" — avvalgi xatti-harakat: chegara
 *     SINFNING joriy mavzusidan, hammaga ayni savollar;
 *   · "Har o'quvchiga o'z savollari" — chegara HAR BOLANING o'z
 *     mavzu o'rnidan (`StudentTopicPlan`), savollar ham alohida.
 *
 * Ikki forma yozilsa, biriga qo'shilgan tekshiruv (mavzu oralig'i, AI
 * ruxsati, eskirgan reja) ikkinchisida tushib qolardi.
 */
const emptyRow = () => ({
  subjectId: "",
  grade: "",
  source: "bank",
  topicMode: "current",
  topicFrom: "",
  topicTo: "",
  easy: 0,
  medium: 0,
  hard: 0,
});

/** Serverga ketadigan shakl — panel hech qanday chegarani hisoblamaydi. */
const toPayloadRow = (row) => ({
  subjectId: row.subjectId,
  grade: row.grade ? Number(row.grade) : null,
  source: row.source,
  topicMode: row.topicMode,
  topicFrom: row.topicMode === "range" ? Number(row.topicFrom) || null : null,
  topicTo: row.topicMode === "range" ? Number(row.topicTo) || null : null,
  easy: Number(row.easy) || 0,
  medium: Number(row.medium) || 0,
  hard: Number(row.hard) || 0,
});

const TestBuilder = ({ classes = [], onBuild, isPending }) => {
  const { data: subjects = [] } = useSubjects();
  const { mutate: preview, isPending: isCheckingClass } = usePreviewTest();
  const { mutate: previewStudents, isPending: isCheckingStudents } =
    usePreviewStudentTest();

  const [classId, setClassId] = useState("");
  /**
   * HAR O'QUVCHIGA O'Z SAVOLLARI.
   *
   * ⚠️ SUKUT — O'CHIQ: avvalgi xatti-harakat saqlanadi. Yoqilganda
   * qamrov har bolaning shaxsiy mavzu o'rnidan olinadi va kimga test
   * tushmagani ham ro'yxatda ko'rinadi.
   */
  const [perStudent, setPerStudent] = useState(false);
  /**
   * TESTGA KIRMAYDIGAN O'QUVCHILAR.
   *
   * ⚠️ RO'YXAT "CHIQARILGANLAR" bo'yicha yuritiladi, "tanlanganlar"
   * bo'yicha EMAS: tekshiruvdan oldin guruhning kimligi noma'lum
   * (ro'yxat serverdan keladi) va bo'sh "tanlanganlar" ro'yxati
   * "hech kim" degan ma'noni berib qolardi.
   */
  const [excluded, setExcluded] = useState([]);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({
    title: "",
    date: "",
    durationMin: 45,
    mode: "timed",
    description: "",
  });

  const [plan, setPlan] = useState(null);
  /** Reja AYNAN QAYSI TAQSIMOT uchun olingani — eskirganini bilish uchun. */
  const [planKey, setPlanKey] = useState(null);

  /**
   * ⚠️ TAQSIMOT O'ZGARSA REJA ESKIRADI. Usiz admin "Tekshirish" ni
   * bosib, keyin sonlarni o'zgartirib, eski (yashil) natijaga qarab
   * test yaratardi — holbuki tekshiruv boshqa taqsimot uchun qilingan.
   */
  const currentKey = useMemo(
    () => JSON.stringify({ classId, perStudent, rows: rows.map(toPayloadRow) }),
    [classId, perStudent, rows],
  );
  const stale = Boolean(plan) && planKey !== currentKey;

  const total = useMemo(
    () =>
      rows.reduce(
        (sum, r) => sum + (+r.easy || 0) + (+r.medium || 0) + (+r.hard || 0),
        0,
      ),
    [rows],
  );

  const setRow = useCallback(
    (index, patch) =>
      setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r))),
    [],
  );

  const planByIndex = useMemo(() => {
    if (!plan?.rows) return null;
    return new Map(plan.rows.map((row) => [row.index, row]));
  }, [plan]);

  /** Serverga bormasdan oldin ushlanadigan xatolar. */
  const validate = () => {
    if (!classId) return "Sinfni tanlang";
    if (!rows.length) return "Kamida bitta fan qo'shing";
    if (rows.some((r) => !r.subjectId)) return "Har qatorda fanni tanlang";
    if (total === 0) return "Savollar sonini kiriting";

    const badRange = rows.find(
      (r) => r.topicMode === "range" && (!Number(r.topicFrom) || !Number(r.topicTo)),
    );
    if (badRange) return "Mavzular oralig'ining ikkala chegarasini kiriting";

    return null;
  };

  const handleCheck = () => {
    const error = validate();
    if (error) return toast.error(error);

    const payload = { classId, blueprint: rows.map(toPayloadRow) };
    const handlers = {
      onSuccess: (data) => {
        setPlan(data);
        setPlanKey(currentKey);
        // Tekshiruv yangi ro'yxat beradi — eski "chiqarilganlar" ma'nosiz
        setExcluded([]);
        if (!data.canBuild) {
          toast.warning("Taqsimotda tuzatilishi kerak joylar bor");
        }
      },
      onError: (err) =>
        toast.error(err.response?.data?.message || "Tekshirib bo'lmadi"),
    };

    // ⚠️ IKKI YO'L, BITTA TUGMA: rejim bo'yicha boshqa endpoint, lekin
    // tekshiruv natijasi bilan ishlash qoidasi AYNI.
    if (perStudent) previewStudents(payload, handlers);
    else preview(payload, handlers);
  };

  const handleSubmit = () => {
    const error = validate();
    if (error) return toast.error(error);
    if (!form.title.trim()) return toast.error("Test nomini kiriting");

    onBuild(
      {
        perStudent,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        mode: form.mode,
        durationMin: Number(form.durationMin) || 45,
        classIds: [classId],
        // ⚠️ Sana BO'LSA — test o'sha kundan ochiladi; bo'lmasa darhol.
        availableFrom: form.date || undefined,
        blueprint: rows.map(toPayloadRow),
        // ⚠️ RO'YXAT FAQAT KIMDIR CHIQARILGANDA yuboriladi: bo'sh ro'yxat
        // serverda "guruhning hammasi" degani (`studentIds: null`).
        ...(perStudent && excluded.length > 0
          ? {
              studentIds: (plan?.students ?? [])
                .filter(
                  (row) =>
                    row.status === "ready" && !excluded.includes(row.student.id),
                )
                .map((row) => row.student.id),
            }
          : {}),
      },
      { onDone: reset },
    );
  };

  const reset = () => {
    setClassId("");
    setRows([]);
    setForm({ title: "", date: "", durationMin: 45, mode: "timed", description: "" });
    setPlan(null);
    setPlanKey(null);
    setPerStudent(false);
    setExcluded([]);
  };

  const needsAi = rows.some((r) => r.source === "ai");
  const isChecking = isCheckingClass || isCheckingStudents;

  // Moslangan testda kamida bitta o'quvchi qolishi kerak: hammasi
  // chiqarilsa yaratadigan narsa qolmaydi.
  const readyStudents = perStudent
    ? (plan?.students ?? []).filter(
        (row) => row.status === "ready" && !excluded.includes(row.student.id),
      ).length
    : 1;

  const canSubmit =
    Boolean(plan) && !stale && plan.canBuild && !isPending && readyStudents > 0;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Yangi test qo'shish</h2>
        <p className="mt-0.5 text-sm text-gray-500">
          Sinf uchun fanlarni tanlang, mavzu qamrovini va har bir qiyinlikdan
          nechta savol kerakligini belgilang
        </p>
      </div>

      {/* ── 1. SINF ────────────────────────── */}
      <Card>
        <StepTitle n={1}>Test qaysi sinf o'quvchilari uchun</StepTitle>

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,420px)_1fr]">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">
              Sinf (o'quvchilar)
            </span>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-primary"
            >
              <option value="">Sinfni tanlang</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <p className="self-center text-sm leading-relaxed text-gray-500">
            {perStudent ? (
              <>
                Mavzu chegarasi{" "}
                <b className="text-gray-700">har bir o'quvchining</b> o'z mavzu
                o'rnidan olinadi: guruhda kim qayerga kelgan bo'lsa, test o'sha
                oraliqda tuziladi. Dars kunlari guruhning jadvalidan sanaladi,
                shuning uchun bitta guruh tanlanadi.
              </>
            ) : (
              <>
                Mavzu chegarasi <b className="text-gray-700">shu sinfning</b>{" "}
                joriy mavzusidan olinadi: o'tilmagan mavzudan savol tushmaydi.
                Shu sababli bitta testga bitta sinf tanlanadi.
              </>
            )}
          </p>
        </div>

        {/* ── REJIM ────────────────────────── */}
        <button
          type="button"
          onClick={() => setPerStudent((prev) => !prev)}
          className={cn(
            "mt-4 flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors",
            perStudent
              ? "border-primary bg-primary/5"
              : "border-gray-200 hover:border-gray-300",
          )}
        >
          <span
            className={cn(
              "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
              perStudent ? "border-primary bg-primary" : "border-gray-300",
            )}
          >
            {perStudent && (
              <Users className="size-3 text-white" strokeWidth={2.5} />
            )}
          </span>

          <span className="min-w-0">
            <span className="block text-sm font-medium text-gray-900">
              Har o'quvchiga o'z savollari
            </span>
            <span className="mt-0.5 block text-xs text-gray-500">
              Guruhdagi bolalar boshqa-boshqa mavzuga kelgan bo'ladi. Yoqilsa,
              har bolaga uning O'Z mavzu oralig'idan savol tushadi; bir xil
              oraliqdagilar ayni savollarni oladi.
            </span>
          </span>
        </button>
      </Card>

      {/* ── 2. TAQSIMOT ────────────────────── */}
      <Card className="!p-0">
        <div className="p-4 xs:p-5">
          <StepTitle n={2}>Fanlar, mavzular va savollar taqsimoti</StepTitle>
        </div>

        <TestBlueprintTable
          rows={rows}
          subjects={subjects}
          planByIndex={planByIndex}
          disabled={isPending}
          onChange={setRow}
          onRemove={(index) =>
            setRows((prev) => prev.filter((_, i) => i !== index))
          }
          onAdd={() => setRows((prev) => [...prev, emptyRow()])}
        />
      </Card>

      {/* ── 3. MA'LUMOTLAR ─────────────────── */}
      <Card>
        <StepTitle n={3}>Test ma'lumotlari</StepTitle>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Test nomi">
            <Input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Masalan: Daraja testi"
              maxLength={120}
            />
          </Field>

          <Field label="O'tkazish sanasi">
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
            />
          </Field>

          <Field label="Vaqt (daqiqa)">
            <Input
              type="number"
              min={1}
              max={300}
              value={form.durationMin}
              onChange={(e) =>
                setForm((p) => ({ ...p, durationMin: e.target.value }))
              }
            />
          </Field>

          <Field label="Test turi">
            <select
              value={form.mode}
              onChange={(e) => setForm((p) => ({ ...p, mode: e.target.value }))}
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-primary"
            >
              {TEST_MODES.filter((m) => m.value !== "adaptive").map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Tavsif (ixtiyoriy)" className="mt-4">
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none focus:border-primary"
          />
        </Field>
      </Card>

      {/* ── 4. TEKSHIRUV ───────────────────── */}
      {plan &&
        (perStudent ? (
          <StudentPlanCard
            plan={plan}
            stale={stale}
            excluded={excluded}
            onToggleStudent={(studentId) =>
              setExcluded((prev) =>
                prev.includes(studentId)
                  ? prev.filter((id) => id !== studentId)
                  : [...prev, studentId],
              )
            }
            onToggleAll={() =>
              setExcluded((prev) =>
                prev.length > 0
                  ? []
                  : (plan.students ?? [])
                      .filter((row) => row.status === "ready")
                      .map((row) => row.student.id),
              )
            }
          />
        ) : (
          <TestPlanCard plan={plan} stale={stale} />
        ))}

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-xl text-xs text-gray-500">
            {/* ⚠️ TASDIQ DARVOZASI HAMMA TESTGA TEGISHLI (2026-11-12):
                "filial egasi ko'rib chiqadi, tasdiqlasa keyin chiqariladi".
                Ilgari faqat AI savollari tasdiq talab qilardi. */}
            Test <b>qoralama</b> bo'lib yaratiladi.{" "}
            {needsAi
              ? "AI yozgan savollar bankka qo'shiladi; "
              : "Savollar tasdiqlangan bazadan olinadi; "}
            chiqarishdan oldin "Ko'rib chiqish" ekranida savollarni tekshirib
            tasdiqlash kerak.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="text-sm font-medium text-gray-500 hover:text-gray-900"
            >
              Bekor qilish
            </button>

            <Button
              variant="secondary"
              className="px-4"
              disabled={isChecking || isPending}
              onClick={handleCheck}
            >
              {isChecking ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <ScanSearch className="mr-2 size-4" strokeWidth={1.5} />
              )}
              Tekshirish
            </Button>

            <Button className="px-5" disabled={!canSubmit} onClick={handleSubmit}>
              {isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Plus className="mr-2 size-4" strokeWidth={2} />
              )}
              Testni yaratish
            </Button>
          </div>
        </div>

        {!plan && (
          <p className="mt-3 text-xs text-gray-400">
            Testni yaratishdan oldin <b>Tekshirish</b> ni bosing:{" "}
            {perStudent
              ? "kim qaysi oraliqda test olishi va kimga tushmasligi shundan ko'rinadi."
              : "sinf qaysi mavzuga kelgani va savollar qayerdan olinishi shundan ko'rinadi."}
          </p>
        )}

        {/* Hammasi belgidan chiqarilgan holat — tugma nega o'chiq */}
        {plan && perStudent && readyStudents === 0 && (
          <p className="mt-3 text-xs text-red-600">
            Birorta o'quvchi belgilanmagan — kamida bittasini belgilang.
          </p>
        )}
      </Card>
    </div>
  );
};

/** ⚠️ Raqamli nishon — qadamlar tartibi ko'z bilan o'qilishi uchun. */
const StepTitle = ({ n, children }) => (
  <div className="flex items-center gap-2.5">
    <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white">
      {n}
    </span>
    <h3 className="font-semibold text-gray-900">{children}</h3>
  </div>
);

const Field = ({ label, className, children }) => (
  <label className={cn("block", className)}>
    <span className="mb-1.5 block text-sm font-medium text-gray-700">{label}</span>
    {children}
  </label>
);

export default TestBuilder;
