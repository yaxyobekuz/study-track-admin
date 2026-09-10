// React
import { useMemo, useState } from "react";

// Router
import { Link, useNavigate, useParams } from "react-router-dom";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { ArrowLeft, ChevronRight, ClipboardList, Users } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import EmptyState from "@/shared/components/ui/EmptyState";
import Table, { Td, Tr } from "@/shared/components/ui/Table";
import { Badge, GradeBadge } from "../components/ToneBadge";
import DateRangeFilter from "../components/DateRangeFilter";

// Queries
import { analyticsQueries } from "../queries/diagnostics.queries";

// Data
import {
  MODE_LABELS,
  TEST_STATUS_LABELS,
  TEST_STATUS_BADGE,
  defaultRange,
  gradeColor,
} from "../data/diagnostics.data";

// Utils
import { formatDateUz } from "@/shared/utils/date.utils";

/**
 * BITTA SINFNING DIAGNOSTIKA TAFSILOTI.
 *
 * Uch qism: sinf ko'rsatkichlari, sinfga biriktirilgan testlar va
 * o'quvchilar ro'yxati.
 *
 * ⚠️ O'QUVCHI QATORI BOSILGANDA UNING PROFILIGA O'TADI. Bu ekranning
 * asosiy yo'li: rahbar sinfdan boshlaydi, zaif o'quvchini ko'radi va
 * darhol uning tahliliga kiradi. Alohida "ko'rish" tugmasi qo'yilsa,
 * qatorning o'zi bosilmaydigan bo'lib qolardi va yo'l uzilardi.
 */
const ClassDetailPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [range, setRange] = useState(defaultRange);

  const params = useMemo(() => ({ from: range.from, to: range.to }), [range]);
  const { data, isLoading } = useQuery(
    analyticsQueries.classDetail(classId, params),
  );

  if (isLoading) {
    return <Card className="py-16 text-center text-gray-400">Yuklanmoqda…</Card>;
  }

  if (!data) {
    return (
      <Card>
        <EmptyState title="Sinf topilmadi" description="Sinf o'chirilgan bo'lishi mumkin." />
      </Card>
    );
  }

  const { summary, tests, students } = data;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/diagnostics/classes"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="size-4" strokeWidth={1.5} />
          Sinflarga qaytish
        </Link>
        <DateRangeFilter from={range.from} to={range.to} onChange={setRange} />
      </div>

      <div>
        <h1 className="text-xl font-semibold text-gray-900">{data.class.name}</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          {summary.students} o'quvchi · {summary.tests} biriktirilgan test
        </p>
      </div>

      {/* ── KO'RSATKICHLAR ─────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Metric label="O'quvchilar" value={summary.students} />
        <Metric label="Testlar" value={summary.tests} />
        <Metric
          label="Sinf o'rtacha natijasi"
          value={summary.averageScore != null ? `${summary.averageScore}%` : "—"}
          color={
            summary.averageScore != null ? gradeColor(summary.averageScore) : undefined
          }
        />
        <Metric
          label="Test ishlaganlar"
          value={summary.testedStudents}
          hint={`${summary.attempts} ta urinish`}
        />
      </div>

      {/* ── SINF TESTLARI ──────────────────── */}
      <Card className="!p-0">
        <div className="p-4 xs:p-5">
          <h2 className="font-semibold text-gray-900">Sinf testlari</h2>
        </div>

        {!tests.length ? (
          <EmptyState
            icon={ClipboardList}
            title="Biriktirilgan test yo'q"
            description="Bu sinfga hali diagnostika biriktirilmagan."
          />
        ) : (
          <Table
            columns={[
              "Test nomi",
              "Fan",
              "Rejim",
              { label: "Savollar", align: "right" },
              "Sana",
              "Holati",
              { label: "O'rtacha natija", align: "right" },
              { label: "Ishlaganlar", align: "right" },
            ]}
          >
            {tests.map((test) => (
              <Tr
                key={test.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => navigate("/diagnostics/tests")}
              >
                <Td className="font-medium text-gray-900">{test.title}</Td>
                <Td className="text-gray-500">{test.subjectName || "Aralash"}</Td>
                <Td className="text-gray-500">{MODE_LABELS[test.mode]}</Td>
                <Td align="right" className="tabular-nums text-gray-500">
                  {test.questionCount}
                </Td>
                <Td className="whitespace-nowrap text-gray-500">
                  {formatDateUz(test.date)}
                </Td>
                <Td>
                  <Badge className={TEST_STATUS_BADGE[test.status]}>
                    {TEST_STATUS_LABELS[test.status] || test.status}
                  </Badge>
                </Td>
                <Td align="right" className="font-semibold tabular-nums">
                  {test.averageScore != null ? (
                    <span style={{ color: gradeColor(test.averageScore) }}>
                      {test.averageScore}%
                    </span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </Td>
                {/* ⚠️ MAXRAJ BILAN: "3 ta ishladi" degan son o'z-o'zicha
                    ko'p yoki ozligini bildirmaydi. */}
                <Td align="right" className="tabular-nums text-gray-500">
                  {test.completed}/{test.total}
                </Td>
              </Tr>
            ))}
          </Table>
        )}
      </Card>

      {/* ── O'QUVCHILAR ────────────────────── */}
      <Card className="!p-0">
        <div className="p-4 xs:p-5">
          <h2 className="font-semibold text-gray-900">
            O'quvchilar
            <span className="ml-2 text-sm font-normal text-gray-400">
              — profilga o'tish uchun bosing
            </span>
          </h2>
        </div>

        {!students.length ? (
          <EmptyState
            icon={Users}
            title="O'quvchi yo'q"
            description="Bu sinfga o'quvchi biriktirilmagan."
          />
        ) : (
          <Table
            columns={[
              "O'quvchi",
              { label: "Ishlagan testlar", align: "right" },
              { label: "O'rtacha natija", align: "right" },
              "Daraja",
              { label: "", align: "right" },
            ]}
          >
            {students.map((student) => (
              <Tr
                key={student.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => navigate(`/diagnostics/students/${student.id}`)}
              >
                <Td>
                  <span className="flex items-center gap-2.5">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {[student.lastName?.[0], student.firstName?.[0]]
                        .filter(Boolean)
                        .join("")
                        .toUpperCase() || "?"}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-gray-900">
                        {[student.lastName, student.firstName].filter(Boolean).join(" ")}
                      </span>
                      <span className="block truncate text-xs text-gray-400">
                        {student.username}
                      </span>
                    </span>
                  </span>
                </Td>
                <Td align="right" className="tabular-nums text-gray-500">
                  {student.attempts}
                </Td>
                <Td align="right" className="font-semibold tabular-nums">
                  {student.averageScore != null ? (
                    <span style={{ color: gradeColor(student.averageScore) }}>
                      {student.averageScore}%
                    </span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </Td>
                <Td>
                  <GradeBadge grade={student.grade} />
                </Td>
                <Td align="right">
                  <ChevronRight className="ml-auto size-4 text-gray-300" strokeWidth={1.5} />
                </Td>
              </Tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
};

const Metric = ({ label, value, hint, color }) => (
  <div className="rounded-2xl bg-white p-4 xs:p-5">
    <p className="text-2xl font-semibold tabular-nums" style={color ? { color } : undefined}>
      {value}
    </p>
    <p className="mt-1 text-sm text-gray-500">{label}</p>
    {hint && <p className="text-xs text-gray-400">{hint}</p>}
  </div>
);

export default ClassDetailPage;
