// React
import { useState } from "react";
import { createPortal } from "react-dom";

// Router
import { useOutletContext } from "react-router-dom";

// Toast
import { toast } from "sonner";

// Icons
import {
  Archive,
  ArchiveRestore,
  Check,
  LayoutGrid,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Button from "@/shared/components/ui/button/Button";
import ConfirmPopover from "@/shared/components/ui/ConfirmPopover";
import Input from "@/shared/components/ui/input/Input";
import Pagination from "@/shared/components/ui/Pagination";
import Select from "@/shared/components/ui/select/Select";
import Panel from "../components/Panel";
import { GuardTable, GuardRow, GuardCell } from "../components/GuardTable";
import AppModal from "../components/AppModal";

// Hooks
import useModal from "@/shared/hooks/useModal";
import useDebounce from "@/shared/hooks/useDebounce";

// Utils
import { cn } from "@/shared/utils/cn";

// Tokens, data & queries
import { CHIP, T } from "../data/guard.tokens";
import { APP_CATEGORIES, categoryLabel, formatMinutes } from "../data/devices.data";
import { devicesQueries } from "../queries/devices.queries";
import {
  useArchiveApp,
  useBulkArchiveApps,
  useRestoreApp,
} from "../queries/devices.mutations";

const CATEGORY_FILTERS = [{ value: "all", label: "Barcha turlar" }, ...APP_CATEGORIES];

/**
 * ILOVALAR KATALOGI — "biz qaysi ilovalar haqida gapira olamiz".
 *
 * ⚠️ KATALOGNI QURILMA TO'LDIRADI, admin emas. Paket nomini
 * (`com.google.android.youtube`) yoddan yozib bo'lmaydi — telefon esa uni
 * biladi va o'rnatilgan ilovalar ro'yxatini yuboradi.
 *
 * ⚠️ "YANGI ANIQLANGAN" TARQALGANLIK BO'YICHA SARALANADI, alifbo bo'yicha
 * EMAS. Butun maktab ulanganda bu ro'yxatga bir necha yuz ilova tushadi;
 * alifbo tartibida adminga kerak bo'lgan 20 tasi quyruqda yo'qolib
 * ketardi. Eng ko'p qurilmada uchragani tepada turadi va qolganini
 * ommaviy arxivlab tashlash mumkin.
 *
 * ⚠️ HAMMASINI NOMLASH SHART EMAS: oq ro'yxat siyosatida nomlanmagan
 * ilova allaqachon bloklangan. Nomlash faqat ruxsat bermoqchi yoki vaqt
 * chegarasi qo'ymoqchi bo'lgan ilovalar uchun kerak.
 */
const AppsPage = () => {
  const { filterSlot } = useOutletContext();
  const { openModal } = useModal();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [archived, setArchived] = useState(false);
  const [page, setPage] = useState(1);
  const debounced = useDebounce(search, 300);

  /**
   * ⚠️ FILTR O'ZGARGANDA BIRINCHI SAHIFAGA QAYTAMIZ va buni EFFEKT
   * QILMAYMIZ: sahifani tiklash — filtrni o'zgartirgan HODISANING
   * qismi (`DevicesPage` bilan AYNI naqsh). Usiz 5-sahifada turib
   * qidirilganda ro'yxat bo'sh ko'rinardi.
   */
  const onFilter = (apply) => (value) => {
    apply(value);
    setPage(1);
  };

  const { data, isLoading, isError } = useQuery(
    devicesQueries.apps({
      page,
      limit: 40,
      search: debounced || undefined,
      category,
      archived: archived ? "true" : undefined,
    }),
  );

  const apps = data?.data ?? [];
  const discovered = data?.discovered ?? [];

  return (
    <div className="flex flex-col gap-3">
      {filterSlot &&
        createPortal(
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => onFilter(setSearch)(e.target.value)}
                placeholder="Ilova nomi yoki paketi"
                className="h-9 w-52 pl-8 text-[12.5px]"
              />
            </div>
            <Select
              triggerClassName="h-9 min-w-36"
              value={category}
              options={CATEGORY_FILTERS}
              onChange={onFilter(setCategory)}
            />
            <Button
              size="sm"
              variant={archived ? "default" : "outline"}
              className="h-9"
              onClick={() => onFilter(setArchived)(!archived)}
            >
              <Archive className="size-3.5" />
              Arxiv
            </Button>
            <Button size="sm" className="h-9" onClick={() => openModal("deviceApp", { app: null })}>
              <Plus className="size-3.5" />
              Ilova qo'shish
            </Button>
          </div>,
          filterSlot,
        )}

      {!archived && discovered.length > 0 && (
        <DiscoveredPanel apps={discovered} total={data?.discoveredTotal ?? 0} />
      )}

      <Panel
        title={archived ? "Arxivlangan ilovalar" : "Katalog"}
        hint={`${data?.pagination?.total ?? 0} ta ilova · siyosat muharririda shu ro'yxatdan tanlanadi`}
        icon={LayoutGrid}
        tone="allowed"
        isLoading={isLoading}
        isError={isError}
        isEmpty={!isLoading && apps.length === 0}
        emptyText={
          archived
            ? "Arxivlangan ilova yo'q."
            : "Katalog bo'sh. Ilovani qo'lda qo'shing yoki o'quvchi telefonini ulang — ilova o'rnatilgan dasturlar ro'yxatini o'zi yuboradi."
        }
        padding="flush"
      >
        <div className="px-5 pb-5">
          <GuardTable
            minWidth={880}
            template="minmax(170px,1.2fr) 140px 120px minmax(180px,1fr) minmax(180px,1fr) 90px"
            columns={[
              { label: "Ilova" },
              { label: "Turi" },
              { label: "Qurilmalarda" },
              { label: "Android" },
              { label: "iOS" },
              { label: "Amallar", align: "right" },
            ]}
          >
            {apps.map((app, index) => (
              <AppRow key={app.id} app={app} index={index} />
            ))}
          </GuardTable>

          {data?.pagination?.totalPages > 1 && (
            <Pagination
              className="mt-4"
              currentPage={page}
              totalPages={data.pagination.totalPages}
              hasNextPage={data.pagination.hasNextPage}
              hasPrevPage={data.pagination.hasPrevPage}
              onPageChange={setPage}
            />
          )}
        </div>
      </Panel>

      <AppModal />
    </div>
  );
};

