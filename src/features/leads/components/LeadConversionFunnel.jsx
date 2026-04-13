// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// API
import { leadsAPI } from "@/features/leads/api/leads.api";

// Data
import {
  leadStatusLabels,
  leadStatusChartColors,
} from "@/features/leads/data/leads.data";

// Components
import Card from "@/shared/components/ui/Card";

const LeadConversionFunnel = ({ period }) => {
  const { data } = useQuery({
    queryKey: ["leads", "conversion", period],
    queryFn: () => {
      const params = {};
      if (period) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - Number(period));
        params.startDate = startDate.toISOString().split("T")[0];
      }
      return leadsAPI.getConversion(params).then((res) => res.data.data);
    },
  });

  const funnel = data || [];
  const maxCount = funnel.length > 0 ? funnel[0].count : 1;

  return (
    <Card title="Konversiya funnel" className="space-y-4">
      {funnel.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          Ma'lumot topilmadi
        </p>
      ) : (
        <div className="space-y-1.5">
          {funnel.map((stage) => {
            const widthPercent =
              maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
            const color = leadStatusChartColors[stage.stage] || "#6b7280";

            return (
              <div key={stage.stage} className="flex items-center gap-3">
                {/* Label */}
                <div className="w-28 text-right text-xs font-medium text-gray-600">
                  {leadStatusLabels[stage.stage]}
                </div>

                {/* Progress */}
                <div className="flex-1 h-8 bg-gray-100 rounded-2xl overflow-hidden">
                  {/* Inner */}
                  <div
                    className="flex items-center justify-center h-full px-1.5 min-w-max rounded-lg transition-all duration-500"
                    style={{
                      backgroundColor: color,
                      width: `${widthPercent}%`,
                    }}
                  >
                    <span className="text-xs font-bold text-white">
                      {stage.count}
                    </span>
                  </div>
                </div>

                {/* Percent */}
                <div className="w-10 text-right text-xs font-semibold text-gray-500">
                  {stage.percentage}%
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default LeadConversionFunnel;
