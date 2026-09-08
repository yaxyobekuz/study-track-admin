// Icons
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import WeekGrid from "./WeekGrid";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

// Data & queries
import { CHIP, MODE, SCALE, SURFACE, T } from "../data/ledger.tokens";
import { formatHourNumber } from "../data/lessonHours.data";
import { lessonHoursQueries } from "../queries/lessonHours.queries";

/**
 * BITTA O'QITUVCHINING OYI — vedomostdagi qatorning ochilgan holi.
 *
 * Ekran "nega bu odamda 84 soat chiqdi" degan savolga to'liq javob
 * beradi: haftalik jadval, sinf va fan kesimi, o'rinbosarlik yozuvlari
 * va oxirgi olti oyning tarixi.
 *
 * ⚠️ MA'LUMOT MODALNI OCHGANDA SO'RALADI (`enabled: Boolean(staffId)`).
 * Vedomost qatoriga to'liq tafsilotni oldindan qo'shib qo'yish har oy
 * yuzlab keraksiz so'rov bo'lardi.
 */
export const TeacherHoursModal = () => (
  <ResponsiveModal
    name="teacherHours"
    title="O'qituvchining dars soati"
    className="max-w-2xl"
  >
    <TeacherHoursBody />
  </ResponsiveModal>
);

const TeacherHoursBody = ({ staffId, month }) => {
  const { data, isLoading, isError } = useQuery(
    lessonHoursQueries.teacher(staffId, { month }),
  );

  if (isLoading) {
    return (
      <div className="space-y-2.5 py-6">
        {[92, 74, 58].map((width, index) => (
          <div
            key={width}
            className="h-2.5 rounded-full bg-slate-100 motion-safe:animate-breathe"
            style={{ width: `${width}%`, animationDelay: `${index * 160}ms` }}
          />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="py-8 text-center text-[12.5px] text-slate-500">
        Ma'lumotni yuklab bo'lmadi
      </p>
    );
  }

  const maxClassHours = Math.max(1, ...(data.byClass ?? []).map((c) => c.hours));

  return (
    <div className="max-h-[70vh] space-y-4 overflow-y-auto hidden-scrollbar">
      {/* ── Shartnoma sharti ─────────────────────────────────── */}
      <div className={cn(SURFACE.tile, "flex flex-wrap items-center gap-x-5 gap-y-3")}>
        <div className="min-w-0 flex-1">
          <p className={T.label}>Shartnoma sharti</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className={cn(CHIP, MODE[data.salaryType]?.chip ?? "bg-slate-100 text-slate-500")}>
              {MODE[data.salaryType]?.label ?? "Qoida yo'q"}
            </span>
            <span className={T.formula}>{data.formulaLabel ?? "—"}</span>
          </div>
        </div>

        <div className="text-right">
          <p className={T.label}>{data.monthLabel}</p>
          <p className={cn(T.value, T.sizeXl, "mt-1.5")}>
            {formatHourNumber(data.hours)}
          </p>
        </div>
      </div>

      {/* ── Uch raqam ────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2.5">
        <Metric
          label="O'tildi"
          value={formatHourNumber(data.taughtHours)}
          hint={`${data.taughtDays}/${data.teachingDays} kun`}
        />
        <Metric
          label="Hisoblandi"
          value={formatMoney(data.accruedAmount)}
          hint="bugungacha"
        />
        <Metric
          label="Oy oxirida"
          value={formatMoney(data.projectedAmount)}
          hint="prognoz"
          emphasis
        />
      </div>

      {/* ── Haftalik jadval ──────────────────────────────────── */}
      <Section title="Haftalik yuklama">
        <WeekGrid byDay={data.byDay} weeklyHours={data.weeklyHours} />
      </Section>

      {/* ── Sinf kesimi ──────────────────────────────────────── */}
      {data.byClass?.length > 0 && (
        <Section title="Sinflar kesimi">
          <ul className="space-y-1.5">
            {data.byClass.map((row, index) => (
              <li key={row.id} className="flex items-center gap-3">
                <span className={cn(T.td, "w-[92px] shrink-0 truncate")}>
                  {row.name}
                </span>

                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <span
                    className="block h-full rounded-full origin-left motion-safe:animate-grow-x"
                    style={{
                      width: `${(row.hours / maxClassHours) * 100}%`,
                      background: SCALE[Math.min(index, SCALE.length - 1)],
                      animationDelay: `${120 + index * 50}ms`,
                    }}
                  />
                </span>

                <span className={cn(T.tdNum, "w-12 shrink-0 text-right")}>
                  {row.hours}
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* ── O'rinbosarlik ────────────────────────────────────── */}
      {(data.substitutions?.given?.length > 0 ||
        data.substitutions?.taken?.length > 0) && (
        <Section title="O'rinbosarlik">
          <ul className="space-y-1.5">
            {data.substitutions.given.map((row) => (
              <SubRow key={row.id} row={row} direction="given" />
            ))}
            {data.substitutions.taken.map((row) => (
              <SubRow key={row.id} row={row} direction="taken" />
            ))}
          </ul>
        </Section>
      )}

      {/* ── Oylik tarixi ─────────────────────────────────────── */}
      {data.history?.length > 0 && (
        <Section title="Oxirgi oylar">
          <HistoryBars history={data.history} />
        </Section>
      )}
    </div>
  );
};

const Section = ({ title, children }) => (
  <section>
    <div className="mb-2.5 flex items-center gap-3">
      <span className={T.label}>{title}</span>
      <span className={SURFACE.rule} />
    </div>
    {children}
  </section>
);

const Metric = ({ label, value, hint, emphasis }) => (
  <div className={cn(SURFACE.tile, emphasis && "bg-indigo-50/70")}>
    <p className={T.label}>{label}</p>
    <p className={cn(T.value, T.sizeMd, "mt-1.5 truncate")}>{value}</p>
    <p className={cn(T.meta, "mt-1")}>{hint}</p>
  </div>
);

const SubRow = ({ row, direction }) => {
  const given = direction === "given";

  return (
    <li className={cn(SURFACE.tile, "flex items-center gap-2.5 py-2.5")}>
      <span
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-lg",
          given ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600",
        )}
      >
        {given ? (
          <ArrowUpRight className="size-3" strokeWidth={2.4} />
        ) : (
          <ArrowDownLeft className="size-3" strokeWidth={2.4} />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p className={cn(T.td, "truncate")}>
          <span className="font-medium text-slate-900">{row.withName}</span>
          {given ? " ga berildi" : " dan olindi"}
        </p>
        {/* ⚠️ Sana matni SERVERDAN tayyor keladi: `fromDate`/`toDate`
            — `@db.Date`, ya'ni UTC yarim tunida. Brauzerda `new Date()`
            bilan o'qilsa, taymzonaga qarab kun bir kunga siljirdi. */}
        <p className={cn(T.meta, "mt-0.5 truncate")}>
          {row.periodLabel} · {row.reasonLabel}
        </p>
      </div>

      <span className={cn(CHIP, given ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700")}>
        {row.lessonCount} dars
      </span>
    </li>
  );
};

/**
 * OXIRGI OYLAR — bazaviy va soatdan chiqqan qismlar ustma-ust.
 *
 * ⚠️ Ikki qism ALOHIDA ko'rinadi: aralash rejimda "oylik oshdi" degani
 * "ko'proq dars o'tdi" degani bo'lishi ham, "bazaviy oshirildi" bo'lishi
 * ham mumkin va bu ikkisi butunlay boshqa xabar.
 */
const HistoryBars = ({ history }) => {
  const max = Math.max(1, ...history.map((h) => Number(h.amount) || 0));

  return (
    <div className="flex items-end gap-2">
      {history.map((row, index) => {
        const total = Number(row.amount) || 0;
        const hours = Number(row.hoursAmount) || 0;
        const height = Math.max(4, (total / max) * 96);
        const hoursShare = total > 0 ? hours / total : 0;

        return (
          <div key={row.month} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
            <span className={cn(T.meta, "tabular-nums")}>{row.hoursWorked || ""}</span>

            <div
              className="flex w-full flex-col justify-end overflow-hidden rounded-lg bg-slate-100 origin-bottom motion-safe:animate-post"
              style={{ height: `${height}px`, animationDelay: `${index * 60}ms` }}
              title={`${row.monthLabel}: ${row.amount}`}
            >
              <span
                className="w-full bg-indigo-500"
                style={{ height: `${hoursShare * 100}%` }}
              />
              <span
                className="w-full bg-slate-400"
                style={{ height: `${(1 - hoursShare) * 100}%` }}
              />
            </div>

            {/* ⚠️ `monthLabel` ni kesib bo'lmaydi: "Iyun" va "Iyul" ikkalasi
                ham "Iyu" bo'lib, ikki ustun farqlanmay qolardi. Qisqartma
                serverda tayyorlanadi (`formatMonthShort`). */}
            <span className={cn(T.meta, "w-full truncate text-center")}>
              {row.monthShortLabel}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default TeacherHoursModal;