/* ─────────────────────── YANGI ANIQLANGAN ─────────────────────── */

/**
 * ⚠️ OMMAVIY TANLASH VA ARXIVLASH — ro'yxat ish ro'yxati bo'lgani uchun.
 * Admin kerakli 20 tasini nomlaydi, qolgan 200 tasini bir bosishda
 * arxivlaydi. Bittalab arxivlash 200 marta tasdiq oynasini ochish
 * degani bo'lardi va hech kim buni oxirigacha qilmasdi.
 */
const DiscoveredPanel = ({ apps, total }) => {
  const { openModal } = useModal();
  const [selected, setSelected] = useState(() => new Set());
  const { mutate: bulkArchive, isPending } = useBulkArchiveApps();

  const toggle = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleBulk = () =>
    bulkArchive([...selected], {
      onSuccess: (res) => {
        setSelected(new Set());
        toast.success(res?.message || "Arxivlandi");
      },
      onError: (err) => toast.error(err.response?.data?.message || "Arxivlanmadi"),
    });

  return (
    <Panel
      title="Yangi aniqlangan ilovalar"
      hint={`${total} ta · telefonlarda eng ko'p uchragani tepada. Kerakligini nomlang, qolganini arxivlang`}
      icon={Sparkles}
      tone="limited"
      padding="flush"
      action={
        selected.size > 0 && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="text-[11.5px] text-slate-400 hover:text-slate-600"
            >
              Bekor
            </button>
            <ConfirmPopover
              title={`${selected.size} ta ilovani arxivlash`}
              description="Ular ro'yxatdan chiqadi. Kerak bo'lsa «Arxiv» dan qaytarish mumkin."
              confirmLabel="Arxivlash"
              onConfirm={handleBulk}
            >
              <Button size="sm" variant="outline" className="h-7" disabled={isPending}>
                <Archive className="size-3" />
                {selected.size} tasini arxivlash
              </Button>
            </ConfirmPopover>
          </div>
        )
      }
    >
      <ul className="grid grid-cols-1 gap-1.5 px-5 pb-5 sm:grid-cols-2 xl:grid-cols-3">
        {apps.map((app) => {
          const isSelected = selected.has(app.id);
          return (
            <li key={app.id}>
              <div
                className={cn(
                  "flex items-center gap-2 rounded-xl px-2.5 py-2 transition-colors",
                  isSelected ? "bg-slate-900/5 ring-1 ring-slate-300" : "bg-slate-50/80",
                )}
              >
                <button
                  type="button"
                  onClick={() => toggle(app.id)}
                  aria-label="Tanlash"
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-[5px] ring-1 transition-colors",
                    isSelected ? "bg-slate-900 ring-slate-900" : "bg-white ring-slate-300",
                  )}
                >
                  {isSelected && <Check className="size-3 text-white" strokeWidth={3} />}
                </button>

                <button
                  type="button"
                  onClick={() => openModal("deviceApp", { app })}
                  className="min-w-0 flex-1 text-left"
                  title={app.androidPackage || app.iosBundleId}
                >
                  <span className={cn(T.tdName, "block truncate")}>{app.name}</span>
                  <span className={cn(T.mono, "block truncate")}>
                    {app.androidPackage || app.iosBundleId}
                  </span>
                </button>

                {/* Tarqalganlik — ro'yxat aynan shu bo'yicha saralangan */}
                <span
                  className={cn(CHIP, "shrink-0 bg-white text-slate-600 ring-1 ring-slate-200")}
                  title={`${app.usage.devices} ta qurilmada · ${formatMinutes(app.usage.minutes)}`}
                >
                  <Smartphone className="size-2.5" strokeWidth={2.4} />
                  {app.usage.devices}
                </span>

                <button
                  type="button"
                  onClick={() => openModal("deviceApp", { app })}
                  className="flex size-6 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white hover:text-slate-700"
                  aria-label="Nomlash"
                >
                  <Pencil className="size-3" strokeWidth={2} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
};

/* ─────────────────────── KATALOG QATORI ─────────────────────── */

const AppRow = ({ app, index }) => {
  const { openModal } = useModal();
  const { mutate: archiveApp } = useArchiveApp();
  const { mutate: restoreApp } = useRestoreApp();

  return (
    <GuardRow index={index}>
      <GuardCell>
        <div className="flex items-center gap-2">
          <span className={cn(T.tdName, "truncate")}>{app.name}</span>
          {app.isEssential && (
            <span className={cn(CHIP, "shrink-0 bg-emerald-50 text-emerald-700")}>
              <ShieldCheck className="size-2.5" strokeWidth={2.4} />
              Majburiy
            </span>
          )}
        </div>
      </GuardCell>

      <GuardCell>
        <span className={cn(CHIP, "bg-slate-100 text-slate-600")}>
          {categoryLabel(app.category)}
        </span>
      </GuardCell>

      <GuardCell>
        {app.usage?.devices > 0 ? (
          <span className={cn(T.td, "tabular-nums")} title={formatMinutes(app.usage.minutes)}>
            {app.usage.devices} ta
          </span>
        ) : (
          <span className={T.hint}>—</span>
        )}
      </GuardCell>

      <GuardCell>
        <span className={cn(T.mono, "block truncate", !app.androidPackage && "text-amber-600")}>
          {app.androidPackage || "kiritilmagan"}
        </span>
      </GuardCell>

      <GuardCell>
        <span className={cn(T.mono, "block truncate", !app.iosBundleId && "text-amber-600")}>
          {app.iosBundleId || "kiritilmagan"}
        </span>
      </GuardCell>

      <GuardCell align="right">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => openModal("deviceApp", { app })}
            className="flex size-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Tahrirlash"
          >
            <Pencil className="size-3.5" strokeWidth={2} />
          </button>

          {app.isArchived ? (
            <button
              type="button"
              onClick={() => restoreApp(app.id)}
              className="flex size-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label="Arxivdan qaytarish"
            >
              <ArchiveRestore className="size-3.5" strokeWidth={2} />
            </button>
          ) : (
            <ConfirmPopover
              title="Ilovani arxivlash"
              description="Siyosatda ishlatilayotgan ilova arxivlanmaydi — avval siyosatdan olib tashlang."
              confirmLabel="Arxivlash"
              onConfirm={() =>
                archiveApp(app.id, {
                  onSuccess: () => toast.success("Ilova arxivlandi"),
                  onError: (err) =>
                    toast.error(err.response?.data?.message || "Arxivlanmadi"),
                })
              }
            >
              <button
                type="button"
                className="flex size-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                aria-label="Arxivlash"
              >
                <Archive className="size-3.5" strokeWidth={2} />
              </button>
            </ConfirmPopover>
          )}
        </div>
      </GuardCell>
    </GuardRow>
  );
};

export default AppsPage;
