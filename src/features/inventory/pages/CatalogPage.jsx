// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import { Plus, Pencil, Archive, ArchiveRestore, Boxes, Tags, DoorOpen } from "lucide-react";

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
import { formatMoney } from "@/shared/utils/formatMoney";

// Data & queries
import {
  ARCHIVE_HINT,
  CATALOG_STATUS_OPTIONS,
  CATEGORY_COLUMNS,
  ITEM_COLUMNS,
  LOCATION_COLUMNS,
  getCatalogStatusBadge,
} from "../data/inventory.data";
import { inventoryQueries } from "../queries/inventory.queries";
import {
  useArchiveCategory,
  useArchiveItem,
  useArchiveLocation,
} from "../queries/inventory.mutations";

/**
 * KATALOG — xonalar, jihoz turlari va toifalar.
 *
 * ⚠️ Jihoz ro'yxati OLDINDAN BELGILANMAGAN: oshxonada piyola, sport
 * zalida to'p, laboratoriyada probirka bo'ladi. Yangi buyum qo'shish —
 * oddiy ma'lumot kiritish amali, kod o'zgarishi emas.
 */
const CatalogPage = () => {
  const [tab, setTab] = useState("locations");

  const tabs = [
    { value: "locations", label: "Xonalar", content: <LocationsPanel /> },
    { value: "items", label: "Jihozlar", content: <ItemsPanel /> },
    { value: "categories", label: "Toifalar", content: <CategoriesPanel /> },
  ];

  return (
    <div className="space-y-4">
      <TabsButtons items={tabs} value={tab} onChange={setTab} contentClassName="mt-4" />
      <p className="text-xs text-gray-500">{ARCHIVE_HINT}</p>
    </div>
  );
};

// ─────────────────────────────────────────────
// Xonalar
// ─────────────────────────────────────────────

