// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Router
import { Link, useParams, useLocation } from "react-router-dom";

// Icons
import { ArrowLeft, FileText, ChevronRight } from "lucide-react";

// API
import { testSeasonsAPI } from "../api/testSeasons.api";

// Data
import {
  RESULT_STATUS_LABELS,
  RESULT_STATUS_COLORS,
} from "../data/resultStatuses.data";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateUZ } from "@/shared/utils/date.utils";
import { formatScore } from "@/shared/utils/formatScore";

/**
 * Admin: bitta o'quvchining mavsumdagi topshirgan testlari ro'yxati.
 * Har bir natija javoblar sahifasiga olib boradi.
 */
const StudentResultsPage = () => {
  const { seasonId, studentId } = useParams();
  const location = useLocation();
  const studentName = location.state?.studentName;

  const { data: results = [], isLoading } = useQuery({
    queryKey: ["admin-student-results", seasonId, studentId],
    queryFn: () =>
      testSeasonsAPI
        .getStudentResults(seasonId, studentId)
        .then((res) => res.data.data),
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3 flex-wrap">
        <Link to={`/test-seasons/${seasonId}/rewards`}>
          <Button variant="outline" size="sm" className="size-9 p-0">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold text-gray-900">
            {studentName || "O'quvchi"} - test javoblari
          </h1>
          <p className="text-sm text-gray-600 mt-0.5">
            Mavsumda topshirilgan testlar ro'yxati
          </p>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <p className="text-center text-gray-500 py-10">Yuklanmoqda...</p>
        </Card>
      ) : results.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center py-10 text-center">
            <FileText size={40} className="text-gray-300" />
            <p className="mt-3 text-gray-600">
              Bu o'quvchi mavsumda test topshirmagan
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {results.map((r) => (
            <Link
              key={r._id}
              to={`/test-seasons/results/${r._id}`}
              state={{ seasonId, studentName }}
            >
              <Card className="transition-shadow hover:shadow-md">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="font-semibold text-gray-900">
                      {r.test?.title || "Test"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {r.subject?.name}
                      {r.class?.name ? ` · ${r.class.name}` : ""} ·{" "}
                      {formatDateUZ(r.createdAt)}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-md text-xs font-medium",
                          RESULT_STATUS_COLORS[r.status] || "bg-gray-100",
                        )}
                      >
                        {RESULT_STATUS_LABELS[r.status] || r.status}
                      </span>
                      {r.gradingMin != null && r.status !== "pending" && (
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-md text-xs font-medium",
                            r.passed
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700",
                          )}
                        >
                          {r.passed ? "O'tdi" : "O'tmadi"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-blue-700">
                      {formatScore(r.finalScore)}
                      <span className="text-sm font-normal text-gray-500">
                        {" "}
                        / {r.maxScore != null ? formatScore(r.maxScore) : "-"}
                      </span>
                    </p>
                  </div>

                  <ChevronRight size={20} className="text-gray-400 shrink-0" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentResultsPage;
