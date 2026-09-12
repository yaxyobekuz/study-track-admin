// React
import { useEffect, useState } from "react";

// Router
import { Link, useParams, useNavigate } from "react-router-dom";

// Toast
import { toast } from "sonner";

// Icons
import { ChevronLeft, CircleAlert, FileSpreadsheet, RefreshCw } from "lucide-react";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";

// Queries
import {
  useClassSchedule,
  useScheduleDraft,
} from "@/features/schedules/queries/schedules.queries";
import { useClasses } from "@/features/classes/queries/classes.queries";
import { useScheduleSourceMode } from "@/features/schedule-sync/queries/scheduleSync.queries";

// Data
import { SCHEDULE_SYNC_ACCESS } from "@/features/permissions/data/permissions.data";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import ScheduleForm from "../components/ScheduleForm";

/** Sheet rejimi — tahrir yopiq, sababi va qayerga borish kerakligi. */
const SheetModeCard = ({ classId, canOpenSync }) => {
  const navigate = useNavigate();

  return (
    <Card className="space-y-4 border border-emerald-200 bg-emerald-50/60">
      <div className="flex items-start gap-2.5">
        <FileSpreadsheet
          className="mt-0.5 size-5 shrink-0 text-emerald-600"
          strokeWidth={1.5}
        />
        <div className="space-y-1">
          <p className="font-medium text-gray-900">
            Jadval Google Sheets orqali boshqarilmoqda
          </p>
          <p className="text-sm text-gray-600">
            Platformada tahrirlash yopilgan. O'zgarishni sheet'da qiling — mas'ul
            xodim uni ko'rib chiqib tasdiqlagach jadvalga kiradi.
          </p>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 xs:flex-row xs:justify-end">
        <Button variant="outline" onClick={() => navigate(`/schedules/${classId}`)}>
          <ChevronLeft className="size-4" strokeWidth={1.5} />
          Dars jadvaliga qaytish
        </Button>
        {canOpenSync && (
          <Button onClick={() => navigate("/schedules/sheets")}>
            <FileSpreadsheet className="size-4" strokeWidth={1.5} />
            Google Sheets bo'limi
          </Button>
        )}
      </div>
    </Card>
  );
};

/** Manbani aniqlab bo'lmadi — forma CHIZILMAYDI (qaysi rejimdaligi noma'lum). */
const ModeErrorCard = ({ onRetry, isRetrying }) => (
  <Card role="alert" className="space-y-4 border border-red-200 bg-red-50/60">
    <div className="flex items-start gap-2.5">
      <CircleAlert className="mt-0.5 size-5 shrink-0 text-red-600" strokeWidth={1.5} />
      <div className="space-y-1">
        <p className="font-medium text-gray-900">Jadval manbasini aniqlab bo'lmadi</p>
        <p className="text-sm text-gray-600">
          Jadval hozir platformada yoki Google Sheets'da boshqarilayotganini
          bilmasdan tahrirni ochib bo'lmaydi. Ulanishni tekshirib qayta urinib
          ko'ring.
        </p>
      </div>
    </div>

    <div className="flex justify-end">
      <Button variant="outline" onClick={onRetry} disabled={isRetrying}>
        <RefreshCw className="size-4" strokeWidth={1.5} />
        Qayta urinish{isRetrying && "..."}
      </Button>
    </div>
  </Card>
);

const EditScheduleContent = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { can } = usePermissions();
  const { data: classes = [] } = useClasses();

  const className = classes.find((cls) => cls.id === classId)?.name || "Sinf";

  // ── Jadval manbai ──
  //
  // ⚠️ Forma FAQAT sahifa ochilgandan KEYIN kelgan muvaffaqiyatli javob
  // "platform" desa chiziladi. Keshdagi eski javob yetarli emas: manbani
  // boshqa odam hozirgina Google Sheets'ga o'tkazgan bo'lsa, odam
  // saqlanmaydigan jadvalni tahrirlab o'tirardi.
  const modeQuery = useScheduleSourceMode({ refetchOnMount: "always" });
  const mode = modeQuery.data?.mode;

  // Bir marta tasdiqlangach eslab qolinadi: keyingi (oynaga qaytgandagi)
  // so'rov tarmoq sababli yiqilsa, yarim yozilgan forma yopilib ketmasin.
  // Manba haqiqatan "sheet" ga o'zgarsa esa forma baribir yopiladi.
  const [platformConfirmed, setPlatformConfirmed] = useState(false);
  if (
    !platformConfirmed &&
    modeQuery.isFetchedAfterMount &&
    modeQuery.isSuccess &&
    mode === "platform"
  ) {
    setPlatformConfirmed(true);
  }

  const canEdit = platformConfirmed && mode === "platform";
  const isSheetMode = mode === "sheet";
  const isModeError =
    !canEdit && !isSheetMode && modeQuery.isFetchedAfterMount && modeQuery.isError;

  const { data: schedules, isLoading, isError } = useClassSchedule(classId);

  // Tugallanmagan tahrirning zaxirasi (faqat shu foydalanuvchiniki).
  //
  // ⚠️ Forma qoralama YUKLANIB BO'LGACH chiziladi: boshlang'ich holat bir
  // marta o'qiladi va keyin proplar o'zgarsa ham qayta o'rnatilmaydi
  // (odamning yozayotgani orqaga tashlanmasligi uchun). Kech kelgan
  // qoralama shu sababli e'tiborsiz qolib ketardi.
  //
  // Sheet rejimida so'ralmaydi — u yerda platformadagi tahrir yo'q.
  //
  // Qoralamani olishda xatolik bo'lsa sahifa ochilaveradi — zaxira
  // qulaylik, jadvalni tahrirlashning sharti emas.
  const draftQuery = useScheduleDraft(classId, { enabled: canEdit });
  const { data: draftData, isError: isDraftError } = draftQuery;

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

  // ⚠️ `isPending`, `isLoading` EMAS: o'chiq so'rovda `isLoading` false
  // bo'ladi va forma qoralamasiz chizilib ketardi.
  const isReady = canEdit && !isLoading && !draftQuery.isPending;

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

      {isSheetMode ? (
        <SheetModeCard
          classId={classId}
          canOpenSync={can(SCHEDULE_SYNC_ACCESS)}
        />
      ) : isModeError ? (
        <ModeErrorCard
          onRetry={() => modeQuery.refetch()}
          isRetrying={modeQuery.isFetching}
        />
      ) : !isReady ? (
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

/**
 * Har sinf uchun ALOHIDA nusxa (`key={classId}`).
 *
 * ⚠️ Router bir sinfning tahriridan boshqasiga o'tganda sahifani qayta
 * ishlatadi: `platformConfirmed` va `isFetchedAfterMount` eski sinfdan
 * qolib, keyingi sinf formasi YANGI manba javobini kutmasdan ochilib
 * ketardi (masalan "O'sha sinfni ochish" tugmasi bilan). Kalit bilan har
 * sinf manbani qaytadan so'raydi.
 */
const EditSchedulePage = () => {
  const { classId } = useParams();
  return <EditScheduleContent key={classId} />;
};

export default EditSchedulePage;
