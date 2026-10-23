// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// API
import { usersAPI } from "@/features/users/api/users.api";

// API
import { branchSharedOf } from "@/shared/api/aggregateMeta";

// Components
import Card from "@/shared/components/ui/Card";
import Counter from "@/shared/components/ui/Counter";
import BranchSplit from "@/shared/components/ui/BranchSplit";
import { Skeleton } from "@/shared/components/shadcn/skeleton";

// Icons
import { Bot, Briefcase, GraduationCap, Sparkle } from "lucide-react";

const UsersStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["users", "stats"],
    queryFn: () => usersAPI.getStats().then((res) => res.data.data),
  });

  // `path` — umumiy ko'rinishdagi filiallar kesimining kaliti, `to` esa
  // o'sha filialga o'tgandan keyin ochiladigan bo'lim (`BranchSplit`).
  const statItems = [
    {
      label: "O'quvchilar",
      value: stats?.students || 0,
      icon: GraduationCap,
      path: "students",
      to: "/users/students",
    },
    {
      label: "Xodimlar",
      value: stats?.workers || 0,
      icon: Briefcase,
      path: "workers",
      to: "/users/staff",
      // ⚠️ Xodim bir nechta filialda ishlashi mumkin: jami uni BIR MARTA
      // sanaydi, kesim esa har filialda ko'rsatadi — shuning uchun kesim
      // yig'indisi jamidan katta chiqishi mumkin va sababi yozib qo'yiladi.
      sharedKey: "workers",
    },
    {
      label: "Bot foydalanuvchilar",
      value: stats?.telegramUsers || 0,
      icon: Bot,
      path: "telegramUsers",
      to: "/pulse",
      sharedKey: "telegramUsers",
    },
    {
      label: "Premium foydalanuvchilar",
      value: stats?.premiumUsers || 0,
      icon: Sparkle,
      path: "premiumUsers",
      to: "/premium",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
      {statItems.map((item, idx) => (
        <Card key={idx} title={item.label} className="space-y-3">
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

          {/* Umumiy ko'rinishda: qaysi filialda qancha (bosilsa — o'sha
              filialga o'tadi va ro'yxatni ochadi) */}
          <BranchSplit data={stats} path={item.path} to={item.to} />

          {item.sharedKey && branchSharedOf(stats, item.sharedKey) > 0 && (
            <p className="text-[11px] leading-snug text-gray-400">
              {branchSharedOf(stats, item.sharedKey)} ta bir nechta filialda —
              jamida bir marta sanalgan
            </p>
          )}
        </Card>
      ))}
    </div>
  );
};

export default UsersStats;
