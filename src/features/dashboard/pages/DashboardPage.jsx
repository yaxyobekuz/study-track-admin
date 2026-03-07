// Lottie
import Lottie from "lottie-react";

// Store
import useAuth from "@/shared/hooks/useAuth";

// Components
import Card from "@/shared/components/ui/Card";
import CoinStats from "../components/CoinStats";
import PenaltyStats from "../components/PenaltyStats";
import UsersStats from "../components/UsersStats";
import HolidayInfo from "../components/HolidayInfo";
import AllSchedulesToday from "../components/AllSchedulesToday";

// Utils
import { getTimedRandomAnimation } from "@/shared/utils/animations.utils";

const Dashboard = () => {
  const { user } = useAuth();

  const { animation } = getTimedRandomAnimation({
    family: "duck",
    sentiment: ["positive", "playful"],
  });

  return (
    <div>
      {/* Top Bar */}
      <Card className="flex items-center gap-1.5 mb-4 !py-3 md:gap-3">
        <Lottie className="size-6 sm:size-7" animationData={animation} />

        <h2 className="text-xl leading-none font-bold text-gray-900">
          Xush kelibsiz, {user?.fullName}!
        </h2>
      </Card>

      {/* Holiday Info */}
      <HolidayInfo />

      {/* User Statistics - Owner only */}
      <UsersStats />

      {/* Coin Statistics - Owner only */}
      <CoinStats />

      {/* Penalty Statistics - Owner only */}
      <PenaltyStats />

      {/* Today's Schedules */}
      <AllSchedulesToday />
    </div>
  );
};

export default Dashboard;
