// React
import { useState } from "react";

// Icons
import { ArrowDownLeft, ArrowUpRight, PenLine } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import WeekGrid from "./WeekGrid";
import ContractEditor from "./ContractEditor";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

// Data & queries
import { CHIP, SCALE, SURFACE, T, modeOf } from "../data/ledger.tokens";
import { MISSED_LESSONS_HINT, formatHourNumber } from "../data/lessonHours.data";
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
 *
 * ⚠️ SHARTNOMA SHARTI SHU YERNING O'ZIDA TAHRIRLANADI (`payroll.assign`).
 * Soatni ko'rib turgan odam oylikni to'g'rilash uchun "Xodimlar oyligi"
 * bo'limiga o'tib, o'qituvchini qaytadan qidirmasligi kerak.
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
  const { can } = usePermissions();
  const [isEditing, setIsEditing] = useState(false);

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

  // Tahrir paytida qolgan bloklar yashiriladi: forma o'zi uzun, natija
  // blokida esa shu oyning soati allaqachon ko'rinadi.
  if (isEditing) {
    return (
      <div className="max-h-[70vh] overflow-y-auto hidden-scrollbar">
        <ContractEditor
          staffId={staffId}
          month={month}
          onDone={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="max-h-[70vh] space-y-4 overflow-y-auto hidden-scrollbar">
      {/* ── Shartnoma sharti ─────────────────────────────────── */}
      <div className={cn(SURFACE.tile, "flex flex-wrap items-center gap-x-5 gap-y-3")}>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className={T.label}>Shartnoma sharti</p>
            {can("payroll.assign") && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className={cn(
                  "-my-1 flex items-center gap-1 rounded-lg px-2 py-1 text-[11.5px] font-medium",
                  "transition-colors duration-200 ease-out-quint",
                  data.hasRule
                    ? "text-indigo-600 hover:bg-indigo-50"
                    : "bg-slate-900 text-white hover:bg-slate-800",
                )}
              >
                <PenLine className="size-3" strokeWidth={2.2} />
                {data.hasRule ? "O'zgartirish" : "Oylik belgilash"}
              </button>
            )}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className={cn(CHIP, modeOf(data.salaryType).chip)}>
              {modeOf(data.salaryType).label}
            </span>
            <span className={T.formula}>
              {data.formulaLabel ?? "Oylik qoidasi biriktirilmagan"}
            </span>
          </div>
        </div>

        <div className="text-right">
          <p className={T.label}>{data.monthLabel}</p>
          <p className={cn(T.value, T.sizeXl, "mt-1.5")}>
            {formatHourNumber(data.hours)}
          </p>
        </div>
      </div>

      {/* ── Fanlar va toifa ──────────────────────────────────── */}
      <TeacherProfile
        subjects={data.subjects}
        categoryName={data.categoryName}
        positionName={data.positionName}
        departmentName={data.departmentName}
      />

      {/* ── Uch raqam ────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2.5">
        <Metric
          label="O'tildi"
          value={formatHourNumber(data.taughtHours)}
          hint={
            data.missedHours > 0
              ? `${data.taughtDays}/${data.teachingDays} kun · ${data.missedHours} o'tilmadi`
              : `${data.taughtDays}/${data.teachingDays} kun`
          }
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

      {/* ── O'tilmagan darslar ───────────────────────────────── */}
      {data.missedLessons?.length > 0 && (
        <Section title={`O'tilmagan darslar · ${data.missedLessons.length}`}>
          <MissedLessons rows={data.missedLessons} isCurrentMonth={data.isCurrentMonth} />
        </Section>
      )}

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

/**
 * KIM BU O'QITUVCHI — fanlari va toifasi.
 *
 * ⚠️ FANLAR RO'YXATI SERVERDA BIRLASHTIRILADI (`buildSubjects`): jadval,
 * o'rinbosarlik va profil. Panel manbalarni o'zi qo'shmaydi — ikkinchi
 * yig'uvchi bir kuni boshqa ro'yxat chiqarib qo'yardi.
 *
 * ⚠️ MANBA MATN BILAN HAM KO'RSATILADI ("o'rinbosar", "jadvalda yo'q"),
 * faqat ohang bilan emas: bir kun kimningdir o'rniga chiqilgan fan va
 * profilda qolib ketgan fan asosiy fanlar bilan bir xil ko'rinsa, "bu
 * o'qituvchi uch fandan dars beradi" degan noto'g'ri xulosa chiqardi.
 *
 * ⚠️ TOIFA BITTA. U `User.salaryCategoryId` da, fan bo'yicha emas; lavozim
 * bilan esa birga bo'lmaydi — shuning uchun toifa yo'q bo'lsa lavozim
 * ko'rsatiladi (`finance.md` §10).
 */
const TeacherProfile = ({ subjects = [], categoryName, positionName, departmentName }) => {
  const grade = categoryName
    ? { label: "Toifa", name: categoryName }
    : positionName
      ? { label: "Lavozim", name: positionName }
      : { label: "Toifa", name: null };

  return (
    <div
      className={cn(
        SURFACE.tile,
        "grid gap-x-6 gap-y-3.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,180px)]",
      )}
    >
      <div className="min-w-0">
        <p className={T.label}>
          {subjects.length > 1 ? `Fanlar · ${subjects.length}` : "Fan"}
        </p>

        {subjects.length > 0 ? (
          <ul aria-label="Fanlar" className="mt-2 flex flex-wrap gap-1.5">
            {subjects.map((subject) => (
              <SubjectChip key={subject.id} subject={subject} />
            ))}
          </ul>
        ) : (
          <p className={cn(T.hint, "mt-1.5")}>
            Fan biriktirilmagan, jadvalda darsi yo'q
          </p>
        )}
      </div>

      <div className="min-w-0 sm:text-right">
        <p className={T.label}>{grade.label}</p>
        <p className={cn("mt-2 truncate", grade.name ? T.tdName : T.hint)}>
          {grade.name ?? "Biriktirilmagan"}
        </p>
        {grade.name && departmentName && (
          <p className={cn(T.meta, "mt-1 truncate")}>{departmentName}</p>
        )}
      </div>
    </div>
  );
};

/**
 * Fan manbasi — ohang va IZOH. Jadvaldagi fan izohsiz: u odatiy holat,
 * izoh esa faqat istisnoga beriladi.
 */
const SUBJECT_SOURCE = {
  schedule: {
    chip: "bg-white text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.06)]",
    note: null,
  },
  substitution: { chip: "bg-white/60 text-slate-600", note: "o'rinbosar" },
  profile: { chip: "bg-slate-200/50 text-slate-500", note: "jadvalda yo'q" },
};

const subjectTitle = (subject) => {
  if (subject.source === "substitution") {
    return `${subject.name}: o'z darsi yo'q, o'rinbosarlikdan ${formatHourNumber(subject.coveredHours)} soat`;
  }
  if (subject.source === "profile") {
    return `${subject.name}: profilda biriktirilgan, jadvalda darsi yo'q`;
  }
  return `${subject.name}: haftasiga ${formatHourNumber(subject.weeklyHours)} soat, oyda ${formatHourNumber(subject.hours)} soat`;
};

const SubjectChip = ({ subject }) => {
  const source = SUBJECT_SOURCE[subject.source] ?? SUBJECT_SOURCE.schedule;

  return (
    <li
      title={subjectTitle(subject)}
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-full py-1 pl-2.5 pr-2",
        "text-[11.5px] font-medium leading-none",
        source.chip,
      )}
    >
      <span className="truncate">{subject.name}</span>

      {/* Profildagi fanda soat yo'q — "0" "o'tilmadi" deb o'qilardi */}
      {subject.source !== "profile" && (
        <span className="font-semibold tabular-nums text-slate-900">
          {formatHourNumber(subject.hours)}
        </span>
      )}

      {source.note && (
        <span className="text-[10px] font-normal text-slate-400">{source.note}</span>
      )}
    </li>
  );
};

