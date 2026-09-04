// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import { Plus, X } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import InputField from "@/shared/components/ui/input/InputField";
import Select from "@/shared/components/ui/select/Select";
import Button from "@/shared/components/ui/button/Button";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Data & queries
import { inventoryQueries } from "../queries/inventory.queries";
import {
  useAddStock,
  useAdjustStock,
  useRepairStock,
  useTransferStock,
  useWriteOffStock,
} from "../queries/inventory.mutations";

const showError = (err) =>
  toast.error(err.response?.data?.message || "Xatolik yuz berdi");

/** Bugungi sana — `<input type="date">` qiymati (ISO, ko'rsatish uchun emas). */
const todayInputValue = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

// ─────────────────────────────────────────────
// Boshlang'ich xatlov / yangi jihoz
// ─────────────────────────────────────────────

export const AddStockModal = () => (
  <ResponsiveModal name="inventoryAddStock" title="Xatlovga jihoz kiritish" className="max-w-2xl">
    <AddStockForm />
  </ResponsiveModal>
);

/**
 * BIR NECHTA QATOR BIR AMALDA.
 *
 * Boshlang'ich xatlov aynan shunday ishlaydi: "1-A sinf xonasi — parta 20,
 * stul 40, doska 1, proyektor 1". Qatorma-qator kiritish soatlab vaqt olardi.
 */
