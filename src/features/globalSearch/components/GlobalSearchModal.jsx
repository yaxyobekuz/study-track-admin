// React
import { useEffect, useMemo, useRef, useState } from "react";

// Router
import { useNavigate } from "react-router-dom";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import {
  Search,
  SearchX,
  UserRound,
  Loader2,
  CornerDownLeft,
} from "lucide-react";

// Hooks
import useModal from "@/shared/hooks/useModal";
import useDebounce from "@/shared/hooks/useDebounce";
import usePermissions from "@/shared/hooks/usePermissions";

// Navigation (yagona manba)
import { flatNavPages } from "@/shared/data/navigation.data";

// Permissions
import { permissionForPath } from "@/features/permissions/data/permissions.data";

// Queries
import {
  globalSearchQueries,
  MIN_QUERY_LENGTH,
} from "../queries/globalSearch.queries";

// Components
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Utils
import { cn } from "@/shared/utils/cn";

// Qidiruv oynasi tasdiqlash oynasidan KENG: natija qatorida ism, login,
// lavozim va filial yonma-yon turadi — `max-w-md` da ular qisilib ketardi.
const GlobalSearchModal = () => (
  <ResponsiveModal
    name="globalSearch"
    title="Qidiruv"
    description="Foydalanuvchilar butun platforma bo'ylab, sahifalar — ruxsatingiz bo'yicha."
    className="max-w-2xl"
  >
    <Content />
  </ResponsiveModal>
);

/**
 * GLOBAL QIDIRUV — foydalanuvchilar va sahifalar.
 *
 * Ikki manba, ikki xil yo'l bilan:
 *
 *   - FOYDALANUVCHI — serverdan, butun platforma bo'ylab
 *     (`platform.user_directory`). Shuning uchun boshqa filialdagi odam
 *     ham topiladi va qator yonida uning filiali ko'rsatiladi.
 *   - SAHIFA — frontendda, `flatNavPages` dan. Server qaysi sahifa qaysi
 *     yo'lda turganini bilmaydi, ruxsat esa `permissionForPath` bilan shu
 *     yerda kesiladi: ko'rinmaydigan bo'limga olib boradigan natija
 *     chiqmaydi.
 *
 * ⚠️ Boshqa filialdagi odam tanlanganda uning kartasiga O'TIB BO'LMAYDI:
 * karta joriy filial bazasidan o'qiydi, ya'ni ochilgan sahifa bo'sh
 * chiqardi. Shuning uchun bunday qatorda filial nomi yozuv sifatida
 * turadi va bosilmaydi — odamni ko'rish uchun avval o'sha filialga
 * o'tish kerak.
 */
