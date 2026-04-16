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

function buildParams(dateParams) {
  if (!dateParams) return {};
  if (dateParams.startDate || dateParams.endDate) {
    const p = {};
    if (dateParams.startDate) p.startDate = dateParams.startDate;
    if (dateParams.endDate) p.endDate = dateParams.endDate;
    return p;
  }
  if (dateParams.period) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(dateParams.period));
    return { startDate: startDate.toISOString().split("T")[0] };
  }
  return {};
}

const LeadConversionFunnel = ({ dateParams }) => {
  const params = buildParams(dateParams);
  const queryKey = JSON.stringify(params);

  const { data } = useQuery({
    queryKey: ["leads", "conversion", queryKey],
    queryFn: () => leadsAPI.getConversion(params).then((res) => res.data.data),
  });

  const pipeline = data?.pipeline || [];
  const exits = data?.exits || [];
  const totalLeads = data?.totalLeads || 0;

  const maxCount = pipeline.length > 0 ? Math.max(...pipeline.map((s) => s.count)) : 1;

  return (
    <div className="space-y-4">
      {/* Pipeline funnel */}
      <Card title={`Sotuv funnel — Jami: ${totalLeads} lid`} className="space-y-3">
        {pipeline.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            Ma'lumot topilmadi
          </p>
        ) : (
          <div className="space-y-2">
            {pipeline.map((stage, idx) => {
              const widthPercent = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
              const color = leadStatusChartColors[stage.stage] || "#6b7280";

              return (
                <div key={stage.stage}>
                  <div className="flex items-center gap-3">
                    {/* Step number + label */}
                    <div className="w-32 flex items-center gap-1.5 text-right justify-end">
                      <span className="text-[10px] text-gray-400 font-medium">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-medium text-gray-700">
                        {leadStatusLabels[stage.stage]}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="flex-1 h-8 bg-gray-100 rounded-xl overflow-hidden">
                      <div
                        className="flex items-center justify-end pr-2 h-full rounded-xl transition-all duration-500"
                        style={{ backgroundColor: color, width: `${Math.max(widthPercent, 8)}%` }}
                      >
                        <span className="text-xs font-bold text-white">
                          {stage.count}
                        </span>
                      </div>
                    </div>

                    {/* Percent of total */}
                    <div className="w-12 text-right text-xs font-semibold text-gray-500">
                      {stage.percentage}%
                    </div>
                  </div>

                  {/* Drop-off indicator between stages */}
                  {idx < pipeline.length - 1 && stage.dropOff !== undefined && stage.dropOff > 0 && (
                    <div className="flex items-center gap-3 py-0.5">
                      <div className="w-32" />
                      <div className="flex-1 flex items-center gap-1 pl-2">
                        <div className="h-3 border-l-2 border-dashed border-gray-300 ml-4" />
                        <span className="text-[10px] text-red-400 font-medium ml-1">
                          ↓ {stage.dropOff}% tushdi
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Exit statuses */}
      {exits.length > 0 && (
        <Card title="Chiqish statuslari" className="space-y-2">
          <div className="grid grid-cols-3 gap-3">
            {exits.map((exit) => {
              const color = leadStatusChartColors[exit.stage] || "#6b7280";
              return (
                <div
                  key={exit.stage}
                  className="rounded-xl p-3 text-center"
                  style={{ backgroundColor: `${color}18` }}
                >
                  <p className="text-2xl font-bold" style={{ color }}>
                    {exit.count}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {leadStatusLabels[exit.stage]}
                  </p>
                  <p className="text-[11px] text-gray-400">{exit.percentage}%</p>
                </div>
              );
            })}
          </div>

          {/* Conversion summary */}
          <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-3 text-center">
            <div>
              <p className="text-xl font-bold text-green-600">
                {pipeline.find((s) => s.stage === "enrolled")?.count || 0}
              </p>
              <p className="text-xs text-gray-500">Ro'yxatdan o'tdi</p>
              <p className="text-[11px] text-gray-400">
                {totalLeads > 0
                  ? `${(((pipeline.find((s) => s.stage === "enrolled")?.count || 0) / totalLeads) * 100).toFixed(1)}% konversiya`
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-xl font-bold text-red-500">
                {exits.reduce((sum, e) => sum + (e.stage === "postponed" ? 0 : e.count), 0)}
              </p>
              <p className="text-xs text-gray-500">Yo'qoldi / Rad etdi</p>
              <p className="text-[11px] text-gray-400">
                {totalLeads > 0
                  ? `${((exits.reduce((sum, e) => sum + (e.stage === "postponed" ? 0 : e.count), 0) / totalLeads) * 100).toFixed(1)}% yo'qolish`
                  : "—"}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default LeadConversionFunnel;
