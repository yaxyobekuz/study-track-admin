// Router
import { useSearchParams } from "react-router-dom";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Icons
import { Plus } from "lucide-react";

// Components
import Can from "@/shared/components/guards/Can";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import ChangelogEntryList from "./ChangelogEntryList";
import ChangelogVersionHeader from "./ChangelogVersionHeader";

// Data
import { PANEL_FILTER_OPTIONS } from "../data/changelog.data";

/** Bugungi sana `YYYY-MM-DD` (foydalanuvchi kuni bo'yicha). */
const today = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

/**
 * "Bugungi o'zgarishlar" — faqat shu kunning yozuvlari.
 * Yagona filtr — panel: kun allaqachon belgilangan, sana filtri ortiqcha.
 */
const ChangelogTodayTab = () => {
  const { openModal } = useModal();
  const [searchParams, setSearchParams] = useSearchParams();

  const panel = searchParams.get("panel") || "all";
  const date = today();

  const setPanel = (value) =>
    setSearchParams((prev) => {
      if (!value || value === "all") prev.delete("panel");
      else prev.set("panel", value);
      prev.delete("page");
      return prev;
    });

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

      <div className="mb-4">
        <Select
          value={panel}
          onChange={setPanel}
          triggerClassName="min-w-44"
          options={PANEL_FILTER_OPTIONS}
        />
      </div>

      <ChangelogEntryList
        params={{ panel, from: date, to: date }}
        emptyText="Bugun hali o'zgarish yozilmagan"
      />
    </div>
  );
};

export default ChangelogTodayTab;
