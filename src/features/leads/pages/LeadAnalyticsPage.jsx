// React
import { useState } from "react";

// Data
import {
  periodOptions,
  analyticsTabOptions,
} from "@/features/leads/data/leads.data";

// Components
import SelectField from "@/shared/components/ui/select/SelectField";
import InputField from "@/shared/components/ui/input/InputField";
import { TabsButtons } from "@/shared/components/ui/tabs/Tabs";
import LeadOverviewStats from "@/features/leads/components/LeadOverviewStats";
import LeadTrendChart from "@/features/leads/components/LeadTrendChart";
import LeadSourceChart from "@/features/leads/components/LeadSourceChart";
import LeadConversionFunnel from "@/features/leads/components/LeadConversionFunnel";
import LeadStatusDistribution from "@/features/leads/components/LeadStatusDistribution";
import LeadDirectionChart from "@/features/leads/components/LeadDirectionChart";
import LeadCategoryChart from "@/features/leads/components/LeadCategoryChart";
import RecentLeads from "@/features/leads/components/RecentLeads";

const LeadAnalyticsPage = () => {
  const [period, setPeriod] = useState("30");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const isCustom = period === "custom";

  // Build date params passed to each component
  const dateParams = isCustom
    ? { startDate: customStart, endDate: customEnd }
    : { period };

  // Tab kaliti → kontent. Faqat aktiv tab mount bo'ladi, shuning uchun
  // ko'rinmayotgan chartlar so'rov yubormaydi.
  const contentByTab = {
    overview: (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <LeadTrendChart dateParams={dateParams} />
          <LeadStatusDistribution dateParams={dateParams} />
        </div>
        <RecentLeads />
      </div>
    ),
    funnel: <LeadConversionFunnel dateParams={dateParams} />,
    sources: <LeadSourceChart dateParams={dateParams} />,
    directions: <LeadDirectionChart dateParams={dateParams} />,
    categories: <LeadCategoryChart dateParams={dateParams} />,
    trends: <LeadTrendChart dateParams={dateParams} expanded />,
  };

  const tabItems = analyticsTabOptions.map((tab) => ({
    ...tab,
    content: contentByTab[tab.value],
  }));

  return (
    <div className="pb-28 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <h1 className="text-2xl font-semibold">Sotuv tahlili</h1>

        <div className="flex flex-wrap items-end gap-2">
          <div className="w-44">
            <SelectField
              name="period"
              value={period}
              options={periodOptions}
              onChange={(v) => setPeriod(v)}
            />
          </div>
          {isCustom && (
            <>
              <InputField
                type="date"
                label=""
                name="customStart"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="w-36"
              />
              <InputField
                type="date"
                label=""
                name="customEnd"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="w-36"
              />
            </>
          )}
        </div>
      </div>

      {/* Overview Stats - always visible */}
      <LeadOverviewStats dateParams={dateParams} />

      {/* Tablar + kontent — 6 ta, tor ekranga sig'masa gorizontal scroll bo'ladi */}
      <TabsButtons
        items={tabItems}
        contentClassName="mt-4"
        triggerClassName="shrink-0"
        listClassName="max-w-full justify-start overflow-x-auto overflow-y-hidden hidden-scrollbar"
      />
    </div>
  );
};

export default LeadAnalyticsPage;
