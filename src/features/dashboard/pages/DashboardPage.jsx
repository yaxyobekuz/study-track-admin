// Lottie
import Lottie from "lottie-react";

// Icons
import { Download } from "lucide-react";

// Hooks
import useAuth from "@/shared/hooks/useAuth";
import useModal from "@/shared/hooks/useModal";

// Components
import Card from "@/shared/components/ui/Card";
import OverviewStats from "../components/OverviewStats";
import UsersStats from "../components/UsersStats";
import BotActivityStats from "../components/BotActivityStats";
import HolidayInfo from "../components/HolidayInfo";
import PenaltyStats from "../components/PenaltyStats";
import RecentExcuses from "../components/RecentExcuses";
import DownloadAppModal from "../components/DownloadAppModal";
import AllSchedulesToday from "../components/AllSchedulesToday";
import DepartedStudents from "../components/DepartedStudents";

// Utils
import { getTimedRandomAnimation } from "@/shared/utils/animations.utils";

const Dashboard = () => {
  const { user } = useAuth();
  const { openModal } = useModal();

  const { animation } = getTimedRandomAnimation({
    family: "duck",
    sentiment: ["positive", "playful"],
  });

  return (
    <div>
      {/* Top Bar */}
      <div className="flex flex-col gap-4 mb-4 sm:flex-row">
        {/* Greetings */}
        <Card className="flex items-center gap-1.5 !py-3 grow md:gap-3">
          <Lottie className="size-6 sm:size-7" animationData={animation} />

          <h2 className="text-xl leading-none font-bold text-gray-900">
            Xush kelibsiz, {user?.fullName}!
          </h2>
        </Card>

        {/* Download button */}
        <button
          onClick={() => openModal("downloadApp")}
          className="flex items-center gap-4 min-h-12  h-auto bg-blue-100 text-blue-500 rounded-xl pl-4 overflow-hidden font-medium text-sm"
        >
          Ilovani yuklab olish
          <span className="flex items-center justify-center bg-blue-500 text-white min-h-12 h-full px-4 ml-auto">
            <Download className="size-5" strokeWidth={1.5} />
          </span>
        </button>
      </div>

      {/* Holiday Info */}
      <HolidayInfo />

      {/* User Statistics */}
      <UsersStats />

      {/* Bot faolligi — `UsersStats` dagi "Bot foydalanuvchilar" BOG'LANGAN
          hisoblar sonini beradi, bu blok esa ularning qanchasi haqiqatan
          FOYDALANAYOTGANINI. Ruxsati bo'lmaganda umuman chizilmaydi. */}
      <BotActivityStats />

      {/* CHIQIB KETGAN O'QUVCHILAR — "kim, qachon va nega ketdi".
          ⚠️ O'quvchilar sanog'idan KEYIN turadi: "461 o'quvchi" degan
          raqamdan keyin darhol "va 12 tasi oxirgi oyda ketdi" degan
          javob kelishi kerak — ikkalasi bir savolning ikki yarmi. */}
      <DepartedStudents />

      {/* Tanga sanoqlari + kunlik grafik + jarima sanoqlari | o'quvchilar natijalari */}
      <OverviewStats />

      {/* Jarimalar: top xodimlar + grafik | top o'quvchilar */}
      <PenaltyStats />

      {/* Recent Excuse Requests */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <RecentExcuses />
      </div>

      {/* Today's Schedules */}
      <AllSchedulesToday />

      {/* Download App Modal */}
      <DownloadAppModal />
    </div>
  );
};

export default Dashboard;
