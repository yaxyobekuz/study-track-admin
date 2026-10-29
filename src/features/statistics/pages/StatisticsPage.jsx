// Toast
import { toast } from "sonner";

// Utils
import { cn } from "@/shared/utils/cn";

// Hooks
import useModal from "@/shared/hooks/useModal";
import usePermissions from "@/shared/hooks/usePermissions";

// Router
import { useNavigate, useSearchParams } from "react-router-dom";

// API
import { statisticsAPI } from "@/features/statistics/api/statistics.api";
import { classesAPI } from "@/features/classes/api/classes.api";

// Data
import {
  scoreColor,
  scoreLegend,
  resolvePeriod,
  STATISTICS_PERIODS,
} from "@/features/statistics/data/statistics.data";

// Utils
import { formatDateUz, formatDateRangeUz } from "@/shared/utils/date.utils";

// Components
import Card from "@/shared/components/ui/Card";
import Select from "@/shared/components/ui/select/Select";
import Button from "@/shared/components/ui/button/Button";
import Pagination from "@/shared/components/ui/Pagination";

// React
import { useState, useEffect, useCallback, useRef } from "react";

// Icons
import {
  Eye,
  Users,
  School,
  Download,
  CalendarDays,
  GraduationCap,
} from "lucide-react";

/**
 * Haftalik reyting.
 *
 * ⚠️ IKKI KIRISH NUQTASI, IKKI XIL SAVOL: ko'z tugmasi — "bu hafta qancha
 * ball oldi" (haftalik oyna), qatorning O'ZI esa o'quvchining TO'LIQ
 * profilini ochadi (`/users/:id` — davomat kunlik sahifasi va bosh
 * sahifadagi "Eng yaxshilar" kartasi bilan AYNI naqsh). Reytingda ismni
 * ko'rgan odam "bu kim" degan savolga shu yerdan javob olishi kerak,
 * o'quvchini qaytadan "O'quvchilar" bo'limidan qidirmasdan.
 *
 * ⚠️ Umumiy ("barcha filiallar") ko'rinishida ham ishlaydi: profil so'rovi
 * yo'ldagi id bo'yicha o'z filialiga tushadi, shuning uchun filialni oldin
 * almashtirish SHART EMAS.
 *
 * ⚠️ DAVR (kunlik / haftalik / oylik) — URL'da (`?period=`), holatda EMAS:
 * profilga kirib "orqaga" qaytilganda tanlov saqlanib qolishi kerak
 * (davomat sahifasidagi filtrlar bilan AYNI qoida). Oraliqni SERVER
 * aytadi (`periodStart` / `periodEnd`) — panel sanani o'zi hisoblamaydi,
 * aks holda ekrandagi davr bilan sanalgan baholar boshqa-boshqa bo'lardi.
 */
