// Hooks
import useChangelogTab from "../hooks/useChangelogTab";

// Components
import { TabsButtons } from "@/shared/components/ui/tabs/Tabs";
import ChangelogAllTab from "../components/ChangelogAllTab";
import ChangelogTodayTab from "../components/ChangelogTodayTab";
import ChangelogSettingsTab from "../components/ChangelogSettingsTab";

// Data
import { CHANGELOG_TABS } from "../data/changelog.data";

const TAB_CONTENT = {
  today: ChangelogTodayTab,
  all: ChangelogAllTab,
  settings: ChangelogSettingsTab,
};

const ChangelogPage = () => {
  const [tab, setTab] = useChangelogTab(CHANGELOG_TABS);

  // Tab almashganda oldingi tab unmount bo'ladi — keraksiz so'rovlar ketmaydi
  const Content = TAB_CONTENT[tab] ?? ChangelogTodayTab;

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

      <Content />
    </div>
  );
};

export default ChangelogPage;
