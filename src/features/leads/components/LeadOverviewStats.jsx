// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { Users, UserPlus, TrendingUp, UserX } from "lucide-react";

// API
import { leadsAPI } from "@/features/leads/api/leads.api";

// Components
import Card from "@/shared/components/ui/Card";
import Counter from "@/shared/components/ui/Counter";
import { Skeleton } from "@/shared/components/shadcn/skeleton";

const LeadOverviewStats = ({ period }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["leads", "overview", period],
    queryFn: () => {
      const params = {};
      if (period) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - Number(period));
        params.startDate = startDate.toISOString().split("T")[0];
      }
      return leadsAPI.getOverview(params).then((res) => res.data.data);
    },
  });

  const statItems = [
    {
      label: "Jami lidlar",
      value: stats?.totalLeads || 0,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-700",
    },
    {
      label: "Yangi lidlar",
      value: stats?.newLeads || 0,
      icon: UserPlus,
      color: "text-cyan-500",
      bgColor: "bg-cyan-50",
      iconColor: "text-cyan-700",
    },
    {
      label: "Konversiya darajasi",
      value: stats?.conversionRate || 0,
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-50",
      iconColor: "text-green-700",
      suffix: "%",
    },
    {
      label: "Yo'qolgan lidlar",
      value: (stats?.rejectedLeads || 0) + (stats?.lostLeads || 0),
      icon: UserX,
      color: "text-red-500",
      bgColor: "bg-red-50",
      iconColor: "text-red-700",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item, idx) => (
        <Card
          key={idx}
          title={item.label}
          className="flex items-center justify-between"
          icon={
            <div
              className={`flex items-center justify-center size-10 ${item.bgColor} rounded-full`}
            >
              <item.icon
                className={`size-5 ${item.iconColor}`}
                strokeWidth={1.5}
              />
            </div>
          }
        >
          {isLoading ? (
            <Skeleton className="w-16 h-7" />
          ) : (
            <div className="flex items-baseline gap-0.5">
              <Counter
                value={item.value}
                className={`text-2xl font-bold ${item.color}`}
              />
              {item.suffix && (
                <span className={`text-lg font-semibold ${item.color}`}>
                  {item.suffix}
                </span>
              )}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

export default LeadOverviewStats;
