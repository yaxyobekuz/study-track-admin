// React
import { useEffect, useState } from "react";

// Router
import { Link, useParams, useNavigate } from "react-router-dom";

// Toast
import { toast } from "sonner";

// Icons
import { ChevronLeft } from "lucide-react";

// Hooks
import useArrayStore from "@/shared/hooks/useArrayStore";

// API
import { schedulesAPI } from "@/features/schedules/api/schedules.api";

// Components
import Card from "@/shared/components/ui/Card";
import ScheduleForm from "../components/ScheduleForm";

const EditSchedulePage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { getCollectionData } = useArrayStore();
  const classes = getCollectionData("classes");

  const [isLoading, setIsLoading] = useState(true);
  const [schedules, setSchedules] = useState([]);

  const className = classes.find((cls) => cls._id === classId)?.name || "Sinf";

  useEffect(() => {
    schedulesAPI
      .getByClass(classId)
      .then((res) => {
        setSchedules(res.data.data || []);
      })
      .catch(() => {
        toast.error("Dars jadvalini yuklashda xatolik yuz berdi");
        navigate(`/schedules/${classId}`);
      })
      .finally(() => setIsLoading(false));
  }, [classId, navigate]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link
          to={`/schedules/${classId}`}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="size-4" />
          Dars jadvali
        </Link>
      </div>

      <h1 className="page-title">
        Dars jadvalini tahrirlash - {className}
      </h1>

      {isLoading ? (
        <Card className="h-96 max-w-2xl animate-pulse" />
      ) : (
        <ScheduleForm classId={classId} initialSchedules={schedules} />
      )}
    </div>
  );
};

export default EditSchedulePage;
