// React
import { useCallback, useMemo, useState } from "react";

// Router
import { useNavigate, useSearchParams } from "react-router-dom";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Toast
import { toast } from "sonner";

// Icons
import {
  ArrowLeft,
  CalendarCheck,
  FileText,
  Layers,
  Loader2,
  Printer,
} from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import EmptyState from "@/shared/components/ui/EmptyState";
import { TabsButtons } from "@/shared/components/ui/tabs/Tabs";
import { Skeleton } from "@/shared/components/shadcn/skeleton";
import AttendanceStatsDocument from "../components/AttendanceStatsDocument";

// Hooks
import useBranch from "@/shared/hooks/useBranch";
import usePermissions from "@/shared/hooks/usePermissions";

// Queries & API
import { attendanceReportsQueries } from "../queries/attendance.queries";
import { attendanceReportAPI } from "../api/attendanceReport.api";

// Data
import { DASHBOARD_PERIODS } from "@/shared/data/dashboardPeriods.data";

// Utils
import {
  downloadBlob,
  readBlobErrorMessage,
} from "@/shared/utils/download.utils";

const DEFAULT_PERIOD = "month";

/**
 * DAVOMAT HISOBOTI — HUJJAT KO'RINISHIDA (o'quvchilar va o'qituvchilar).
 *
 * ⚠️ HUJJAT PLATFORMANING ICHIDA OCHILADI, yangi tabda emas: bosh
 * sahifadagi davomat kartasidagi belgi shu sahifaga olib keladi. Yuklab
 * olish — ALOHIDA amal (`.docx`), ya'ni ko'rish uchun faylni ochish shart
 * emas.
 *
 * ⚠️ EKRAN VA FAYL BITTA MANBADAN (`attendanceStats.service.js`): hujjat
 * ko'rinishi `AttendanceStatsDocument` da, Word nusxasi serverda, lekin
 * ikkalasi ham AYNI hisobot obyektidan quriladi — raqamlar farq qila
 * olmaydi.
 *
 * ⚠️ FAQAT "UMUMIY — BARCHA FILIALLAR" KO'RINISHIDA (biznes qarori,
 * 2026-10-28), ya'ni faqat tizim egasida — "Xodimlar topshiriqlari"
 * hisoboti bilan AYNI qoida. Hisobot tarmoq savoliga javob beradi:
 * "qaysi filialda davomat tushdi, qaysi sinf eng past". Bitta filialning
 * kesimi Davomat → Hisobotlar bo'limida turadi.
 *
 * Darvoza SERVERDA ham bor (`attendanceStats.controller.js` → 403), ya'ni
 * saqlangan havola orqali ham ochilmaydi.
 *
 * ⚠️ IKKI SAHIFA, BITTA KOMPONENT (`kind`): amallar, davr tanlagich,
 * qamrov yozuvi va holatlar ikkalasida ham AYNI — ikki nusxa bo'lsa,
 * biriga qo'shilgan tuzatish ikkinchisida tushib qolardi.
 *
 * Davr URL da (`?period=`): tanlangan davrni havola qilib yuborsa bo'ladi
 * va kartadan o'tilganda o'sha davr ochiladi.
 */
const CONFIG = {
  students: {
    title: "O'quvchilar davomati",
    subtitle:
      "Kim keldi, kim qoldirdi, sinflar kesimi va o'tgan davr bilan " +
      "taqqoslash — hujjat ko'rinishida",
    query: attendanceReportsQueries.studentAttendanceReport,
    download: attendanceReportAPI.exportStudentAttendanceReport,
    fileName: "oquvchilar-davomati.docx",
  },
  teachers: {
    title: "O'qituvchilar davomati",
    subtitle:
      "Kelish-ketish, kechikishlar, bugun darsga chiqmaganlar va o'tgan " +
      "davr bilan taqqoslash — hujjat ko'rinishida",
    query: attendanceReportsQueries.teacherAttendanceReport,
    download: attendanceReportAPI.exportTeacherAttendanceReport,
    fileName: "oqituvchilar-davomati.docx",
  },
};