const Statistics = () => {
  const { openModal } = useModal();
  const { can } = usePermissions();
  const navigate = useNavigate();
  const contentRef = useRef(null);

  // Profil `GET /users/:id` ga tayanadi — ruxsatsiz qator bosilmaydi
  // (403 o'rniga bosilmaydigan qator).
  const canOpenProfile = can("users.view");

  // Search params
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const period = resolvePeriod(searchParams.get("period"));

  // States
  const [classes, setClasses] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState("school");
  const [selectedClass, setSelectedClass] = useState(null);
  // Serverdan kelgan davr oralig'i ({ start, end }) — sarlavha yorlig'i uchun
  const [range, setRange] = useState(null);

  // Pagination states
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  // Sinflarni yuklash
  useEffect(() => {
    classesAPI
      .getAll()
      .then((res) => {
        if (res.data.success) {
          setClasses(res.data.data || []);
          if (res.data.data && res.data.data.length > 0) {
            setSelectedClass(res.data.data[0].id);
          }
        }
      })
      .catch(() => {
        toast.error("Sinflarni yuklashda xatolik");
      });
  }, []);

  // Reytinglarni yuklash
  const fetchRankings = useCallback(() => {
    setIsLoading(true);

    const params = { page: currentPage, limit: 50, period };

    const apiCall =
      viewMode === "school"
        ? statisticsAPI.getSchoolRankings(params)
        : statisticsAPI.getClassRankings(selectedClass, params);

    apiCall
      .then((res) => {
        if (!res.data.success) return;
        setRankings(res.data.data.rankings || []);
        setRange({
          start: res.data.data.periodStart,
          end: res.data.data.periodEnd,
        });

        // Set pagination data
        if (res.data.pagination) {
          setHasNextPage(res.data.pagination.hasNextPage);
          setHasPrevPage(res.data.pagination.hasPrevPage);
          setTotalPages(res.data.pagination.totalPages);
        }
      })
      .catch((err) => {
        toast.error(
          err.response?.data?.message || "Reytinglarni yuklashda xatolik",
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [viewMode, selectedClass, currentPage, period]);

  // Navigate to page
  const goToPage = useCallback(
    (page) => {
      if (page < 1) return;
      const params = new URLSearchParams(searchParams);
      params.set("page", page.toString());
      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  // Davr almashtirish — sahifa bilan BIRGA yoziladi: ikki alohida yozuv
  // bo'lsa, oraliq holatda 5-sahifa yangi davr bilan so'ralardi.
  const changePeriod = useCallback(
    (value) => {
      const params = new URLSearchParams(searchParams);
      params.set("period", value);
      params.set("page", "1");
      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  // View mode yoki sinf o'zgarganda page'ni 1 ga reset qilish
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    setSearchParams(params);
  }, [viewMode, selectedClass]);

  // View mode o'zgarganda reytinglarni yangilash
  useEffect(() => {
    if (viewMode === "school" || (viewMode === "class" && selectedClass)) {
      fetchRankings();
    }
  }, [viewMode, selectedClass, fetchRankings]);

  // O'quvchi statistikasini ko'rsatish — JADVAL BILAN AYNI DAVRDA, aks
  // holda ro'yxatda bir raqam, oynada boshqasi turardi.
  const handleViewStudent = useCallback(
    (studentId) => openModal("studentStats", { studentId, period }),
    [openModal, period],
  );

  // O'quvchining to'liq profili
  const openProfile = useCallback(
    (studentId) => navigate(`/users/${studentId}`),
    [navigate],
  );

  // Sinf tanlash uchun options
  const classOptions = classes.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  // Tanlangan davrning nomi ("Kunlik" / "Haftalik" / "Oylik")
  const periodLabel =
    STATISTICS_PERIODS.find((p) => p.value === period)?.label || "";

  // Davr oralig'i — SERVERDAN. Kunlik davrda boshi va oxiri bitta kun,
  // shuning uchun oraliq emas, sananing o'zi yoziladi.
  const rangeLabel = !range?.start
    ? ""
    : period === "day"
      ? formatDateUz(range.start)
      : formatDateRangeUz(range.start, range.end);

  // Excel yuklab olish
  const handleExport = async () => {
    try {
      const params =
        viewMode === "class"
          ? { type: "class", classId: selectedClass, period }
          : { type: "school", period };

      const response = await statisticsAPI.export(params);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Fayl nomidagi davr server bilan bir xil: "kunlik_" / "haftalik_" / "oylik_"
      const prefix = periodLabel.toLowerCase();
      const today = new Date().toISOString().split("T")[0];
      const fileName =
        viewMode === "class"
          ? `${prefix}_reyting_sinf_${today}.xlsx`
          : `${prefix}_reyting_maktab_${today}.xlsx`;

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Excel yuklab olishda xatolik");
      console.error("Export xatosi:", error);
    }
  };

  // Badge color (rank bo'yicha)
  const getRankBadgeColor = (rank) => {
    if (rank === 1) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    if (rank === 2) return "bg-gray-100 text-gray-800 border-gray-300";
    if (rank === 3) return "bg-orange-100 text-orange-800 border-orange-300";
    return "bg-blue-50 text-blue-700 border-blue-200";
  };

  return (
    <div>
      {/* Controls */}
      <Card className="mb-6 space-y-4">
        {/* Davr — kunlik / haftalik / oylik */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Davr
          </label>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex w-full gap-2 sm:gap-4">
              {STATISTICS_PERIODS.map((item) => (
                <Button
                  key={item.value}
                  className="w-full"
                  onClick={() => changePeriod(item.value)}
                  variant={period === item.value ? "default" : "secondary"}
                >
                  {item.label}
                </Button>
              ))}
            </div>

            {/* Qaysi kunlar sanalgani — serverdan kelgan oraliq */}
            {rangeLabel && (
              <p className="flex shrink-0 items-center gap-1.5 text-sm text-gray-500">
                <CalendarDays className="size-4" strokeWidth={1.5} />
                {rangeLabel}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row">
          {/* View Mode Toggle */}
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ko'rinish
            </label>

            <div className="flex gap-4">
              <Button
                className="w-full"
                onClick={() => setViewMode("school")}
                variant={viewMode === "school" ? "default" : "secondary"}
              >
                <School />
                Maktab bo'yicha
              </Button>

              <Button
                className="w-full"
                onClick={() => setViewMode("class")}
                variant={viewMode === "class" ? "default" : "secondary"}
              >
                <Users />
                Sinf bo'yicha
              </Button>
            </div>
          </div>

          {/* Class Select (faqat sinf ko'rinishida) */}
          {viewMode === "class" && (
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sinf tanlang
              </label>
              <Select
                value={selectedClass}
                onChange={setSelectedClass}
                options={classOptions}
                placeholder="Sinfni tanlang"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Rankings Table */}
      <div ref={contentRef}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : rankings.length === 0 ? (
          <div className="text-center py-12">
            <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {period === "day"
                ? "Bugun hech qanday natija topilmadi"
                : period === "month"
                  ? "Joriy oyda hech qanday natija topilmadi"
                  : "Joriy haftada hech qanday natija topilmadi"}
            </p>
          </div>
        ) : (
          <div className="rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th>O'rin</th>
                  <th>O'quvchi</th>
                  {viewMode === "school" && <th>Sinflar</th>}
                  <th>Umumiy Ball</th>
                  <th>Baholar soni</th>
                  <th>Harakatlar</th>
                </tr>
              </thead>

              <tbody>
                {rankings.map((item) => (
                  <tr
                    key={item.student.id}
                    title={
                      canOpenProfile
                        ? `${item.student.fullName} — profilni ochish`
                        : undefined
                    }
                    onClick={
                      canOpenProfile
                        ? () => openProfile(item.student.id)
                        : undefined
                    }
                    className={cn(
                      "group transition-colors hover:bg-gray-50",
                      canOpenProfile && "cursor-pointer",
                    )}
                  >
                    {/* Rank */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={cn(
                          "flex items-center justify-center min-h-8 px-1.5 rounded-full border",
                          getRankBadgeColor(item.rank),
                        )}
                      >
                        <span className="font-semibold">{item.rank}</span>
                      </div>
                    </td>

                    {/* Student Name — qatorni bosish profilni ochadi */}
                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                      <span
                        className={cn(
                          canOpenProfile &&
                            "group-hover:text-blue-600 group-hover:underline",
                        )}
                      >
                        {item.student.fullName}
                      </span>
                    </td>

                    {/* Classes (faqat maktab ko'rinishida) */}
                    {viewMode === "school" && (
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.classes && item.classes.length > 0
                          ? item.classes.map((c) => c.name).join(", ")
                          : "-"}
                      </td>
                    )}

                    {/* Total Sum — chegara TANLANGAN DAVRNIKI (legend bilan
                        AYNI manbadan: `statistics.data.js`) */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={cn(
                          "font-semibold",
                          scoreColor(period, item.totalSum),
                        )}
                      >
                        {item.totalSum}
                      </span>
                    </td>

                    {/* Total Grades */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-700">{item.totalGrades}</span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* ⚠️ Tugma bosilishi QATORGA TARQALMAYDI: aks holda
                          natija oynasi bilan birga profil ham ochilib,
                          oyna darhol boshqa sahifada qolib ketardi. */}
                      <Button
                        variant="secondary"
                        size="sm"
                        title={`${periodLabel} natijasi`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewStudent(item.student.id);
                        }}
                        className="flex items-center gap-2"
                      >
                        <Eye className="size-5" strokeWidth={1.5} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {!isLoading && rankings.length > 0 && (
          <Pagination
            contentRef={contentRef}
            maxPageButtons={5}
            showPageNumbers={true}
            onPageChange={goToPage}
            currentPage={currentPage}
            hasNextPage={hasNextPage}
            hasPrevPage={hasPrevPage}
            className="pt-6"
            totalPages={totalPages}
          />
        )}
      </div>

      {/* Legend — chegaralar DAVRGA qarab o'zgaradi (bir kunda 45 ball
          imkonsiz, bir oyda esa u past natija) */}
      <Card className="flex flex-wrap items-center gap-6 text-sm mt-6">
        {scoreLegend(period).map((item) => (
          <div key={item.range} className="flex items-center gap-2">
            <div className={cn("size-3 rounded-full", item.dot)}></div>
            <span className="text-gray-700">
              <strong>{item.range}</strong> - {item.label}
            </span>
          </div>
        ))}

        {/* Export Button */}
        <Button
          className="ml-auto"
          onClick={handleExport}
          disabled={isLoading || (viewMode === "class" && !selectedClass)}
        >
          <Download />
          Yuklab olish
        </Button>
      </Card>
    </div>
  );
};

export default Statistics;
