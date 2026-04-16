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
  const [activeTab, setActiveTab] = useState("overview");

  const isCustom = period === "custom";

  // Build date params passed to each component
  const dateParams = isCustom
    ? { startDate: customStart, endDate: customEnd }
    : { period };

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

      {/* Tab navigation */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {analyticsTabOptions.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.value
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <LeadTrendChart dateParams={dateParams} />
            <LeadStatusDistribution dateParams={dateParams} />
          </div>
          <RecentLeads />
        </div>
      )}

      {activeTab === "funnel" && (
        <LeadConversionFunnel dateParams={dateParams} />
      )}

      {activeTab === "sources" && (
        <LeadSourceChart dateParams={dateParams} />
      )}

      {activeTab === "directions" && (
        <LeadDirectionChart dateParams={dateParams} />
      )}

      {activeTab === "categories" && (
        <LeadCategoryChart dateParams={dateParams} />
      )}

      {activeTab === "trends" && (
        <LeadTrendChart dateParams={dateParams} expanded />
      )}
    </div>
  );
};

export default LeadAnalyticsPage;