/**
 * O'TILMAGAN DARSLAR — "nega 61 emas, 60 soat" degan savolning javobi.
 *
 * ⚠️ SABAB VA SANA MATNI SERVERDAN (`reasonLabel`, `dateLabel`): sana
 * `@db.Date` bo'lib, brauzerda `new Date` bilan o'qilsa bir kunga siljirdi.
 * "Avtomatik" belgisi alohida: davomat tizimi kun oxirida o'zi qo'ygan
 * "kelmadi" — admin davomatni to'g'rilasa soat qaytadi.
 */
const MissedLessons = ({ rows, isCurrentMonth }) => (
  <div className="space-y-2">
    <ul className="max-h-[220px] space-y-1.5 overflow-y-auto pr-1 hidden-scrollbar">
      {rows.map((row) => (
        <li
          key={`${row.dateLabel}-${row.classId}-${row.lessonOrder}`}
          className={cn(SURFACE.tile, "flex items-center gap-3 py-2.5")}
        >
          <div className="min-w-0 flex-1">
            <p className={cn(T.td, "truncate")}>
              <span className="font-medium text-slate-900">{row.dateLabel}</span>
              {` · ${row.className}, ${row.lessonOrder}-dars · ${row.subjectName}`}
            </p>
            {(row.autoMarked || row.substituted) && (
              <p className={cn(T.meta, "mt-0.5 truncate")}>
                {[row.substituted && "o'rinbosarlik", row.autoMarked && "davomat avtomatik belgilangan"]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
          </div>

          <span className={cn(CHIP, "shrink-0 bg-rose-50 text-rose-700")}>
            {row.reasonLabel}
          </span>
        </li>
      ))}
    </ul>

    <p className={T.hint}>
      {MISSED_LESSONS_HINT.rule}
      {isCurrentMonth ? ` ${MISSED_LESSONS_HINT.today}` : ""}
    </p>
  </div>
);

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
