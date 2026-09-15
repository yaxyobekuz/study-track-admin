// React
import { useMemo, useState } from "react";

// TanStack Query
import { useInfiniteQuery } from "@tanstack/react-query";

// Icons
import { Plus, Search, X } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Components
import AssistantButton from "./AssistantButton";
import ConversationItem from "./ConversationItem";
import IconButton from "./IconButton";

// Hooks
import useDebounce from "@/shared/hooks/useDebounce";
import useNow from "../hooks/useNow";

// Queries
import { aiAssistantQueries } from "../queries/aiAssistant.queries";

// Lib
import { groupConversations } from "../lib/thread";

// Data
import { CONVERSATION_GROUPS, COPY } from "../data/aiAssistant.data";
import { T } from "../data/assistant.tokens";

/**
 * SUHBATLAR RO'YXATI — qidiruv, kun guruhlari, "Ko'proq yuklash".
 *
 * ⚠️ QIDIRUV SERVERDA (`search`), kechiktirilgan. Ro'yxat sahifalanadi:
 * brauzerdagi qidiruv faqat yuklangan 30 tani ko'rib, eski suhbatni
 * "topilmadi" deb aytardi.
 *
 * ⚠️ BITTA KOMPONENT IKKI JOYDA: keng ekranda chap panel, torda chap
 * `Sheet` ichida (`onNavigate` uni yopadi). Ikkita nusxa yozilmaydi.
 *
 * @param {object} props
 * @param {string|null} props.activeId
 * @param {string|null} props.streamingId
 * @param {() => void} props.onNewConversation
 * @param {(id: string) => void} props.onDeleted
 * @param {() => void} [props.onNavigate]
 * @param {React.ReactNode} [props.headerAction] - sarlavha o'ng tomoniga qo'shimcha (mobil yopish)
 * @param {string} [props.className]
 */
const ConversationSidebar = ({ activeId, streamingId, onNewConversation, onDeleted, onNavigate, headerAction, className }) => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 350);
  const now = useNow(60 * 1000);

  const query = useInfiniteQuery(aiAssistantQueries.conversations({ search: debouncedSearch }));

  const conversations = useMemo(
    () => (query.data?.pages ?? []).flatMap((page) => page.data ?? []),
    [query.data],
  );
  const groups = useMemo(() => groupConversations(conversations, now), [conversations, now]);

  const isSearching = Boolean(debouncedSearch);
  const isInitialLoading = query.isLoading;

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-slate-100 pl-4 pr-2.5">
        <h2 className={T.title}>{COPY.conversations}</h2>
        <div className="flex items-center gap-0.5">
          <IconButton icon={Plus} label={COPY.newConversation} onClick={onNewConversation} />
          {headerAction}
        </div>
      </div>

      <div className="shrink-0 px-2.5 pb-1 pt-2.5">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <label htmlFor="ai-conversation-search" className="sr-only">
            {COPY.searchPlaceholder}
          </label>
          <input
            id="ai-conversation-search"
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => event.key === "Escape" && search && setSearch("")}
            placeholder={COPY.searchPlaceholder}
            autoComplete="off"
            className={cn(
              "h-9 w-full rounded-[10px] bg-slate-50 pl-8 pr-8 text-[13px] text-slate-900 outline-none ring-1 ring-inset ring-slate-200/80",
              "placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-primary/40",
            )}
          />
          {search && (
            <button
              type="button"
              aria-label="Qidiruvni tozalash"
              onClick={() => setSearch("")}
              className="absolute right-1.5 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 outline-none hover:bg-slate-200/70 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <X className="size-3.5" strokeWidth={2} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <nav aria-label={COPY.conversations} className="min-h-0 flex-1 overflow-y-auto px-1.5 pb-3">
        {isInitialLoading ? (
          <ListSkeleton />
        ) : query.isError ? (
          <p className="px-3 py-6 text-center text-[12.5px] text-slate-500">Ro'yxatni yuklab bo'lmadi</p>
        ) : conversations.length === 0 ? (
          <p className="px-3 py-8 text-center text-[12.5px] text-slate-500">
            {isSearching ? COPY.noSearchResults : COPY.noConversations}
          </p>
        ) : (
          <>
            {CONVERSATION_GROUPS.map(({ key, label }) =>
              groups[key].length ? (
                <section key={key} className="mt-3 first:mt-2">
                  <h3 className={cn(T.label, "px-2.5 pb-1")}>{label}</h3>
                  <ul className="space-y-px">
                    {groups[key].map((conversation) => (
                      <ConversationItem
                        key={conversation.id}
                        conversation={conversation}
                        active={conversation.id === activeId}
                        streaming={conversation.id === streamingId}
                        onNavigate={onNavigate}
                        onDeleted={onDeleted}
                      />
                    ))}
                  </ul>
                </section>
              ) : null,
            )}

            {query.hasNextPage && (
              <div className="mt-2 px-1">
                <AssistantButton
                  size="compact"
                  tone="ghost"
                  className="w-full"
                  loading={query.isFetchingNextPage}
                  onClick={() => query.fetchNextPage()}
                >
                  {COPY.loadMore}
                </AssistantButton>
              </div>
            )}
          </>
        )}
      </nav>
    </div>
  );
};

const ListSkeleton = () => (
  <div className="space-y-3 px-2.5 pt-4" aria-hidden="true">
    {[88, 72, 80, 64, 76].map((width, index) => (
      <div key={width} className="space-y-1.5">
        <div
          className="h-2.5 rounded-full bg-slate-100 motion-safe:animate-breathe"
          style={{ width: `${width}%`, animationDelay: `${index * 120}ms` }}
        />
        <div className="h-2 w-16 rounded-full bg-slate-100/80" />
      </div>
    ))}
  </div>
);

export default ConversationSidebar;