const AttendanceStatsReportPage = ({ kind = "students" }) => {
  const navigate = useNavigate();
  const { isAggregate, canViewAll, switchToAll, isSwitching } = useBranch();
  const { can } = usePermissions();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isExporting, setExporting] = useState(false);

  const config = CONFIG[kind] ?? CONFIG.students;
  const canSee = can("attendance.reports");

  const periodParam = searchParams.get("period");
  const period = DASHBOARD_PERIODS.some((item) => item.value === periodParam)
    ? periodParam
    : DEFAULT_PERIOD;

  const params = useMemo(() => ({ period }), [period]);

  // ⚠️ Rejim yoki ruxsat to'g'ri kelmasa SO'ROV UMUMAN YUBORILMAYDI:
  // server 403 qaytaradi va ekranda "xatolik" ko'rinardi — holbuki bu
  // xato emas, shunchaki boshqa ko'rinish.
  const {
    data: report,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({ ...config.query(params), enabled: isAggregate && canSee });

  const setPeriod = useCallback(
    (value) =>
      setSearchParams(
        (prev) => {
          if (value && value !== DEFAULT_PERIOD) prev.set("period", value);
          else prev.delete("period");
          return prev;
        },
        { replace: true },
      ),
    [setSearchParams],
  );

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await config.download(params);
      downloadBlob(response, config.fileName);
    } catch (err) {
      toast.error(await readBlobErrorMessage(err, "Word fayli yuklab olinmadi"));
    } finally {
      setExporting(false);
    }
  };

  const header = (
    <div className="no-print flex items-start gap-1.5">
      <Button variant="ghost" onClick={() => navigate("/")}>
        <ArrowLeft strokeWidth={1.5} />
      </Button>

      <div>
        <h1 className="page-title">{config.title}</h1>
        <p className="mt-0.5 text-sm text-gray-500">{config.subtitle}</p>
      </div>
    </div>
  );

  /**
   * ⚠️ RUXSATI YO'Q BO'LSA — "ruxsat yo'q" degan aniq ekran. Marshrut
   * ruxsat bilan to'silmagan (`ROUTE_PERMISSIONS` faqat menyuni
   * filtrlaydi), ya'ni saqlangan havola bilan kelingan bo'lishi mumkin.
   */
  if (!canSee) {
    return (
      <div className="space-y-4">
        {header}

        <Card>
          <EmptyState
            icon={CalendarCheck}
            title="Bu hisobotni ko'rishga ruxsat yo'q"
            description={
              "Hisobotda sinflar va shaxslar kesimi bor, shuning uchun u " +
              "davomat bo'limidagi \"Hisobotlar\" ruxsati ortida turadi. " +
              "Kerak bo'lsa rahbariyatdan so'rang."
            }
          />
        </Card>
      </div>
    );
  }

  /**
   * ⚠️ FILIAL TANLANGAN BO'LSA — BO'LIM OCHILMAYDI (biznes qarori,
   * 2026-10-28). Hisobot tarmoq savoliga javob beradi; filial ichida uni
   * Davomat → Hisobotlar bo'limi beradi.
   *
   * ⚠️ XATO EMAS, YO'L KO'RSATILADI: bu yerga faqat SAQLANGAN HAVOLA
   * bilan kelinadi, shuning uchun "ruxsat yo'q" degan ekran o'rniga
   * darhol o'tish tugmasi turadi (`StaffTasksReportPage` bilan AYNI
   * naqsh).
   */
  if (!isAggregate) {
    return (
      <div className="space-y-4">
        {header}

        <Card>
          <EmptyState
            icon={Layers}
            title="Bu hisobot umumiy ko'rinishda ochiladi"
            description={
              "Davomat butun tarmoq bo'yicha hisoblanadi — qaysi filialda " +
              "davomat tushgani, qaysi sinf eng past ekani. Buning uchun " +
              "almashtirgichdan \"Umumiy — barcha filiallar\" ni tanlang. " +
              "Bitta filialning kesimi Davomat → Hisobotlar bo'limida turadi."
            }
            action={
              canViewAll ? (
                <Button onClick={switchToAll} disabled={isSwitching}>
                  {isSwitching ? (
                    <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
                  ) : (
                    <Layers className="size-4" strokeWidth={1.5} />
                  )}
                  Umumiy ko&apos;rinishga o&apos;tish
                </Button>
              ) : null
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {header}

      {/* Davr va amallar */}
      <Card className="no-print space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <TabsButtons
            value={period}
            items={DASHBOARD_PERIODS}
            onChange={setPeriod}
            className="min-w-0"
            listClassName="max-w-full overflow-x-auto overflow-y-hidden hidden-scrollbar"
            triggerClassName="shrink-0"
          />

          <div className="flex items-center gap-2 lg:ml-auto">
            <Button
              variant="outline"
              className="gap-1.5"
              onClick={() => window.print()}
              disabled={!report}
            >
              <Printer className="size-4" strokeWidth={1.5} />
              <span className="hidden sm:inline">Chop etish</span>
            </Button>

            {/* ⚠️ Word fayli UMUMIY KO'RINISHDA ham beriladi: hisobot
                filiallar bo'ylab SERVERDA quriladi, ya'ni birlashtiriladigan
                fayl ham, "qaysi filialniki" degan savol ham qolmaydi. */}
            <Button
              className="gap-1.5"
              onClick={handleExport}
              disabled={!report || isExporting}
            >
              {isExporting ? (
                <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
              ) : (
                <FileText className="size-4" strokeWidth={1.5} />
              )}
              Word&apos;da yuklab olish
            </Button>
          </div>
        </div>

        {/* ⚠️ QAMROV OCHIQ YOZILADI: raqam qaysi filiallardan yig'ilganini
            ko'rsatmasa, u bitta filialniki deb o'qilishi mumkin. Foiz esa
            yig'indidan qayta hisoblangan — filiallar o'rtachasi EMAS. */}
        {report?.isNetwork && report.branches?.length > 0 && (
          <p className="text-xs text-gray-400">
            Qamrov: {report.branches.map((item) => item.name).join(", ")}.
            Davr: {report.period.rangeLabel}. Sonlar qo&apos;shilgan, foiz esa
            yig&apos;indidan hisoblangan.
          </p>
        )}

        {report?.partial?.length > 0 && (
          <p className="text-xs font-semibold text-red-600">
            Diqqat: {report.partial.join(", ")} filial(lar) ma&apos;lumoti
            olinmadi va hisobotga kirmagan.
          </p>
        )}
      </Card>

      {/* Hujjat */}
      {isError ? (
        <Card>
          <EmptyState
            icon={CalendarCheck}
            title="Hisobotni yuklab bo'lmadi"
            description={
              error?.response?.data?.message ||
              "Internet aloqasini tekshirib, qayta urinib ko'ring."
            }
            action={<Button onClick={() => refetch()}>Qayta urinish</Button>}
          />
        </Card>
      ) : isLoading || !report ? (
        <Card className="mx-auto w-full max-w-[210mm] space-y-3">
          <Skeleton className="mx-auto h-7 w-2/3" />
          <Skeleton className="mx-auto h-4 w-1/3" />
          {[0, 1, 2, 3, 4, 5, 6].map((key) => (
            <Skeleton key={key} className="h-9 w-full" />
          ))}
        </Card>
      ) : (
        // ⚠️ Filial nomi PANELDAN BERILMAYDI: hisobotning o'zi qamrovni
        // olib keladi (`isNetwork` + `branches`), ya'ni ekrandagi sarlavha
        // Word faylidagi sarlavha bilan AYNI manbadan chiqadi.
        <AttendanceStatsDocument report={report} />
      )}
    </div>
  );
};

export default AttendanceStatsReportPage;
