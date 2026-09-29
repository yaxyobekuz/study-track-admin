// Icons
import { Users } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { PRESENCE, STUDENT_SYSTEMS } from "../data/studentSystems.data";

/**
 * SANOQ KARTALARI — joriy qamrovdagi (butun maktab yoki tanlangan sinf)
 * o'quvchilar va har tizim bo'yicha "bor / yo'q".
 *
 * ⚠️ Sanoq faqat SINF filtriga bog'liq (server `summary`): qidiruv yoki
 * "ERP da yo'q" tanlanganda ham kartalar sinf manzarasini ko'rsatib turadi.
 *
 * "Bor" / "Yo'q" bosilsa — o'sha filtr qo'yiladi, qayta bosilsa olinadi.
 *
 * @param {object} props
 * @param {object} [props.summary] - `{ students, systems: { erp: {yes,no}, ... } }`
 * @param {string} props.scopeLabel - "Butun maktab" / sinf nomi
 * @param {Record<string, string>} props.presence - joriy filtrlar
 * @param {(system: string, value: string) => void} props.onFilter
 */
const SystemSummaryCards = ({ summary, scopeLabel, presence, onFilter }) => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
    <div className="rounded-2xl bg-white p-4">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Users className="size-4" strokeWidth={1.75} />
        O'quvchilar
      </div>
      <p className="mt-2 text-2xl font-semibold text-gray-900">
        {summary ? summary.students : "—"}
      </p>
      <p className="mt-1 truncate text-xs text-gray-500">{scopeLabel}</p>
    </div>

    {STUDENT_SYSTEMS.map(({ key, label }) => (
      <SystemCard
        key={key}
        label={label}
        counts={summary?.systems?.[key]}
        total={summary?.students ?? 0}
        active={presence[key]}
        onFilter={(value) => onFilter(key, value)}
      />
    ))}
  </div>
);

const SystemCard = ({ label, counts, total, active, onFilter }) => {
  const percent = counts && total > 0 ? Math.round((counts.yes / total) * 100) : 0;

  // Faol filtrni qayta bosish — filtrni olib tashlaydi
  const toggle = (value) => onFilter(active === value ? PRESENCE.ALL : value);

  return (
    <div className="rounded-2xl bg-white p-4">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <p className="text-xs text-gray-500">{counts ? `${percent}% kiritilgan` : ""}</p>
      </div>

      <div
        className={cn(
          "mt-2.5 h-1.5 overflow-hidden rounded-full",
          total > 0 ? "bg-red-100" : "bg-gray-100",
        )}
      >
        <div
          className="h-full rounded-full bg-emerald-500 transition-[width] duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <CountChip
          tone="yes"
          label="Bor"
          value={counts?.yes}
          selected={active === PRESENCE.YES}
          onClick={() => toggle(PRESENCE.YES)}
        />
        <CountChip
          tone="no"
          label="Yo'q"
          value={counts?.no}
          selected={active === PRESENCE.NO}
          onClick={() => toggle(PRESENCE.NO)}
        />
      </div>
    </div>
  );
};

const CHIP_TONES = {
  yes: {
    base: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    selected: "ring-2 ring-emerald-500",
  },
  no: {
    base: "bg-red-50 text-red-700 hover:bg-red-100",
    selected: "ring-2 ring-red-500",
  },
};

const CountChip = ({ tone, label, value, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={selected}
    title={selected ? "Filtrni olib tashlash" : `Faqat "${label.toLowerCase()}" larni ko'rsatish`}
    className={cn(
      "flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors",
      CHIP_TONES[tone].base,
      selected && CHIP_TONES[tone].selected,
    )}
  >
    <span>{label}</span>
    <span className="font-semibold">{value ?? "—"}</span>
  </button>
);

export default SystemSummaryCards;
