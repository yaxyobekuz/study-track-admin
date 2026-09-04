// React
import { useState } from "react";

// Icons
import {
  Boxes,
  Plus,
  Wrench,
  Trash2,
  ArrowLeftRight,
  SlidersHorizontal,
  History,
  User,
} from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Can from "@/shared/components/guards/Can";
import Card from "@/shared/components/ui/Card";
import Table, { Td, Tr } from "@/shared/components/ui/Table";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import Pagination from "@/shared/components/ui/Pagination";
import EmptyState from "@/shared/components/ui/EmptyState";
import { TabsButtons } from "@/shared/components/ui/tabs/Tabs";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateUz } from "@/shared/utils/date.utils";

// Data & queries
import {
  MOVEMENT_COLUMNS,
  STOCK_COLUMNS,
  TRANSFER_COLUMNS,
} from "../data/inventory.data";
import { inventoryQueries } from "../queries/inventory.queries";

/**
 * XATLOV — "qaysi xonada nima va nechta bor".
 *
 * Ikkinchi tab — MIQDOR DAFTARI: har bir o'zgarishning append-only
 * registri. U kassa daftarining aynan ko'zgusi va xuddi shunday
 * tahrirlanmaydi: xato yozuv teskari qator bilan qaytariladi.
 */
const StockPage = () => {
  const [tab, setTab] = useState("stock");

  const tabs = [
    { value: "stock", label: "Xatlov", content: <StockList /> },
    // O'tkazmalar HARAKATLAR TARIXIDAN alohida tab: daftarda bitta akt
    // to'rtta bog'lanmagan qator bo'lib ko'rinardi ("10 ta parta chiqdi",
    // "10 ta parta kirdi", ...) va "kimga topshirildi" umuman ko'rinmasdi
    { value: "transfers", label: "O'tkazmalar", content: <TransferList /> },
    { value: "movements", label: "Harakatlar tarixi", content: <MovementList /> },
  ];

  return (
    <div className="space-y-4">
      <TabsButtons items={tabs} value={tab} onChange={setTab} contentClassName="mt-4" />
    </div>
  );
};

// ─────────────────────────────────────────────
// Xatlov
// ─────────────────────────────────────────────

