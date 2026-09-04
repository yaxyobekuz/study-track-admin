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
  useCreateTransfer,
  useRepairStock,
  useWriteOffStock,
} from "../queries/inventory.mutations";

// Qabul qiluvchi xodim tanlagichi — ro'yxat uzun bo'lishi mumkin,
// shuning uchun qidiruvli `Combobox` (`ChargeForm` bilan bir xil naqsh)
import Combobox from "@/shared/components/form/combobox";
import { usersQueries } from "@/features/users/queries/users.queries";

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
// O'TKAZMA — TOPSHIRISH-QABUL QILISH AKTI
// ─────────────────────────────────────────────

/**
 * Bir aktda BIR NECHTA jihoz, qaysi xonaga va KIMGA topshirilgani bilan.
 *
 * Avval bu forma bitta jihozni ko'chirardi va "kimga topshirildi" degan
 * savolga javob bermasdi — javobgarlik faqat izoh matnida qolardi.
 * Ko'p qatorli shakl `AddStockForm` naqshidan olingan: amalda "1-A dan
 * 2-B ga 10 ta parta va 20 ta stul" bitta hodisa.
 */
export const TransferModal = () => (
  <ResponsiveModal
    name="inventoryTransfer"
    title="Jihozlarni o'tkazish"
    className="max-w-2xl"
  >
    <TransferForm />
  </ResponsiveModal>
);

const emptyTransferLine = () => ({ itemId: "", quantity: "", brokenQuantity: "" });

const fullNameOf = (user) => `${user.firstName} ${user.lastName ?? ""}`.trim();

