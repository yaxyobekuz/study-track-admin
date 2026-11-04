// React
import { useMemo, useState } from "react";

// Icons
import { Ban, Coins, Search, Unlock, Wallet } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Can from "@/shared/components/guards/Can";
import Card from "@/shared/components/ui/Card";
import Table, { Td, Tr } from "@/shared/components/ui/Table";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import SelectSearch from "@/shared/components/ui/select/SelectSearch";
import Pagination from "@/shared/components/ui/Pagination";
import EmptyState from "@/shared/components/ui/EmptyState";
import { BlockCoinsModal, UnblockCoinsModal } from "../components/CoinBlockModals";

// Hooks
import useModal from "@/shared/hooks/useModal";
import useDebounce from "@/shared/hooks/useDebounce";
import usePermissions from "@/shared/hooks/usePermissions";

// Utils
import { cn } from "@/shared/utils/cn";

// Data & queries
import {
  BLOCK_COLUMNS,
  BLOCK_STATUS_OPTIONS,
  HISTORY_COLUMNS,
} from "../data/coin-blocks.data";
import { coinBlocksQueries } from "../queries/coin-blocks.queries";
import { classesQueries } from "@/features/classes/queries/classes.queries";

/**
 * TANGA CHEKLOVI — registr (Tangalar → "Tanga cheklovi").
 *
 * Qarzdor o'quvchiga tanga berish to'xtatiladi: kunlik baho uchun ham,
 * haftalik bonus ham, test mavsumi mukofoti ham, qo'lda berish ham
 * (darvoza serverda bitta joyda — `coinBlock.service.js`).
 *
 * ⚠️ RO'YXATDA IKKI XIL QARZ TURADI va ikkalasi ham kerak:
 * "Cheklanganda" — muhrlangan summa ("nega cheklangan edi"), "Hozirgi" —
 * jonli qarz ("ochish kerakmi"). Faqat birinchisi ko'rsatilsa, qarzini
 * to'lagan o'quvchi ro'yxatda abadiy qolib ketardi.
 *
 * ⚠️ OCHISH YO'LI RO'YXATDA BO'LISHI SHART: usiz "adashib cheklab qo'ydim"
 * holatining yagona yechimi bazaga kirish bo'lardi (`DeviceUnlock`
 * registridagi AYNI mulohaza).
 */