const StockList = () => {
  const { openModal } = useModal();

  const [page, setPage] = useState(1);
  const [locationId, setLocationId] = useState("");
  const [onlyBroken, setOnlyBroken] = useState(false);

  const { data, isLoading } = useQuery(
    inventoryQueries.stocks({
      page,
      limit: 30,
      ...(locationId ? { locationId } : {}),
      ...(onlyBroken ? { onlyBroken: "true" } : {}),
    }),
  );

  const { data: locations = [] } = useQuery(inventoryQueries.activeLocations());

  const items = data?.data ?? [];
  const isFiltered = Boolean(locationId || onlyBroken);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Select
            triggerClassName="min-w-48"
            value={locationId}
            placeholder="Barcha xonalar"
            onChange={(v) => {
              setLocationId(v);
              setPage(1);
            }}
            options={[
              { label: "Barcha xonalar", value: "" },
              ...locations.map((l) => ({ label: l.name, value: l.id })),
            ]}
          />

          <Button
            variant={onlyBroken ? "default" : "outline"}
            onClick={() => {
              setOnlyBroken((v) => !v);
              setPage(1);
            }}
          >
            <Wrench />
            Faqat yaroqsizlar
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Can do="inventory.transfer">
            <Button variant="outline" onClick={() => openModal("inventoryTransfer", {})}>
              <ArrowLeftRight />
              O'tkazish
            </Button>
          </Can>

          <Can do="inventory.stock">
            <Button onClick={() => openModal("inventoryAddStock", {})}>
              <Plus />
              Jihoz kiritish
            </Button>
          </Can>
        </div>
      </div>

      {data?.totals && (
        <div className="grid gap-3 sm:grid-cols-3">
          <SummaryCard label="Jami jihoz" value={`${data.totals.quantity} ta`} />
          <SummaryCard
            label="Yaroqli"
            value={`${data.totals.serviceableQuantity} ta`}
            className="text-green-700"
          />
          <SummaryCard
            label="Yaroqsiz"
            value={`${data.totals.brokenQuantity} ta`}
            className={data.totals.brokenQuantity > 0 ? "text-amber-700" : "text-gray-400"}
          />
        </div>
      )}

      {isLoading ? (
        <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>
      ) : items.length === 0 ? (
        <Card className="p-0 xs:p-0">
          <EmptyState
            icon={Boxes}
            title={isFiltered ? "Yozuv topilmadi" : "Xatlov bo'sh"}
            description={
              isFiltered
                ? "Filtrni o'zgartirib ko'ring."
                : "Boshlang'ich xatlovni kiriting: har bir xonaga tegishli jihozlar va ularning miqdori."
            }
            action={
              <Can do="inventory.stock">
                <Button onClick={() => openModal("inventoryAddStock", {})}>
                  <Plus />
                  Jihoz kiritish
                </Button>
              </Can>
            }
          />
        </Card>
      ) : (
        <>
          <Table columns={STOCK_COLUMNS}>
            {items.map((stock) => (
              <Tr key={stock.id}>
                <Td className="text-gray-500">{stock.locationName}</Td>

                <Td className="font-medium text-gray-900">
                  {stock.itemName}
                  {stock.categoryName && (
                    <span className="block text-xs font-normal text-gray-400">
                      {stock.categoryName}
                    </span>
                  )}
                </Td>

                <Td align="right" className="font-semibold text-gray-900">
                  {stock.quantity}
                  <span className="ml-1 text-xs font-normal text-gray-400">{stock.unit}</span>
                </Td>

                <Td
                  align="right"
                  className={cn(
                    stock.brokenQuantity > 0 ? "font-medium text-amber-700" : "text-gray-300",
                  )}
                >
                  {stock.brokenQuantity}
                </Td>

                <Td align="right" className="font-medium text-green-700">
                  {stock.serviceableQuantity}
                </Td>

                <Td>
                  <div className="flex items-center justify-end gap-1">
                    {stock.brokenQuantity > 0 && (
                      <Can do="inventory.repair">
                        <IconButton
                          title="Ta'mirlandi"
                          icon={Wrench}
                          className="hover:bg-green-50 hover:text-green-600"
                          onClick={() => openModal("inventoryRepair", { stock })}
                        />
                      </Can>
                    )}

                    <Can do="inventory.writeoff">
                      <IconButton
                        title="Hisobdan chiqarish"
                        icon={Trash2}
                        className="hover:bg-red-50 hover:text-red-500"
                        onClick={() => openModal("inventoryWriteOff", { stock })}
                      />
                    </Can>

                    <Can do="inventory.adjust">
                      <IconButton
                        title="Qo'lda to'g'rilash"
                        icon={SlidersHorizontal}
                        className="hover:bg-gray-100 hover:text-gray-600"
                        onClick={() => openModal("inventoryAdjust", { stock })}
                      />
                    </Can>
                  </div>
                </Td>
              </Tr>
            ))}
          </Table>

          {data?.pagination?.totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={data.pagination.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Miqdor daftari
// ─────────────────────────────────────────────

/**
 * O'TKAZMALAR REGISTRI — topshirish-qabul qilish aktlari.
 *
 * ⚠️ Bekor qilish tugmasi YO'Q va bu ataylab: daftar append-only, ya'ni
 * "bekor qilish" baribir ikkita yangi qator yozardi va faqat asl aktni
 * ko'rinmas qilardi. Xato o'tkazma TESKARI o'tkazma bilan tuzatiladi.
 */
const TransferList = () => {
  const [page, setPage] = useState(1);
  const [locationId, setLocationId] = useState("");

  const { data, isLoading } = useQuery(
    inventoryQueries.transfers({
      page,
      limit: 30,
      // Xona filtri IKKALA tomonni ham qamraydi (kelgani ham, ketgani ham)
      ...(locationId ? { locationId } : {}),
    }),
  );

  const { data: locations = [] } = useQuery(inventoryQueries.activeLocations());
  const items = data?.data ?? [];

  return (
    <div className="space-y-4">
      <Select
        triggerClassName="min-w-48"
        value={locationId}
        placeholder="Barcha xonalar"
        onChange={(v) => {
          setLocationId(v);
          setPage(1);
        }}
        options={[
          { label: "Barcha xonalar", value: "" },
          ...locations.map((l) => ({ label: l.name, value: l.id })),
        ]}
      />

      {isLoading ? (
        <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>
      ) : items.length === 0 ? (
        <Card className="p-0 xs:p-0">
          <EmptyState
            icon={ArrowLeftRight}
            title="O'tkazma yo'q"
            description="Jihozlar boshqa xonaga o'tkazilganda akt shu yerda paydo bo'ladi."
          />
        </Card>
      ) : (
        <>
          <Table columns={TRANSFER_COLUMNS}>
            {items.map((transfer) => (
              <Tr key={transfer.id}>
                <Td className="text-gray-500">{formatDateUz(transfer.occurredAt)}</Td>

                <Td className="text-gray-900">{transfer.fromLocationName}</Td>

                <Td className="font-medium text-gray-900">
                  {transfer.toLocationName}
                  {/* Satrlar aktning o'zida keladi — tafsilot ekrani
                      uchun alohida so'rov kerak emas */}
                  <span className="block text-xs font-normal text-gray-400">
                    {transfer.lines
                      ?.map((l) => `${l.itemName} × ${l.quantity}`)
                      .join(", ")}
                  </span>
                </Td>

                <Td className="text-gray-500">
                  {transfer.toPersonName ? (
                    <span className="inline-flex items-center gap-1">
                      <User className="size-3.5 text-gray-400" />
                      {transfer.toPersonName}
                    </span>
                  ) : (
                    "—"
                  )}
                </Td>

                <Td align="right" className="text-gray-500">
                  {transfer.linesCount}
                </Td>

                <Td align="right" className="font-semibold text-gray-900">
                  {transfer.totalQuantity}
                </Td>

                <Td nowrap={false} className="max-w-xs text-xs text-gray-400">
                  {transfer.note || "—"}
                </Td>
              </Tr>
            ))}
          </Table>

          <p className="text-xs text-gray-500">
            O'tkazma akti bekor qilinmaydi: xato bo'lsa teskari o'tkazma
            qilinadi va izohda sababi yoziladi.
          </p>

          {data?.pagination?.totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={data.pagination.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
};

const MovementList = () => {
  const [page, setPage] = useState(1);
  const [locationId, setLocationId] = useState("");

  const { data, isLoading } = useQuery(
    inventoryQueries.movements({
      page,
      limit: 30,
      ...(locationId ? { locationId } : {}),
    }),
  );

  const { data: locations = [] } = useQuery(inventoryQueries.activeLocations());
  const items = data?.data ?? [];

  return (
    <div className="space-y-4">
      <Select
        triggerClassName="min-w-48"
        value={locationId}
        placeholder="Barcha xonalar"
        onChange={(v) => {
          setLocationId(v);
          setPage(1);
        }}
        options={[
          { label: "Barcha xonalar", value: "" },
          ...locations.map((l) => ({ label: l.name, value: l.id })),
        ]}
      />

      {isLoading ? (
        <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>
      ) : items.length === 0 ? (
        <Card className="p-0 xs:p-0">
          <EmptyState
            icon={History}
            title="Harakat yo'q"
            description="Xatlovga jihoz kiritilganda bu yerda yozuv paydo bo'ladi."
          />
        </Card>
      ) : (
        <>
          <Table columns={MOVEMENT_COLUMNS}>
            {items.map((movement) => (
              <Tr key={movement.id}>
                <Td className="text-gray-500">{formatDateUz(movement.occurredAt)}</Td>
                <Td className="text-gray-500">{movement.locationName}</Td>
                <Td className="font-medium text-gray-900">{movement.itemName}</Td>
                <Td className="text-gray-500">{movement.typeLabel}</Td>

                <Td align="right">
                  <Delta value={movement.quantityDelta} />
                  {movement.brokenDelta !== 0 && (
                    <span className="ml-2 text-xs text-amber-600">
                      yaroqsiz {movement.brokenDelta > 0 ? "+" : ""}
                      {movement.brokenDelta}
                    </span>
                  )}
                </Td>

                <Td align="right" className="text-gray-500">
                  {movement.quantityAfter}
                  {movement.brokenAfter > 0 && (
                    <span className="ml-1 text-xs text-amber-600">
                      ({movement.brokenAfter})
                    </span>
                  )}
                </Td>

                <Td nowrap={false} className="max-w-xs text-xs text-gray-400">
                  {movement.note || "—"}
                </Td>
              </Tr>
            ))}
          </Table>

          <p className="text-xs text-gray-500">
            Harakatlar daftari — append-only registr: yozuv tahrirlanmaydi ham,
            o'chirilmaydi ham. Xato bo'lsa teskari qator yoziladi.
          </p>

          {data?.pagination?.totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={data.pagination.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
};

const Delta = ({ value }) => (
  <span
    className={cn(
      "font-semibold",
      value > 0 && "text-green-700",
      value < 0 && "text-red-600",
      value === 0 && "text-gray-400",
    )}
  >
    {value > 0 ? "+" : ""}
    {value}
  </span>
);

const SummaryCard = ({ label, value, className }) => (
  <Card>
    <p className="text-xs font-medium text-gray-500">{label}</p>
    <p className={cn("mt-1 text-xl font-bold text-gray-900", className)}>{value}</p>
  </Card>
);

const IconButton = ({ icon: Icon, title, className, onClick }) => (
  <button
    title={title}
    onClick={onClick}
    className={cn("rounded-lg p-1.5 text-gray-400", className)}
  >
    <Icon className="size-3.5" />
  </button>
);

export default StockPage;
