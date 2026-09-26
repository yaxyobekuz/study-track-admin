// React
import { useEffect, useRef } from "react";

// Router
import { useSearchParams } from "react-router-dom";

// Icons
import { BellOff, BellRing, FileSearch, Lock, Play, Settings2, Square, Trash2, Wand2 } from "lucide-react";

// TanStack Query
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Toast
import { toast } from "sonner";

// Components
import Card from "@/shared/components/ui/Card";
import EmptyState from "@/shared/components/ui/EmptyState";
import ConfirmPopover from "@/shared/components/ui/ConfirmPopover";
import AnalysisHero from "../components/AnalysisHero";
import RunHistory from "../components/RunHistory";
import ReportsTable from "../components/ReportsTable";
import LaunchModal from "../components/LaunchModal";
import SettingsModal from "../components/SettingsModal";
import StudentReportModal from "../components/StudentReportModal";
import { CausesPanel, HeatmapPanel, SignalsPanel, SubjectBoard, TopicsPanel } from "../components/OverviewPanels";
import { NarrativePanel, StudentSpotlight } from "../components/InsightPanels";

// Hooks
import useModal from "@/shared/hooks/useModal";
import usePermissions from "@/shared/hooks/usePermissions";

// Queries
import { ACTIVE_STATUSES, gradeAnalysisKeys, gradeAnalysisQueries } from "../queries/gradeAnalysis.queries";
import {
  useCancelGradeAnalysis,
  useDeleteGradeAnalysis,
  usePublishGradeAnalysis,
  useUnpublishGradeAnalysis,
} from "../queries/gradeAnalysis.mutations";

// Utils
import { cn } from "@/shared/utils/cn";

// Tokens
import { DELAY, MOTION, SURFACE, T } from "../data/analysis.tokens";

/** Qorong'i hero ustidagi tugmalar — bir xil shakl, ikki og'irlik. */
const HERO_BTN = {
  primary:
    "inline-flex h-9 items-center gap-2 rounded-xl bg-white px-3.5 text-[12.5px] font-semibold text-slate-900 " +
    "shadow-[0_6px_18px_-8px_rgba(255,255,255,0.5)] transition-colors hover:bg-white/90 disabled:opacity-50",
  ghost:
    "inline-flex h-9 items-center gap-2 rounded-xl bg-white/[0.07] px-3.5 text-[12.5px] font-semibold text-white " +
    "ring-1 ring-white/15 transition-colors hover:bg-white/[0.12] disabled:opacity-50",
  icon:
    "inline-flex size-9 items-center justify-center rounded-xl bg-white/[0.07] text-white/80 ring-1 ring-white/15 " +
    "transition-colors hover:bg-white/[0.12] hover:text-white disabled:opacity-40",
};

const errorText = (error, fallback) => error?.response?.data?.message || fallback;

/**
 * BAHOLAR TAHLILI — o'quv bo'limining "diagnostika markazi".
 *
 * Sahifa BITTA tahlilni ko'rsatadi (`?run=`), tarix tasmasi orqali
 * boshqasiga o'tiladi. Tanlanmagan bo'lsa — eng so'nggisi.
 *
 * ⚠️ RUXSATLAR (`gradeAnalysis.*`): `view` — ko'rish, `run` — ishga
 * tushirish/to'xtatish, `publish` — o'quvchi va ota-onaga yuborish,
 * `delete`, `settings`. Tugma ruxsatsiz chizilmaydi; server baribir
 * o'zi tekshiradi.
 *
 * ⚠️ HISOB-KITOB FAQAT SERVERDA: sahifa hech narsa qayta hisoblamaydi —
 * ekrandagi har bir raqam o'quvchi va ota-ona ko'radigan hisobot bilan
 * bir manbadan.
 */
