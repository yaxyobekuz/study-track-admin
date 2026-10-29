// React
import { useCallback, useMemo, useState } from "react";

// Router
import { useNavigate, useSearchParams } from "react-router-dom";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Toast
import { toast } from "sonner";

// Icons
import { ArrowLeft, Bot, FileText, Layers, Loader2, Printer } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import EmptyState from "@/shared/components/ui/EmptyState";
import { TabsButtons } from "@/shared/components/ui/tabs/Tabs";
import { Skeleton } from "@/shared/components/shadcn/skeleton";
import BotReportDocument from "../components/BotReportDocument";

// Hooks
import useBranch from "@/shared/hooks/useBranch";
import usePermissions from "@/shared/hooks/usePermissions";

// Queries & API
import { activityQueries } from "../queries/activity.queries";
import { activityAPI } from "../api/activity.api";

// Utils
import {
  downloadBlob,
  readBlobErrorMessage,
} from "@/shared/utils/download.utils";

/**
 * ⚠️ DAVR VARIANTLARI SERVERDAGI RO'YXAT BILAN AYNI
 * (`activityDashboard.service.js` → `GRANULARITY.day.options`). Boshqa
 * qiymat yuborilsa server 400 qaytaradi, shuning uchun ro'yxat qotirilgan
 * emas, KO'CHIRILGAN: o'sha yerda o'zgarsa bu yerda ham o'zgaradi.
 */
const PERIODS = [
  { value: "7", label: "7 kun" },
  { value: "14", label: "14 kun" },
  { value: "30", label: "30 kun" },
  { value: "90", label: "90 kun" },
];

const DEFAULT_DAYS = "30";

/**
 * BOT FOYDALANUVCHILARI — HUJJAT KO'RINISHIDAGI HISOBOT.
 *
 * ⚠️ HUJJAT PLATFORMANING ICHIDA OCHILADI, yangi tabda emas: bosh
 * sahifadagi "Bot foydalanuvchilar" kartasidagi belgi shu sahifaga olib
 * keladi. Yuklab olish — ALOHIDA amal (`.docx`), ya'ni ko'rish uchun
 * faylni ochish shart emas.
 *
 * ⚠️ EKRAN VA FAYL BITTA MANBADAN (`botReport.service.js`): hujjat
 * ko'rinishi `BotReportDocument` da, Word nusxasi serverda, lekin
 * ikkalasi ham AYNI hisobot obyektidan quriladi.
 *
 * ⚠️ FAQAT "UMUMIY — BARCHA FILIALLAR" KO'RINISHIDA (biznes qarori,
 * 2026-10-29), ya'ni faqat tizim egasida. Darvoza SERVERDA ham bor
 * (`activity.controller.js` → 403).
 *
 * Davr URL da (`?days=`): tanlangan davrni havola qilib yuborsa bo'ladi.
 */
const BotReportPage = () => {
  const navigate = useNavigate();
  const { isAggregate, canViewAll, switchToAll, isSwitching } = useBranch();
  const { can } = usePermissions();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isExporting, setExporting] = useState(false);

  const canSee = can("activity.view");

  const daysParam = searchParams.get("days");
  const days = PERIODS.some((item) => item.value === daysParam)
    ? daysParam
    : DEFAULT_DAYS;

  const params = useMemo(() => ({ days: Number(days) }), [days]);

  // ⚠️ Rejim yoki ruxsat to'g'ri kelmasa SO'ROV UMUMAN YUBORILMAYDI:
  // server 403 qaytaradi va ekranda "xatolik" ko'rinardi — holbuki bu
  // xato emas, shunchaki boshqa ko'rinish.
  const {
    data: report,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    ...activityQueries.botReport(params),
    enabled: isAggregate && canSee,
  });

  const setDays = useCallback(
    (value) =>
      setSearchParams(
        (prev) => {
          if (value && value !== DEFAULT_DAYS) prev.set("days", value);
          else prev.delete("days");
          return prev;
        },
        { replace: true },
      ),
    [setSearchParams],
  );

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await activityAPI.exportBotReport(params);
      downloadBlob(response, "bot-foydalanuvchilari.docx");
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
        <h1 className="page-title">Bot foydalanuvchilari</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Qamrov, foydalanish, sinflar kesimi va ulanmaganlar ro&apos;yxati —
          hujjat ko&apos;rinishida
        </p>
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
            icon={Bot}
            title="Bu hisobotni ko'rishga ruxsat yo'q"
            description={
              "Hisobot Faollik bo'limining ma'lumotidan quriladi, shuning " +
              "uchun u o'sha bo'limning ko'rish huquqi ortida turadi."
            }
          />
        </Card>
      </div>
    );
  }

  /**
   * ⚠️ FILIAL TANLANGAN BO'LSA — BO'LIM OCHILMAYDI (biznes qarori,
   * 2026-10-29). Hisobot tarmoq savoliga javob beradi; filial ichida uni
   * Faollik bo'limi beradi.
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
              "Bot qamrovi butun tarmoq bo'yicha hisoblanadi — qaysi " +
              "filialda ota-onalar ulanmay qolgani. Buning uchun " +
              "almashtirgichdan \"Umumiy — barcha filiallar\" ni tanlang. " +
              "Bitta filialning kesimi Faollik bo'limida turadi."
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
            value={days}
            items={PERIODS}
            onChange={setDays}
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
            ko'rsatmasa, u bitta filialniki deb o'qilishi mumkin. */}
        {report?.branches?.length > 0 && (
          <p className="text-xs text-gray-400">
            Qamrov: {report.branches.map((item) => item.name).join(", ")}.
            Davr: {report.period.days} kun. Sonlar qo&apos;shilgan, foiz esa
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
            icon={Bot}
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
        <BotReportDocument report={report} />
      )}
    </div>
  );
};

export default BotReportPage;
