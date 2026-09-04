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
import Combobox from "@/shared/components/form/combobox";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Utils
import { formatMoney } from "@/shared/utils/formatMoney";

// Data & queries
import { DAMAGE_KINDS, NO_ADVANCE_HINT, SEALED_HINT } from "../data/inventory.data";
import { inventoryQueries } from "../queries/inventory.queries";
import {
  useCancelCharge,
  useCancelDamage,
  useCreateCharges,
  useCreateDamage,
  useCreateDamagePayment,
  useVoidDamagePayment,
  useWaiveDamage,
} from "../queries/inventory.mutations";
import { usersQueries } from "@/features/users/queries/users.queries";
import { financeQueries } from "@/features/finance/queries/finance.queries";
import { damagesAPI } from "../api/inventory.api";

const showError = (err) =>
  toast.error(err.response?.data?.message || "Xatolik yuz berdi");

const todayInputValue = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const fullNameOf = (user) => `${user.firstName} ${user.lastName ?? ""}`.trim();

// ─────────────────────────────────────────────
// Zarar qayd etish
// ─────────────────────────────────────────────

export const DamageModal = () => (
  <ResponsiveModal name="inventoryDamage" title="Zarar qayd etish">
    <DamageForm />
  </ResponsiveModal>
);

const DamageForm = ({ close, isLoading, setIsLoading }) => {
  const { data: locations = [] } = useQuery(inventoryQueries.activeLocations());
  const { data: settings } = useQuery(inventoryQueries.settings());
  const { mutate: createDamage } = useCreateDamage();

  const { locationId, itemId, kind, quantity, occurredAt, description, setField } =
    useObjectState({
      locationId: "",
      itemId: "",
      kind: "broken",
      quantity: "1",
      occurredAt: todayInputValue(),
      description: "",
    });

  const [files, setFiles] = useState([]);

  // Faqat xonada MAVJUD jihozni sindirish mumkin
  const { data: stock } = useQuery({
    ...inventoryQueries.stockByLocation(locationId),
    enabled: Boolean(locationId),
  });

  const availableItems = stock?.items ?? [];
  const selected = availableItems.find((s) => s.itemId === itemId);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    createDamage(
      { locationId, itemId, kind, quantity, occurredAt, description, files },
      {
        onSuccess: () => {
          close();
          toast.success("Zarar qayd etildi");
        },
        onError: showError,
        onSettled: () => setIsLoading(false),
      },
    );
  };

  const photoRequired = settings?.requirePhoto && files.length === 0;

  return (
    <InputGroup as="form" onSubmit={handleSubmit}>
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700">Xona</p>
        <Select
          value={locationId}
          placeholder="Xonani tanlang"
          onChange={(v) => {
            setField("locationId", v);
            setField("itemId", "");
          }}
          options={locations.map((l) => ({ label: l.name, value: l.id }))}
        />
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700">Jihoz</p>
        <Select
          value={itemId}
          placeholder={locationId ? "Jihozni tanlang" : "Avval xonani tanlang"}
          onChange={(v) => setField("itemId", v)}
          options={availableItems.map((s) => ({
            label: `${s.itemName} (${s.serviceableQuantity} ta yaroqli)`,
            value: s.itemId,
          }))}
        />
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700">Zarar turi</p>
        <Select
          value={kind}
          onChange={(v) => setField("kind", v)}
          options={DAMAGE_KINDS}
        />
        <p className="text-xs text-gray-500">
          {kind === "missing"
            ? "Yo'qolgan buyum xatlovdan CHIQADI — jami miqdor kamayadi."
            : "Singan buyum xonada qoladi, lekin yaroqsizlar safiga o'tadi."}
        </p>
      </div>

      <InputField
        required
        min="1"
        type="number"
        name="quantity"
        label="Nechta"
        value={quantity}
        max={kind === "missing" ? selected?.quantity : selected?.serviceableQuantity}
        onChange={(e) => setField("quantity", e.target.value)}
      />

      <InputField
        required
        type="date"
        name="occurredAt"
        label="Qachon"
        value={occurredAt}
        max={todayInputValue()}
        onChange={(e) => setField("occurredAt", e.target.value)}
      />

      <InputField
        name="description"
        label="Tafsilot"
        value={description}
        placeholder="Tanaffusda o'ynab turib sindirishdi"
        onChange={(e) => setField("description", e.target.value)}
      />

      <FilePicker files={files} onChange={setFiles} required={settings?.requirePhoto} />

      <p className="rounded-xl bg-gray-50 p-3 text-xs text-gray-600">{SEALED_HINT}</p>

      <Button
        type="submit"
        disabled={isLoading || !locationId || !itemId || !quantity || photoRequired}
      >
        Qayd etish
      </Button>
    </InputGroup>
  );
};

