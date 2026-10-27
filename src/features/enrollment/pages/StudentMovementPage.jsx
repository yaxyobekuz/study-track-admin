// React
import { useCallback, useMemo, useState } from "react";

// Router
import { useNavigate, useSearchParams } from "react-router-dom";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Toast
import { toast } from "sonner";

// Icons
import { ArrowLeft, FileText, Layers, Loader2, Printer, Users } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import EmptyState from "@/shared/components/ui/EmptyState";
import { TabsButtons } from "@/shared/components/ui/tabs/Tabs";
import { Skeleton } from "@/shared/components/shadcn/skeleton";
import MovementDocument from "../components/MovementDocument";

// Hooks
import useBranch from "@/shared/hooks/useBranch";

// Queries & API
import { enrollmentQueries } from "../queries/enrollment.queries";
import { enrollmentAPI } from "../api/enrollment.api";

// Data
import {
  MOVEMENT_SCOPES,
  MOVEMENT_SCOPE_DEFAULT,
  buildMovementParams,
  buildYearOptions,
} from "../data/movement.data";

// Utils
import { buildMonthOptions, currentMonthKey } from "@/shared/helpers/month.helpers";
import { downloadBlob, readBlobErrorMessage } from "@/shared/utils/download.utils";

const YEAR_OPTIONS = buildYearOptions();

/**
 * Oy tanlovi — oxirgi 24 oy, o'zbekcha yorliq bilan ("Oktabr, 2026").
 *
 * ⚠️ `<input type="month">` ATAYLAB ISHLATILMAYDI: uning ko'rinishi
 * BRAUZER tiliga bog'liq va ekranda "October 2026" bo'lib turardi —
 * hujjatdagi "Oktabr, 2026" yonida ikki xil til (`.claude/rules/dates.md`
 * — sana matni bitta manbadan).
 * ⚠️ Kelgusi oy ro'yxatda yo'q: server ham rad etadi (hali fakt emas).
 */
const MONTH_OPTIONS = buildMonthOptions({ back: 23, forward: 0 });

/**
 * O'QUVCHILAR HARAKATI — "kimlar keldi, kimlar ketdi va nega".
 *
 * ⚠️ HUJJAT PLATFORMANING ICHIDA OCHILADI, yangi tabda emas: bosh
 * sahifadagi "O'quvchilar" kartasidagi belgi shu sahifaga olib keladi.
 * Yuklab olish — ALOHIDA amal (`.docx`), ya'ni ko'rish uchun faylni
 * ochish shart emas.
 *
 * ⚠️ EKRAN VA FAYL BITTA MANBADAN (`studentMovement.service.js`):
 * hujjat ko'rinishi `MovementDocument` da, Word nusxasi serverda, lekin
 * ikkalasi ham AYNI hisobot obyektidan quriladi — raqamlar farq qila
 * olmaydi.
 *
 * Holat URL da (`scope`, `year`, `month`, `from`, `to`): tanlangan davrni
 * havola qilib yuborsa bo'ladi va "orqaga" tanlovni yo'qotmaydi.
 */
