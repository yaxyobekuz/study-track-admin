// React
import { useMemo, useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import {
  CalendarClock,
  Copy,
  LayoutGrid,
  Plus,
  Save,
  Search,
  TriangleAlert,
  X,
} from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import Button from "@/shared/components/ui/button/Button";
import Input from "@/shared/components/ui/input/Input";
import Select from "@/shared/components/ui/select/Select";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Utils
import { cn } from "@/shared/utils/cn";

// Tokens, data & queries
import { CHIP, SURFACE, T, modeOf } from "../data/guard.tokens";
import {
  DEFAULT_MODES,
  OFFLINE_POLICIES,
  POLICY_PRESETS,
  WEEKDAYS,
  WEEK_ORDER,
  isValidClock,
  weekdayShort,
} from "../data/devices.data";
import { devicesQueries } from "../queries/devices.queries";
import { useCreatePolicy, useUpdatePolicy } from "../queries/devices.mutations";

const MODE_OPTIONS = [
  { value: "always", label: "Doim ochiq" },
  { value: "allowed", label: "Ruxsat etilgan" },
  { value: "limited", label: "Chegaralangan" },
  { value: "blocked", label: "Yopiq" },
];

/**
 * SIYOSAT MUHARRIRI — qoidalar to'plami bitta ekranda.
 *
 * ⚠️ SAQLASH BIRIKTIRISH EMAS. Muharrir hech kimga ta'sir qilmaydi:
 * siyosat biriktirilgunicha bitta telefon ham o'zgarmaydi. Bu oyna
 * shuni matnda ham aytadi — aks holda admin "saqladim, nega ishlamadi"
 * degan holatga tushardi.
 *
 * ⚠️ ILOVALAR VA OYNALAR O'RNIGA QO'YILADI (server ham shunday):
 * qisman yangilash muharrir bilan server holatini asta-sekin
 * farqlantirardi.
 *
 * ⚠️ IDENTIFIKATORI YETISHMAYDIGAN ILOVA OGOHLANTIRILADI. "YouTube
 * ruxsat" deb yozilgan-u iOS bundle id kiritilmagan bo'lsa, iPhone da
 * u baribir bloklangan bo'lib qolardi va buni hech kim sezmasdi.
 */
const PolicyEditorModal = () => (
  <ResponsiveModal
    name="devicePolicyEditor"
    title="Siyosat"
    description="Qoidalarni shu yerda yozasiz. Ular biriktirilgunicha birorta telefonga ta'sir qilmaydi."
    className="max-w-3xl"
  >
    <PolicyForm />
  </ResponsiveModal>
);

/**
 * Yuklovchi qobiq: mavjud siyosatni o'qiydi va formani `key` bilan
 * QAYTA YARATADI.
 *
 * ⚠️ EFFEKT BILAN HOLAT TO'LDIRILMAYDI. Ilgari bu "ma'lumot kelgach
 * formani to'ldirish" effekti edi va u kaskadli render berardi
 * (`react-hooks/set-state-in-effect`). `key` bilan qayta yaratish esa
 * React'ning o'z yo'li: forma boshlang'ich qiymatlarni to'g'ridan-to'g'ri
 * proplardan oladi va hech qachon "yarim to'ldirilgan" holatda
 * ko'rinmaydi.
 */
const PolicyForm = ({ close, setIsLoading, policyId }) => {
  const { data: existing, isLoading } = useQuery(devicesQueries.policy(policyId));

  // Tahrirlashda ma'lumot kelgunicha formani chizmaymiz — aks holda
  // bo'sh maydonlar ko'rinib, keyin to'lib ketardi.
  if (policyId && isLoading) {
    return <p className="py-8 text-center text-[12.5px] text-slate-400">Yuklanmoqda…</p>;
  }

  return (
    <PolicyFormBody
      key={existing?.id ?? "new"}
      existing={existing}
      policyId={policyId}
      close={close}
      setIsLoading={setIsLoading}
    />
  );
};

const PolicyFormBody = ({ close, setIsLoading, policyId, existing }) => {
  const isEdit = Boolean(policyId);

  const { data: appOptions = [] } = useQuery(devicesQueries.appOptions());

  const { state, setFields } = useObjectState({
    name: existing?.name ?? "",
    description: existing?.description ?? "",
    defaultMode: existing?.defaultMode ?? "block",
    dailyLimitMinutes:
      existing?.dailyLimitMinutes == null ? "" : String(existing.dailyLimitMinutes),
    offlinePolicy: existing?.offlinePolicy ?? "keepLast",
  });

  const [apps, setApps] = useState(() =>
    (existing?.apps || []).map((row) => ({
      appId: row.app.id,
      name: row.app.name,
      mode: row.mode,
      dailyMinutes: row.dailyMinutes ?? 30,
    })),
  );

  const [windows, setWindows] = useState(() =>
    (existing?.windows || []).map((w) => ({
      weekday: w.weekday,
      start: toClock(w.startMinute),
      end: toClock(w.endMinute),
    })),
  );

  const [appSearch, setAppSearch] = useState("");

  const { mutate: createPolicy } = useCreatePolicy();
  const { mutate: updatePolicy } = useUpdatePolicy();

  const chosen = new Set(apps.map((a) => a.appId));
  const available = useMemo(
    () =>
      appOptions
        .filter((app) => !chosen.has(app.id))
        .filter((app) =>
          appSearch ? app.name.toLowerCase().includes(appSearch.toLowerCase()) : true,
        )
        .slice(0, 40),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [appOptions, appSearch, apps],
  );

  /** Tanlangan ilovalarda platforma identifikatori yetishmaydiganlar. */
  const missing = useMemo(() => {
    const byId = new Map(appOptions.map((a) => [a.id, a]));
    return apps
      .map((row) => byId.get(row.appId))
      .filter(Boolean)
      .filter((app) => !app.androidPackage || !app.iosBundleId)
      .map((app) => ({ name: app.name, platform: app.androidPackage ? "iOS" : "Android" }));
  }, [apps, appOptions]);

  const addApp = (app) =>
    setApps((prev) => [
      ...prev,
      { appId: app.id, name: app.name, mode: app.isEssential ? "always" : "allowed", dailyMinutes: 30 },
    ]);

  const patchApp = (appId, patch) =>
    setApps((prev) => prev.map((row) => (row.appId === appId ? { ...row, ...patch } : row)));

  const removeApp = (appId) => setApps((prev) => prev.filter((row) => row.appId !== appId));

  const addWindow = () =>
    setWindows((prev) => [...prev, { weekday: 1, start: "16:00", end: "20:00" }]);

  const patchWindow = (index, patch) =>
    setWindows((prev) => prev.map((w, i) => (i === index ? { ...w, ...patch } : w)));

  const removeWindow = (index) => setWindows((prev) => prev.filter((_, i) => i !== index));

  /** Birinchi oynani hamma ish kuniga nusxalaydi — eng ko'p kerak bo'ladigan amal. */
  const copyToWeek = () => {
    const first = windows[0];
    if (!first) return;
    setWindows(WEEK_ORDER.map((weekday) => ({ weekday, start: first.start, end: first.end })));
  };

  const applyPreset = (preset) => {
    setFields({ name: state.name || preset.name, description: preset.description });
    setWindows(preset.windows.map((w) => ({ ...w })));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!state.name.trim()) return toast.error("Siyosat nomini kiriting");

    for (const w of windows) {
      if (!isValidClock(w.start) || !isValidClock(w.end)) {
        return toast.error("Vaqt «HH:mm» ko'rinishida bo'lishi kerak");
      }
      if (toMinutes(w.end) <= toMinutes(w.start)) {
        return toast.error(
          "Tugash vaqti boshlanishdan keyin bo'lsin. Yarim tundan oshadigan oynani ikkiga bo'ling: 22:00–24:00 va 00:00–07:00",
        );
      }
    }

    const payload = {
      name: state.name.trim(),
      description: state.description.trim(),
      defaultMode: state.defaultMode,
      dailyLimitMinutes:
        state.dailyLimitMinutes === "" ? null : Number(state.dailyLimitMinutes),
      offlinePolicy: state.offlinePolicy,
      apps: apps.map((row) => ({
        appId: row.appId,
        mode: row.mode,
        ...(row.mode === "limited" ? { dailyMinutes: Number(row.dailyMinutes) } : {}),
      })),
      windows: windows.map((w) => ({ weekday: w.weekday, start: w.start, end: w.end })),
    };

    setIsLoading(true);
    const onDone = {
      onSuccess: () => {
        close();
        toast.success(isEdit ? "Siyosat saqlandi" : "Siyosat yaratildi");
      },
      onError: (err) => toast.error(err.response?.data?.message || "Saqlanmadi"),
      onSettled: () => setIsLoading(false),
    };

    if (isEdit) updatePolicy({ id: policyId, data: payload }, onDone);
    else createPolicy(payload, onDone);
  };

  return (
    <form onSubmit={handleSubmit} className="max-h-[72vh] space-y-4 overflow-y-auto pr-1">
      {/* ── Asosiy ── */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className={cn(T.label, "mb-1.5")}>Nomi *</p>
          <Input
            value={state.name}
            onChange={(e) => setFields({ name: e.target.value })}
            placeholder="Masalan: Dars vaqti"
            maxLength={120}
          />
        </div>
        <div>
          <p className={cn(T.label, "mb-1.5")}>Izoh</p>
          <Input
            value={state.description}
            onChange={(e) => setFields({ description: e.target.value })}
            placeholder="Qisqacha tavsif"
            maxLength={500}
          />
        </div>
      </div>

      {!isEdit && (
        <div className="flex flex-wrap gap-1.5">
          {POLICY_PRESETS.map((preset) => (
            <button
              key={preset.key}
              type="button"
              onClick={() => applyPreset(preset)}
              className={cn(CHIP, "bg-slate-100 text-slate-600 hover:bg-slate-200")}
            >
              <Plus className="size-2.5" strokeWidth={2.5} />
              {preset.name}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <p className={cn(T.label, "mb-1.5")}>Ro'yxat turi</p>
          <Select
            value={state.defaultMode}
            options={DEFAULT_MODES.map((m) => ({ value: m.value, label: m.label }))}
            onChange={(value) => setFields({ defaultMode: value })}
          />
          <p className={cn(T.hint, "mt-1")}>
            {DEFAULT_MODES.find((m) => m.value === state.defaultMode)?.hint}
          </p>
        </div>
        <div>
          <p className={cn(T.label, "mb-1.5")}>Kunlik limit (daqiqa)</p>
          <Input
            type="number"
            min={0}
            max={1440}
            value={state.dailyLimitMinutes}
            onChange={(e) => setFields({ dailyLimitMinutes: e.target.value })}
            placeholder="Chegarasiz"
          />
          <p className={cn(T.hint, "mt-1")}>
            «Doim ochiq» ilovalar bu chegaraga kirmaydi
          </p>
        </div>
        <div>
          <p className={cn(T.label, "mb-1.5")}>Internet yo'qolganda</p>
          <Select
            value={state.offlinePolicy}
            options={OFFLINE_POLICIES.map((m) => ({ value: m.value, label: m.label }))}
            onChange={(value) => setFields({ offlinePolicy: value })}
          />
          <p className={cn(T.hint, "mt-1")}>
            {OFFLINE_POLICIES.find((m) => m.value === state.offlinePolicy)?.hint}
          </p>
        </div>
      </div>

      {/* ── Vaqt oynalari ── */}
      <section className={cn(SURFACE.inset, "p-4")}>
        <div className="mb-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <CalendarClock className="size-3.5 text-slate-400" strokeWidth={2} />
            <p className={T.label}>Telefon qachon ishlaydi</p>
          </div>
          <div className="flex gap-1.5">
            {windows.length > 0 && (
              <Button type="button" size="sm" variant="ghost" className="h-7" onClick={copyToWeek}>
                <Copy className="size-3" />
                Butun haftaga
              </Button>
            )}
            <Button type="button" size="sm" variant="outline" className="h-7" onClick={addWindow}>
              <Plus className="size-3" />
              Oyna
            </Button>
          </div>
        </div>

        {windows.length === 0 ? (
          <p className="rounded-lg bg-white px-3.5 py-3 text-[12px] leading-relaxed text-slate-500">
            Vaqt oynasi yo'q — <strong className="font-medium">vaqt cheklovi qo'llanmaydi</strong>.
            Faqat ilova qoidalari va kunlik limit ishlaydi.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {windows.map((w, index) => (
              <li key={index} className="flex items-center gap-2 rounded-lg bg-white px-2.5 py-2">
                <Select
                  triggerClassName="h-8 w-32"
                  value={String(w.weekday)}
                  options={WEEK_ORDER.map((value) => ({
                    value: String(value),
                    label: WEEKDAYS.find((d) => d.value === value).label,
                  }))}
                  onChange={(value) => patchWindow(index, { weekday: Number(value) })}
                />
                <Input
                  type="time"
                  className="h-8 w-28"
                  value={w.start}
                  onChange={(e) => patchWindow(index, { start: e.target.value })}
                />
                <span className="text-slate-400">—</span>

                {/*
                  ⚠️ "YARIM TUNGACHA" ALOHIDA TUGMA va bu ataylab.
                  `<input type="time">` eng kechi 23:59 ni qabul qiladi —
                  24:00 ni umuman ifodalay olmaydi. Shu sababli 22:00 dan
                  yarim tungacha ochiq oyna "22:00–23:59" bo'lib yozilardi
                  va kunning oxirgi daqiqasi jimgina yopiq qolardi.
                  Tugma bosilganda qiymat aniq "24:00" bo'ladi (server
                  `parseClock` uni qabul qiladi) va input o'rniga yorliq
                  ko'rsatiladi.
                */}
                {w.end === "24:00" ? (
                  <button
                    type="button"
                    onClick={() => patchWindow(index, { end: "23:00" })}
                    className={cn(CHIP, "h-8 bg-slate-900 px-3 text-white")}
                  >
                    24:00
                  </button>
                ) : (
                  <Input
                    type="time"
                    className="h-8 w-28"
                    value={w.end}
                    onChange={(e) => patchWindow(index, { end: e.target.value })}
                  />
                )}

                <button
                  type="button"
                  onClick={() =>
                    patchWindow(index, { end: w.end === "24:00" ? "23:00" : "24:00" })
                  }
                  title="Yarim tungacha (24:00)"
                  className={cn(
                    "rounded-lg px-2 py-1 text-[10.5px] font-medium transition-colors",
                    w.end === "24:00"
                      ? "bg-slate-100 text-slate-500"
                      : "text-slate-400 hover:bg-slate-100 hover:text-slate-700",
                  )}
                >
                  {w.end === "24:00" ? "vaqt tanlash" : "yarim tungacha"}
                </button>

                <button
                  type="button"
                  onClick={() => removeWindow(index)}
                  className="ml-auto flex size-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                  aria-label="Oynani olib tashlash"
                >
                  <X className="size-3.5" strokeWidth={2.4} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Ilovalar ── */}
      <section className={cn(SURFACE.inset, "p-4")}>
        <div className="mb-2.5 flex items-center gap-1.5">
          <LayoutGrid className="size-3.5 text-slate-400" strokeWidth={2} />
          <p className={T.label}>Ilovalar qoidasi</p>
        </div>

        {apps.length > 0 && (
          <ul className="mb-3 space-y-1.5">
            {apps.map((row) => (
              <li
                key={row.appId}
                className="flex flex-wrap items-center gap-2 rounded-lg bg-white px-2.5 py-2"
              >
                <span className={cn(T.tdName, "min-w-0 flex-1 truncate")}>{row.name}</span>

                <Select
                  triggerClassName="h-8 w-40"
                  value={row.mode}
                  options={MODE_OPTIONS}
                  onChange={(value) => patchApp(row.appId, { mode: value })}
                />

                {row.mode === "limited" && (
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      min={1}
                      max={1440}
                      className="h-8 w-20"
                      value={row.dailyMinutes}
                      onChange={(e) => patchApp(row.appId, { dailyMinutes: e.target.value })}
                    />
                    <span className="text-[11px] text-slate-400">daq/kun</span>
                  </div>
                )}

                <span className={cn(CHIP, modeOf(row.mode).chip)}>
                  {modeOf(row.mode).hint}
                </span>

                <button
                  type="button"
                  onClick={() => removeApp(row.appId)}
                  className="flex size-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                  aria-label="Ilovani olib tashlash"
                >
                  <X className="size-3.5" strokeWidth={2.4} />
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Qo'shish */}
        <div className="relative mb-2">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
          <Input
            value={appSearch}
            onChange={(e) => setAppSearch(e.target.value)}
            placeholder="Ilova qidiring va qo'shing"
            className="h-9 bg-white pl-8 text-[12.5px]"
          />
        </div>

        <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto">
          {available.length === 0 ? (
            <p className="px-1 py-1 text-[11.5px] text-slate-400">
              {appOptions.length === 0
                ? "Katalog bo'sh — «Ilovalar» tabida ilova qo'shing"
                : "Mos ilova topilmadi"}
            </p>
          ) : (
            available.map((app) => (
              <button
                key={app.id}
                type="button"
                onClick={() => addApp(app)}
                className={cn(
                  CHIP,
                  "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100",
                )}
              >
                <Plus className="size-2.5" strokeWidth={2.5} />
                {app.name}
              </button>
            ))
          )}
        </div>

        {/* ⚠️ Jim bo'shliqni ochadigan ogohlantirish */}
        {missing.length > 0 && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5">
            <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-amber-600" strokeWidth={2} />
            <p className="text-[11.5px] leading-relaxed text-amber-900">
              {missing.map((m) => `${m.name} (${m.platform})`).join(", ")} — bu
              ilovalarda ko'rsatilgan platforma uchun identifikator yo'q, ya'ni
              o'sha telefonlarda qoida qo'llanmaydi. «Ilovalar» tabida
              to'ldiring.
            </p>
          </div>
        )}
      </section>

      <div className="flex gap-2 pt-1">
        <Button type="button" variant="outline" className="flex-1" onClick={() => close()}>
          Bekor qilish
        </Button>
        <Button type="submit" className="flex-1">
          <Save className="size-4" />
          {isEdit ? "Saqlash" : "Yaratish"}
        </Button>
      </div>
    </form>
  );
};

/* ─────────────────────── YORDAMCHILAR ─────────────────────── */

/**
 * Daqiqa → "HH:mm".
 *
 * ⚠️ 1440 → "24:00", "00:00" EMAS. `% 24` bilan yozilsa yarim tungacha
 * ochiq oyna muharrirda "00:00" bo'lib ko'rinardi va keyingi saqlashda
 * "tugash boshlanishdan keyin bo'lsin" xatosini berardi — oyna esa
 * aslida to'g'ri edi.
 */
const toClock = (minute) => {
  if (minute >= 1440) return "24:00";
  return `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
};

const toMinutes = (clock) => {
  const [h, m] = String(clock).split(":").map(Number);
  return h * 60 + m;
};

export default PolicyEditorModal;