const LocationsPanel = () => {
  const { openModal } = useModal();
  const { mutate: archive } = useArchiveLocation();

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("active");

  const { data, isLoading } = useQuery(
    inventoryQueries.locations({ page, limit: 20, status }),
  );

  const items = data?.data ?? [];

  const handleArchive = (location) => {
    archive(
      { id: location.id, isArchived: !location.isArchived },
      {
        onSuccess: (result) => toast.success(result.message),
        onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      },
    );
  };

  return (
    <div className="space-y-4">
      <PanelHeader
        status={status}
        onStatusChange={(v) => {
          setStatus(v);
          setPage(1);
        }}
        action={
          <Can do="inventory.locations">
            <Button onClick={() => openModal("inventoryLocation", {})}>
              <Plus />
              Xona qo'shish
            </Button>
          </Can>
        }
      />

      {isLoading ? (
        <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>
      ) : items.length === 0 ? (
        <Card className="p-0 xs:p-0">
          <EmptyState
            icon={DoorOpen}
            title="Xona yo'q"
            description="Moddiy-texnik baza xonalar bo'yicha yuritiladi: 1-A sinf xonasi, Oshxona, Sport zali."
            action={
              <Can do="inventory.locations">
                <Button onClick={() => openModal("inventoryLocation", {})}>
                  <Plus />
                  Xona qo'shish
                </Button>
              </Can>
            }
          />
        </Card>
      ) : (
        <>
          <Table columns={LOCATION_COLUMNS}>
            {items.map((location) => (
              <Tr key={location.id}>
                <Td className="font-medium text-gray-900">
                  {location.name}
                  {location.className && (
                    <span className="block text-xs font-normal text-gray-400">
                      {location.className}
                    </span>
                  )}
                </Td>

                <Td className="text-gray-500">{location.typeLabel}</Td>
                <Td className="text-gray-500">{location.responsibleName ?? "—"}</Td>
                <Td align="right" className="text-gray-500">{location.itemCount ?? 0}</Td>
                <Td align="right" className="font-medium text-gray-900">
                  {location.totalQuantity ?? 0}
                </Td>
                <Td align="right" className="text-amber-700">
                  {location.brokenQuantity ?? 0}
                </Td>

                <Td>
                  <RowActions
                    can="inventory.locations"
                    isArchived={location.isArchived}
                    onEdit={() => openModal("inventoryLocation", { location })}
                    onArchive={() => handleArchive(location)}
                  />
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
// Jihozlar
// ─────────────────────────────────────────────

const ItemsPanel = () => {
  const { openModal } = useModal();
  const { mutate: archive } = useArchiveItem();

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("active");
  const [categoryId, setCategoryId] = useState("");

  const { data, isLoading } = useQuery(
    inventoryQueries.items({
      page,
      limit: 20,
      status,
      ...(categoryId ? { categoryId } : {}),
    }),
  );

  const { data: categoriesData } = useQuery(inventoryQueries.categories({ status: "active" }));
  const categories = categoriesData?.items ?? [];

  const items = data?.data ?? [];

  const handleArchive = (item) => {
    archive(
      { id: item.id, isArchived: !item.isArchived },
      {
        onSuccess: (result) => toast.success(result.message),
        onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      },
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Select
            triggerClassName="min-w-36"
            value={status}
            options={CATALOG_STATUS_OPTIONS}
            onChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
          />

          <Select
            triggerClassName="min-w-44"
            value={categoryId}
            placeholder="Barcha toifalar"
            onChange={(v) => {
              setCategoryId(v);
              setPage(1);
            }}
            options={[
              { label: "Barcha toifalar", value: "" },
              ...categories.map((c) => ({ label: c.name, value: c.id })),
            ]}
          />
        </div>

        <Can do="inventory.catalog">
          <Button onClick={() => openModal("inventoryItem", {})}>
            <Plus />
            Jihoz qo'shish
          </Button>
        </Can>
      </div>

      {isLoading ? (
        <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>
      ) : items.length === 0 ? (
        <Card className="p-0 xs:p-0">
          <EmptyState
            icon={Boxes}
            title="Jihoz yo'q"
            description="Parta, stul, piyola, proyektor — xatlovda uchraydigan har qanday buyum shu yerga kiritiladi."
            action={
              <Can do="inventory.catalog">
                <Button onClick={() => openModal("inventoryItem", {})}>
                  <Plus />
                  Jihoz qo'shish
                </Button>
              </Can>
            }
          />
        </Card>
      ) : (
        <>
          <Table columns={ITEM_COLUMNS}>
            {items.map((item) => (
              <Tr key={item.id}>
                <Td className="font-medium text-gray-900">
                  {item.name}
                  {item.description && (
                    <span className="block text-xs font-normal text-gray-400">
                      {item.description}
                    </span>
                  )}
                </Td>

                <Td className="text-gray-500">{item.categoryName ?? "—"}</Td>
                <Td className="text-gray-500">{item.unit}</Td>

                <Td align="right" className="font-medium text-gray-900">
                  {formatMoney(item.unitPrice)}
                </Td>

                <Td align="right" className="text-gray-500">
                  {item.totalQuantity ?? 0}
                </Td>

                <Td>
                  <RowActions
                    can="inventory.catalog"
                    isArchived={item.isArchived}
                    onEdit={() => openModal("inventoryItem", { item })}
                    onArchive={() => handleArchive(item)}
                  />
                </Td>
              </Tr>
            ))}
          </Table>

          <p className="text-xs text-gray-500">
            Narx — zararning STANDART qiymati. U hodisa paytida yozuvga
            muhrlanadi, ya'ni narxni o'zgartirish o'tgan zararlarga ta'sir qilmaydi.
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

// ─────────────────────────────────────────────
// Toifalar
// ─────────────────────────────────────────────

const CategoriesPanel = () => {
  const { openModal } = useModal();
  const { mutate: archive } = useArchiveCategory();
  const [status, setStatus] = useState("active");

  const { data, isLoading } = useQuery(inventoryQueries.categories({ status }));
  const items = data?.items ?? [];

  const handleArchive = (category) => {
    archive(
      { id: category.id, isArchived: !category.isArchived },
      {
        onSuccess: (result) => toast.success(result.message),
        onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      },
    );
  };

  return (
    <div className="space-y-4">
      <PanelHeader
        status={status}
        onStatusChange={setStatus}
        action={
          <Can do="inventory.catalog">
            <Button onClick={() => openModal("inventoryCategory", {})}>
              <Plus />
              Toifa qo'shish
            </Button>
          </Can>
        }
      />

      {isLoading ? (
        <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>
      ) : items.length === 0 ? (
        <Card className="p-0 xs:p-0">
          <EmptyState
            icon={Tags}
            title="Toifa yo'q"
            description="Mebel, Texnika, Oshxona buyumlari, Sport inventari — jihozlarni kesimlarga ajratadi."
            action={
              <Can do="inventory.catalog">
                <Button onClick={() => openModal("inventoryCategory", {})}>
                  <Plus />
                  Toifa qo'shish
                </Button>
              </Can>
            }
          />
        </Card>
      ) : (
        <Table columns={CATEGORY_COLUMNS}>
          {items.map((category) => {
            const badge = getCatalogStatusBadge(category);

            return (
              <Tr key={category.id}>
                <Td className="font-medium text-gray-900">{category.name}</Td>
                <Td align="right" className="text-gray-500">
                  {category.itemCount ?? 0}
                </Td>
                <Td>
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                </Td>
                <Td>
                  <RowActions
                    can="inventory.catalog"
                    isArchived={category.isArchived}
                    onEdit={() => openModal("inventoryCategory", { category })}
                    onArchive={() => handleArchive(category)}
                  />
                </Td>
              </Tr>
            );
          })}
        </Table>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Umumiy bo'laklar
// ─────────────────────────────────────────────

const PanelHeader = ({ status, onStatusChange, action }) => (
  <div className="flex flex-wrap items-center justify-between gap-3">
    <Select
      triggerClassName="min-w-36"
      value={status}
      options={CATALOG_STATUS_OPTIONS}
      onChange={onStatusChange}
    />
    {action}
  </div>
);

const RowActions = ({ can, isArchived, onEdit, onArchive }) => (
  <div className="flex items-center justify-end gap-1">
    <Can do={can}>
      <button
        title="Tahrirlash"
        onClick={onEdit}
        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
      >
        <Pencil className="size-3.5" />
      </button>

      <button
        title={isArchived ? "Arxivdan qaytarish" : "Arxivlash"}
        onClick={onArchive}
        className="rounded-lg p-1.5 text-gray-400 hover:bg-amber-50 hover:text-amber-600"
      >
        {isArchived ? (
          <ArchiveRestore className="size-3.5" />
        ) : (
          <Archive className="size-3.5" />
        )}
      </button>
    </Can>
  </div>
);

export default CatalogPage;
