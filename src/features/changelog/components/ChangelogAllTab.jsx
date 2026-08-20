// React
import { useEffect, useState } from "react";

// Router
import { useSearchParams } from "react-router-dom";

// Hooks
import useModal from "@/shared/hooks/useModal";
import { useChangelogMonths } from "../queries/changelog.queries";

// Icons
import { Plus, Search } from "lucide-react";

// Utils
import { months as MONTHS_UZ } from "@/shared/utils/date.utils";

// Components
import Can from "@/shared/components/guards/Can";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import InputField from "@/shared/components/ui/input/InputField";
import ChangelogEntryList from "./ChangelogEntryList";
import ChangelogVersionHeader from "./ChangelogVersionHeader";

// Data
import { ALL_MONTHS_OPTION, PANEL_FILTER_OPTIONS } from "../data/changelog.data";

/** "2026-08" → "Avgust 2026". */
const monthLabel = (value) => {
  const [year, month] = value.split("-");
  const name = MONTHS_UZ[Number(month) - 1]?.label ?? month;
  return `${name} ${year}`;
};

/** "2026-08" → { from: "2026-08-01", to: "2026-08-31" }. */
const monthRange = (value) => {
  const [year, month] = value.split("-").map(Number);
  // `Date.UTC(year, month, 0)` — keyingi oyning "0-kuni", ya'ni shu oyning oxiri
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const pad = (n) => String(n).padStart(2, "0");

  return {
    from: `${year}-${pad(month)}-01`,
    to: `${year}-${pad(month)}-${pad(lastDay)}`,
  };
};

/**
 * "Barchasi" — butun tarix. Oy, panel va qidiruv bo'yicha filtrlanadi.
 *
 * Oylar ro'yxati serverdan keladi va faqat yozuv BOR oylarni o'z ichiga oladi,
 * shuning uchun tanlov hech qachon bo'sh natija bermaydi.
 */
const ChangelogAllTab = () => {
  const { openModal } = useModal();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: monthRows = [] } = useChangelogMonths();

  const panel = searchParams.get("panel") || "all";
  const month = searchParams.get("month") || "all";
  const search = searchParams.get("search") || "";

  const setParam = (key, value) =>
    setSearchParams((prev) => {
      if (!value || value === "all") prev.delete(key);
      else prev.set(key, String(value));
      prev.delete("page");
      return prev;
    });

  // Qidiruv har harfda serverga ketmasligi uchun kechiktiriladi
  const [searchDraft, setSearchDraft] = useState(search);

  useEffect(() => {
    if (searchDraft === search) return;

    const timer = setTimeout(() => setParam("search", searchDraft), 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchDraft]);

  const monthOptions = [
    ALL_MONTHS_OPTION,
    ...monthRows.map((row) => ({
      value: row.month,
      label: `${monthLabel(row.month)} (${row.count})`,
    })),
  ];

  const range = month === "all" ? {} : monthRange(month);
  const hasFilter = Boolean(search) || month !== "all" || panel !== "all";

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Can do="changelog.create">
          <Button onClick={() => openModal("createChangelog", null)}>
            <Plus strokeWidth={1.5} />
            Qo'shish
          </Button>
        </Can>
      </div>

      <ChangelogVersionHeader />

      {/* Filtrlar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Select
          value={month}
          options={monthOptions}
          triggerClassName="min-w-48"
          onChange={(v) => setParam("month", v)}
        />

        <Select
          value={panel}
          triggerClassName="min-w-44"
          options={PANEL_FILTER_OPTIONS}
          onChange={(v) => setParam("panel", v)}
        />

        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-gray-400" />
          <InputField
            name="search"
            value={searchDraft}
            inputClassName="pl-9"
            placeholder="Sarlavha yoki o'zgarish matni bo'yicha qidirish"
            onChange={(e) => setSearchDraft(e.target.value)}
          />
        </div>
      </div>

      <ChangelogEntryList
        params={{ panel, search, ...range }}
        emptyText={
          hasFilter
            ? "Bu shartlarga mos yozuv topilmadi"
            : "Hozircha o'zgarishlar yozilmagan"
        }
      />
    </div>
  );
};

export default ChangelogAllTab;
