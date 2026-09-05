// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import { Pencil, Plus, Trash2, X } from "lucide-react";

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
import usePermissions from "@/shared/hooks/usePermissions";

// Utils
import { cn } from "@/shared/utils/cn";

// Data & queries
import { inventoryQueries } from "../queries/inventory.queries";
import {
  useAddStock,
  useCreateTransfer,
  useDeleteStock,
  useRepairStock,
  useUpdateStock,
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
// Xatlov qatorini tahrirlash / o'chirish
// ─────────────────────────────────────────────

/**
 * BITTA OYNA, IKKI KO'RINISH: tahrirlash va o'chirish.
 *
 * ⚠️ Modal nomi `inventoryAdjust` bo'lib QOLADI: sahifadagi
 * `openModal("inventoryAdjust", { stock })` chaqiruvlari shunga bog'langan
 * va nomni o'zgartirish faqat ikki repoda qidirib yurish ishini qo'shardi.
 *
 * ⚠️ O'chirish alohida modal QILINMADI: ikkala amal ham bitta savolga
 * javob beradi — "bu qatordagi ma'lumot noto'g'ri". Xodim avval
 * to'g'rilashga kiradi va qator umuman ortiqcha ekanini shu yerda ko'radi.
 */
export const EditStockModal = () => (
  <ResponsiveModal
    name="inventoryAdjust"
    title="Xatlov qatorini tahrirlash"
    className="max-w-lg"
  >
    <EditStockForm />
  </ResponsiveModal>
);

const EditStockForm = ({ close, isLoading, setIsLoading, stock }) => {
  const { can } = usePermissions();

  // ⚠️ Ikkala kalit ham MUSTAQIL (`inventory.routes.js`): faqat
  // `inventory.delete` berilgan xodim ham shu oynani ochadi
  // (`StockPage` dagi `canEditRow`). Unga tahrir maydonlari
  // ko'rsatilsa, "Saqlash" serverda 403 bilan qaytardi.
  const canAdjust = can("inventory.adjust");
  const canDelete = can("inventory.delete");

  const [view, setView] = useState(canAdjust ? "edit" : "delete");

  if (!stock) return null;

  return (
    <div className="space-y-5">
      {/* Qatorning BOSHLANG'ICH holati. Tanlagichlar o'zgarganda bu blok
          O'ZGARMAYDI: u "hozir nima bor" ma'lumoti, forma qiymati emas —
          aks holda ko'chirish paytida qaydan ko'chayotgani ko'rinmay qolardi. */}
      <div className="flex items-start justify-between gap-3 rounded-xl bg-gray-50 p-3">
        <p className="min-w-0 text-sm text-gray-700">
          <span className="font-medium">{stock.itemName}</span> · {stock.locationName}
          <span className="block text-xs text-gray-500">
            Hozir: jami {stock.quantity}, yaroqsiz {stock.brokenQuantity}
          </span>
        </p>

        {/* Almashtirgich faqat IKKALA ko'rinish ham ochiq bo'lganda
            ma'noga ega — bitta tugmali "tanlov" chalg'itardi */}
        {canAdjust && canDelete && (
          <div className="flex shrink-0 items-center gap-1">
            <ViewButton
              icon={Pencil}
              title="Tahrirlash"
              active={view === "edit"}
              onClick={() => setView("edit")}
            />

            <ViewButton
              danger
              icon={Trash2}
              title="O'chirish"
              active={view === "delete"}
              onClick={() => setView("delete")}
            />
          </div>
        )}
      </div>

      {view === "delete" ? (
        <DeleteStockView
          stock={stock}
          close={close}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          // Tahrir huquqi bo'lmasa qaytadigan joy yo'q — oyna yopiladi
          onCancel={canAdjust ? () => setView("edit") : close}
        />
      ) : (
        <EditStockFields
          stock={stock}
          close={close}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      )}
    </div>
  );
};

/** Ko'rinish almashtirgichi — kulrang blokning o'ng chekkasidagi mayda tugma. */
const ViewButton = ({ icon: Icon, title, active, danger, onClick }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={cn(
      "rounded-lg p-1.5 text-gray-400 transition-colors",
      danger ? "hover:bg-red-50 hover:text-red-500" : "hover:bg-gray-200 hover:text-gray-600",
      active && (danger ? "bg-red-50 text-red-500" : "bg-gray-200 text-gray-700"),
    )}
  >
    <Icon className="size-3.5" />
  </button>
);

/**
 * Arxivlangan xona/jihoz tanlagichdan tushib qolmasin.
 *
 * Ro'yxatlar FAOL yozuvlardan quriladi, lekin tahrirdagi qator arxivlangan
 * xonada turgan bo'lishi mumkin. Joriy qiymat variantlar orasida bo'lmasa
 * Radix trigger'ni BO'SH ko'rsatadi — foydalanuvchi "xona tanlanmagan" deb
 * o'ylab boshqasini tanlaydi va qatorni bexosdan ko'chirib yuboradi
 * (`LocationForm` dagi faol bo'lmagan sinf bilan bir xil mulohaza).
 *
 * ⚠️ `isLoading` MAJBURIY. Ro'yxat hali kelmaganda `options` BO'SH
 * bo'ladi va joriy qiymat "yo'q" bo'lib ko'rinadi — yorliq bir necha yuz
 * millisekundga "— arxivlangan" bo'lib turardi. Aynan shu yolg'on yorliq
 * yuqoridagi izohda qo'rqilgan xatoni keltirib chiqaradi: xodim "jihoz
 * arxivlangan ekan" deb boshqasini tanlaydi va qator KO'CHADI.
 */
const withCurrent = (options, id, name, isLoading = false) => {
  if (!id || options.some((o) => o.value === id)) return options;

  return [
    {
      label: isLoading ? (name ?? "Tanlangan") : `${name ?? "Tanlangan"} — arxivlangan`,
      value: id,
    },
    ...options,
  ];
};

/**
 * TAHRIR KO'RINISHI — "Jihoz kiritish" oynasi bilan bir xil shaklda,
 * lekin joriy qiymatlar bilan to'ldirilgan.
 *
 * ⚠️ Boshlang'ich qiymatlar to'g'ridan-to'g'ri `useObjectState` ga
 * beriladi (`CategoryForm` / `ItemForm` bilan bir xil naqsh): modal
 * yopilganda forma UNMOUNT bo'ladi, ya'ni oyna boshqa qator uchun qayta
 * ochilganda holat noldan quriladi. Qiymatni `useEffect` bilan
 * "yangilash" bu yerda kerak emas va zarar keltirardi.
 *
 * ⚠️ Miqdor ABSOLYUT yuboriladi. Farqni server LOCK ostida hisoblaydi va
 * daftarga yozadi — mijozda hisoblansa ikki parallel tahrir bir-birini
 * yo'q qilardi.
 */
const EditStockFields = ({ stock, close, isLoading, setIsLoading }) => {
  // ⚠️ `isPending` ham olinadi — `withCurrent` ga uzatiladi (o'sha
  // funksiyaning izohiga qarang): ro'yxat kelmaguncha joriy qiymat
  // "arxivlangan" deb belgilanmasligi kerak.
  const { data: locations = [], isPending: locationsPending } = useQuery(
    inventoryQueries.activeLocations(),
  );
  const { data: items = [], isPending: itemsPending } = useQuery(
    inventoryQueries.activeItems(),
  );
  const { mutate: updateStock } = useUpdateStock();

  const { locationId, itemId, quantity, brokenQuantity, note, reason, occurredAt, setField } =
    useObjectState({
      locationId: stock.locationId,
      itemId: stock.itemId,
      quantity: String(stock.quantity),
      brokenQuantity: String(stock.brokenQuantity),
      note: stock.note ?? "",
      reason: "",
      occurredAt: todayInputValue(),
    });

  // Juftlik o'zgardi = bu TAHRIR emas, KO'CHIRISH: server eski qatordan
  // chiqim, yangisiga kirim yozadi va BOSHQA qatorni qaytaradi
  const isMoving = locationId !== stock.locationId || itemId !== stock.itemId;

  const locationName = locations.find((l) => l.id === locationId)?.name ?? stock.locationName;
  const itemName = items.find((i) => i.id === itemId)?.name ?? stock.itemName;

  /**
   * Nishon juftlikda ALLAQACHON qancha bor.
   *
   * Ko'chirishda miqdor nishon qatorga QO'SHILADI, ustiga yozilmaydi
   * (`@@unique([locationId, itemId])` — juftlikka bitta qator). "105-xonada
   * 2 ta bor" deb yozilmasa, 5 kiritgan xodim 7 chiqqanini xatolik deb
   * o'ylardi. `includeEmpty` — nishon qator nol miqdor bilan turgan
   * bo'lishi mumkin (avval bo'shatilgan).
   */
  const { data: targetList, isFetching: isCheckingTarget } = useQuery({
    ...inventoryQueries.stocks({ locationId, itemId, includeEmpty: "true", limit: 1 }),
    enabled: isMoving && Boolean(locationId && itemId),
  });
  // Qator hali bo'lmasa NOL — "u yerda hech narsa yo'q" ham javob, uni
  // ko'rsatmaslik xodimni raqamsiz qoldirardi
  const targetStock = targetList?.data?.[0];
  const targetQuantity = targetStock?.quantity ?? 0;

  const nextQuantity = Number(quantity);
  const nextBroken = Number(brokenQuantity) || 0;
  const quantityDelta = nextQuantity - stock.quantity;
  const brokenDelta = nextBroken - stock.brokenQuantity;

  // ⚠️ NOLGA TUSHIRISH — qator ro'yxatdan YO'QOLADI: registr
  // `quantity > 0` bo'yicha filtrlanadi (`includeEmpty` faqat shu
  // oynadagi tekshiruv uchun yuboriladi). Qator o'chmaydi, lekin uni
  // boshqa ochib ham, izohini o'qib ham bo'lmaydi — shuning uchun
  // ogohlantiriladi.
  const willVanish = !isMoving && nextQuantity === 0 && stock.quantity > 0;

  const isDirty =
    isMoving ||
    quantityDelta !== 0 ||
    brokenDelta !== 0 ||
    note !== (stock.note ?? "");

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    updateStock(
      {
        id: stock.id,
        data: {
          quantity: nextQuantity,
          brokenQuantity: nextBroken,
          reason,
          note,
          occurredAt,
          // Juftlik o'zgarmagan bo'lsa ham yuboriladi: server o'zi
          // taqqoslaydi va bir xil bo'lsa oddiy tahrir yo'lidan ketadi
          locationId,
          itemId,
        },
      },
      {
        onSuccess: (result) => {
          close();
          toast.success(
            // ⚠️ Ko'chirishda javobdagi qator BOSHQA (nishon juftlik),
            // shuning uchun matn ham `result` dan olinadi
            result.moved
              ? `"${result.itemName}" ${result.locationName} xonasiga ko'chirildi`
              : "Xatlov qatori yangilandi",
          );
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
          triggerClassName="w-full"
          onChange={(v) => setField("locationId", v)}
          options={withCurrent(
            locations.map((l) => ({ label: l.name, value: l.id })),
            stock.locationId,
            stock.locationName,
            locationsPending,
          )}
        />
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700">Jihoz</p>
        <Select
          value={itemId}
          placeholder="Jihozni tanlang"
          triggerClassName="w-full"
          onChange={(v) => setField("itemId", v)}
          options={withCurrent(
            items.map((i) => ({ label: i.name, value: i.id })),
            stock.itemId,
            stock.itemName,
            itemsPending,
          )}
        />
      </div>

      {isMoving && (
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          Qator{" "}
          <span className="font-medium">
            {stock.locationName} · {stock.itemName}
          </span>{" "}
          dan{" "}
          <span className="font-medium">
            {locationName} · {itemName}
          </span>{" "}
          ga ko'chiriladi. Daftarga chiqim va kirim qatorlari yoziladi
          {quantityDelta !== 0 || brokenDelta !== 0
            ? ", miqdor to'g'rilangani esa alohida sanoq farqi bo'lib tushadi"
            : ""}
          .
          {isCheckingTarget ? (
            <span className="mt-1 block text-xs">Nishon qator tekshirilmoqda...</span>
          ) : (
            <span className="mt-1 block text-xs">
              U yerda hozir {targetQuantity} ta bor: {nextQuantity || 0} ta qo'shiladi →{" "}
              {targetQuantity + (nextQuantity || 0)} ta bo'ladi.
            </span>
          )}
        </p>
      )}

      {willVanish && (
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          Miqdor NOLGA tushiriladi — qator xatlov ro'yxatidan yo'qoladi va
          uni qaytadan ochib bo'lmaydi. Jihoz haqiqatan ham yo'q bo'lsa,
          buning o'rniga <span className="font-medium">hisobdan chiqarish</span>{" "}
          to'g'riroq: u hodisani va sababini saqlaydi.
        </p>
      )}

      <InputField
        required
        min="0"
        type="number"
        name="quantity"
        label="Jami miqdor"
        value={quantity}
        description={
          quantityDelta !== 0
            ? `${stock.quantity} → ${nextQuantity} (${quantityDelta > 0 ? "+" : ""}${quantityDelta})`
            : "Xonada HOZIR nechta bor — farqni server hisoblaydi"
        }
        onChange={(e) => setField("quantity", e.target.value)}
      />

      <InputField
        min="0"
        type="number"
        name="brokenQuantity"
        label="Yaroqsizlar"
        value={brokenQuantity}
        max={quantity}
        description={
          brokenDelta !== 0
            ? `${stock.brokenQuantity} → ${nextBroken} (${brokenDelta > 0 ? "+" : ""}${brokenDelta})`
            : "Jami miqdordan ko'p bo'la olmaydi"
        }
        onChange={(e) => setField("brokenQuantity", e.target.value)}
      />

      <InputField
        name="note"
        label="Izoh (ixtiyoriy)"
        value={note}
        onChange={(e) => setField("note", e.target.value)}
      />

      <InputField
        required
        name="reason"
        label="Sabab"
        value={reason}
        placeholder={
          isMoving ? "Qator noto'g'ri xonaga kiritilgan" : "Inventarizatsiyada 1 ta kam chiqdi"
        }
        description="Daftarga yoziladi va keyin tekshiriladi — shuning uchun majburiy"
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

      <Button
        type="submit"
        disabled={isLoading || !reason.trim() || !quantity || !isDirty}
      >
        Saqlash
      </Button>
    </InputGroup>
  );
};

/**
 * O'CHIRISH KO'RINISHI — "bu yozuv umuman bo'lmasligi kerak edi".
 *
 * ⚠️ Bu hisobdan chiqarish EMAS: u hodisani qayd etadi va tarixni
 * saqlaydi, o'chirish esa daftar qatorlarini ham olib tashlaydi.
 *
 * To'siqlar (zarar yozuvi, yuborilgan kunlik hisobot) tugmani bosishdan
 * OLDIN o'qiladi: serverning xato xabari sifatida ko'rsatish kech bo'lardi
 * — xodim sababni yozib, tasdiqlab, keyin rad javobini olardi.
 */
const DeleteStockView = ({ stock, close, isLoading, setIsLoading, onCancel }) => {
  const { data: usage, isLoading: isChecking } = useQuery(
    inventoryQueries.stockUsage(stock.id),
  );
  const { mutate: deleteStock } = useDeleteStock();
  const { reason, setField } = useObjectState({ reason: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    deleteStock(
      { id: stock.id, reason },
      {
        onSuccess: (result) => {
          close();
          toast.success(`"${result.itemName}" xatlovdan o'chirildi`);
        },
        onError: showError,
        onSettled: () => setIsLoading(false),
      },
    );
  };

  if (isChecking || !usage) {
    return <p className="py-6 text-center text-sm text-gray-500">Tekshirilmoqda...</p>;
  }

  return (
    <InputGroup as="form" onSubmit={handleSubmit}>
      {usage.canDelete ? (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          <p className="font-medium">Qator butunlay o'chiriladi va qaytarilmaydi.</p>
          <ul className="mt-1 list-inside list-disc text-xs">
            <li>{usage.movements} ta daftar yozuvi</li>
            <li>{usage.draftCheckLines} ta qoralama hisobot qatori</li>
          </ul>
          <p className="mt-1 text-xs">
            Jihoz sindi yoki eskirdi bo'lsa — o'chirish emas, hisobdan chiqarish.
          </p>
        </div>
      ) : (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          <p className="font-medium">Bu qator o'chirilmaydi:</p>
          <ul className="mt-1 list-inside list-disc space-y-1 text-xs">
            {usage.blockers.map((blocker, index) => (
              <li key={index}>{blocker}</li>
            ))}
          </ul>
        </div>
      )}

      {usage.canDelete && (
        <InputField
          required
          name="reason"
          label="O'chirish sababi"
          value={reason}
          placeholder="Qator ikki marta kiritilgan"
          onChange={(e) => setField("reason", e.target.value)}
        />
      )}

      <div className="flex flex-col-reverse gap-3 xs:flex-row xs:justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="w-full xs:w-32"
        >
          Bekor qilish
        </Button>

        {usage.canDelete && (
          <Button
            type="submit"
            variant="danger"
            disabled={isLoading || !reason.trim()}
            className="w-full xs:w-32"
          >
            O'chirish
          </Button>
        )}
      </div>
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
