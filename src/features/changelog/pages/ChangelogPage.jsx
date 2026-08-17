// Hooks
import useChangelogTab from "../hooks/useChangelogTab";

// Components
import { TabsButtons } from "@/shared/components/ui/tabs/Tabs";
import ChangelogListTab from "../components/ChangelogListTab";
import ChangelogSettingsTab from "../components/ChangelogSettingsTab";

// Data
import { CHANGELOG_TABS } from "../data/changelog.data";

const ChangelogPage = () => {
  const [tab, setTab] = useChangelogTab(CHANGELOG_TABS);

  return (
    <div>
      <h1 className="page-title mb-4">O'zgarishlar tarixi</h1>

      <div className="mb-4">
        <TabsButtons
          value={tab}
          onChange={setTab}
          items={CHANGELOG_TABS}
          listClassName="hidden-scrollbar"
        />
      </div>

      {/* Tab almashganda ro'yxat unmount bo'ladi — sozlamalar ochiq turganda
          keraksiz so'rovlar ketmaydi. */}
      {tab === "main" ? <ChangelogListTab /> : <ChangelogSettingsTab />}
    </div>
  );
};

export default ChangelogPage;
