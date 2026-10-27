// React
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";

// Router
import { useOutletContext, useSearchParams } from "react-router-dom";

// Icons
import { History, UserRound, WifiOff } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Input from "@/shared/components/ui/input/Input";
import Select from "@/shared/components/ui/select/Select";
import Table, { Tr, Td } from "@/shared/components/ui/Table";
import Pagination from "@/shared/components/ui/Pagination";
import EmptyState from "@/shared/components/ui/EmptyState";
import LoaderCard from "@/shared/components/ui/LoaderCard";
import FaceSnapshot from "../components/FaceSnapshot";

// Queries
import { faceIdQueries } from "../queries/faceId.queries";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateTimeUz } from "@/shared/utils/date.utils";

// Data
import {
  CHECK_KINDS,
  CHECK_KIND_FILTERS,
  CHECK_RESULTS,
  CHECK_RESULT_FILTERS,
} from "../data/faceId.data";

/**
 * URINISHLAR JURNALI — "kirish eshigida nima bo'ldi".
 *
 * ⚠️ MUVAFFAQIYATSIZ URINISHLAR HAM KO'RINADI va bu bo'limning asosiy
 * ma'nosi. "Nega kiosk meni tanimayapti" va "kim telefondagi rasm
 * bilan o'tishga urindi" degan savollarning javobi aynan shu ro'yxatda:
 * faqat muvaffaqiyatli qaydlarni ko'rsatish bu modulni nosozligi
 * topilmaydigan qora qutiga aylantirardi.
 *
 * ⚠️ VAQT `occurredAt` BO'YICHA — kadr HAQIQATDA olingan payt. Oflayn
 * navbatdan kelgan qayd kechagi vaqtga tegishli bo'lishi mumkin va
 * `createdAt` (serverga yetib kelgan payt) bo'yicha saralansa, kechagi
 * davomat bugungi qaydlar orasida turib qolardi.
 */
