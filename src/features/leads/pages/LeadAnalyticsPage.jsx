// React
import { useState } from "react";

// Data
import { periodOptions } from "@/features/leads/data/leads.data";

// Components
import RecentLeads from "@/features/leads/components/RecentLeads";
import SelectField from "@/shared/components/ui/select/SelectField";
import LeadTrendChart from "@/features/leads/components/LeadTrendChart";
import LeadSourceChart from "@/features/leads/components/LeadSourceChart";
import LeadOverviewStats from "@/features/leads/components/LeadOverviewStats";
import LeadConversionFunnel from "@/features/leads/components/LeadConversionFunnel";
import LeadStatusDistribution from "@/features/leads/components/LeadStatusDistribution";

const LeadAnalyticsPage = () => {
  const [period, setPeriod] = useState("30");

  return (
    <div className="pb-28 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Sotuv tahlili</h1>
        <SelectField
          name="period"
          value={period}
          className="w-auto"
          options={periodOptions}
          onChange={(v) => setPeriod(v)}
        />
      </div>

      {/* Overview Stats */}
      <LeadOverviewStats period={period} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <LeadTrendChart period={period} />
        <LeadStatusDistribution period={period} />
      </div>

      {/* Source & Funnel */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <LeadSourceChart period={period} />
        <LeadConversionFunnel period={period} />
      </div>

      {/* Recent Leads */}
      <RecentLeads />
    </div>
  );
};

export default LeadAnalyticsPage;
