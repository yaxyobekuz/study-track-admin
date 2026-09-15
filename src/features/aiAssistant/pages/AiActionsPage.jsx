// React
import { useRef, useState } from "react";

// Router
import { Link, useSearchParams } from "react-router-dom";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { ArrowLeft, Lock } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Components
import Card from "@/shared/components/ui/Card";
import EmptyState from "@/shared/components/ui/EmptyState";
import Pagination from "@/shared/components/ui/Pagination";
import ActionDetailSheet from "../components/ActionDetailSheet";
import AssistantButton from "../components/AssistantButton";
import Chip from "../components/Chip";
import HintTooltip from "../components/HintTooltip";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";
import useNow from "../hooks/useNow";

// Queries
import { aiAssistantQueries } from "../queries/aiAssistant.queries";

// Data
import { ACTION_COPY, ACTION_STATUS_FILTERS, ACTIONS_PAGE_COPY, COPY } from "../data/aiAssistant.data";
import { BUTTON, MOTION, riskTone, statusTone, SURFACE, T } from "../data/assistant.tokens";

/**
 * AMALLAR TARIXI — yordamchi taklif qilgan har o'zgarish, egasining qarori
 * va natijasi (`/ai-assistant/actions`).
 *
 * ⚠️ BU AUDIT, BEZAK EMAS. Server `AiAction` qatorining o'zi audit yozuvi:
 * nima taklif qilingan, ega qaysi ko'rinishga rozi bo'lgan, nima bo'lgan.
 * Shu sababli jadvalda natija matni (yoki xato) doim ko'rinadi — "bajarildimi?"
 * savoliga javob uchun qatorni ochish shart emas.
 *
 * ⚠️ FILTR VA SAHIFA MANZILDA (`?status=&page=`): ega havolani yangilasa
 * yoki orqaga qaytsa, ro'yxat o'sha holatda qoladi.
 */
const AiActionsPage = () => {
  const { isOwner } = usePermissions();

  if (!isOwner) {
    return (
      <Card className="p-0 xs:p-0">
        <EmptyState icon={Lock} title={COPY.ownerOnlyTitle} description={COPY.ownerOnlyHint} />
      </Card>
    );
  }

  return <ActionsHistory />;
};

const VALID_STATUSES = new Set(ACTION_STATUS_FILTERS.map((filter) => filter.value));

