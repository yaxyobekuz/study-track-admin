// Data
import { days } from "@/shared/data/days.data";

// Router
import { Link, useParams } from "react-router-dom";

// Icons
import { ChevronLeft } from "lucide-react";

// Hooks
import useArrayStore from "@/shared/hooks/useArrayStore";

// Components
import ScheduleForm from "../components/ScheduleForm";

const CreateSchedulePage = () => {
  const { classId, day } = useParams();
  const { getCollectionData } = useArrayStore();
  const classes = getCollectionData("classes");

  const className = classes.find((cls) => cls._id === classId)?.name || "Sinf";
  const dayLabel = days.find((d) => d.value === day)?.label || day;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link
          to="/schedules"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="size-4" />
          Dars jadvali
        </Link>
      </div>

      <h1 className="page-title">
        Yangi dars jadvali — {className}, {dayLabel}
      </h1>

      <ScheduleForm mode="create" classId={classId} day={day} />
    </div>
  );
};

export default CreateSchedulePage;