const AddStockForm = ({ close, isLoading, setIsLoading }) => {
  const { data: locations = [] } = useQuery(inventoryQueries.activeLocations());
  const { data: items = [] } = useQuery(inventoryQueries.activeItems());
  const { mutate: addStock } = useAddStock();

  const { locationId, type, occurredAt, note, setField } = useObjectState({
    locationId: "",
    type: "initial",
    occurredAt: todayInputValue(),
    note: "",
  });

  const [lines, setLines] = useState([{ itemId: "", quantity: "", brokenQuantity: "" }]);

  const setLine = (index, key, value) =>
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, [key]: value } : l)));

  const addLine = () =>
    setLines((prev) => [...prev, { itemId: "", quantity: "", brokenQuantity: "" }]);

  const removeLine = (index) =>
    setLines((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));

  const filled = lines.filter((l) => l.itemId && Number(l.quantity) > 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    addStock(
      {
        locationId,
        type,
        occurredAt,
        note,
        lines: filled.map((l) => ({
          itemId: l.itemId,
          quantity: Number(l.quantity),
          brokenQuantity: Number(l.brokenQuantity) || 0,
        })),
      },
      {
        onSuccess: (result) => {
          close();
          toast.success(`${result.lines.length} ta qator kiritildi`);
        },
        onError: showError,
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <InputGroup as="form" onSubmit={handleSubmit}>
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700">Xona</p>
        <Select
          value={locationId}
          placeholder="Xonani tanlang"
          onChange={(v) => setField("locationId", v)}
          options={locations.map((l) => ({ label: l.name, value: l.id }))}
        />
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700">Kiritish sababi</p>
        <Select
          value={type}
          onChange={(v) => setField("type", v)}
          options={[
            { label: "Boshlang'ich xatlov", value: "initial" },
            { label: "Yangi jihoz sotib olindi", value: "purchase" },
          ]}
        />
        <p className="text-xs text-gray-500">
          {type === "initial"
            ? "Tizimga birinchi marta kiritish — yaroqsizlari ham ko'rsatiladi."
            : "Yangi sotib olingan jihoz yaroqsiz holda kelmaydi."}
        </p>
      </div>

      {/* ── Qatorlar ── */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Jihozlar</p>

        {lines.map((line, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <Select
                value={line.itemId}
                placeholder="Jihozni tanlang"
                triggerClassName="w-full"
                onChange={(v) => setLine(index, "itemId", v)}
                options={items.map((i) => ({ label: i.name, value: i.id }))}
              />
            </div>

            <input
              min="1"
              type="number"
              placeholder="Soni"
              value={line.quantity}
              onChange={(e) => setLine(index, "quantity", e.target.value)}
              className="w-20 rounded-xl border border-gray-200 px-2 py-2 text-sm"
            />

            {type === "initial" && (
              <input
                min="0"
                type="number"
                title="Yaroqsizlari"
                placeholder="Yaroqsiz"
                value={line.brokenQuantity}
                onChange={(e) => setLine(index, "brokenQuantity", e.target.value)}
                className="w-24 rounded-xl border border-gray-200 px-2 py-2 text-sm"
              />
            )}

            <button
              type="button"
              title="Qatorni olib tashlash"
              onClick={() => removeLine(index)}
              disabled={lines.length === 1}
              className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-30"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}

        <Button type="button" variant="outline" size="sm" onClick={addLine}>
          <Plus />
          Qator qo'shish
        </Button>
      </div>

      <InputField
        required
        type="date"
        name="occurredAt"
        label="Sana"
        value={occurredAt}
        max={todayInputValue()}
        onChange={(e) => setField("occurredAt", e.target.value)}
      />

      <InputField
        name="note"
        label="Izoh (ixtiyoriy)"
        value={note}
        onChange={(e) => setField("note", e.target.value)}
      />

      <Button type="submit" disabled={isLoading || !locationId || filled.length === 0}>
        {filled.length > 0 ? `${filled.length} ta qatorni kiritish` : "Kiritish"}
      </Button>
    </InputGroup>
  );
};

// ─────────────────────────────────────────────
// Ta'mirlash
// ─────────────────────────────────────────────

export const RepairModal = () => (
  <ResponsiveModal name="inventoryRepair" title="Ta'mirlanganini belgilash">
    <RepairForm />
  </ResponsiveModal>
);

const RepairForm = ({ close, isLoading, setIsLoading, stock }) => {
  const { mutate: repair } = useRepairStock();

  const { quantity, occurredAt, note, setField } = useObjectState({
    quantity: "",
    occurredAt: todayInputValue(),
    note: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    repair(
      { stockId: stock.id, quantity: Number(quantity), occurredAt, note },
      {
        onSuccess: () => {
          close();
          toast.success("Ta'mirlangani qayd etildi");
        },
        onError: showError,
        onSettled: () => setIsLoading(false),
      },
    );
  };

  if (!stock) return null;

  return (
    <InputGroup as="form" onSubmit={handleSubmit}>
      <p className="rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
        <span className="font-medium">{stock.itemName}</span> · {stock.locationName}
        <span className="block text-xs text-gray-500">
          Hozir {stock.brokenQuantity} ta yaroqsiz holatda
        </span>
      </p>

      <InputField
        required
        min="1"
        type="number"
        name="quantity"
        label="Nechtasi ta'mirlandi"
        value={quantity}
        max={stock.brokenQuantity}
        description="Jami miqdor o'zgarmaydi — faqat yaroqsizlar soni kamayadi"
        onChange={(e) => setField("quantity", e.target.value)}
      />

      <InputField
        required
        type="date"
        name="occurredAt"
        label="Sana"
        value={occurredAt}
        max={todayInputValue()}
        onChange={(e) => setField("occurredAt", e.target.value)}
      />

      <InputField
        name="note"
        label="Izoh (ixtiyoriy)"
        value={note}
        onChange={(e) => setField("note", e.target.value)}
      />

      <Button type="submit" disabled={isLoading || !quantity}>
        Saqlash
      </Button>
    </InputGroup>
  );
};

// ─────────────────────────────────────────────
// Hisobdan chiqarish
// ─────────────────────────────────────────────

export const WriteOffModal = () => (
  <ResponsiveModal name="inventoryWriteOff" title="Hisobdan chiqarish">
    <WriteOffForm />
  </ResponsiveModal>
);

const WriteOffForm = ({ close, isLoading, setIsLoading, stock }) => {
  const { mutate: writeOff } = useWriteOffStock();

  const { quantity, fromBroken, occurredAt, note, setField } = useObjectState({
    quantity: "",
    fromBroken: "true",
    occurredAt: todayInputValue(),
    note: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    writeOff(
      {
        stockId: stock.id,
        quantity: Number(quantity),
        fromBroken: fromBroken === "true",
        occurredAt,
        note,
      },
      {
        onSuccess: () => {
          close();
          toast.success("Hisobdan chiqarildi");
        },
        onError: showError,
        onSettled: () => setIsLoading(false),
      },
    );
  };

  if (!stock) return null;

  const max = fromBroken === "true" ? stock.brokenQuantity : stock.quantity;

  return (
    <InputGroup as="form" onSubmit={handleSubmit}>
      <p className="rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
        <span className="font-medium">{stock.itemName}</span> · {stock.locationName}
        <span className="block text-xs text-gray-500">
          Jami {stock.quantity} ta, shundan {stock.brokenQuantity} tasi yaroqsiz
        </span>
      </p>

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700">Nimani chiqaramiz</p>
        <Select
          value={fromBroken}
          onChange={(v) => setField("fromBroken", v)}
          options={[
            { label: "Yaroqsizlar ichidan", value: "true" },
            { label: "Yaroqlilar ichidan (eskirgan)", value: "false" },
          ]}
        />
      </div>

      <InputField
        required
        min="1"
        max={max}
        type="number"
        name="quantity"
        label="Miqdor"
        value={quantity}
        description={`Ko'pi bilan ${max} ta`}
        onChange={(e) => setField("quantity", e.target.value)}
      />

      <InputField
        required
        type="date"
        name="occurredAt"
        label="Sana"
        value={occurredAt}
        max={todayInputValue()}
        onChange={(e) => setField("occurredAt", e.target.value)}
      />

      <InputField
        name="note"
        label="Izoh (ixtiyoriy)"
        value={note}
        placeholder="Ta'mirlab bo'lmaydi"
        onChange={(e) => setField("note", e.target.value)}
      />

      <Button type="submit" disabled={isLoading || !quantity}>
        Hisobdan chiqarish
      </Button>
    </InputGroup>
  );
};

// ─────────────────────────────────────────────
// Qo'lda to'g'rilash
// ─────────────────────────────────────────────

export const AdjustModal = () => (
  <ResponsiveModal name="inventoryAdjust" title="Qo'lda to'g'rilash">
    <AdjustForm />
  </ResponsiveModal>
);

const AdjustForm = ({ close, isLoading, setIsLoading, stock }) => {
  const { mutate: adjust } = useAdjustStock();

  const { quantityDelta, brokenDelta, reason, occurredAt, setField } = useObjectState({
    quantityDelta: "",
    brokenDelta: "",
    reason: "",
    occurredAt: todayInputValue(),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    adjust(
      {
        stockId: stock.id,
        quantityDelta: Number(quantityDelta) || 0,
        brokenDelta: Number(brokenDelta) || 0,
        reason,
        occurredAt,
      },
      {
        onSuccess: () => {
          close();
          toast.success("Xatlov to'g'rilandi");
        },
        onError: showError,
        onSettled: () => setIsLoading(false),
      },
    );
  };

  if (!stock) return null;

  const hasDelta = Number(quantityDelta) !== 0 || Number(brokenDelta) !== 0;

  return (
    <InputGroup as="form" onSubmit={handleSubmit}>
      <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
        Qo'lda to'g'rilash — inventarizatsiyadagi sanoq farqi uchun.
        Sabab MAJBURIY: bu daftarga yoziladi va keyin tekshiriladi.
      </p>

      <p className="rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
        <span className="font-medium">{stock.itemName}</span> · {stock.locationName}
        <span className="block text-xs text-gray-500">
          Hozir: jami {stock.quantity}, yaroqsiz {stock.brokenQuantity}
        </span>
      </p>

      <InputField
        type="number"
        name="quantityDelta"
        label="Jami miqdor farqi"
        value={quantityDelta}
        placeholder="-1"
        description="Manfiy — kamaytiradi, musbat — oshiradi"
        onChange={(e) => setField("quantityDelta", e.target.value)}
      />

      <InputField
        type="number"
        name="brokenDelta"
        label="Yaroqsizlar farqi"
        value={brokenDelta}
        placeholder="0"
        onChange={(e) => setField("brokenDelta", e.target.value)}
      />

      <InputField
        required
        name="reason"
        label="Sabab"
        value={reason}
        placeholder="Inventarizatsiyada 1 ta kam chiqdi"
        onChange={(e) => setField("reason", e.target.value)}
      />

      <InputField
        required
        type="date"
        name="occurredAt"
        label="Sana"
        value={occurredAt}
        max={todayInputValue()}
        onChange={(e) => setField("occurredAt", e.target.value)}
      />

      <Button type="submit" disabled={isLoading || !reason.trim() || !hasDelta}>
        To'g'rilash
      </Button>
    </InputGroup>
  );
};

// ─────────────────────────────────────────────
// Xonalar orasida ko'chirish
// ─────────────────────────────────────────────

export const TransferModal = () => (
  <ResponsiveModal name="inventoryTransfer" title="Boshqa xonaga ko'chirish">
    <TransferForm />
  </ResponsiveModal>
);

const TransferForm = ({ close, isLoading, setIsLoading }) => {
  const { data: locations = [] } = useQuery(inventoryQueries.activeLocations());
  const { mutate: transfer } = useTransferStock();

  const {
    fromLocationId,
    toLocationId,
    itemId,
    quantity,
    brokenQuantity,
    occurredAt,
    note,
    setField,
  } = useObjectState({
    fromLocationId: "",
    toLocationId: "",
    itemId: "",
    quantity: "",
    brokenQuantity: "",
    occurredAt: todayInputValue(),
    note: "",
  });

  // Manba xonaning xatlovi — faqat u yerda BOR jihozlarni ko'chirish mumkin
  const { data: sourceStock } = useQuery({
    ...inventoryQueries.stockByLocation(fromLocationId),
    enabled: Boolean(fromLocationId),
  });

  const availableItems = sourceStock?.items ?? [];
  const selected = availableItems.find((s) => s.itemId === itemId);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    transfer(
      {
        fromLocationId,
        toLocationId,
        itemId,
        quantity: Number(quantity),
        brokenQuantity: Number(brokenQuantity) || 0,
        occurredAt,
        note,
      },
      {
        onSuccess: () => {
          close();
          toast.success("Jihoz ko'chirildi");
        },
        onError: showError,
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <InputGroup as="form" onSubmit={handleSubmit}>
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700">Qaysi xonadan</p>
        <Select
          value={fromLocationId}
          placeholder="Xonani tanlang"
          onChange={(v) => {
            setField("fromLocationId", v);
            setField("itemId", "");
          }}
          options={locations.map((l) => ({ label: l.name, value: l.id }))}
        />
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700">Jihoz</p>
        <Select
          value={itemId}
          placeholder={fromLocationId ? "Jihozni tanlang" : "Avval xonani tanlang"}
          onChange={(v) => setField("itemId", v)}
          options={availableItems.map((s) => ({
            label: `${s.itemName} (${s.quantity} ta)`,
            value: s.itemId,
          }))}
        />
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700">Qaysi xonaga</p>
        <Select
          value={toLocationId}
          placeholder="Xonani tanlang"
          onChange={(v) => setField("toLocationId", v)}
          options={locations
            .filter((l) => l.id !== fromLocationId)
            .map((l) => ({ label: l.name, value: l.id }))}
        />
      </div>

      <InputField
        required
        min="1"
        type="number"
        name="quantity"
        label="Miqdor"
        value={quantity}
        max={selected?.quantity}
        description={selected ? `Mavjud: ${selected.quantity} ta` : ""}
        onChange={(e) => setField("quantity", e.target.value)}
      />

      {selected?.brokenQuantity > 0 && (
        <InputField
          min="0"
          type="number"
          name="brokenQuantity"
          label="Shundan yaroqsizlari"
          value={brokenQuantity}
          max={selected.brokenQuantity}
          description={`Manba xonada ${selected.brokenQuantity} ta yaroqsiz bor`}
          onChange={(e) => setField("brokenQuantity", e.target.value)}
        />
      )}

      <InputField
        required
        type="date"
        name="occurredAt"
        label="Sana"
        value={occurredAt}
        max={todayInputValue()}
        onChange={(e) => setField("occurredAt", e.target.value)}
      />

      <InputField
        name="note"
        label="Izoh (ixtiyoriy)"
        value={note}
        onChange={(e) => setField("note", e.target.value)}
      />

      <Button
        type="submit"
        disabled={isLoading || !fromLocationId || !toLocationId || !itemId || !quantity}
      >
        Ko'chirish
      </Button>
    </InputGroup>
  );
};