const EventsPage = () => {
  const { filterSlot, overview } = useOutletContext();

  const [params, setParams] = useSearchParams();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const result = params.get("result") || "all";
  const kind = params.get("kind") || "all";
  const kioskId = params.get("kioskId") || "";
  const page = Number(params.get("page")) || 1;

  const query = useMemo(
    () => ({
      result,
      kind,
      kioskId: kioskId || undefined,
      from: from || undefined,
      to: to || undefined,
      page,
      limit: 30,
    }),
    [result, kind, kioskId, from, to, page],
  );

  const { data, isPending } = useQuery(faceIdQueries.events(query));

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (!value || value === "all") next.delete(key);
    else next.set(key, value);
    if (key !== "page") next.delete("page");
    setParams(next, { replace: true });
  };

  const rows = data?.data ?? [];
  const summary = overview?.summary;

  const kioskOptions = [
    { value: "", label: "Barcha kiosklar" },
    ...(overview?.kiosks ?? []).map((k) => ({ value: k.id, label: k.name })),
  ];

  const columns = [
    { label: "", key: "snapshot", className: "w-14" },
    "Vaqt",
    "Odam",
    "Amal",
    "Natija",
    "Kiosk",
    { label: "O'xshashlik", align: "right" },
  ];

  return (
    <>
      {filterSlot &&
        createPortal(
          <>
            {/* ⚠️ `toISOString().split("T")[0]` — ISO qiymat, FORMAT emas:
                faqat `<input type="date">` va API parametri uchun
                (`.claude/rules/dates.md` §3). Ekranda esa
                `formatDateTimeUz` ishlatiladi. */}
            <Input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="h-10 w-full xs:w-36"
            />
            <Input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="h-10 w-full xs:w-36"
            />

            <Select
              value={kind}
              options={CHECK_KIND_FILTERS}
              onChange={(value) => setParam("kind", value)}
              triggerClassName="w-full xs:w-44"
            />

            <Select
              value={result}
              options={CHECK_RESULT_FILTERS}
              onChange={(value) => setParam("result", value)}
              triggerClassName="w-full xs:w-48"
            />

            <Select
              value={kioskId}
              options={kioskOptions}
              onChange={(value) => setParam("kioskId", value)}
              triggerClassName="w-full xs:w-44"
            />
          </>,
          filterSlot,
        )}

      {/* ── Bugungi yig'indi ── */}
      {summary && (
        <div className="grid gap-3 sm:grid-cols-4">
          <SummaryCard
            label="Belgilandi"
            value={summary.marked}
            tone="text-emerald-600"
            onClick={() => setParam("result", "marked")}
          />
          <SummaryCard
            label="Tanilmadi"
            value={summary.byResult?.no_match ?? 0}
            tone="text-amber-600"
            onClick={() => setParam("result", "no_match")}
          />
          <SummaryCard
            label="Tiriklik rad etdi"
            value={summary.byResult?.spoof ?? 0}
            tone="text-rose-600"
            onClick={() => setParam("result", "spoof")}
          />
          <SummaryCard
            label="Noaniq (o'xshash)"
            value={summary.byResult?.ambiguous ?? 0}
            tone="text-orange-600"
            onClick={() => setParam("result", "ambiguous")}
          />
        </div>
      )}

      {isPending ? (
        <LoaderCard />
      ) : rows.length === 0 ? (
        <div className="rounded-2xl bg-white">
          <EmptyState
            icon={History}
            title="Jurnal bo'sh"
            description="Bu filtrda urinish topilmadi. Kiosk orqali birinchi o'tish shu ro'yxatda darhol ko'rinadi."
          />
        </div>
      ) : (
        <>
          <Table columns={columns}>
            {rows.map((event) => {
              const resultMeta = CHECK_RESULTS[event.result] ?? {
                label: event.result,
                tone: "bg-gray-100 text-gray-600",
              };

              return (
                <Tr key={event.id}>
                  <Td>
                    <FaceSnapshot
                      path={event.snapshotUrl}
                      fallback="none"
                      className="size-9 rounded-lg"
                    />
                  </Td>

                  <Td className="text-[12.5px] text-gray-600">
                    {formatDateTimeUz(event.occurredAt)}
                    {event.offline && (
                      <span
                        className="ml-1.5 inline-flex items-center gap-1 text-[11px] text-amber-600"
                        title="Internet uzilgan paytda yozilgan, keyin yuborilgan"
                      >
                        <WifiOff className="size-3" />
                        oflayn
                      </span>
                    )}
                  </Td>

                  <Td nowrap={false}>
                    {event.userName ? (
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900">{event.userName}</p>
                        <p className="text-[11.5px] text-gray-500">
                          {event.userRole === "student" ? "O'quvchi" : "Xodim"}
                        </p>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[12.5px] text-gray-400">
                        <UserRound className="size-3.5" />
                        Aniqlanmagan
                      </span>
                    )}
                  </Td>

                  <Td className="text-[12.5px] text-gray-600">
                    {CHECK_KINDS[event.kind]?.label ?? event.kind}
                  </Td>

                  <Td nowrap={false}>
                    <span
                      className={cn(
                        "inline-block rounded-full px-2.5 py-1 text-[12px] font-medium",
                        resultMeta.tone,
                      )}
                    >
                      {resultMeta.label}
                    </span>
                    {event.message && (
                      <p className="mt-1 max-w-xs text-[11.5px] leading-snug text-gray-500">
                        {event.message}
                      </p>
                    )}
                  </Td>

                  <Td className="text-[12.5px] text-gray-500">
                    {event.kioskName || "—"}
                  </Td>

                  <Td align="right" className="text-[12.5px]">
                    {event.scorePercent != null ? (
                      <>
                        <span className="font-medium text-gray-900">
                          {event.scorePercent}%
                        </span>
                        {/* ⚠️ `margin` ko'rsatiladi: "noaniq" natijasini
                            tushunish uchun aynan shu raqam kerak —
                            birinchi va ikkinchi o'rin qanchalik yaqin
                            bo'lgani. */}
                        {event.margin != null && (
                          <p className="mt-0.5 text-[11px] text-gray-400">
                            farq {Math.round(Math.max(0, event.margin) * 1000) / 10}%
                          </p>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </Td>
                </Tr>
              );
            })}
          </Table>

          {data.pagination?.totalPages > 1 && (
            <Pagination
              className="mt-4"
              currentPage={page}
              totalPages={data.pagination.totalPages}
              hasNextPage={data.pagination.hasNextPage}
              hasPrevPage={data.pagination.hasPrevPage}
              onPageChange={(next) => setParam("page", String(next))}
            />
          )}
        </>
      )}
    </>
  );
};

const SummaryCard = ({ label, value, tone, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="rounded-2xl bg-white p-4 text-left transition-colors hover:bg-gray-50"
  >
    <p className="text-[12px] text-gray-500">{label}</p>
    <p className={cn("mt-1 text-2xl font-semibold", tone)}>{value}</p>
  </button>
);

export default EventsPage;
