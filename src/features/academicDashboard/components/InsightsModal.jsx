// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Queries
import { academicQueries } from "../queries/academicDashboard.queries";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import {
  FALLBACK_ICON,
  TONE_ICON,
} from "../data/academicDashboard.data";
import { AI_ROW, AI_TONE, MOTION, T, TONE } from "../data/dashboard.tokens";

/**
 * TAVSIYALAR ARXIVI — haftalik tahlilning TO'LIQ matni.
 *
 * ⚠️ NIMA UCHUN BOR. Dashboarddagi "AI tahlil" kartasi eng muhim BITTA
 * xulosa va BITTA vazifani ko'rsatadi (karta balandligi qat'iy), qolgani
 * esa "Tavsiyalar arxivi (yana N ta)" havolasi ortida qolardi. Havola
 * bir vaqtlar `/statistics` ga — o'quvchilar reytingi sahifasiga — olib
 * borardi: nomi bir narsani va'da qilib, butunlay boshqa ekran ochilardi.
 * Endi u shu oynani ochadi.
 *
 * ⚠️ ALOHIDA SAHIFA EMAS, OYNA — feature'ning qolgan uch "batafsil"
 * qadami bilan bitta oila (`AchievementsModal`, `ClubsModal`,
 * `TargetsModal`). Sidebarga yana bitta kam ishlatiladigan bo'lim
 * qo'shilmaydi.
 *
 * ⚠️ O'Z SO'ROVI YO'Q — karta bilan AYNAN BITTA `queryKey`
 * (`academicQueries.insights()`). TanStack keshidan o'qigani uchun oyna
 * darhol ochiladi va kartadagi matn bilan oynadagi matn hech qachon
 * ajralib qolmaydi ("Yangilash" bosilganda ikkalasi birga yangilanadi).
 *
 * ⚠️ KO'RINISH kartadagi bilan bir xil: ohangli plitka + to'ldirilgan
 * ikonka doirasi (`AI_TONE`), vazifada ustuvorlik relsi
 * (`MOTION.priorityRail`). Farqi — bu yerda balandlik cheklovi YO'Q:
 * matn kesilmaydi (`line-clamp` yo'q), oynaning o'zi suriladi.
 */
export const InsightsModal = () => (
  <ResponsiveModal
    name="academicInsights"
    title="Tavsiyalar arxivi"
    className="max-w-2xl"
  >
    <InsightsPanel />
  </ResponsiveModal>
);

const InsightsPanel = () => {
  const { data, isLoading, isError } = useQuery(academicQueries.insights());

  if (isLoading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <div className="size-7 animate-spin rounded-full border-2 border-gray-200 border-t-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="py-10 text-center text-sm text-gray-400">
        Tahlilni yuklab bo'lmadi
      </p>
    );
  }

  const insights = data?.insights ?? [];
  const actions = data?.actions ?? [];

  // Manba YASHIRILMAYDI: `ai` — model, `rules` — server qoidalari
  // (`InsightsCard` dagi bilan bitta qoida).
  const sourceLabel = data?.source === "ai" ? "AI tahlil" : "qoidalar";
  const meta = [data?.monthLabel, data?.weekStartLabel && `${data.weekStartLabel} dan`]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="max-h-[70vh] space-y-4 overflow-y-auto pb-1">
      {/* Sarlavha bloki: manba nishoni, davr va UMUMIY XULOSA — kartada u
          bir qatorga sig'may kesiladi, bu yerda to'liq turadi. */}
      <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200/70">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              TONE.neutral.chip,
              data?.source === "ai" &&
                "bg-violet-50 text-violet-700 ring-violet-200/60",
            )}
          >
            {sourceLabel}
          </span>
          {meta && <span className={T.cardHint}>{meta}</span>}
        </div>
        {data?.summary && (
          <p className={cn(T.tableCell, "mt-2 leading-relaxed")}>
            {data.summary}
          </p>
        )}
      </div>

      {insights.length > 0 && (
        <Section title="Xulosalar">
          {insights.map((row) => {
            const tone = AI_TONE[row.tone] ?? AI_TONE.neutral;
            const Icon = TONE_ICON[row.tone] ?? FALLBACK_ICON;

            return (
              <div
                key={row.id}
                className={cn(
                  "flex items-start gap-3 rounded-lg bg-white p-3 ring-1",
                  "shadow-[0_1px_1.5px_rgba(15,23,42,0.04)]",
                  tone.ring,
                )}
              >
                <span className={cn(AI_ROW.icon, "mt-px size-7", tone.icon)}>
                  <Icon className="size-3.5" />
                </span>
                <p className={cn(T.tableCell, "leading-relaxed")}>{row.text}</p>
              </div>
            );
          })}
        </Section>
      )}

      {actions.length > 0 && (
        <Section title="Shu hafta qilinadigan ishlar">
          {actions.map((row) => (
            <div
              key={row.id}
              className={cn(
                "relative overflow-hidden rounded-lg bg-white py-3 pl-4 pr-3 ring-1 ring-slate-200/70",
                "shadow-[0_1px_1.5px_rgba(15,23,42,0.04)]",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  AI_ROW.rail,
                  MOTION.priorityRail[row.priority] ?? MOTION.priorityRail.low,
                )}
              />
              <p className={cn(T.tableName, "leading-snug")}>{row.title}</p>
              <p className={cn(T.valueMeta, "mt-1")}>
                {[row.owner, row.dueLabel].filter(Boolean).join(" · ")}
              </p>
            </div>
          ))}
        </Section>
      )}

      {insights.length === 0 && actions.length === 0 && (
        <p className="py-8 text-center text-sm text-gray-400">
          Bu hafta uchun tahlil hali tayyorlanmagan
        </p>
      )}
    </div>
  );
};

/** Bo'lim: chap/o'ng chiziqli yorliq — kartadagi bilan bitta ko'rinish. */
const Section = ({ title, children }) => (
  <div>
    <div className="flex items-center gap-2">
      <span className={T.sectionRule} />
      <p className={cn(T.sectionLabel, "shrink-0")}>{title}</p>
      <span className={T.sectionRule} />
    </div>
    <div className="mt-2 space-y-2">{children}</div>
  </div>
);

export default InsightsModal;