const TransferForm = ({ close, isLoading, setIsLoading }) => {
  const { data: locations = [] } = useQuery(inventoryQueries.activeLocations());
  const { data: allUsers = [] } = useQuery(usersQueries.allShort());
  const { mutate: createTransfer } = useCreateTransfer();

  const { fromLocationId, toLocationId, toPersonId, occurredAt, note, setField } =
    useObjectState({
      fromLocationId: "",
      toLocationId: "",
      toPersonId: "",
      occurredAt: todayInputValue(),
      note: "",
    });

  const [lines, setLines] = useState([emptyTransferLine()]);

  // Manba xonaning xatlovi — faqat u yerda BOR jihozni o'tkazish mumkin
  const { data: sourceStock } = useQuery({
    ...inventoryQueries.stockByLocation(fromLocationId),
    enabled: Boolean(fromLocationId),
  });

  const availableItems = sourceStock?.items ?? [];
  const stockOf = (itemId) => availableItems.find((s) => s.itemId === itemId);

  const setLine = (index, key, value) =>
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, [key]: value } : l)));

  /**
   * Jihoz almashtirilganda miqdorlar TOZALANADI.
   *
   * "Shundan yaroqsizlari" maydoni faqat xonada yaroqsizi bor jihozda
   * ko'rinadi. Foydalanuvchi 3 deb yozib, keyin yaroqsizi yo'q jihozga
   * almashtirsa, maydon ekrandan yo'qolardi-yu qiymat holatda qolib
   * serverga ketardi — u esa "yaroqsizlar soni manfiy bo'lib qoladi"
   * deb rad etardi va foydalanuvchi sababini ko'rmasdi.
   */
  const changeItem = (index, itemId) =>
    setLines((prev) =>
      prev.map((l, i) => (i === index ? { itemId, quantity: "", brokenQuantity: "" } : l)),
    );

  const addLine = () => setLines((prev) => [...prev, emptyTransferLine()]);

  const removeLine = (index) =>
    setLines((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));

  // Manba xona almashsa qatorlar TOZALANADI — aks holda eski xonaning
  // jihozlari ro'yxatda qolib, server "bu xatlovda bunday jihoz yo'q"
  // degan xatoni qaytarardi
  const changeSource = (value) => {
    setField("fromLocationId", value);
    setLines([emptyTransferLine()]);
    if (value === toLocationId) setField("toLocationId", "");
  };

  const filled = lines.filter((l) => l.itemId && Number(l.quantity) > 0);

  // O'quvchiga topshirib bo'lmaydi — server ham rad etadi, lekin tanlagichda
  // umuman ko'rinmagani tushunarliroq
  const staffOptions = allUsers
    .filter((u) => u.role !== "student")
    .map((u) => ({ label: fullNameOf(u), value: u.id }));

  const handleSubmit = (e) => {
    e.preventDefault();

    // Miqdor xatlovdagidan oshib ketmasin — server baribir tekshiradi,
    // lekin xato tranzaksiya boshlangandan keyin emas, shu yerda chiqsin
    const tooMuch = filled.find((l) => {
      const stock = stockOf(l.itemId);
      return stock && Number(l.quantity) > stock.quantity;
    });
    if (tooMuch) {
      const stock = stockOf(tooMuch.itemId);
      toast.error(`"${stock.itemName}": xonada ${stock.quantity} ta bor`);
      return;
    }

    setIsLoading(true);

    createTransfer(
      {
        fromLocationId,
        toLocationId,
        toPersonId: toPersonId || undefined,
        occurredAt,
        note,
        lines: filled.map((l) => ({
          itemId: l.itemId,
          quantity: Number(l.quantity),
          brokenQuantity: Number(l.brokenQuantity) || 0,
        })),
      },
      {
        onSuccess: (transfer) => {
          close();
          toast.success(
            `${transfer.linesCount} ta jihoz turi o'tkazildi` +
              (transfer.toPersonName ? ` — ${transfer.toPersonName}` : ""),
          );
        },
        onError: showError,
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <InputGroup as="form" onSubmit={handleSubmit}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-gray-700">Qaysi xonadan</p>
          <Select
            value={fromLocationId}
            placeholder="Xonani tanlang"
            triggerClassName="w-full"
            onChange={changeSource}
            options={locations.map((l) => ({ label: l.name, value: l.id }))}
          />
        </div>

        <div className="space-y-1.5">
          <p className="text-sm font-medium text-gray-700">Qaysi xonaga</p>
          <Select
            value={toLocationId}
            placeholder="Xonani tanlang"
            triggerClassName="w-full"
            onChange={(v) => setField("toLocationId", v)}
            options={locations
              .filter((l) => l.id !== fromLocationId)
              .map((l) => ({ label: l.name, value: l.id }))}
          />
        </div>
      </div>

      <Combobox
        name="toPersonId"
        label="Kimga topshirildi (ixtiyoriy)"
        value={toPersonId}
        options={staffOptions}
        placeholder="Xodimni tanlang"
        searchPlaceholder="Ism bo'yicha qidirish"
        emptyText="Xodim topilmadi"
        onChange={(v) => setField("toPersonId", v)}
      />

      {/* ── Jihozlar ── */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Jihozlar</p>

        {lines.map((line, index) => {
          const stock = stockOf(line.itemId);

          return (
            <div key={index} className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <Select
                  value={line.itemId}
                  placeholder={fromLocationId ? "Jihozni tanlang" : "Avval xonani tanlang"}
                  triggerClassName="w-full"
                  onChange={(v) => changeItem(index, v)}
                  options={availableItems.map((s) => ({
                    label: `${s.itemName} (${s.quantity} ta)`,
                    value: s.itemId,
                  }))}
                />
                {stock?.brokenQuantity > 0 && (
                  <p className="mt-1 text-xs text-amber-600">
                    Xonada {stock.brokenQuantity} ta yaroqsiz bor
                  </p>
                )}
              </div>

              <input
                min="1"
                type="number"
                placeholder="Soni"
                max={stock?.quantity}
                value={line.quantity}
                onChange={(e) => setLine(index, "quantity", e.target.value)}
                className="w-20 rounded-xl border border-gray-200 px-2 py-2 text-sm"
              />

              {/* Yaroqsizlari — ko'chirilayotgan miqdor ICHIDA. Xonada
                  yaroqsiz bo'lmasa maydon ham kerak emas. */}
              {stock?.brokenQuantity > 0 && (
                <input
                  min="0"
                  type="number"
                  title="Shundan yaroqsizlari"
                  placeholder="Yaroqsiz"
                  max={Math.min(stock.brokenQuantity, Number(line.quantity) || 0)}
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
          );
        })}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addLine}
          disabled={!fromLocationId}
        >
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
        label="Izoh"
        value={note}
        placeholder="Nima uchun o'tkazilyapti?"
        onChange={(e) => setField("note", e.target.value)}
      />

      <p className="rounded-xl bg-gray-50 p-3 text-xs text-gray-600">
        O'tkazma bekor qilinmaydi: xato bo'lsa teskari o'tkazma qilinadi va
        izohda sababi yoziladi.
      </p>

      <Button
        type="submit"
        disabled={isLoading || !fromLocationId || !toLocationId || filled.length === 0}
      >
        {filled.length > 0 ? `${filled.length} ta jihozni o'tkazish` : "O'tkazish"}
      </Button>
    </InputGroup>
  );
};
