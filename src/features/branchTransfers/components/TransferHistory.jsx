// React
import { useState } from "react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { ArrowRight, History, Search, TriangleAlert } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Hooks & queries
import useDebounce from "@/shared/hooks/useDebounce";
import { branchTransfersQueries } from "../queries/branchTransfers.queries";

// Components
import Card from "@/shared/components/ui/Card";
import Input from "@/shared/components/ui/input/Input";
import Select from "@/shared/components/ui/select/Select";
import Button from "@/shared/components/ui/button/Button";
import EmptyState from "@/shared/components/ui/EmptyState";
import LoaderCard from "@/shared/components/ui/LoaderCard";
import Pagination from "@/shared/components/ui/Pagination";

// Data
import {
  DIRECTION_OPTIONS,
  HISTORY_PAGE_SIZE,
  KIND_FILTER_OPTIONS,
  KIND_LABELS,
  MODE_LABELS,
  TRANSFER_STATUSES,
} from "../data/branchTransfers.data";

/**
 * Ko'chirishlar jurnali — kim, qachon, qayerdan, qayerga, nega va kim
 * ko'chdi. Tranzaksiyadan keyingi qadam yiqilgan bo'lsa ("E'tibor talab")
 * nima qo'lda hal qilinishi kerakligi shu yerda turadi.
 */
const TransferHistory = () => {
  const [page, setPage] = useState(1);
  const [kind, setKind] = useState("all");
  const [direction, setDirection] = useState("all");
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search.trim(), 400);
  const [openId, setOpenId] = useState(null);

  const { data, isLoading, isError, refetch } = useQuery(
    branchTransfersQueries.list({
      page,
      limit: HISTORY_PAGE_SIZE,
      ...(kind !== "all" && { kind }),
      ...(direction !== "all" && { direction }),
      ...(debounced && { search: debounced }),
    }),
  );
  const rows = data?.data ?? [];

  const filter = (fn) => (value) => {
    fn(value);
    setPage(1);
  };

  return (
    <Card className="space-y-3">
      <div className="flex flex-col gap-2 md:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            value={search}
            className="pl-9"
            placeholder="Ism yoki sinf"
            onChange={(e) => filter(setSearch)(e.target.value)}
          />
        </div>
        <Select value={kind} options={KIND_FILTER_OPTIONS} onChange={filter(setKind)} triggerClassName="md:w-44" />
        <Select value={direction} options={DIRECTION_OPTIONS} onChange={filter(setDirection)} triggerClassName="md:w-44" />
      </div>

      {isLoading ? (
        <LoaderCard title="Yuklanmoqda..." />
      ) : isError ? (
        <EmptyState
          icon={History}
          title="Jurnalni yuklab bo'lmadi"
          action={<Button onClick={() => refetch()}>Qayta urinish</Button>}
        />
      ) : rows.length === 0 ? (
        <EmptyState icon={History} title="Ko'chirishlar hali yo'q" />
      ) : (
        <div className="space-y-2">
          {rows.map((row) => {
            const status = TRANSFER_STATUSES[row.status] ?? TRANSFER_STATUSES.completed;
            const isOpen = openId === row.id;
            const people = row.items.filter((i) => i.subjectType === "user");
            const classes = row.items.filter((i) => i.subjectType === "class");
            const warned = row.items.filter((i) => i.warnings?.length);
            return (
              <div key={row.id} className="rounded-xl border border-gray-100">
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : row.id)}
                  className="flex w-full flex-col gap-1.5 px-3.5 py-3 text-left sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="min-w-0 space-y-0.5">
                    <span className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-gray-900">
                      {row.source.name}
                      <ArrowRight className="size-3.5 text-gray-400" />
                      {row.target.name}
                      <span className="font-normal text-gray-500">
                        · {KIND_LABELS[row.kind]} · {MODE_LABELS[row.mode]}
                      </span>
                    </span>
                    <span className="block truncate text-xs text-gray-500">
                      {classes.length > 0 && `${classes.map((c) => c.label).join(", ")} · `}
                      {people.length} ta · {row.effectiveDateLabel} dan · {row.createdBy.name || "—"},{" "}
                      {row.createdAtLabel}
                    </span>
                  </span>
                  <span className={cn("shrink-0 self-start rounded-full border px-2.5 py-0.5 text-[11px] font-medium sm:self-center", status.className)}>
                    {status.label}
                  </span>
                </button>

                {isOpen && (
                  <div className="space-y-2 border-t border-gray-100 px-3.5 py-3 text-sm">
                    <p className="text-gray-700">
                      <span className="text-gray-500">Sabab: </span>
                      {row.reason}
                    </p>
                    {warned.length > 0 && (
                      <div className="space-y-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                        {warned.map((item) =>
                          item.warnings.map((w) => (
                            <p key={`${item.id}-${w}`} className="flex gap-1.5">
                              <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
                              <span>
                                <b>{item.label}:</b> {w}
                              </span>
                            </p>
                          )),
                        )}
                      </div>
                    )}
                    <p className="text-xs leading-relaxed text-gray-600">
                      {people.map((p) => p.label).join(", ")}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {data?.pagination && (
        <Pagination
          currentPage={page}
          onPageChange={setPage}
          totalPages={data.pagination.totalPages}
          hasNextPage={data.pagination.hasNextPage}
          hasPrevPage={data.pagination.hasPrevPage}
          showPageNumbers={false}
        />
      )}
    </Card>
  );
};

export default TransferHistory;