const ActionsHistory = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawStatus = searchParams.get("status") ?? "";
  const status = VALID_STATUSES.has(rawStatus) ? rawStatus : "";
  const page = Math.max(1, Number.parseInt(searchParams.get("page"), 10) || 1);

  const contentRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const query = useQuery(aiAssistantQueries.actions({ status, page }));
  const rows = query.data?.data ?? [];
  const pagination = query.data?.pagination;

  // Ochiq panel ro'yxatdagi ENG YANGI nusxani ko'rsatadi; qator filtrdan
  // chiqib ketsa (masalan tasdiqlangach "Tasdiq kutilmoqda" dan), oxirgi
  // ma'lum holat qoladi — panel yopilib ketmaydi.
  const selectedAction = selected ? (rows.find((row) => row.id === selected.id) ?? selected) : null;

  const updateParams = (next) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (value === "" || value === 1 || value == null) params.delete(key);
      else params.set(key, String(value));
    });
    setSearchParams(params);
  };

  const openAction = (action) => {
    setSelected(action);
    setSheetOpen(true);
  };

  const handleUpdated = (fresh) =>
    setSelected((current) =>
      current && current.id === fresh.id ? { ...fresh, conversationTitle: current.conversationTitle } : current,
    );

  return (
    <div className="flex flex-col gap-3 pb-6">
      <header className={cn("flex items-start justify-between gap-3 px-0.5 pt-0.5", MOTION.enter)}>
        <div className="min-w-0">
          <h1 className={T.pageTitle}>{ACTIONS_PAGE_COPY.title}</h1>
          <p className={cn(T.hint, "mt-1")}>{ACTIONS_PAGE_COPY.hint}</p>
        </div>
        {/* Tor ekranda faqat ikonka: matnli tugma sarlavhani ikki qatorga
            surib, alohida qatorga tushib qolardi. */}
        <Link
          to="/ai-assistant"
          className={cn(BUTTON.base, BUTTON.size.default, BUTTON.tone.secondary, "hidden sm:inline-flex")}
        >
          <ArrowLeft strokeWidth={1.75} aria-hidden="true" />
          {COPY.pageTitle}
        </Link>
        <HintTooltip content={COPY.pageTitle} side="bottom">
          <Link
            to="/ai-assistant"
            aria-label={COPY.pageTitle}
            className={cn(BUTTON.base, BUTTON.icon.default, BUTTON.tone.secondary, "sm:hidden")}
          >
            <ArrowLeft strokeWidth={1.75} aria-hidden="true" />
          </Link>
        </HintTooltip>
      </header>

      {/* ⚠️ Filtrlar QATORGA O'RALADI, gorizontal suriladigan lenta emas:
          telefonda oxirgi ikkitasi ekran chetida kesilib, borligi ham
          ko'rinmay qolardi. */}
      <div role="tablist" aria-label={ACTIONS_PAGE_COPY.filterLabel} className="flex flex-wrap gap-1 px-0.5">
        {ACTION_STATUS_FILTERS.map((filter) => {
          const active = filter.value === status;
          return (
            <button
              key={filter.value || "all"}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => updateParams({ status: filter.value, page: 1 })}
              className={cn(
                "h-8 shrink-0 whitespace-nowrap rounded-[8px] px-3 text-[12.5px] font-medium outline-none transition-colors",
                "focus-visible:ring-2 focus-visible:ring-primary/40",
                active
                  ? "bg-white text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.06)] ring-1 ring-slate-200"
                  : "text-slate-600 hover:bg-white/70 hover:text-slate-900",
              )}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* ⚠️ Jadval yoki ro'yxat KARTA kengligiga qarab (container query).
          Ekran kengligi bo'yicha (`lg:`) tanlanganda 1024–1280px da chap menyu
          ochiq bo'lsa karta ~730px qolib, qat'iy ustunlar "Amal" ustunini
          nolga siqib qo'yardi. */}
      <section
        ref={contentRef}
        className={cn(SURFACE.card, "overflow-hidden [container-name:actions] [container-type:inline-size]")}
        aria-busy={query.isFetching || undefined}
      >
        {query.isPending ? (
          <TableSkeleton />
        ) : query.isError && !query.data ? (
          <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
            <p className="text-[13px] text-slate-500">{COPY.loadFailed}</p>
            <AssistantButton size="compact" tone="secondary" onClick={() => query.refetch()}>
              {COPY.reload}
            </AssistantButton>
          </div>
        ) : rows.length === 0 ? (
          <p className="px-5 py-12 text-center text-[13px] text-slate-500">
            {status ? ACTIONS_PAGE_COPY.empty : ACTIONS_PAGE_COPY.emptyAll}
          </p>
        ) : (
          <div className={cn("transition-opacity duration-150", query.isPlaceholderData && "opacity-60")}>
            <ActionsTable rows={rows} onOpen={openAction} />
            <ActionsList rows={rows} onOpen={openAction} />
          </div>
        )}
      </section>

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          contentRef={contentRef}
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          onPageChange={(nextPage) => updateParams({ page: nextPage })}
        />
      )}

      <ActionDetailSheet
        action={selectedAction}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onUpdated={handleUpdated}
      />
    </div>
  );
};

/** Muddati mahalliy o'tgan `pending` — server keyingi o'qishda yozadi. */
const useDisplayStatus = () => {
  const now = useNow(30 * 1000);
  return (action) => {
    const expiresAt = Date.parse(action.expiresAt);
    if (action.status === "pending" && Number.isFinite(expiresAt) && expiresAt <= now) {
      return { status: "expired", label: ACTION_COPY.expiredLabel };
    }
    return { status: action.status, label: action.statusLabel };
  };
};

const outcomeOf = (action) => {
  if (action.status === "succeeded") return { text: action.result?.summary, tone: "text-slate-700" };
  if (action.status === "failed") return { text: action.errorMessage, tone: "text-rose-700" };
  return { text: null, tone: "text-slate-500" };
};

const TH = "px-3 py-2.5 text-left text-[10.5px] font-medium uppercase tracking-[0.07em] text-slate-500 first:pl-4 last:pr-4";
const TD = "px-3 py-3 align-top first:pl-4 last:pr-4";

