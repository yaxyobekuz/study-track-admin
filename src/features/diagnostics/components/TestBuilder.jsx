// React
import { useCallback, useMemo, useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import { Loader2, Plus, ScanSearch } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import Input from "@/shared/components/ui/input/Input";
import TestBlueprintTable from "./TestBlueprintTable";
import TestPlanCard from "./TestPlanCard";

// Hooks
import { useSubjects } from "@/features/subjects/queries/subjects.queries";
import { usePreviewTest } from "../queries/diagnostics.mutations";

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
  const { mutate: preview, isPending: isChecking } = usePreviewTest();

  const [classId, setClassId] = useState("");
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
    () => JSON.stringify({ classId, rows: rows.map(toPayloadRow) }),
    [classId, rows],
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

    preview(
      { classId, blueprint: rows.map(toPayloadRow) },
      {
        onSuccess: (data) => {
          setPlan(data);
          setPlanKey(currentKey);
          if (!data.canBuild) {
            toast.warning("Taqsimotda tuzatilishi kerak joylar bor");
          }
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Tekshirib bo'lmadi"),
      },
    );
  };

  const handleSubmit = () => {
    const error = validate();
    if (error) return toast.error(error);
    if (!form.title.trim()) return toast.error("Test nomini kiriting");

    onBuild(
      {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        mode: form.mode,
        durationMin: Number(form.durationMin) || 45,
        classIds: [classId],
        // ⚠️ Sana BO'LSA — test o'sha kundan ochiladi; bo'lmasa darhol.
        availableFrom: form.date || undefined,
        blueprint: rows.map(toPayloadRow),
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
  };

  const needsAi = rows.some((r) => r.source === "ai");
  const canSubmit = Boolean(plan) && !stale && plan.canBuild && !isPending;

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
            Mavzu chegarasi <b className="text-gray-700">shu sinfning</b> joriy
            mavzusidan olinadi: o'tilmagan mavzudan savol tushmaydi. Shu sababli
            bitta testga bitta sinf tanlanadi.
          </p>
        </div>
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
      {plan && <TestPlanCard plan={plan} stale={stale} />}

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-xl text-xs text-gray-500">
            {needsAi
              ? "AI yozgan savollar bankka qo'shiladi va tasdiqlanishi kerak — test qoralama bo'lib yaratiladi."
              : "Savollar tasdiqlangan bazadan olinadi — test darhol nashrga tayyor bo'ladi."}
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
            Testni yaratishdan oldin <b>Tekshirish</b> ni bosing: sinf qaysi
            mavzuga kelgani va savollar qayerdan olinishi shundan ko'rinadi.
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