const StudentMovementPage = () => {
  const navigate = useNavigate();
  const { isAggregate, canViewAll, switchToAll, isSwitching } = useBranch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isExporting, setExporting] = useState(false);

  const scopeParam = searchParams.get("scope");
  const scope = MOVEMENT_SCOPES.some((item) => item.value === scopeParam)
    ? scopeParam
    : MOVEMENT_SCOPE_DEFAULT;

  const thisMonth = currentMonthKey();
  const year = searchParams.get("year") || String(Math.trunc(thisMonth / 100));
  const month = searchParams.get("month") || String(thisMonth);
  const from = searchParams.get("from") || String(Math.trunc(thisMonth / 100) * 100 + 1);
  const to = searchParams.get("to") || String(thisMonth);

  const params = useMemo(
    () => buildMovementParams({ scope, year, month, from, to }),
    [scope, year, month, from, to],
  );

  // ⚠️ Rejim to'g'ri kelmasa SO'ROV UMUMAN YUBORILMAYDI: server 403
  // qaytaradi (`studentEnrollment.controller.js`) va ekranda "xatolik"
  // ko'rinardi — holbuki bu xato emas, shunchaki boshqa ko'rinish.
  const { data: report, isLoading, isError, error, refetch } = useQuery({
    ...enrollmentQueries.movement(params),
    enabled: isAggregate,
  });

  const setParam = useCallback(
    (key, value) =>
      setSearchParams((prev) => {
        if (value) prev.set(key, value);
        else prev.delete(key);
        return prev;
      }),
    [setSearchParams],
  );

  /**
   * ⚠️ Oraliq tanlanganda `from > to` bo'lib qolishi mumkin (odam avval
   * tugash oyini orqaga suradi). Server buni rad etadi, shuning uchun
   * ikkinchi chegara shu yerda surib qo'yiladi — xato xabari o'rniga
   * ma'noli natija.
   */
  const setRangeBound = useCallback(
    (bound, value) => {
      const monthKey = Number(value);
      if (!monthKey) return;

      setSearchParams((prev) => {
        prev.set(bound, String(monthKey));
        if (bound === "from" && Number(prev.get("to") || to) < monthKey) {
          prev.set("to", String(monthKey));
        }
        if (bound === "to" && Number(prev.get("from") || from) > monthKey) {
          prev.set("from", String(monthKey));
        }
        return prev;
      });
    },
    [setSearchParams, from, to],
  );

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await enrollmentAPI.exportMovement(params);
      downloadBlob(response, "oquvchilar-harakati.docx");
    } catch (err) {
      toast.error(
        await readBlobErrorMessage(err, "Word fayli yuklab olinmadi"),
      );
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
        <h1 className="page-title">O&apos;quvchilar harakati</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Butun tarmoq bo&apos;yicha: kimlar keldi, kimlar ketdi va nega —
          o&apos;sish va tushish foizlari bilan, hujjat ko&apos;rinishida
        </p>
      </div>
    </div>
  );

  /**
   * ⚠️ FILIAL TANLANGAN BO'LSA — BO'LIM OCHILMAYDI (biznes qarori,
   * 2026-10-27). Hisobot tarmoq savoliga javob beradi; filial ichida u
   * o'sha filialning raqami bo'lib qolardi va bir xil nomdagi bo'lim ikki
   * joyda ikki xil savolga javob berardi.
   *
   * ⚠️ XATO EMAS, YO'L KO'RSATILADI: menyuda bu qator umumiy ko'rinishdan
   * tashqarida ko'rinmaydi, ya'ni bu yerga faqat SAQLANGAN HAVOLA bilan
   * kelinadi. "Ruxsat yo'q" degan ekran o'rniga darhol o'tish tugmasi
   * turadi — odam nima qilishini bilib tursin.
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
              "O'quvchilar harakati butun tarmoq bo'yicha hisoblanadi — " +
              "qaysi filial o'sdi, qaysi biri tushdi. Buning uchun " +
              "almashtirgichdan \"Umumiy — barcha filiallar\" ni tanlang."
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
            value={scope}
            items={MOVEMENT_SCOPES}
            onChange={(value) => setParam("scope", value === MOVEMENT_SCOPE_DEFAULT ? "" : value)}
            className="min-w-0"
            listClassName="max-w-full overflow-x-auto overflow-y-hidden hidden-scrollbar"
            triggerClassName="shrink-0"
          />

          {scope === "year" && (
            <Select
              value={year}
              options={YEAR_OPTIONS}
              placeholder="Yil tanlang"
              onChange={(value) => setParam("year", value)}
              triggerClassName="w-full lg:w-44 lg:shrink-0"
            />
          )}

          {scope === "month" && (
            <Select
              value={month}
              options={MONTH_OPTIONS}
              placeholder="Oy tanlang"
              onChange={(value) => setParam("month", value)}
              triggerClassName="w-full lg:w-52"
            />
          )}

          {scope === "range" && (
            <div className="flex items-center gap-2">
              <Select
                value={from}
                options={MONTH_OPTIONS}
                placeholder="Boshlanish oyi"
                onChange={(value) => setRangeBound("from", value)}
                triggerClassName="w-full lg:w-48"
              />
              <span className="shrink-0 text-sm text-gray-400">—</span>
              <Select
                value={to}
                options={MONTH_OPTIONS}
                placeholder="Tugash oyi"
                onChange={(value) => setRangeBound("to", value)}
                triggerClassName="w-full lg:w-48"
              />
            </div>
          )}

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

            {/* ⚠️ Word fayli UMUMIY KO'RINISHDA ham beriladi va bu avval
                shunday emas edi: yo'l `unsupported` bo'lib turardi (ikkilik
                hujjat birlashtirilmaydi) va tugma o'chiq edi. Endi hisobot
                filiallar bo'ylab SERVERDA quriladi
                (`studentMovementNetwork.service.js`), ya'ni birlashtiriladigan
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

        {/* ⚠️ QAMROV OCHIQ YOZILADI: "462" degan raqam qaysi filiallardan
            yig'ilganini ko'rsatmasa, u bitta filialniki deb o'qilishi
            mumkin. Foiz esa yig'indidan qayta hisoblangan — filiallar
            o'rtachasi EMAS (`combineMetrics`). */}
        {report?.branches?.length > 0 && (
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
            icon={Users}
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
        <MovementDocument report={report} />
      )}
    </div>
  );
};

export default StudentMovementPage;