const Content = ({ close }) => {
  const navigate = useNavigate();
  const { can } = usePermissions();
  const { isOpen } = useModal("globalSearch");

  const [term, setTerm] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const debouncedTerm = useDebounce(term, 300);

  const trimmed = term.trim();
  const isTooShort = trimmed.length > 0 && trimmed.length < MIN_QUERY_LENGTH;

  // Modal ochilganda maydonga fokus — Drawer/Dialog animatsiyasi tugagach.
  //
  // ⚠️ Holat bu yerda TOZALANMAYDI: `ResponsiveModal` yopilganda ichini
  // DOM'dan olib tashlaydi, ya'ni keyingi ochilishda komponent yangidan
  // montaj qilinadi va `term` baribir bo'sh boshlanadi. Effekt ichida
  // `setTerm("")` qo'shilsa, bu kaskad render bo'lardi (lint ham shuni
  // aytadi) va hech narsa yutmasdi.
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const { data, isFetching } = useQuery(
    globalSearchQueries.users(debouncedTerm),
  );

  // Ko'rish mumkin bo'lgan sahifalar — qidiruv ham, tez havolalar ham
  // shundan oladi (ruxsat filtri ikki joyda takrorlanmasin)
  const allowedPages = useMemo(
    () =>
      flatNavPages.filter((page) => {
        const key = permissionForPath(page.url);
        // Kaliti yo'q sahifa (masalan bosh sahifa) hammaga ochiq
        return !key || can(key);
      }),
    [can],
  );

  // Bo'sh holatdagi tez havolalar — menyudagi birinchi sahifalar
  const quickLinks = useMemo(() => allowedPages.slice(0, 5), [allowedPages]);

  // Sahifalar — nom yoki bo'lim nomi bo'yicha moslashtirilgan
  const pageResults = useMemo(() => {
    if (trimmed.length < MIN_QUERY_LENGTH) return [];
    const needle = trimmed.toLowerCase();

    return allowedPages
      .filter(
        (page) =>
          page.title.toLowerCase().includes(needle) ||
          page.section.toLowerCase().includes(needle),
      )
      .slice(0, 8);
  }, [trimmed, allowedPages]);

  const userResults = useMemo(() => data?.users ?? [], [data]);

  // Klaviatura bilan yurish uchun yassi ro'yxat: sahifalar, keyin odamlar
  const rows = useMemo(
    () => [
      ...pageResults.map((page) => ({ kind: "page", page })),
      ...userResults.map((user) => ({ kind: "user", user })),
    ],
    [pageResults, userResults],
  );

  // Natija o'zgarsa tanlov ro'yxatdan tashqarida qolib ketmasligi kerak
  // (Enter hech narsa qilmasdi). Effekt bilan tuzatish kaskad render
  // bo'lardi, shuning uchun ko'rsatkich RENDER paytida chegaraga
  // qisiladi — holat ortiqcha yangilanmaydi.
  const safeIndex = rows.length === 0 ? 0 : Math.min(activeIndex, rows.length - 1);

  const go = (row) => {
    if (!row) return;

    if (row.kind === "page") {
      navigate(row.page.url);
      close();
      return;
    }
    // Boshqa filialdagi odam — kartasi joriy filialda yo'q (izoh yuqorida)
    if (!row.user.isCurrentBranch) return;
    navigate(`/users/${row.user.id}`);
    close();
  };

  const onKeyDown = (event) => {
    if (rows.length === 0) return;

    // Qisilgan ko'rsatkichdan hisoblanadi: ro'yxat qisqarib qolgan bo'lsa
    // eski (chegaradan tashqari) qiymatdan sakrab ketmasin
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((safeIndex + 1) % rows.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((safeIndex - 1 + rows.length) % rows.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(rows[safeIndex]);
    }
  };

  const showEmpty =
    trimmed.length >= MIN_QUERY_LENGTH && !isFetching && rows.length === 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Qidiruv maydoni */}
      <div className="relative">
        <Search
          size={18}
          strokeWidth={1.5}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          ref={inputRef}
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ism, username yoki sahifa nomi"
          className="h-12 w-full rounded-xl border bg-background pl-11 pr-10 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {isFetching && (
          <Loader2
            size={16}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground"
          />
        )}
      </div>

      {/* Ko'rsatma / natija */}
      <div className="min-h-[260px] max-h-[380px] overflow-y-auto hidden-scrollbar">
        {/* Bo'sh holat — quruq matn o'rniga TEZ HAVOLALAR: oyna ochilgan
            zahoti foyda beradi va qidiruv nimani topishini ko'rsatadi */}
        {trimmed.length === 0 && (
          <div>
            <p className="px-1 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Tez havolalar
            </p>
            {quickLinks.map((page, index) => {
              const Icon = page.icon;

              return (
                <button
                  type="button"
                  key={page.url}
                  onClick={() => go({ kind: "page", page })}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-accent/60",
                    index === 0 && "bg-accent/40",
                  )}
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
                    {Icon ? (
                      <Icon size={14} strokeWidth={1.5} />
                    ) : (
                      <Search size={14} strokeWidth={1.5} />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {page.title}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {page.section}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {isTooShort && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Kamida {MIN_QUERY_LENGTH} harf yozing
          </p>
        )}

        {showEmpty && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <span className="mb-2 flex size-10 items-center justify-center rounded-full bg-muted">
              <SearchX size={18} strokeWidth={1.5} className="text-muted-foreground" />
            </span>
            <p className="text-sm font-medium">Hech narsa topilmadi</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Boshqa ism, username yoki sahifa nomini sinab ko'ring
            </p>
          </div>
        )}

        {/* Sahifalar */}
        {pageResults.length > 0 && (
          <div className="mb-2">
            <p className="px-1 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Sahifalar
            </p>
            {pageResults.map((page, index) => {
              const Icon = page.icon;
              const isActive = safeIndex === index;

              return (
                <button
                  type="button"
                  key={page.url}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => go({ kind: "page", page })}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors",
                    isActive ? "bg-accent" : "hover:bg-accent/60",
                  )}
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
                    {Icon ? (
                      <Icon size={14} strokeWidth={1.5} />
                    ) : (
                      <Search size={14} strokeWidth={1.5} />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {page.title}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {page.section}
                    </span>
                  </span>
                  {isActive && (
                    <CornerDownLeft
                      size={14}
                      strokeWidth={1.5}
                      className="shrink-0 text-muted-foreground"
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Foydalanuvchilar */}
        {userResults.length > 0 && (
          <div>
            <p className="px-1 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Foydalanuvchilar
            </p>
            {userResults.map((user, index) => {
              const rowIndex = pageResults.length + index;
              const isActive = safeIndex === rowIndex;
              // Boshqa filialdagi odam kartasi joriy bazada yo'q
              const reachable = user.isCurrentBranch;

              return (
                <button
                  type="button"
                  key={user.id}
                  disabled={!reachable}
                  onMouseEnter={() => setActiveIndex(rowIndex)}
                  onClick={() => go({ kind: "user", user })}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors",
                    isActive && reachable && "bg-accent",
                    reachable
                      ? "hover:bg-accent/60"
                      : "cursor-default opacity-60",
                  )}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <UserRound size={15} strokeWidth={1.5} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-medium">
                        {user.fullName}
                      </span>
                      {/* Lavozim — alohida nishon: ism bilan bitta qatorda
                          yozilsa uzun ismlarda kesilib ketardi */}
                      <span className="shrink-0 rounded bg-muted px-1.5 py-px text-[10px] text-muted-foreground">
                        {user.roleLabel}
                      </span>
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      @{user.username}
                    </span>
                  </span>

                  {/* Filial — boshqa filialdagi odam uchun SABAB sifatida:
                      qator nega bosilmasligini aytadi */}
                  {!reachable && (
                    <span className="shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      {user.branchName}
                    </span>
                  )}
                  {isActive && reachable && (
                    <CornerDownLeft
                      size={14}
                      strokeWidth={1.5}
                      className="shrink-0 text-muted-foreground"
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Klaviatura ko'rsatmasi — o'q tugmalari borligi aks holda
          ko'rinmaydi (faqat kengaytirilgan oynada sig'adi) */}
      <div className="hidden items-center gap-3 border-t pt-2.5 text-[11px] text-muted-foreground sm:flex">
        <span className="flex items-center gap-1">
          <kbd className="rounded border bg-muted px-1 font-mono">↑↓</kbd>
          tanlash
        </span>
        <span className="flex items-center gap-1">
          <kbd className="rounded border bg-muted px-1 font-mono">↵</kbd>
          ochish
        </span>
        <span className="flex items-center gap-1">
          <kbd className="rounded border bg-muted px-1 font-mono">Esc</kbd>
          yopish
        </span>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
