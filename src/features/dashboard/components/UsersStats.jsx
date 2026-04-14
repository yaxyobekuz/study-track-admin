// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// API
import { usersAPI } from "@/features/users/api/users.api";

// Components
import Card from "@/shared/components/ui/Card";
import Counter from "@/shared/components/ui/Counter";
import { Skeleton } from "@/shared/components/shadcn/skeleton";

// Icons
import { Bot, Briefcase, GraduationCap, Sparkle } from "lucide-react";

const UsersStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["users", "stats"],
    queryFn: () => usersAPI.getStats().then((res) => res.data.data),
  });

  const statItems = [
    {
      label: "O'quvchilar",
      value: stats?.students || 0,
      icon: GraduationCap,
    },
    {
      label: "Xodimlar",
      value: stats?.workers || 0,
      icon: Briefcase,
    },
    {
      label: "Bot foydalanuvchilar",
      value: stats?.telegramUsers || 0,
      icon: Bot,
    },
    {
      label: "Premium foydalanuvchilar",
      value: stats?.premiumUsers || 0,
      icon: Sparkle,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
      {statItems.map((item, idx) => (
        <Card key={idx} title={item.label} className="space-y-4">
          <div className="flex items-center justify-between">
            {/* Icon */}
            <div className="flex items-center justify-center size-9 bg-blue-50 rounded-full">
              <item.icon className="size-5 text-blue-700" strokeWidth={1.5} />
            </div>

            {/* Value */}
            {isLoading ? (
              <Skeleton className="w-16 h-7" />
            ) : (
              <Counter
                value={item.value}
                className="text-2xl font-bold text-gray-900"
              />
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default UsersStats;
