// Icons
import { ArrowUpRight, Play, Trophy } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Panel from "./Panel";
import { ClassRankings, SchoolRankings } from "./RankingsPanel";

// Queries
import { gradeAnalysisQueries } from "../queries/gradeAnalysis.queries";

// Utils
import { cn } from "@/shared/utils/cn";

// Tokens
import { DELAY, T } from "../data/analysis.tokens";

/** Reyting chiqadigan qamrovlar — bitta o'quvchi tahlilida reyting ma'nosiz. */
const GROUP_SCOPES = ["school", "classes"];
const LATEST_GROUP = { page: 1, limit: 1, status: "completed", scope: GROUP_SCOPES.join(",") };

const TITLE = "Eng yaxshi va eng past natijalar";

const LINK_BTN =
  "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11.5px] font-semibold text-slate-600 " +
  "transition-colors hover:bg-slate-50 hover:text-slate-900";

/**
 * REYTING — SAHIFANING ENG TEPASIDA, tanlangan tahlildan MUSTAQIL.
 *
 * Manba: tanlangan tahlil maktab/sinflar bo'yicha va tayyor bo'lsa — o'sha
 * (sahifaning qolgan qismi bilan bir raqam); aks holda OXIRGI tayyor
 * maktab/sinf tahlili.
 *
 * ⚠️ Ilgari reyting faqat tanlangan tahlil ichida chizilardi: tarixda
 * bitta o'quvchi tahlili tanlangan bo'lsa (yoki eng so'nggisi shu bo'lsa)
 * blok umuman yo'qolib, "reyting qilinmagan" bo'lib ko'rinardi.
 */
const RankingsSection = ({ selectedRun, canRun, onLaunch, onOpenRun }) => {
  const fromSelected =
    selectedRun?.status === "completed" && GROUP_SCOPES.includes(selectedRun.scope) && Boolean(selectedRun.overview);

  const latest = useQuery({ ...gradeAnalysisQueries.runs(LATEST_GROUP), enabled: !fromSelected });
  const latestId = latest.data?.data?.[0]?.id ?? null;
  const latestRun = useQuery({ ...gradeAnalysisQueries.run(latestId), enabled: !fromSelected && Boolean(latestId) });

  const run = fromSelected ? selectedRun : latestRun.data;
  const isLoading = !fromSelected && (latest.isLoading || (Boolean(latestId) && latestRun.isLoading));
  const isError = !fromSelected && (latest.isError || latestRun.isError);

  if (isLoading || isError) {
    return <Panel title={TITLE} icon={Trophy} accent="bg-amber-50 text-amber-600" className="h-auto" isLoading={isLoading} isError={isError} />;
  }

  if (!run?.overview?.rankings) {
    return (
      <Panel
        title={TITLE}
        hint="Maktab bo'yicha va har sinfda eng yaxshi 3 va eng past 3 o'quvchi"
        icon={Trophy}
        accent="bg-amber-50 text-amber-600"
        className="h-auto"
      >
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <p className={cn(T.body, "max-w-[56ch]")}>
            Reyting maktab yoki sinflar bo'yicha tayyor tahlildan chiqadi — hozircha bunday tahlil yo'q. Bitta
            o'quvchi bo'yicha tahlilda reyting bo'lmaydi.
          </p>
          {canRun && (
            <button
              type="button"
              onClick={onLaunch}
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-slate-900 px-3.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-slate-800"
            >
              <Play className="size-4" /> Maktab bo'yicha tahlil
            </button>
          )}
        </div>
      </Panel>
    );
  }

  const showSchool = (run.overview.rankings.classes?.length ?? 0) > 1;
  // Manba boshqa tahlil bo'lsa — qaysi davrdan ekani va unga o'tish yo'li
  const note = `Tahlil davri: ${run.rangeLabel}`;
  const action = !fromSelected && (
    <button type="button" className={LINK_BTN} onClick={() => onOpenRun(run.id)}>
      Tahlilni ochish <ArrowUpRight className="size-3.5" />
    </button>
  );

  return (
    <>
      {showSchool && <SchoolRankings run={run} delay={DELAY.row(0)} note={note} action={action} />}
      <ClassRankings
        run={run}
        delay={DELAY.row(showSchool ? 1 : 0)}
        note={showSchool ? undefined : note}
        action={showSchool ? undefined : action}
      />
    </>
  );
};

export default RankingsSection;