/** Rasm tanlagich — zararning "qanday" degan savoliga javob. */
const FilePicker = ({ files, onChange, required }) => (
  <div className="space-y-1.5">
    <p className="text-sm font-medium text-gray-700">
      Rasm {required && <span className="text-primary">*</span>}
    </p>

    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 px-3 py-4 text-sm text-gray-500 hover:border-gray-400">
      <Plus className="size-4" />
      Rasm tanlash
      <input
        multiple
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onChange([...files, ...(e.target.files ?? [])])}
      />
    </label>

    {files.length > 0 && (
      <div className="space-y-1">
        {files.map((file, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-2 rounded-lg bg-gray-50 px-2 py-1 text-xs text-gray-600"
          >
            <span className="truncate">{file.name}</span>
            <button
              type="button"
              onClick={() => onChange(files.filter((_, i) => i !== index))}
              className="shrink-0 rounded p-0.5 text-gray-400 hover:text-red-500"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
);

// ─────────────────────────────────────────────
// Aybdorga yozish
// ─────────────────────────────────────────────

export const ChargeModal = () => (
  <ResponsiveModal name="inventoryCharge" title="Aybdorga yozish" className="max-w-lg">
    <ChargeForm />
  </ResponsiveModal>
);

/**
 * BIR ZARARDA BIR NECHTA AYBDOR bo'lishi mumkin ("derazani uchovi birga
 * sindirdi"). Summa kiritilmasa server qoldiqni TENG bo'ladi — tiyin
 * yo'qolmasligi uchun yaxlitlash qoidasi serverda.
 */
const ChargeForm = ({ close, isLoading, setIsLoading, damage }) => {
  const { data: allUsers = [] } = useQuery(usersQueries.allShort());
  const { mutate: createCharges } = useCreateCharges();

  const [people, setPeople] = useState([{ personId: "", amount: "" }]);
  const { dueDate, note, setField } = useObjectState({ dueDate: "", note: "" });

  const setPerson = (index, key, value) =>
    setPeople((prev) => prev.map((p, i) => (i === index ? { ...p, [key]: value } : p)));

  const addPerson = () => setPeople((prev) => [...prev, { personId: "", amount: "" }]);

  const removePerson = (index) =>
    setPeople((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));

  const filled = people.filter((p) => p.personId);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    createCharges(
      {
        damageId: damage.id,
        data: {
          dueDate: dueDate || null,
          note,
          people: filled.map((p) => ({
            personId: p.personId,
            // Bo'sh qoldirilsa — server qoldiqni teng bo'ladi
            ...(p.amount ? { amount: p.amount } : {}),
          })),
        },
      },
      {
        onSuccess: (result) => {
          close();
          toast.success(`${result.length} ta aybdorga qarz yozildi`);
        },
        onError: showError,
        onSettled: () => setIsLoading(false),
      },
    );
  };

  if (!damage) return null;

  const options = allUsers.map((u) => ({
    label: `${fullNameOf(u)} · ${u.role === "student" ? "o'quvchi" : u.role}`,
    value: u.id,
  }));

  return (
    <InputGroup as="form" onSubmit={handleSubmit}>
      <div className="rounded-xl bg-gray-50 p-3 text-sm">
        <p className="font-medium text-gray-900">
          {damage.itemName} ×{damage.quantity} · {damage.kindLabel}
        </p>
        <p className="mt-0.5 text-xs text-gray-500">
          {damage.locationName} · zarar {formatMoney(damage.amount)}
        </p>
        <p className="mt-1 text-xs font-medium text-amber-700">
          Yozilmagan qoldiq: {formatMoney(damage.unchargedAmount)}
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Aybdorlar</p>

        {people.map((person, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <Combobox
                options={options}
                value={person.personId}
                placeholder="Aybdorni tanlang"
                onChange={(v) => setPerson(index, "personId", v)}
              />
            </div>

            <input
              min="0"
              type="number"
              placeholder="Teng"
              value={person.amount}
              title="Bo'sh qoldirilsa qoldiq teng bo'linadi"
              onChange={(e) => setPerson(index, "amount", e.target.value)}
              className="w-28 rounded-xl border border-gray-200 px-2 py-2 text-sm"
            />

            <button
              type="button"
              onClick={() => removePerson(index)}
              disabled={people.length === 1}
              className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-30"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}

        <Button type="button" variant="outline" size="sm" onClick={addPerson}>
          <Plus />
          Aybdor qo'shish
        </Button>

        <p className="text-xs text-gray-500">
          Summa kiritilmasa qoldiq tanlangan odamlar orasida teng bo'linadi.
          Ulushlar yig'indisi zarar summasidan oshib keta olmaydi.
        </p>
      </div>

      <InputField
        type="date"
        name="dueDate"
        label="To'lash muddati (ixtiyoriy)"
        value={dueDate}
        description="Muddati o'tgan qarzlar alohida kesimda ko'rinadi"
        onChange={(e) => setField("dueDate", e.target.value)}
      />

      <InputField
        name="note"
        label="Izoh (ixtiyoriy)"
        value={note}
        onChange={(e) => setField("note", e.target.value)}
      />

      <Button type="submit" disabled={isLoading || filled.length === 0}>
        Qarz yozish
      </Button>
    </InputGroup>
  );
};

// ─────────────────────────────────────────────
// Undiruv (to'lov)
// ─────────────────────────────────────────────

export const DamagePaymentModal = () => (
  <ResponsiveModal name="inventoryDamagePayment" title="Moddiy zararni undirish">
    <DamagePaymentForm />
  </ResponsiveModal>
);

/**
 * ⚠️ QARZDAN ORTIQ TO'LOV RAD ETILADI — moddiy zararda avans yo'q.
 * Shuning uchun forma to'lovdan OLDIN taqsimotni ko'rsatadi: kassir
 * "bu pul qaysi zararlarga ketadi" degan savolga javob oladi.
 */
const DamagePaymentForm = ({ close, isLoading, setIsLoading, personId, personName }) => {
  const { data: accounts = [] } = useQuery(financeQueries.activeAccounts());
  const { data: settings } = useQuery(inventoryQueries.settings());
  const { data: summary } = useQuery(inventoryQueries.personDebt(personId));
  const { mutate: createPayment } = useCreateDamagePayment();

  const { amount, accountId, paidAt, note, setField } = useObjectState({
    amount: "",
    accountId: "",
    paidAt: todayInputValue(),
    note: "",
  });

  const [preview, setPreview] = useState(null);

  const outstanding = summary?.totals?.remainingAmount ?? "0.00";
  const resolvedAccount =
    accountId || settings?.defaultAccountId || (accounts.length === 1 ? accounts[0].id : "");

  const handlePreview = async () => {
    if (!amount) return;

    try {
      const { data } = await damagesAPI.previewPayment({ personId, amount });
      setPreview(data.data);
    } catch (err) {
      showError(err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    createPayment(
      { personId, accountId: resolvedAccount, amount, paidAt, note },
      {
        onSuccess: (result) => {
          close();
          toast.success(`To'lov qabul qilindi · chek #${result.receiptNo}`);
        },
        onError: showError,
        onSettled: () => setIsLoading(false),
      },
    );
  };

  const exceeds = amount && Number(amount) > Number(outstanding);

  return (
    <InputGroup as="form" onSubmit={handleSubmit}>
      <div className="rounded-xl bg-gray-50 p-3 text-sm">
        <p className="font-medium text-gray-900">{personName ?? summary?.personName}</p>
        <p className="mt-0.5 text-xs text-gray-500">
          Moddiy zarar qarzi:{" "}
          <span className="font-semibold text-red-600">{formatMoney(outstanding)}</span>
        </p>
      </div>

      <InputField
        required
        min="1"
        type="number"
        name="amount"
        label="To'lov summasi"
        value={amount}
        description={amount ? formatMoney(amount) : "So'mda"}
        onChange={(e) => {
          setField("amount", e.target.value);
          setPreview(null);
        }}
      />

      {exceeds && (
        <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800">
          Summa qarzdan ko'p. {NO_ADVANCE_HINT}
        </p>
      )}

      {amount && !exceeds && (
        <Button type="button" variant="outline" size="sm" onClick={handlePreview}>
          Taqsimotni ko'rish
        </Button>
      )}

      {preview && (
        <div className="rounded-xl bg-blue-50 p-3 text-xs text-blue-900">
          <p className="font-medium">Bu pul quyidagilarga taqsimlanadi:</p>
          <ul className="mt-1 space-y-0.5">
            {preview.allocations.map((a) => (
              <li key={a.chargeId} className="flex justify-between gap-2">
                <span>{a.itemName ?? "Zarar"}</span>
                <span className="font-medium">{formatMoney(a.amount)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-1 text-blue-700">Eng eski qarzdan boshlab yopiladi.</p>
        </div>
      )}

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700">To'lov turi</p>
        <Select
          value={resolvedAccount}
          placeholder="To'lov turini tanlang"
          onChange={(v) => setField("accountId", v)}
          options={accounts.map((a) => ({ label: a.name, value: a.id }))}
        />
      </div>

      <InputField
        required
        type="date"
        name="paidAt"
        label="Sana"
        value={paidAt}
        max={todayInputValue()}
        onChange={(e) => setField("paidAt", e.target.value)}
      />

      <InputField
        name="note"
        label="Izoh (ixtiyoriy)"
        value={note}
        onChange={(e) => setField("note", e.target.value)}
      />

      <Button type="submit" disabled={isLoading || !amount || !resolvedAccount || exceeds}>
        To'lovni qabul qilish
      </Button>
    </InputGroup>
  );
};

// ─────────────────────────────────────────────
// Sabab so'raydigan modallar
// ─────────────────────────────────────────────

/**
 * Bekor qilish / maktab hisobidan — hammasi SABAB talab qiladi.
 *
 * Bitta forma, to'rtta modal: matn boshqa, mexanika bir xil. To'rtta
 * alohida komponent bir xil o'n qatorni takrorlardi.
 */
const ReasonForm = ({ close, isLoading, setIsLoading, config }) => {
  const [reason, setReason] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    config.mutate(reason, {
      onSuccess: () => {
        close();
        toast.success(config.successMessage);
      },
      onError: showError,
      onSettled: () => setIsLoading(false),
    });
  };

  return (
    <InputGroup as="form" onSubmit={handleSubmit}>
      {config.summary}

      <p className={`rounded-xl p-3 text-sm ${config.hintClassName}`}>{config.hint}</p>

      <InputField
        required
        name="reason"
        label="Sabab"
        value={reason}
        placeholder={config.placeholder}
        onChange={(e) => setReason(e.target.value)}
      />

      {/* Kodbaza konvensiyasi: buzuvchi amalda ham oddiy tugma, yopish
          uchun `secondary` (ReasonModal bilan bir xil) */}
      <Button type="submit" disabled={isLoading || !reason.trim()}>
        {config.submitLabel}
      </Button>
    </InputGroup>
  );
};

export const WaiveDamageModal = () => (
  <ResponsiveModal name="inventoryWaive" title="Maktab hisobidan">
    <WaiveDamageBody />
  </ResponsiveModal>
);

const WaiveDamageBody = ({ damage, ...rest }) => {
  const { mutate } = useWaiveDamage();
  if (!damage) return null;

  return (
    <ReasonForm
      {...rest}
      config={{
        mutate: (reason, handlers) => mutate({ id: damage.id, reason }, handlers),
        successMessage: "Zarar maktab hisobidan deb belgilandi",
        hintClassName: "bg-gray-50 text-gray-700",
        hint:
          "Bu BEKOR QILISH emas: zarar hisobotda qoladi, faqat hech kimdan " +
          "undirilmaydi. Tabiiy eskirish va forsmajor uchun.",
        placeholder: "Tabiiy eskirish",
        submitLabel: "Maktab hisobidan",
        summary: <DamageSummary damage={damage} />,
      }}
    />
  );
};

export const CancelDamageModal = () => (
  <ResponsiveModal name="inventoryCancelDamage" title="Zararni bekor qilish">
    <CancelDamageBody />
  </ResponsiveModal>
);

const CancelDamageBody = ({ damage, ...rest }) => {
  const { mutate } = useCancelDamage();
  if (!damage) return null;

  return (
    <ReasonForm
      {...rest}
      config={{
        mutate: (reason, handlers) => mutate({ id: damage.id, reason }, handlers),
        successMessage: "Zarar bekor qilindi",
        hintClassName: "bg-red-50 text-red-800",
        hint:
          "Zararning O'ZI xato yozilgan bo'lsa ishlatiladi: xatlovga teskari " +
          "qator yoziladi va hodisa hisobotdan chiqadi.",
        placeholder: "Xato kiritilgan — jihoz sinmagan",
        submitLabel: "Bekor qilish",
        summary: <DamageSummary damage={damage} />,
      }}
    />
  );
};

export const CancelChargeModal = () => (
  <ResponsiveModal name="inventoryCancelCharge" title="Qarzni bekor qilish">
    <CancelChargeBody />
  </ResponsiveModal>
);

const CancelChargeBody = ({ charge, ...rest }) => {
  const { mutate } = useCancelCharge();
  if (!charge) return null;

  return (
    <ReasonForm
      {...rest}
      config={{
        mutate: (reason, handlers) => mutate({ id: charge.id, reason }, handlers),
        successMessage: "Qarz bekor qilindi",
        hintClassName: "bg-red-50 text-red-800",
        hint:
          "Qarz bekor qilinadi va zarar yana 'aybdor aniqlanmagan' holatiga " +
          "qaytadi. To'lov tushgan qarzni bekor qilib bo'lmaydi.",
        placeholder: "Aybdor noto'g'ri aniqlangan",
        submitLabel: "Bekor qilish",
        summary: (
          <div className="rounded-xl bg-gray-50 p-3 text-sm">
            <p className="font-medium text-gray-900">{charge.personName}</p>
            <p className="mt-0.5 text-xs text-gray-500">
              {charge.damage?.itemName} · {formatMoney(charge.amount)}
            </p>
          </div>
        ),
      }}
    />
  );
};

export const VoidDamagePaymentModal = () => (
  <ResponsiveModal name="inventoryVoidPayment" title="To'lovni bekor qilish">
    <VoidPaymentBody />
  </ResponsiveModal>
);

const VoidPaymentBody = ({ payment, ...rest }) => {
  const { mutate } = useVoidDamagePayment();
  if (!payment) return null;

  return (
    <ReasonForm
      {...rest}
      config={{
        mutate: (reason, handlers) => mutate({ id: payment.id, reason }, handlers),
        successMessage: "To'lov bekor qilindi",
        hintClassName: "bg-red-50 text-red-800",
        hint:
          "Uch narsa BIRGA qaytariladi: taqsimotlar, qarz holati va kassa " +
          "qoldig'i. Qisman bekor qilish yo'q.",
        placeholder: "Chek xato kiritilgan",
        submitLabel: "Bekor qilish",
        summary: (
          <div className="rounded-xl bg-gray-50 p-3 text-sm">
            <p className="font-medium text-gray-900">
              Chek #{payment.receiptNo} · {payment.personName}
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
              {formatMoney(payment.amount)} · {payment.accountName}
            </p>
          </div>
        ),
      }}
    />
  );
};

const DamageSummary = ({ damage }) => (
  <div className="rounded-xl bg-gray-50 p-3 text-sm">
    <p className="font-medium text-gray-900">
      {damage.itemName} ×{damage.quantity}
    </p>
    <p className="mt-0.5 text-xs text-gray-500">
      {damage.locationName} · {formatMoney(damage.amount)}
    </p>
  </div>
);
