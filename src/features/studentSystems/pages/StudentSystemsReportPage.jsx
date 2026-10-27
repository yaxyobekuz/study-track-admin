// React
import { useState } from "react";

// Router
import { useNavigate } from "react-router-dom";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Toast
import { toast } from "sonner";

// Icons
import { ArrowLeft, ClipboardList, FileText, Loader2, Printer } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import EmptyState from "@/shared/components/ui/EmptyState";
import { Skeleton } from "@/shared/components/shadcn/skeleton";
import SystemsDocument from "../components/SystemsDocument";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";

// Queries & API
import { studentSystemsQueries } from "../queries/studentSystems.queries";
import { studentSystemsAPI } from "../api/studentSystems.api";

// Utils
import { downloadBlob, readBlobErrorMessage } from "@/shared/utils/download.utils";

/**
 * ERP VA KUNDALIK.COM — HUJJAT KO'RINISHIDAGI HISOBOT.
 *
 * ⚠️ HUJJAT PLATFORMANING ICHIDA OCHILADI, yangi tabda emas: bosh
 * sahifadagi "ERP va Kundalik.com" kartasidagi belgi shu sahifaga olib
 * keladi. Yuklab olish — ALOHIDA amal (`.docx`), ya'ni ko'rish uchun
 * faylni ochish shart emas.
 *
 * ⚠️ EKRAN VA FAYL BITTA MANBADAN (`studentSystemReport.service.js`):
 * hujjat ko'rinishi `SystemsDocument` da, Word nusxasi serverda, lekin
 * ikkalasi ham AYNI hisobot obyektidan quriladi — raqamlar farq qila
 * olmaydi.
 *
 * ⚠️ IKKALA REJIMDA HAM OCHILADI (o'quvchilar harakatidan farqi): filial
 * ichida u o'sha filialning ro'yxati bo'ladi — "MBSI da kim qoldi" degan
 * savol mas'ul xodimning kundalik ishi. Umumiy ko'rinishda esa server
 * filiallar bo'ylab o'zi yig'adi va filiallar kesimi qo'shiladi
 * (`studentSystemNetwork.service.js`).
 *
 * Ruxsat: ko'rish — `studentSystems.view` (route guard), Word —
 * `studentSystems.export` (Excel bilan AYNI kalit: ikkalasi ham butun
 * maktabning ro'yxatini faylga chiqaradi).
 */
const StudentSystemsReportPage = () => {
  const navigate = useNavigate();
  const { can } = usePermissions();
  const canExport = can("studentSystems.export");
  const [isExporting, setExporting] = useState(false);

  const {
    data: report,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(studentSystemsQueries.report());

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await studentSystemsAPI.exportReport();
      downloadBlob(response, "erp-kundalik.docx");
    } catch (err) {
      toast.error(await readBlobErrorMessage(err, "Word fayli yuklab olinmadi"));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="no-print flex items-start gap-1.5">
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeft strokeWidth={1.5} />
        </Button>

        <div>
          <h1 className="page-title">ERP va Kundalik.com</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Kim kiritilgan, kim yo&apos;q — sinflar kesimi va kiritilmagan
            o&apos;quvchilar ro&apos;yxati bilan, hujjat ko&apos;rinishida
          </p>
        </div>
      </div>

      {/* Amallar */}
      <Card className="no-print space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <p className="min-w-0 text-sm text-gray-500">
            Hisobot joriy holatni ko&apos;rsatadi: belgi qo&apos;yilishi
            bilan raqamlar o&apos;zgaradi.
          </p>

          <div className="flex items-center gap-2 sm:ml-auto">
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
                filiallar bo'ylab SERVERDA quriladi
                (`studentSystemNetwork.service.js`), ya'ni birlashtiriladigan
                fayl ham, "qaysi filialniki" degan savol ham qolmaydi. */}
            {canExport && (
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
            )}
          </div>
        </div>

        {/* ⚠️ QAMROV OCHIQ YOZILADI: "462" degan raqam qaysi filiallardan
            yig'ilganini ko'rsatmasa, u bitta filialniki deb o'qilishi
            mumkin. Foiz esa yig'indidan qayta hisoblangan — filiallar
            o'rtachasi EMAS (`combineTotals`). */}
        {report?.isNetwork && report.branches?.length > 0 && (
          <p className="text-xs text-gray-400">
            Qamrov: {report.branches.map((item) => item.name).join(", ")}.
            Sonlar qo&apos;shilgan, foiz esa yig&apos;indidan hisoblangan.
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
            icon={ClipboardList}
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
        <SystemsDocument report={report} />
      )}
    </div>
  );
};

export default StudentSystemsReportPage;
