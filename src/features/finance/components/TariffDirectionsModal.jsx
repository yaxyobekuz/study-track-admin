// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { Archive, ArchiveRestore, Check, Plus } from "lucide-react";

// Components
import Button from "@/shared/components/ui/button/Button";
import Input from "@/shared/components/ui/input/Input";
import Select from "@/shared/components/ui/select/Select";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Utils
import { cn } from "@/shared/utils/cn";

// Queries
import { financeQueries } from "../queries/finance.queries";
import {
  useArchiveDirection,
  useCreateDirection,
  useUpdateDirection,
} from "../queries/finance.mutations";

const STATUS_OPTIONS = [
  { label: "Faol", value: "active" },
  { label: "Barchasi", value: "" },
  { label: "Arxivlangan", value: "archived" },
];

/**
 * YO'NALISHLAR KATALOGI — tarif ustidagi daraja.
 *
 * "Maktab", "Bog'cha", "Yotoqxona". Bitta yo'nalishda bir nechta narx
 * darajasi bo'ladi va rahbar hisobotni aynan shu kesimda ko'radi.
 *
 * ⚠️ Yo'nalish O'CHIRILMAYDI — arxivlanadi: o'tgan hisob-fakturalarda
 * uning nomi muhrlangan va hisobot shu kesim bo'yicha qurilgan.
 * Tariflari bor yo'nalishni arxivlab ham bo'lmaydi (server rad etadi) —
 * aks holda tarif "yo'nalishi bor-u ro'yxatda yo'q" holatiga tushardi.
 */
const TariffDirectionsModal = () => (
  <ResponsiveModal
    name="tariffDirections"
    title="Yo'nalishlar"
    className="max-w-xl"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close }) => {
  const [status, setStatus] = useState("active");
  const [draft, setDraft] = useState("");
  const [edits, setEdits] = useState({});

  const { data, isLoading } = useQuery(financeQueries.directionList({ status }));
  const items = data?.items ?? [];

  const { mutate: createDirection, isPending: isCreating } = useCreateDirection();
  const { mutate: updateDirection } = useUpdateDirection();
  const { mutate: archiveDirection } = useArchiveDirection();

  const onError = (err) =>
    toast.error(err.response?.data?.message || "Xatolik yuz berdi");

  const handleCreate = (e) => {
    e.preventDefault();
    const name = draft.trim();
    if (!name) return toast.error("Yo'nalish nomini kiriting");

    createDirection(
      { name, sortOrder: items.length },
      {
        onSuccess: () => {
          setDraft("");
          toast.success("Yo'nalish qo'shildi");
        },
        onError,
      },
    );
  };

  const handleRename = (item) => {
    const name = (edits[item.id] ?? item.name).trim();
    if (!name) return toast.error("Yo'nalish nomini kiriting");
    if (name === item.name) return;

    updateDirection(
      { id: item.id, data: { name } },
      {
        onSuccess: () => {
          setEdits((prev) => {
            const next = { ...prev };
            delete next[item.id];
            return next;
          });
          toast.success("Yo'nalish yangilandi");
        },
        onError,
      },
    );
  };

  const handleArchive = (item) =>
    archiveDirection(
      { id: item.id, isArchived: !item.isArchived },
      {
        onSuccess: (res) => toast.success(res?.message || "Bajarildi"),
        onError,
      },
    );

  return (
    <div className="space-y-4">
      <p className="rounded-xl bg-gray-50 p-3 text-xs text-gray-500">
        Yo'nalish — tarif ustidagi daraja. Moliya hisobotida tariflar shu
        yo'nalish ostida guruhlanadi: "Bog'cha (to'liq kun)" va "Bog'cha
        (yarim kun)" bitta "Bog'cha" qatoriga qo'shiladi.
      </p>

      {/* Yangi yo'nalish */}
      <form onSubmit={handleCreate} className="flex items-center gap-2">
        <Input
          value={draft}
          className="min-w-0 flex-1"
          placeholder="Masalan: Yotoqxona"
          onChange={(e) => setDraft(e.target.value)}
        />
        <Button type="submit" disabled={isCreating || !draft.trim()}>
          <Plus className="size-4" />
          Qo'shish
        </Button>
      </form>

      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
          Mavjud yo'nalishlar
        </p>
        <Select
          value={status}
          options={STATUS_OPTIONS}
          triggerClassName="w-36"
          onChange={setStatus}
        />
      </div>

      <div className="max-h-[45vh] space-y-2 overflow-y-auto pr-1">
        {isLoading && (
          <div className="flex h-24 items-center justify-center">
            <div className="size-6 animate-spin rounded-full border-2 border-gray-200 border-t-primary" />
          </div>
        )}

        {!isLoading && items.length === 0 && (
          <p className="rounded-xl border border-dashed border-gray-200 p-3 text-xs text-gray-400">
            Yo'nalish yo'q. Yuqoridagi maydondan qo'shing.
          </p>
        )}

        {items.map((item) => {
          const value = edits[item.id] ?? item.name;
          const changed = value.trim() !== item.name;

          return (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-2 rounded-xl border border-gray-100 p-2.5",
                item.isArchived && "opacity-60",
              )}
            >
              <div className="min-w-0 flex-1">
                <Input
                  value={value}
                  disabled={item.isArchived}
                  onChange={(e) =>
                    setEdits((prev) => ({ ...prev, [item.id]: e.target.value }))
                  }
                />
                <p className="mt-1 text-[11px] text-gray-400">
                  {item.tariffCount} ta tarif
                  {item.isArchived && " · arxivlangan"}
                </p>
              </div>

              {changed && !item.isArchived && (
                <button
                  type="button"
                  title="Saqlash"
                  onClick={() => handleRename(item)}
                  className="shrink-0 rounded-lg p-1.5 text-green-600 hover:bg-green-50"
                >
                  <Check className="size-4" />
                </button>
              )}

              <button
                type="button"
                title={item.isArchived ? "Arxivdan qaytarish" : "Arxivlash"}
                onClick={() => handleArchive(item)}
                className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                {item.isArchived ? (
                  <ArchiveRestore className="size-4" />
                ) : (
                  <Archive className="size-4" />
                )}
              </button>
            </div>
          );
        })}
      </div>

      <Button type="button" variant="outline" className="w-full" onClick={() => close()}>
        Yopish
      </Button>
    </div>
  );
};

export default TariffDirectionsModal;