const GradeAnalysisPage = () => {
  const { can } = usePermissions();
  const { openModal } = useModal();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const allowed = can("gradeAnalysis.view");
  const perms = {
    run: can("gradeAnalysis.run"),
    publish: can("gradeAnalysis.publish"),
    delete: can("gradeAnalysis.delete"),
    settings: can("gradeAnalysis.settings"),
  };

  const runs = useQuery({ ...gradeAnalysisQueries.runs({ page: 1, limit: 6 }), enabled: allowed });
  const selectedId = searchParams.get("run") || runs.data?.data?.[0]?.id || null;
  const runQuery = useQuery({ ...gradeAnalysisQueries.run(selectedId), enabled: allowed && Boolean(selectedId) });
  const run = runQuery.data;

  const cancel = useCancelGradeAnalysis();
  const publish = usePublishGradeAnalysis();
  const unpublish = useUnpublishGradeAnalysis();
  const remove = useDeleteGradeAnalysis();

  const select = (id) => setSearchParams(id ? { run: id } : {}, { replace: true });

  // Tahlil tugagan zahoti tarix, oyna va jadval yangilanadi — aks holda
  // tasmada "Ishlanmoqda" va eski progress qolib ketardi.
  const lastStatus = useRef(null);
  useEffect(() => {
    const status = run?.status;
    if (lastStatus.current && ACTIVE_STATUSES.includes(lastStatus.current) && status && !ACTIVE_STATUSES.includes(status)) {
      queryClient.invalidateQueries({ queryKey: gradeAnalysisKeys.all });
      if (status === "completed") toast.success("Tahlil tayyor");
      if (status === "failed") toast.error("Tahlil xato bilan to'xtadi");
    }
    lastStatus.current = status ?? null;
  }, [run?.status, queryClient]);

  if (!allowed) {
    return (
      <Card className="p-0 xs:p-0">
        <EmptyState
          icon={Lock}
          title="Ruxsat yo'q"
          description="Baholar tahlilini ko'rish uchun ruxsatingiz yo'q. Kerak bo'lsa administratordan so'rang."
        />
      </Card>
    );
  }

  const openLaunch = () => openModal("gradeAnalysisLaunch", { onCreated: select });
  const isActive = run && ACTIVE_STATUSES.includes(run.status);
  const pending = run ? Math.max(0, (run.publishableCount ?? 0) - (run.publishedCount ?? 0)) : 0;

  const act = (mutation, successText, fallback, after) => () =>
    mutation.mutate(run.id, {
      onSuccess: (response) => {
        toast.success(response?.message || successText);
        after?.();
      },
      onError: (error) => toast.error(errorText(error, fallback)),
    });

  const settingsButton = (
    <button
      type="button"
      className={HERO_BTN.icon}
      title="Sozlamalar"
      aria-label="Sozlamalar"
      onClick={() => openModal("gradeAnalysisSettings", { canEdit: perms.settings })}
    >
      <Settings2 className="size-4" />
    </button>
  );

  const actions = (
    <>
      {perms.run && (
        <button type="button" className={HERO_BTN.primary} onClick={openLaunch}>
          <Play className="size-4" /> Yangi tahlil
        </button>
      )}

      {run && isActive && perms.run && (
        <ConfirmPopover
          title="Tahlil to'xtatilsinmi?"
          description="Hozirgacha yozilgan hisobotlar saqlanadi, qolgan o'quvchilar tahlil qilinmaydi."
          confirmLabel="To'xtatish"
          danger
          onConfirm={act(cancel, "Tahlil to'xtatildi", "To'xtatib bo'lmadi")}
        >
          <button type="button" className={HERO_BTN.ghost}>
            <Square className="size-3.5" /> To'xtatish
          </button>
        </ConfirmPopover>
      )}

      {run?.status === "completed" && perms.publish && pending > 0 && (
        <ConfirmPopover
          title={`${pending} ta hisobot yuborilsinmi?`}
          description="Hisobotlar o'quvchi va ota-onaning mobil ilovasida ochiladi va bildirishnoma boradi."
          confirmLabel="Yuborish"
          onConfirm={act(publish, "Yuborildi", "Yuborib bo'lmadi")}
        >
          <button type="button" className={HERO_BTN.ghost} disabled={publish.isPending}>
            <BellRing className="size-4" /> Yuborish · {pending}
          </button>
        </ConfirmPopover>
      )}

      {run?.status === "completed" && perms.publish && pending === 0 && run.publishedCount > 0 && (
        <ConfirmPopover
          title="Yuborish bekor qilinsinmi?"
          description="Hisobotlar mobil ilovadan yopiladi (o'chirilmaydi). Keyin qayta yuborish mumkin."
          confirmLabel="Bekor qilish"
          danger
          onConfirm={act(unpublish, "Yuborish bekor qilindi", "Bekor qilib bo'lmadi")}
        >
          <button type="button" className={HERO_BTN.ghost} disabled={unpublish.isPending}>
            <BellOff className="size-4" /> Yuborilgan · {run.publishedCount}
          </button>
        </ConfirmPopover>
      )}

      {run && !isActive && perms.delete && !run.publishedCount && (
        <ConfirmPopover
          title="Tahlil o'chirilsinmi?"
          description="Tahlil va undagi barcha hisobotlar butunlay o'chiriladi."
          confirmLabel="O'chirish"
          danger
          onConfirm={act(remove, "O'chirildi", "O'chirib bo'lmadi", () => select(null))}
        >
          <button type="button" className={HERO_BTN.icon} title="O'chirish" aria-label="O'chirish">
            <Trash2 className="size-4" />
          </button>
        </ConfirmPopover>
      )}

      {settingsButton}
    </>
  );

  const noRuns = !runs.isLoading && (runs.data?.data?.length ?? 0) === 0 && !selectedId;
  const ready = run?.status === "completed" && run.overview;
  const isStudentScope = run?.scope === "student";

  return (
    <>
      <div className="space-y-4 pb-8">
        {noRuns ? (
          <EmptyHero actions={settingsButton} canRun={perms.run} onLaunch={openLaunch} />
        ) : (
          <AnalysisHero run={run} isLoading={runQuery.isLoading || runs.isLoading} actions={actions} />
        )}

        <RunHistory selectedId={selectedId} onSelect={select} />

        {ready && (
          <>
            {isStudentScope && run.overview.topStudents?.[0] && (
              <button
                type="button"
                onClick={() => openModal("gradeAnalysisReport", { reportId: run.overview.topStudents[0].reportId })}
                className={cn(SURFACE.card, SURFACE.hover, MOTION.enter, "flex w-full items-center gap-4 px-5 py-4 text-left")}
                style={{ animationDelay: `${DELAY.row(0)}ms` }}
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
                  <FileSearch className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn(T.title, "block")}>To'liq hisobotni ochish</span>
                  <span className={cn(T.hint, "block")}>
                    Fanlar, mavzular, sabablar va ota-ona / o'quvchi / xodim uchun tavsiyalar
                  </span>
                </span>
              </button>
            )}

            <div className="grid gap-4 xl:grid-cols-12">
              <div className="min-w-0 xl:col-span-7">
                <SubjectBoard overview={run.overview} delay={DELAY.row(0)} />
              </div>
              {isStudentScope ? (
                <div className="xl:col-span-5">
                  <NarrativePanel narrative={run.narrative} delay={DELAY.row(0) + 45} />
                </div>
              ) : (
                <div className="xl:col-span-5">
                  <StudentSpotlight overview={run.overview} delay={DELAY.row(0) + 45} />
                </div>
              )}
            </div>

            {!isStudentScope && (
              <div className="grid gap-4 xl:grid-cols-12">
                <div className="xl:col-span-5">
                  <NarrativePanel narrative={run.narrative} delay={DELAY.row(1)} />
                </div>
                <div className="min-w-0 xl:col-span-7">
                  <HeatmapPanel overview={run.overview} delay={DELAY.row(1) + 45} />
                </div>
              </div>
            )}

            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              <TopicsPanel overview={run.overview} delay={DELAY.row(2)} />
              <CausesPanel overview={run.overview} delay={DELAY.row(2) + 45} />
              <SignalsPanel overview={run.overview} delay={DELAY.row(2) + 90} />
            </div>

            {!isStudentScope && <ReportsTable run={run} delay={DELAY.row(3)} />}
          </>
        )}

        {run?.status === "completed" && !run.overview?.students?.analyzed && (
          <Card className="p-0 xs:p-0">
            <EmptyState
              icon={Wand2}
              title="Tahlil uchun baholar yetarli emas"
              description="Tanlangan davrda o'quvchilarga yetarli baho qo'yilmagan. Kengroq davrni tanlab qayta urinib ko'ring."
            />
          </Card>
        )}
      </div>

      <LaunchModal />
      <SettingsModal />
      <StudentReportModal />
    </>
  );
};

