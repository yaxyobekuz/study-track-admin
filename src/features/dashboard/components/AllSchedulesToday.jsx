// Icons
import { BookOpen } from "lucide-react";

// Router
import { Link } from "react-router-dom";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Store
import useAuth from "@/shared/hooks/useAuth";

// API
import { schedulesAPI } from "@/features/schedules/api/schedules.api";

// Utils
import { getDayOfWeekUZ } from "@/shared/utils/date.utils";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import ScheduleItem from "@/features/dashboard/components/ScheduleItem";

const AllSchedulesToday = () => {
  const today = new Date();
  const { user } = useAuth();
  const dayName = getDayOfWeekUZ(today);
  const isOwner = user?.role === "owner";

  // Schedules module is owned by another feature, so this dashboard-local read
  // stays an inline useQuery (no schedules query module is created here).
  const { data: schedules = [], isLoading: loading } = useQuery({
    queryKey: ["schedules", "all-today"],
    queryFn: () => schedulesAPI.getAllToday().then((res) => res.data.data),
    enabled: isOwner,
  });

  if (!isOwner || dayName === "yakshanba") {
    return null;
  }

  if (loading) {
    return (
      <Card className="mt-6">
        <div className="flex items-center justify-center p-8">
          <div className="animate-pulse text-gray-500">Yuklanmoqda...</div>
        </div>
      </Card>
    );
  }

  return (
    <div className="relative mt-4">
      {/* Top */}
      <div className="flex flex-col items-center justify-between mb-4 sm:flex-row">
        {/* Title */}
        <h2 className="section-title">Bugungi barcha sinf dars jadvallari</h2>

        {/* Schedules page link */}
        <Button asChild variant="link">
          <Link to="/schedules">Barcha dars jadvali</Link>
        </Button>
      </div>

      {/* No data */}
      {schedules.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <BookOpen
              className="size-12 text-gray-300 mx-auto mb-3"
              strokeWidth={1.5}
            />
            <p className="text-gray-500">Bugun darslar yo'q</p>
          </div>
        </Card>
      )}

      {/* Schedule Grid */}
      {schedules.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schedules.map((schedule, idx) => (
            <ScheduleItem key={idx} schedule={schedule} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AllSchedulesToday;
