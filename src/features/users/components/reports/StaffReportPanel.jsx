// Router
import { useSearchParams } from "react-router-dom";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import LoaderCard from "@/shared/components/ui/LoaderCard";
import EmptyState from "@/shared/components/ui/EmptyState";
import StaffKpiRow from "./StaffKpiRow";
import StaffRoleChart from "./StaffRoleChart";
import StaffTasksCard from "./StaffTasksCard";
import StaffQuickStats from "./StaffQuickStats";
import StaffTrendChart from "./StaffTrendChart";
import StaffStatusDonut from "./StaffStatusDonut";
import StaffTenureTable from "./StaffTenureTable";
import StaffSubjectsCard from "./StaffSubjectsCard";
import StaffPenaltiesCard from "./StaffPenaltiesCard";
import StaffAttentionList from "./StaffAttentionList";
import StaffTopPerformers from "./StaffTopPerformers";
import StaffIndicatorsRadar from "./StaffIndicatorsRadar";
import StaffSubjectCoverageCard from "./StaffSubjectCoverageCard";

// Utils
import { cn } from "@/shared/utils/cn";

// Helpers & queries
import {
  prevMonthKey,
  formatMonthKey,
  currentMonthKey,
  buildMonthOptions,
} from "@/shared/helpers/month.helpers";
import { usersQueries } from "../../queries/users.queries";

/**
 * Xodimlar bo'limining "Hisobotlar" tabi.
 *
 * Panel bitta savolga javob beradi: "shtat qanday holatda?". Javob ataylab
 * qatlamlarga bo'lingan — yuqorida beshta KPI (bir qarashda o'qiladigan
 * yakun), ostida uchtadan panel: avval MANZARA (holat, dinamika, rollar),
 * keyin FANLAR (qaysi fanni kim o'qitadi va qayerda bo'shliq bor), keyin
 * ODAMLAR (reyting, ko'rsatkichlar radari, tezkor statistika), so'ng
 * INTIZOM (jarima, topshiriq, e'tibor talab qiladiganlar), eng pastda esa
 * batafsil o'qiladigan yagona jadval. Ko'z shu tartibda umumiydan xususiyga
 * tushadi va hech bir qatorda ikki xil savol aralashmaydi.
 *
 * Bu fayl faqat KOMPOZITSIYA: hech bir raqam shu yerda hisoblanmaydi va
 * hech bir panel o'z ma'lumotini o'zi so'ramaydi — payload bir marta
 * olinadi va bo'laklarga ajratib uzatiladi. Shu sababli bir ko'rsatkich
 * ikki panelda har xil chiqib qolishi mumkin emas.
 *
 * Hisobot JORIY oyni ko'rsatadi. Oy tanlagich sahifadan olib tashlangan,
 * lekin `?month=202608` parametri ishlashda qoladi: shu tufayli aniq bir
 * oydagi hisobotni link qilib yuborish imkoni yo'qolmadi.
 */
const StaffReportPanel = () => {
  const [searchParams] = useSearchParams();

  // URL'dagi oy qabul qilinadi, lekin faqat oxirgi 12 oy oralig'ida —
  // aks holda tasodifiy `?month=999999` serverga ma'nosiz so'rov yuborardi.
  // Ro'yxat HAR RENDERDA qayta yig'iladi (12 ta arzon qadam): modul
  // darajasida hisoblansa, ochiq qolgan tab oy chegarasidan o'tganda
  // "joriy oy" eskirib qolardi.
  const monthParam = Number(searchParams.get("month"));
  const isAllowedMonth = buildMonthOptions({ back: 11, forward: 0 }).some(
    (option) => Number(option.value) === monthParam,
  );
  const month = isAllowedMonth ? monthParam : currentMonthKey();

  const { data, isLoading, isError } = useQuery(
    usersQueries.report({
      month: month % 100,
      year: Math.trunc(month / 100),
    }),
  );

  return (
    <div className="space-y-4">
      {isLoading ? (
        <LoaderCard className="ring-1 ring-gray-100" />
      ) : isError || !data ? (
        <Card className="ring-1 ring-gray-100">
          <EmptyState
            title="Hisobot yuklanmadi"
            description="Ma'lumotlarni olishda xatolik yuz berdi. Sahifani yangilab ko'ring."
          />
        </Card>
      ) : (
        <>
          <StaffKpiRow report={data} />

          {/* Manzara: shtat qanday tuzilgan va qayoqqa ketyapti */}
          <div className="grid gap-4 lg:grid-cols-3">
            <StaffStatusDonut composition={data.composition} />
            <StaffTrendChart flow={data.flow} />
            <StaffRoleChart
              byRole={data.byRole}
              total={data.composition.total}
            />
          </div>

          {/* Fanlar: "kim nima qiladi" savolining davomi. Rol bo'yicha
              taqsimot va fanlar bo'yicha o'qituvchilar bir xil — tarkibiy —
              savolga javob beradi, shuning uchun ular yonma-yon turadi va
              sahifa faqat shundan keyin faollik va intizomga o'tadi.
              `lg:col-span-2` kartaning O'ZIGA beriladi: o'ram ichida karta
              to'r katagiga cho'zilmay, qator pastdan tekis chiqmasdi.

              Blok shartli chiziladi — u payload'da eng yangisi, ya'ni admin
              yangi, server eski bo'lgan lahzada (deploy oralig'i) kelmasligi
              mumkin. Ilovada ErrorBoundary yo'q, shuning uchun himoyasiz
              o'qish butun sahifani oq qoldirardi. */}
          {data.subjects && (
            <div className="grid gap-4 lg:grid-cols-3">
              <StaffSubjectsCard
                subjects={data.subjects}
                className="lg:col-span-2"
              />
              <StaffSubjectCoverageCard subjects={data.subjects} />
            </div>
          )}

          {/* Odamlar: kim yaxshi ishladi va oy o'tgan oydan nimasi bilan farq qiladi */}
          <div className="grid gap-4 lg:grid-cols-3">
            <StaffTopPerformers
              attendance={data.attendance}
              tasks={data.tasks}
            />
            <StaffIndicatorsRadar
              indicators={data.indicators}
              monthLabel={formatMonthKey(month)}
              previousLabel={formatMonthKey(prevMonthKey(month))}
            />
            <StaffQuickStats quickStats={data.quickStats} />
          </div>

          {/* Intizom. Oxirgi panel davomat ruxsati bo'lmasa o'zi chizilmaydi,
              shuning uchun u shartsiz chiziladi — lekin qatorning USTUNLAR
              SONI shu yerda hal qilinadi: aks holda uchdan bir bo'sh katak
              zich to'rda ko'zga tashlanadigan teshik bo'lib qolardi */}
          <div
            className={cn(
              "grid gap-4",
              data.attendance ? "lg:grid-cols-3" : "lg:grid-cols-2",
            )}
          >
            <StaffPenaltiesCard penalties={data.penalties} />
            <StaffTasksCard tasks={data.tasks} />
            <StaffAttentionList attendance={data.attendance} />
          </div>

          <StaffTenureTable tenure={data.tenure} />
        </>
      )}
    </div>
  );
};

export default StaffReportPanel;
