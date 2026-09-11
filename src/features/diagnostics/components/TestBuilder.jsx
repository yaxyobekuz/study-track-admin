// React
import { useMemo, useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import { Plus, Trash2, Loader2 } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import Input from "@/shared/components/ui/input/Input";
import Table, { Td, Tr } from "@/shared/components/ui/Table";

// Hooks
import { useSubjects } from "@/features/subjects/queries/subjects.queries";

// Data
import { GRADES, TEST_MODES } from "../data/diagnostics.data";

// Utils
import { cn } from "@/shared/utils/cn";

/**
 * YANGI TEST YIG'GICH.
 *
 * ⚠️ UCH QADAM ALOHIDA KARTADA VA TARTIB QAT'IY: avval KIM
 * (sinf) → keyin NIMA (fanlar va savollar taqsimoti) → keyin QACHON
 * (nom, sana, vaqt). Ikkinchi qadam birinchisisiz ma'nosiz: savol
 * qaysi tilda olinishi sinfga bog'liq.
 *
 * ⚠️ O'QUVCHI SINFI VA SAVOL BAZASI SINFI — IKKI BOSHQA NARSA.
 * 7-sinf o'quvchisiga 6-sinf bazasidan savol berish odatiy hol
 * (takrorlash, bo'shliqni yopish). Shuning uchun har fan qatorida
 * "Sinf (baza)" alohida tanlanadi va u o'quvchi sinfiga bog'liq emas.
 */
const emptyRow = () => ({ subjectId: "", grade: "", easy: 0, medium: 0, hard: 0 });

const TestBuilder = ({ classes = [], onCreate, isPending }) => {
  const { data: subjects = [] } = useSubjects();

  const [classId, setClassId] = useState("");
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({
    title: "",
    date: "",
    durationMin: 45,
    mode: "timed",
    description: "",
  });

  const total = useMemo(
    () =>
      rows.reduce(
        (sum, r) => sum + (+r.easy || 0) + (+r.medium || 0) + (+r.hard || 0),
        0,
      ),
    [rows],
  );

  const setRow = (index, patch) =>
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  const submit = () => {
    if (!classId) return toast.error("Sinfni tanlang");
    if (!rows.length) return toast.error("Kamida bitta fan qo'shing");
    if (rows.some((r) => !r.subjectId)) return toast.error("Har qatorda fanni tanlang");
    if (total === 0) return toast.error("Savollar sonini kiriting");
    if (!form.title.trim()) return toast.error("Test nomini kiriting");

    onCreate({
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      mode: form.mode,
      durationMin: Number(form.durationMin) || 45,
      classIds: [classId],
      // ⚠️ Sana BO'LSA — test o'sha kundan ochiladi; bo'lmasa darhol.
      availableFrom: form.date || undefined,
      blueprint: rows.map((r) => ({
        subjectId: r.subjectId,
        grade: r.grade ? Number(r.grade) : null,
        easy: Number(r.easy) || 0,
        medium: Number(r.medium) || 0,
        hard: Number(r.hard) || 0,
      })),
    });
  };

  const reset = () => {
    setClassId("");
    setRows([]);
    setForm({ title: "", date: "", durationMin: 45, mode: "timed", description: "" });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Yangi test qo'shish</h2>
        <p className="mt-0.5 text-sm text-gray-500">
          Test ma'lumotlarini kiriting va har bir fan uchun savollar olinadigan
          sinfni belgilang
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
            Savollar shu sinf o'quvchilariga biriktiriladi. Quyida har bir fan
            uchun savollar <b className="text-gray-700">qaysi sinf bazasidan</b>{" "}
            olinishini alohida tanlaysiz — o'quvchi sinfiga bog'liq emas.
          </p>
        </div>
      </Card>

      {/* ── 2. TAQSIMOT ────────────────────── */}
      <Card className="!p-0">
        <div className="p-4 xs:p-5">
          <StepTitle n={2}>Fanlar va savollar taqsimoti</StepTitle>
        </div>

        {rows.length === 0 ? (
          <p className="border-y border-gray-100 py-10 text-center text-sm text-gray-400">
            Fan qo'shilmagan — pastdagi tugma orqali qo'shing
          </p>
        ) : (
          <Table
            columns={[
              "Fan",
              "Sinf (baza)",
              { label: "Yengil", align: "center" },
              { label: "O'rta", align: "center" },
              { label: "Og'ir", align: "center" },
              { label: "Jami", align: "center" },
              { label: "", align: "right" },
            ]}
          >
            {rows.map((row, i) => {
              const rowTotal =
                (+row.easy || 0) + (+row.medium || 0) + (+row.hard || 0);
              return (
                <Tr key={i}>
                  <Td nowrap={false} className="min-w-[200px]">
                    <select
                      value={row.subjectId}
                      onChange={(e) => setRow(i, { subjectId: e.target.value })}
                      className="h-10 w-full rounded-lg border border-gray-200 bg-white px-2.5 text-sm outline-none focus:border-primary"
                    >
                      <option value="">Fanni tanlang</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </Td>

                  <Td className="min-w-[140px]">
                    <select
                      value={row.grade}
                      onChange={(e) => setRow(i, { grade: e.target.value })}
                      className="h-10 w-full rounded-lg border border-gray-200 bg-white px-2.5 text-sm outline-none focus:border-primary"
                    >
                      <option value="">Barcha sinflar</option>
                      {GRADES.map((g) => (
                        <option key={g} value={g}>
                          {g}-sinf
                        </option>
                      ))}
                    </select>
                  </Td>

                  {["easy", "medium", "hard"].map((key) => (
                    <Td key={key} align="center">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={row[key]}
                        onChange={(e) => setRow(i, { [key]: e.target.value })}
                        className="mx-auto h-10 w-16 text-center"
                      />
                    </Td>
                  ))}

                  <Td align="center" className="font-semibold tabular-nums">
                    {rowTotal}
                  </Td>

                  <Td align="right">
                    <button
                      type="button"
                      title="Qatorni o'chirish"
                      onClick={() =>
                        setRows((prev) => prev.filter((_, x) => x !== i))
                      }
                      className="rounded-lg border border-gray-200 p-1.5 text-rose-600 transition-colors hover:border-rose-200 hover:bg-rose-50"
                    >
                      <Trash2 className="size-4" strokeWidth={1.5} />
                    </button>
                  </Td>
                </Tr>
              );
            })}
          </Table>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 p-4 xs:p-5">
          <div>
            <Button
              variant="secondary"
              className="px-3.5"
              onClick={() => setRows((prev) => [...prev, emptyRow()])}
            >
              <Plus className="mr-2 size-4" strokeWidth={2} />
              Fan qo'shish
            </Button>
            <p className="mt-2 text-xs text-gray-400">
              Bir xil fanni turli sinflar bilan bir necha marta qo'shishingiz
              mumkin (masalan: Matematika 7-sinf + Matematika 6-sinf).
            </p>
          </div>

          {total > 0 && (
            <p className="text-sm text-gray-500">
              Jami:{" "}
              <span className="font-semibold text-gray-900">{total}</span> ta savol
            </p>
          )}
        </div>
      </Card>

      {/* ── 3. MA'LUMOTLAR ─────────────────── */}
      <Card>
        <StepTitle n={3}>Test ma'lumotlari</StepTitle>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Test nomi">
            <Input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Masalan: Yakuniy nazorat"
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

        <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={reset}
            className="text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            Bekor qilish
          </button>
          <Button className="px-5" disabled={isPending} onClick={submit}>
            {isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Plus className="mr-2 size-4" strokeWidth={2} />
            )}
            Testni yaratish
          </Button>
        </div>
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
