// React
import { useState } from "react";

// Notifications
import { toast } from "sonner";

// Icons
import { Check, CheckCheck, TriangleAlert, Undo2 } from "lucide-react";

// Components
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import Button from "@/shared/components/ui/button/Button";

// Hooks
import useModal from "@/shared/hooks/useModal";
import usePermissions from "@/shared/hooks/usePermissions";

// Utils
import { cn } from "@/shared/utils/cn";

// Data & queries
import { CHIP, SURFACE, T } from "../data/ledger.tokens";
import { CREDIT_HINT, CREDIT_REASON_MAX } from "../data/lessonHours.data";
import {
  useCreateLessonCredits,
  useRevokeLessonCredits,
} from "../queries/lessonHours.mutations";

/**
 * Muhrlangan oylik haqida xabar — "Qayta hisoblash" tugmasi bilan.
 *
 * ⚠️ Qayta hisoblash AVTOMAT EMAS (server `lessonCredit.service.js`
 * sarlavhasi): belgilash huquqi to'langan oylik summasini o'zgartirish
 * huquqiga aylanmasligi kerak. Shuning uchun u o'z oynasida, o'z ruxsati
 * bilan (`payroll.generate`, yozish — `payroll.assign`) ochiladi. Oyna
 * chaqiruvchi sahifada o'rnatilgan bo'lishi SHART (`RecalcPayrollModal`).
 *
 * @param {Array<{month, monthLabel, entries}>} sealed - server javobidagi `sealed`
 * @param {(name: string, data: object) => void} openModal
 * @param {boolean} canRecalc
 */
const notifySealed = (sealed, openModal, canRecalc) => {
  if (!Array.isArray(sealed) || sealed.length === 0) return;

  for (const group of sealed) {
    const names = group.entries.map((entry) => entry.staffName);
    const who = names.length === 1 ? names[0] : `${names.length} ta o'qituvchi`;

    toast.warning(`${group.monthLabel}: ${who} — ${CREDIT_HINT.sealed}`, {
      duration: 15000,
      ...(canRecalc
        ? {
            action: {
              label: "Qayta hisoblash",
              onClick: () =>
                openModal("recalcPayroll", {
                  month: group.month,
                  entryIds: group.entries.map((entry) => entry.entryId),
                  staffName: who,
                }),
            },
          }
        : {}),
    });
  }
};

/* ─────────────────────── BELGILASH ─────────────────────── */

/**
 * DARSLARNI "O'TILDI" DEB BELGILASH.
 *
 * Ochilishi (`openModal("createLessonCredits", {...})`):
 *   · `date`, `dateLabel` — kun (mashina qiymati va server matni);
 *   · `mode` — "lessons" (tanlanganlar) yoki "day" (kunning hammasi;
 *     `teacherIds` berilsa — faqat shu o'qituvchilarniki);
 *   · `groups` — ko'rsatish uchun: `[{ teacherId, teacherName, lessons }]`;
 *   · `sealed` — kimdadir yopilgan oyning muhrlangan oyligi bor.
 *
 * ⚠️ RO'YXATNI SERVER QAYTA TEKSHIRADI: shu orada baho qo'yilgan yoki
 * boshqa kishi belgilagan dars belgilanmaydi va javobda `skipped` bo'ladi.
 */
export const CreateLessonCreditsModal = () => (
  <ResponsiveModal
    name="createLessonCredits"
    title="O'tildi deb belgilash"
    description={CREDIT_HINT.rule}
    className="max-w-xl"
  >
    <CreateForm />
  </ResponsiveModal>
);