/** Jadval shu karta kengligidan boshlab ko'rsatiladi (pastda — ro'yxat). */
const ActionsTable = ({ rows, onOpen }) => {
  const displayStatus = useDisplayStatus();

  return (
    <div className="hidden [@container_actions_(min-width:900px)]:block">
      <table className="w-full min-w-0 table-fixed border-collapse text-left lg:min-w-0 [&_tbody]:divide-y-0 [&_tbody_tr]:bg-transparent [&_tbody_tr:last-child]:bg-transparent [&_thead]:bg-slate-50">
        <colgroup>
          <col className="w-[128px]" />
          <col />
          <col className="w-[132px]" />
          <col className="w-[144px]" />
          <col className="w-[22%]" />
          <col className="w-[15%]" />
        </colgroup>
        <thead className="bg-slate-50">
          <tr>
            {ACTIONS_PAGE_COPY.columns.map((column) => (
              <th key={column} scope="col" className={TH}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((action) => {
            const shown = displayStatus(action);
            const outcome = outcomeOf(action);
            return (
              <tr
                key={action.id}
                tabIndex={0}
                onClick={() => onOpen(action)}
                onKeyDown={(event) => {
                  if (event.target !== event.currentTarget) return;
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onOpen(action);
                  }
                }}
                className="cursor-pointer border-t border-slate-100 outline-none transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40"
              >
                <td className={cn(TD, "text-[12.5px] leading-5 text-slate-600")}>{action.createdAtLabel}</td>
                <td className={TD}>
                  <p className="line-clamp-2 text-[13px] font-medium leading-5 text-slate-900 [overflow-wrap:anywhere]">
                    {action.title}
                  </p>
                  {action.preview?.target && (
                    <p className="truncate text-[12px] leading-5 text-slate-500">{action.preview.target}</p>
                  )}
                </td>
                <td className={TD}>
                  <Chip tone={riskTone(action.risk).chip}>{action.riskLabel}</Chip>
                </td>
                <td className={TD}>
                  <Chip tone={statusTone(shown.status)}>{shown.label}</Chip>
                </td>
                <td className={TD}>
                  <p className={cn("line-clamp-2 text-[12.5px] leading-5 [overflow-wrap:anywhere]", outcome.tone)}>
                    {outcome.text || "—"}
                  </p>
                </td>
                <td className={TD}>
                  <Link
                    to={`/ai-assistant/${action.conversationId}`}
                    onClick={(event) => event.stopPropagation()}
                    className="block truncate rounded-[4px] text-[12.5px] font-medium leading-5 text-primary underline decoration-primary/30 underline-offset-2 outline-none hover:decoration-primary focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    {action.conversationTitle || ACTIONS_PAGE_COPY.openConversation}
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

/** Tor karta (<900px): qatorlar ro'yxati. */
const ActionsList = ({ rows, onOpen }) => {
  const displayStatus = useDisplayStatus();

  return (
    <ul className="divide-y divide-slate-100 [@container_actions_(min-width:900px)]:hidden">
      {rows.map((action) => {
        const shown = displayStatus(action);
        const outcome = outcomeOf(action);
        return (
          <li key={action.id}>
            <button
              type="button"
              onClick={() => onOpen(action)}
              className="flex w-full flex-col gap-1.5 px-4 py-3 text-left outline-none transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40"
            >
              <span className="flex w-full items-start justify-between gap-3">
                <span className="min-w-0 text-[13px] font-medium leading-5 text-slate-900 [overflow-wrap:anywhere]">
                  {action.title}
                </span>
                <Chip tone={statusTone(shown.status)}>{shown.label}</Chip>
              </span>
              {action.preview?.target && (
                <span className="-mt-1 truncate text-[12px] leading-5 text-slate-500">{action.preview.target}</span>
              )}
              {outcome.text && (
                <span className={cn("line-clamp-2 text-[12.5px] leading-5 [overflow-wrap:anywhere]", outcome.tone)}>
                  {outcome.text}
                </span>
              )}
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <Chip tone={riskTone(action.risk).chip}>{action.riskLabel}</Chip>
                <span className={T.meta}>{action.createdAtLabel}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
};

const TableSkeleton = () => (
  <div className="space-y-4 px-5 py-6" aria-hidden="true">
    {[94, 80, 88, 70, 84].map((width, index) => (
      <div
        key={width}
        className="h-2.5 rounded-full bg-slate-100 motion-safe:animate-breathe"
        style={{ width: `${width}%`, animationDelay: `${index * 120}ms` }}
      />
    ))}
  </div>
);

export default AiActionsPage;