/** Birinchi marta — hali birorta tahlil yo'q. */
const EmptyHero = ({ actions, canRun, onLaunch }) => (
  <section className={cn(SURFACE.hero, MOTION.enter, "px-6 py-10 xs:px-10 xs:py-14")}>
    <span aria-hidden className={SURFACE.heroLight} />
    <span aria-hidden className={SURFACE.heroGrid} />
    <div className="flex flex-wrap items-start justify-between gap-6">
      <div className="max-w-xl">
        <p className={T.labelDark}>Baholar tahlili</p>
        <h1 className={cn(T.pageTitle, "mt-3")}>O'quvchilar bilimini bir qarashda ko'ring</h1>
        <p className="mt-4 text-[13.5px] leading-relaxed text-white/60">
          Har bir o'quvchi uchun: qaysi fanlar yaxshi, qaysi mavzular oqsayapti, sababi nimada va nima qilish
          kerak. Natija ota-ona va o'quvchiga mobil ilovada tavsiyalar bilan yetib boradi.
        </p>
        {canRun && (
          <button type="button" onClick={onLaunch} className={cn(HERO_BTN.primary, "mt-6 h-10 px-4")}>
            <Play className="size-4" /> Birinchi tahlilni boshlash
          </button>
        )}
      </div>
      <div className="flex gap-2">{actions}</div>
    </div>
  </section>
);

export default GradeAnalysisPage;
