// React
import { useEffect } from "react";

// Router
import { Link, useParams, useNavigate } from "react-router-dom";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

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

  const className = classes.find((cls) => cls._id === classId)?.name || "Sinf";

  const { data: schedules, isLoading, isError } = useQuery({
    queryKey: ["schedules", "class", classId],
    queryFn: () =>
      schedulesAPI.getByClass(classId).then((res) => res.data.data),
    enabled: !!classId,
  });

  useEffect(() => {
    if (isError) {
      toast.error("Dars jadvalini yuklashda xatolik yuz berdi");
      navigate(`/schedules/${classId}`);
    }
  }, [isError, classId, navigate]);

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

      <h1 className="page-title">Dars jadvalini tahrirlash - {className}</h1>

      {isLoading ? (
        <Card className="h-96 animate-pulse" />
      ) : (
        <ScheduleForm classId={classId} initialSchedules={schedules || []} />
      )}
    </div>
  );
};

export default EditSchedulePage;