const CoinBlocksPage = () => {
  const { openModal } = useModal();
  const { can } = usePermissions();
  const allowed = can("coins.block");

  const [status, setStatus] = useState("active");
  const [search, setSearch] = useState("");
  const [classId, setClassId] = useState("");
  const [page, setPage] = useState(1);
  const [picked, setPicked] = useState(() => new Set());

  const debouncedSearch = useDebounce(search.trim(), 400);
  const isActiveTab = status === "active";

  const { data: classes = [] } = useQuery({ ...classesQueries.list(), enabled: allowed });

  const { data, isLoading } = useQuery({
    ...coinBlocksQueries.list({
      page,
      limit: 20,
      status,
      ...(classId ? { classId } : {}),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    }),
    enabled: allowed,
  });

  const { data: summary } = useQuery({ ...coinBlocksQueries.summary(), enabled: allowed });

  // ⚠️ `?? []` har renderda YANGI massiv qaytaradi va pastdagi `useMemo`
  // lar o'z-o'zidan qayta hisoblanib turardi — shuning uchun bitta joyda
  // memolanadi.
  const rows = useMemo(() => data?.data ?? [], [data]);
  const pagination = data?.pagination;

  // ⚠️ Tanlov FAQAT ko'rinib turgan qatorlardan yig'iladi: sahifa yoki
  // filtr almashsa, ro'yxatdan chiqib ketgan qator ommaviy ochishga
  // tushib qolmasligi kerak.
  const visibleIds = useMemo(() => new Set(rows.map((r) => r.id)), [rows]);
  const selected = useMemo(() => rows.filter((r) => picked.has(r.id)), [rows, picked]);
  const allSelected = rows.length > 0 && rows.every((r) => picked.has(r.id));

  const toggle = (id) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () =>
    setPicked((prev) => {
      const next = new Set(prev);
      for (const row of rows) {
        if (allSelected) next.delete(row.id);
        else next.add(row.id);
      }
      return next;
    });

  const resetSelection = () => setPicked(new Set());

  const changeFilter = (apply) => {
    apply();
    setPage(1);
    resetSelection();
  };

  const openBlock = () => openModal("blockCoins");
  const openUnblock = (blocks) => openModal("unblockCoins", { blocks });

  if (!allowed) {
    return (
      <Card className="p-0 xs:p-0">
        <EmptyState
          icon={Ban}
          title="Ruxsat yo'q"
          description="Tanga cheklovini ko'rish va boshqarish uchun alohida ruxsat kerak."
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Select
            triggerClassName="min-w-48"
            value={status}
            options={BLOCK_STATUS_OPTIONS}
            onChange={(next) => changeFilter(() => setStatus(next))}
          />

          <SelectSearch
            idValues
            value={classId}
            triggerClassName="min-w-40"
            onChange={(next) => changeFilter(() => setClassId(next))}
            options={[
              { label: "Barcha sinflar", value: "" },
              ...classes.map((c) => ({ label: c.name, value: c.id })),
            ]}
          />

          <label className="flex h-10 items-center gap-2 rounded-xl border border-gray-200 px-3">
            <Search className="size-4 text-gray-400" />
            <input
              value={search}
              onChange={(event) => changeFilter(() => setSearch(event.target.value))}
              placeholder="O'quvchi yoki login"
              className="w-44 bg-transparent text-sm outline-none"
            />
          </label>
        </div>

        <Can do="coins.block">
          <Button variant="danger" onClick={openBlock}>
            <Ban />
            Tangani taqiqlash
          </Button>
        </Can>
      </div>

      {summary && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryTile
            icon={Ban}
            label="Tanga berish taqiqlangan"
            value={`${summary.blockedCount} o'quvchi`}
            valueClassName="text-red-600"
            sub="Hech bir ekrandan tanga tushmaydi"
          />
          <SummaryTile
            icon={Wallet}
            label="Ularning hozirgi qarzi"
            value={summary.debtNowLabel}
            sub="Qarzdorlar registri bilan ayni manbadan"
          />
          <SummaryTile
            icon={Unlock}
            label="Qarzi yopilgan"
            value={`${summary.clearedCount} o'quvchi`}
            valueClassName={summary.clearedCount > 0 ? "text-emerald-600" : "text-gray-900"}
            sub={
              summary.clearedCount > 0
                ? "Cheklov hali turibdi — ochish kutilmoqda"
                : "Ochilishi kerak bo'lgan cheklov yo'q"
            }
          />
        </div>
      )}

      {/* OMMAVIY OCHISH — ro'yxatdan bir nechta o'quvchini birdaniga */}
      {isActiveTab && selected.length > 0 && (
        <Card className="flex flex-wrap items-center justify-between gap-3 border-primary/30 bg-primary/5">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">{selected.length} ta cheklov</span> tanlandi
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetSelection}>
              Bekor qilish
            </Button>
            <Can do="coins.block">
              <Button onClick={() => openUnblock(selected)}>
                <Unlock />
                Tangani ochish
              </Button>
            </Can>
          </div>
        </Card>
      )}

      {isLoading ? (
        <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>
      ) : rows.length === 0 ? (
        <Card className="p-0 xs:p-0">
          <EmptyState
            icon={Coins}
            title={isActiveTab ? "Cheklangan o'quvchi yo'q" : "Tarix bo'sh"}
            description={
              isActiveTab
                ? "Oylik to'lovini to'lamagan o'quvchilarga tanga berishni to'xtatish mumkin: ro'yxatdan bir nechta o'quvchini birdaniga tanlab, sababi bilan taqiqlanadi."
                : "Hali birorta cheklov olib tashlanmagan."
            }
            action={
              isActiveTab ? (
                <Can do="coins.block">
                  <Button variant="danger" onClick={openBlock}>
                    <Ban />
                    Tangani taqiqlash
                  </Button>
                </Can>
              ) : null
            }
          />
        </Card>
      ) : (
        <>
          <Table
            columns={
              isActiveTab
                ? [
                    {
                      key: "pick",
                      label: (
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={toggleAll}
                          title="Shu sahifadagilarni belgilash"
                          className="size-4 accent-white"
                        />
                      ),
                    },
                    ...BLOCK_COLUMNS,
                  ]
                : HISTORY_COLUMNS
            }
          >
            {rows.map((row) =>
              isActiveTab ? (
                <Tr key={row.id}>
                  <Td>
                    <input
                      type="checkbox"
                      checked={picked.has(row.id) && visibleIds.has(row.id)}
                      onChange={() => toggle(row.id)}
                      className="size-4 accent-primary"
                    />
                  </Td>

                  <Td className="font-medium text-gray-900">
                    {row.fullName}
                    <span className="block text-xs font-normal text-gray-400">
                      {[row.className, row.username].filter(Boolean).join(" · ") || "—"}
                      {row.isArchived && " · arxivlangan"}
                    </span>
                  </Td>

                  <Td nowrap={false} className="text-gray-700">
                    {row.reason}
                    {row.note && <span className="block text-xs text-gray-400">{row.note}</span>}
                  </Td>

                  <Td align="right" className="text-gray-700">
                    {row.debtAtBlockLabel}
                    {row.debtMonthCount > 0 && (
                      <span className="block text-xs text-gray-400">
                        {row.debtMonthCount} oy
                        {row.oldestDebtMonthLabel ? ` · ${row.oldestDebtMonthLabel} dan` : ""}
                      </span>
                    )}
                  </Td>

                  {/* JONLI qarz — "ochish kerakmi" degan savolga javob */}
                  <Td align="right">
                    {row.debtCleared ? (
                      <span
                        className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"
                        title="Qarzi yopilgan — cheklovni olib tashlash mumkin"
                      >
                        Qarzi yo'q
                      </span>
                    ) : (
                      <span className="font-medium text-red-600">
                        {row.debtNowLabel}
                        {row.debtNowMonthCount > 0 && (
                          <span className="block text-xs font-normal text-gray-400">
                            {row.debtNowMonthCount} oy
                          </span>
                        )}
                      </span>
                    )}
                  </Td>

                  <Td align="right" className="text-gray-500">
                    {row.coinBalance}
                  </Td>

                  <Td className="text-gray-500">{row.createdAtLabel}</Td>

                  <Td align="right">
                    <Can do="coins.block">
                      <button
                        title="Tangani ochish"
                        onClick={() => openUnblock([row])}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600"
                      >
                        <Unlock className="size-3.5" />
                      </button>
                    </Can>
                  </Td>
                </Tr>
              ) : (
                <Tr key={row.id} className="opacity-80">
                  <Td className="font-medium text-gray-900">
                    {row.fullName}
                    <span className="block text-xs font-normal text-gray-400">
                      {[row.className, row.username].filter(Boolean).join(" · ") || "—"}
                    </span>
                  </Td>
                  <Td nowrap={false} className="text-gray-700">
                    {row.reason}
                    {row.note && <span className="block text-xs text-gray-400">{row.note}</span>}
                  </Td>
                  <Td align="right" className="text-gray-700">
                    {row.debtAtBlockLabel}
                  </Td>
                  <Td className="text-gray-500">{row.createdAtLabel}</Td>
                  <Td className="text-gray-500">{row.revokedAtLabel ?? "—"}</Td>
                  <Td nowrap={false} className="text-gray-700">
                    {row.revokeReason || "—"}
                  </Td>
                </Tr>
              ),
            )}
          </Table>

          {pagination?.totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={pagination.totalPages}
              hasNextPage={page < pagination.totalPages}
              hasPrevPage={page > 1}
              onPageChange={(next) => {
                setPage(next);
                resetSelection();
              }}
            />
          )}
        </>
      )}

      <BlockCoinsModal />
      <UnblockCoinsModal />
    </div>
  );
};

const SummaryTile = ({ icon: Icon, label, value, sub, valueClassName = "text-gray-900" }) => (
  <Card>
    <p className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
      {Icon && <Icon className="size-3.5" />}
      {label}
    </p>
    <p className={cn("mt-1 text-xl font-bold", valueClassName)}>{value}</p>
    {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
  </Card>
);

export default CoinBlocksPage;
