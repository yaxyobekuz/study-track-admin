// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import {
  Users,
  UserPlus,
  TrendingUp,
  UserX,
  UserCheck,
  Clock,
  PhoneCall,
  Eye,
  Percent,
} from "lucide-react";

// API
import { leadsAPI } from "@/features/leads/api/leads.api";

// Components
import Card from "@/shared/components/ui/Card";
import Counter from "@/shared/components/ui/Counter";
import { Skeleton } from "@/shared/components/shadcn/skeleton";

// Build API params from dateParams prop
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

const LeadOverviewStats = ({ dateParams }) => {
  const params = buildParams(dateParams);
  const queryKey = JSON.stringify(params);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["leads", "overview", queryKey],
    queryFn: () => leadsAPI.getOverview(params).then((res) => res.data.data),
  });

  const statItems = [
    {
      label: "Jami lidlar",
      value: stats?.totalLeads || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Yangi lidlar",
      value: stats?.newLeads || 0,
      icon: UserPlus,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      iconColor: "text-cyan-600",
    },
    {
      label: "Qiziqmoqda",
      value: (stats?.contactedLeads || 0) + (stats?.interestedLeads || 0),
      icon: PhoneCall,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
    {
      label: "Tashrif / Sinov",
      value: (stats?.visitedLeads || 0) + (stats?.trialLeads || 0),
      icon: Eye,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      label: "Muzokara",
      value: stats?.negotiationLeads || 0,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      label: "Ro'yxatdan o'tdi",
      value: stats?.enrolledLeads || 0,
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      label: "Konversiya",
      value: stats?.conversionRate || 0,
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
      suffix: "%",
    },
    {
      label: "Yo'qolgan / Rad",
      value: (stats?.rejectedLeads || 0) + (stats?.lostLeads || 0),
      icon: UserX,
      color: "text-red-600",
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {statItems.map((item, idx) => (
        <Card
          key={idx}
          className="flex flex-col items-center text-center gap-2 py-3"
        >
          <div
            className={`flex items-center justify-center size-9 ${item.bgColor} rounded-full`}
          >
            <item.icon className={`size-4 ${item.iconColor}`} strokeWidth={1.5} />
          </div>
          <div>
            {isLoading ? (
              <Skeleton className="w-10 h-6 mx-auto mb-1" />
            ) : (
              <div className="flex items-baseline gap-0.5 justify-center">
                <Counter
                  value={item.value}
                  className={`text-xl font-bold ${item.color}`}
                />
                {item.suffix && (
                  <span className={`text-sm font-semibold ${item.color}`}>
                    {item.suffix}
                  </span>
                )}
              </div>
            )}
            <p className="text-[11px] text-gray-500 leading-tight mt-0.5">
              {item.label}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default LeadOverviewStats;