const CreateForm = ({
  close,
  isLoading,
  setIsLoading,
  date,
  dateLabel,
  mode = "lessons",
  teacherIds,
  groups = [],
  sealed = false,
  onDone,
}) => {
  const { can } = usePermissions();
  const { openModal } = useModal();
  const { mutate: create } = useCreateLessonCredits();

  const [reason, setReason] = useState("");
  const [cancelPenalty, setCancelPenalty] = useState(true);

  const lessonCount = groups.reduce((sum, group) => sum + group.lessons.length, 0);

  const problem = !date
    ? "Kun tanlanmagan"
    : lessonCount === 0
      ? "Belgilanadigan dars yo'q"
      : !reason.trim()
        ? "Sababni yozing"
        : null;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (problem || isLoading) return;
    setIsLoading(true);

    const payload =
      mode === "day"
        ? { date, mode, ...(teacherIds?.length ? { teacherIds } : {}) }
        : {
            date,
            mode,
            lessons: groups.flatMap((group) =>
              group.lessons.map((lesson) => ({
                teacherId: group.teacherId,
                classId: lesson.classId,
                subjectId: lesson.subjectId,
                lessonOrder: lesson.lessonOrder,
              })),
            ),
          };

    create(
      { ...payload, reason: reason.trim(), cancelGradePenalty: cancelPenalty },
      {
        onSuccess: (result) => {
          close();
          onDone?.();
          toast.success(
            `${result.dateLabel}: ${result.created} ta dars o'tildi deb belgilandi` +
              (result.penaltiesCancelled ? `, ${result.penaltiesCancelled} ta jarima bekor qilindi` : "") +
              (result.attendanceFixed
                ? `, ${result.attendanceFixed} ta o'qituvchi davomati "keldi" qilindi`
                : ""),
          );
          if (result.skipped > 0) {
            toast.info(
              `${result.skipped} ta dars belgilanmadi — u shu orada o'tilgan yoki belgilangan bo'lib chiqdi`,
            );
          }
          notifySealed(result.sealed, openModal, can("payroll.generate"));
        },
        onError: (error) => toast.error(error.response?.data?.message || "Belgilab bo'lmadi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ── Nima belgilanadi ──────────────────────────────────── */}
      <section>
        <SectionHead label={dateLabel ?? "Kun"}>
          <span className={cn(CHIP, "bg-indigo-50 text-indigo-700")}>
            {lessonCount} ta dars · {groups.length} ta o'qituvchi
          </span>
        </SectionHead>

        {/* ⚠️ `hidden-scrollbar` YO'Q — ro'yxat uzun bo'lsa aylantirgich ko'rinsin */}
        <ul className="max-h-[260px] space-y-2 overflow-y-auto pr-1">
          {groups.map((group) => (
            <li key={group.teacherId} className={cn(SURFACE.tile, "space-y-1.5 py-2.5")}>
              <p className={cn(T.tdName, "truncate")}>{group.teacherName}</p>
              <ul className="space-y-1">
                {group.lessons.map((lesson) => (
                  <li
                    key={`${lesson.classId}-${lesson.subjectId}-${lesson.lessonOrder}`}
                    className="flex items-center gap-3"
                  >
                    <p className={cn(T.td, "min-w-0 flex-1 truncate")}>
                      {`${lesson.className}, ${lesson.lessonOrder}-dars · ${lesson.subjectName}`}
                    </p>
                    <span className={cn(CHIP, "shrink-0 bg-rose-50 text-rose-700")}>
                      {lesson.reasonLabel}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        {mode === "day" && (
          <p className={cn(T.hint, "mt-2")}>
            Server kunning o'tilmagan darslarini saqlash paytida qayta oladi — shu orada baho
            qo'yilgan dars belgilanmaydi.
          </p>
        )}
      </section>

      <label className="block">
        <span className={cn(T.label, "mb-1.5 block")}>Sabab</span>
        <input
          value={reason}
          maxLength={CREDIT_REASON_MAX}
          placeholder="Masalan: platforma ishlamay qolgan, baho daftarda qo'yilgan"
          onChange={(event) => setReason(event.target.value)}
          className={INPUT}
        />
      </label>

      {/* Jarima — ixtiyoriy, sukut bo'yicha yoqilgan */}
      <button
        type="button"
        onClick={() => setCancelPenalty((prev) => !prev)}
        className={cn(
          SURFACE.tile,
          "flex w-full items-start gap-2.5 py-3 text-left transition-colors duration-200 hover:bg-slate-100/80",
        )}
      >
        <span
          className={cn(
            "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-md transition-colors duration-200",
            cancelPenalty ? "bg-indigo-600 text-white" : "bg-white ring-1 ring-inset ring-slate-300",
          )}
        >
          {cancelPenalty && <Check className="size-2.5" strokeWidth={3} />}
        </span>
        <span className="min-w-0">
          <span className={cn(T.tdName, "block")}>"Baho qo'ymaslik" jarimasini ham bekor qilish</span>
          <span className={cn(T.hint, "mt-0.5 block")}>{CREDIT_HINT.penalty}</span>
        </span>
      </button>

      {/* Oqibatlar — saqlashdan OLDIN aytiladi. Davomat har doim: davomati
          belgilanmagan o'qituvchiga ham "keldi" yoziladi */}
      <div className={cn(SURFACE.tile, "space-y-1.5")}>
        <Warning>{CREDIT_HINT.attendance}</Warning>
        {sealed && <Warning>{CREDIT_HINT.sealed}</Warning>}
      </div>

      <div className="sticky bottom-0 flex gap-2.5 bg-white pt-1">
        <Button type="button" variant="outline" onClick={close} className="flex-1">
          Bekor qilish
        </Button>
        <Button
          type="submit"
          disabled={isLoading || Boolean(problem)}
          title={problem ?? undefined}
          className="flex-1"
        >
          <CheckCheck />
          {isLoading ? "Belgilanmoqda..." : "O'tildi deb belgilash"}
        </Button>
      </div>
    </form>
  );
};

/* ─────────────────────── BEKOR QILISH ─────────────────────── */

/**
 * BELGINI BEKOR QILISH — bittalab yoki bir nechtalab.
 *
 * Ochilishi: `openModal("revokeLessonCredits", { credits: [...] })` — server
 * `serialize` shaklidagi belgilar.
 */
export const RevokeLessonCreditsModal = () => (
  <ResponsiveModal
    name="revokeLessonCredits"
    title="Belgini bekor qilish"
    description={CREDIT_HINT.revoke}
  >
    <RevokeForm />
  </ResponsiveModal>
);

const RevokeForm = ({ close, isLoading, setIsLoading, credits = [], onDone }) => {
  const { can } = usePermissions();
  const { openModal } = useModal();
  const { mutate: revoke } = useRevokeLessonCredits();
  const [reason, setReason] = useState("");

  const problem = credits.length === 0 ? "Belgi tanlanmagan" : !reason.trim() ? "Sababni yozing" : null;
  const penaltyCount = credits.filter((credit) => credit.penaltyCancelled).length;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (problem || isLoading) return;
    setIsLoading(true);

    revoke(
      { ids: credits.map((credit) => credit.id), reason: reason.trim() },
      {
        onSuccess: (result) => {
          close();
          onDone?.();
          toast.success(
            `${result.revoked} ta belgi bekor qilindi` +
              (result.penaltiesRestored ? `, ${result.penaltiesRestored} ta jarima qaytarildi` : "") +
              (result.attendanceRestored ? `, ${result.attendanceRestored} ta kun davomati qaytarildi` : ""),
          );
          notifySealed(result.sealed, openModal, can("payroll.generate"));
        },
        onError: (error) => toast.error(error.response?.data?.message || "Bekor qilib bo'lmadi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ul className="max-h-[220px] space-y-1.5 overflow-y-auto pr-1">
        {credits.map((credit) => (
          <li key={credit.id} className={cn(SURFACE.tile, "py-2.5")}>
            <p className={cn(T.tdName, "truncate")}>{credit.teacherName}</p>
            <p className={cn(T.meta, "mt-0.5 truncate")}>
              {`${credit.dateLabel} · ${credit.className}, ${credit.lessonOrder}-dars · ${credit.subjectName}`}
            </p>
          </li>
        ))}
      </ul>

      {penaltyCount > 0 && (
        <div className={SURFACE.tile}>
          <Warning>{`${penaltyCount} ta "Baho qo'ymaslik" jarimasi qaytariladi.`}</Warning>
        </div>
      )}

      <label className="block">
        <span className={cn(T.label, "mb-1.5 block")}>Sabab</span>
        <input
          value={reason}
          maxLength={CREDIT_REASON_MAX}
          placeholder="Masalan: adashib belgilangan"
          onChange={(event) => setReason(event.target.value)}
          className={INPUT}
        />
      </label>

      <div className="flex gap-2.5">
        <Button type="button" variant="outline" onClick={close} className="flex-1">
          Yopish
        </Button>
        <Button
          type="submit"
          variant="danger"
          disabled={isLoading || Boolean(problem)}
          title={problem ?? undefined}
          className="flex-1"
        >
          <Undo2 />
          {isLoading ? "Bekor qilinmoqda..." : "Bekor qilish"}
        </Button>
      </div>
    </form>
  );
};

/* ─────────────────────── Yordamchilar ─────────────────────── */

const Warning = ({ children }) => (
  <p className="flex items-start gap-2">
    <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-amber-600" strokeWidth={2.2} />
    <span className={cn(T.hint, "leading-relaxed")}>{children}</span>
  </p>
);

const SectionHead = ({ label, children }) => (
  <div className="mb-2 flex items-center gap-3">
    <span className={T.label}>{label}</span>
    <span className={SURFACE.rule} />
    {children}
  </div>
);

const INPUT =
  "h-11 w-full rounded-xl border-0 bg-slate-50 px-3 text-[12.5px] text-slate-900 " +
  "transition-colors duration-200 focus:bg-slate-100 focus:outline-none focus:ring-0";
