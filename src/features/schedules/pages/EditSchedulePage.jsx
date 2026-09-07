// React
import { useEffect } from "react";

// Router
import { Link, useParams, useNavigate } from "react-router-dom";

// Toast
import { toast } from "sonner";

// Icons
import { ChevronLeft } from "lucide-react";

// Queries
import {
  useClassSchedule,
  useScheduleDraft,
} from "@/features/schedules/queries/schedules.queries";
import { useClasses } from "@/features/classes/queries/classes.queries";

// Components
import Card from "@/shared/components/ui/Card";
import ScheduleForm from "../components/ScheduleForm";

const EditSchedulePage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { data: classes = [] } = useClasses();

  const className = classes.find((cls) => cls.id === classId)?.name || "Sinf";

  const { data: schedules, isLoading, isError } = useClassSchedule(classId);

  // Tugallanmagan tahrirning zaxirasi (faqat shu foydalanuvchiniki).
  //
  // ⚠️ Forma qoralama YUKLANIB BO'LGACH chiziladi: boshlang'ich holat bir
  // marta o'qiladi va keyin proplar o'zgarsa ham qayta o'rnatilmaydi
  // (odamning yozayotgani orqaga tashlanmasligi uchun). Kech kelgan
  // qoralama shu sababli e'tiborsiz qolib ketardi.
  //
  // Qoralamani olishda xatolik bo'lsa sahifa ochilaveradi — zaxira
  // qulaylik, jadvalni tahrirlashning sharti emas.
  const {
    data: draftData,
    isLoading: isDraftLoading,
    isError: isDraftError,
  } = useScheduleDraft(classId);

  useEffect(() => {
    if (isError) {
      toast.error("Dars jadvalini yuklashda xatolik yuz berdi");
      navigate(`/schedules/${classId}`);
    }
  }, [isError, classId, navigate]);

  useEffect(() => {
    if (isDraftError) {
      toast.warning("Tahrirni zaxiralash hozir ishlamayapti");
    }
  }, [isDraftError]);

  const isReady = !isLoading && !isDraftLoading;

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

      {!isReady ? (
        <Card className="h-96 animate-pulse" />
      ) : (
        <ScheduleForm
          key={classId}
          classId={classId}
          initialSchedules={schedules || []}
          draft={draftData?.draft || null}
          currentHash={draftData?.currentHash || null}
          isStale={Boolean(draftData?.isStale)}
        />
      )}
    </div>
  );
};

export default EditSchedulePage;
