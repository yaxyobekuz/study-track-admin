// React
import { useMemo, useState } from "react";

// Router
import { Link, useParams } from "react-router-dom";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import {
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  ClipboardList,
  AlertTriangle,
  Sparkles,
  Eye,
  Key,
} from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Table, { Td, Tr } from "@/shared/components/ui/Table";
import EmptyState from "@/shared/components/ui/EmptyState";
import CircularScore from "../components/charts/CircularScore";
import TrendChart from "../components/charts/TrendChart";
import RadarChart from "../components/charts/RadarChart";
import { Badge, ToneBadge, GradeBadge } from "../components/ToneBadge";
import DateRangeFilter from "../components/DateRangeFilter";
import TabsButtons from "@/shared/components/ui/tabs/TabsButtons";
import Can from "@/shared/components/guards/Can";
import StudentDashboardView from "../components/StudentDashboardView";
import StudentHistoryView from "../components/StudentHistoryView";

// Queries
import { analyticsQueries, attemptQueries } from "../queries/diagnostics.queries";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Data
import {
  scoreColor,
  TONES,
  toneOf,
  MODE_LABELS,
  ERROR_REASONS,
  gradeColor,
  defaultRange,
} from "../data/diagnostics.data";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateTimeUz, formatDateUz } from "@/shared/utils/date.utils";

/**
 * O'QUVCHINING DIAGNOSTIKA PROFILI.
 *
 * ⚠️ O'SISH BIRINCHI VA OXIRGI O'LCHOV ORASIDAGI FARQ (punktda). O'rtacha
 * ballning o'zi o'sishni ko'rsatmaydi: 40% va 80% ning o'rtachasi 60%,
 * lekin bu "60 ball" emas, "ikki barobar o'sdi" degan hikoya.
 */
const StudentProfilePage = () => {
  const { studentId } = useParams();
  const [range, setRange] = useState(defaultRange);

  const [tab, setTab] = useState("analysis");
  const { openModal } = useModal();

  const { data, isLoading } = useQuery(
    analyticsQueries.student(studentId, { from: range.from, to: range.to }),
  );

  /**
   * ⚠️ PANEL VA TARIX SANA ORALIG'INI OLMAYDI — bu ATAYLAB.
   *
   * "Tahlil" tabi davr hisoboti (oraliq bilan), qolgan ikkitasi esa
   * o'quvchining BUTUN manzarasi: o'quvchi o'z panelida ham aynan
   * shunday ko'radi. Ularni oraliqqa bog'lasak, xodim ko'rgan raqam
   * o'quvchi ko'rgan raqamdan farq qilib qolardi.
   */
  const { data: dashboard } = useQuery(analyticsQueries.studentDashboard(studentId));
  const { data: history } = useQuery(
    attemptQueries.list({ studentId, limit: 100, page: 1 }),
  );

  /**
   * ⚠️ HOOK ERTA CHAQIRILADI — `data` tekshiruvidan OLDIN. Uni pastga,
   * "o'quvchi topilmadi" shartidan keyin qo'yish React qoidasini
   * buzardi: birinchi renderda hook chaqirilmay, ikkinchisida
   * chaqirilib qolardi.
   *
   * Tartib ataylab: eng ko'p uchraydigan sabab tepada tursin.
   */
  const errorPatterns = data?.errorPatterns;
  const errorRows = useMemo(() => {
    if (!errorPatterns?.wrongCount) return [];
    return [
      { key: "knowledge", value: errorPatterns.knowledge },
      { key: "rushing", value: errorPatterns.rushing },
      { key: "misread", value: errorPatterns.misread },
    ]
      .filter((row) => row.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [errorPatterns]);

  if (isLoading) {
    return <Card className="py-16 text-center text-gray-400">Yuklanmoqda…</Card>;
  }

  if (!data) {
    return (
      <Card>
        <EmptyState title="O'quvchi topilmadi" />
      </Card>
    );
  }

  const { student, summary, trend, topics, weakTopics, attempts } = data;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/diagnostics/students"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="size-4" strokeWidth={1.5} />
          O'quvchilarga qaytish
        </Link>

        {/* ⚠️ ORALIQ FAQAT "Tahlil" TABIDA: qolgan ikkitasi butun
            tarixni ko'rsatadi va filtrni ular ustida ko'rsatib qo'yish
            "filtr ishlamayapti" degan taassurot qoldirardi. */}
        {tab === "analysis" && (
          <div className="flex flex-wrap items-end gap-2">
            <DateRangeFilter from={range.from} to={range.to} onChange={setRange} />
          </div>
        )}
      </div>

      {/* ── HERO ───────────────────────────── */}
      <Card>
        <div className="grid items-center gap-6 lg:grid-cols-[180px_1fr]">
          <div className="flex justify-center">
            <CircularScore
              value={summary.averageScore ?? 0}
              size={160}
              color={scoreColor(summary.averageScore)}
            >
              <span className="text-3xl font-semibold tabular-nums text-gray-900">
                {summary.averageScore != null
                  ? Math.round(summary.averageScore)
                  : "—"}
              </span>
              <span className="text-xs text-gray-400">o'rtacha</span>
            </CircularScore>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">
                {student.lastName} {student.firstName}
              </h2>
              {student.classes?.map((klass) => (
                <Badge
                  key={klass.id}
                  className="bg-gray-100 text-gray-600 ring-gray-200"
                >
                  {klass.name}
                </Badge>
              ))}
              <GradeBadge grade={summary.grade} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Metric label="Urinishlar" value={summary.attempts} />
              <Metric
                label="Birinchi natija"
                value={summary.first != null ? `${Math.round(summary.first)}%` : "—"}
              />
              <Metric
                label="Oxirgi natija"
                value={summary.last != null ? `${Math.round(summary.last)}%` : "—"}
              />
              <Metric
                label="O'sish"
                value={
                  summary.growth != null ? (
                    <span
                      className={cn(
                        summary.growth > 0 && "text-emerald-600",
                        summary.growth < 0 && "text-rose-600",
                      )}
                    >
                      {summary.growth > 0 ? "+" : ""}
                      {summary.growth} punkt
                    </span>
                  ) : (
                    "—"
                  )
                }
              />
            </div>
          </div>
        </div>
      </Card>

      {/* ── TABLAR ─────────────────────────── */}
      {/* ⚠️ UCH KO'RINISH BITTA SAHIFADA: "Tahlil" — xodim uchun davr
          hisoboti; "O'quvchi paneli" va "Test tarixi" — o'quvchi o'z
          panelida ko'radigan AYNI ekranlar. Ular alohida sahifaga
          chiqarilsa, xodim ikkalasini yonma-yon solishtira olmasdi. */}
      <TabsButtons
        value={tab}
        onChange={setTab}
        items={[
          { value: "analysis", label: "Tahlil" },
          { value: "dashboard", label: "O'quvchi paneli" },
          { value: "history", label: "Test tarixi" },
        ]}
      />

      {tab === "dashboard" && <StudentDashboardView dashboard={dashboard} />}

      {tab === "history" && (
        <StudentHistoryView attempts={history?.data ?? []} />
      )}

      {tab === "analysis" && (
      <>
      {/* ── HISOB VA UMUMIY MA'LUMOT ───────── */}
      {/* ⚠️ PAROL BU YERDA CHIQMAYDI — u ALOHIDA RUXSATLI YO'LDAN
          olinadi (`users.password` → `GET /users/:id/password`) va
          faqat tugma bosilganda. Shu sababli profil so'rovining
          javobida maxfiy maydon umuman bo'lmaydi: sahifani ochgan
          har kim brauzer tarmoq oynasida parolni ko'rib qolmaydi.
          Ruxsati yo'q xodimga tugmaning o'zi ko'rinmaydi.

          ⚠️ MEXANIZM YANGI EMAS: "Xodimlar/O'quvchilar" bo'limidagi
          "Hisob" kartasi bilan AYNI oyna va AYNI ruxsat. Ikkinchi yo'l
          ochilsa, parolni kim ko'rgani ikki joyda boshqa-boshqa
          qoidaga bo'ysunardi. */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold text-gray-900">Umumiy ma'lumot</h2>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
            <Info label="Sinf" value={student.classes?.[0]?.name || "—"} />
            <Info label="Telefon" value={student.phone || "—"} />
            <Info label="Ota-ona telefoni" value={student.parentPhone || "—"} />
            <Info
              label="Kirish sanasi"
              value={student.joinedAt ? formatDateUz(student.joinedAt) : "—"}
            />
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-gray-900">Kirish ma'lumotlari</h2>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
            <Info label="Login" value={student.username || "—"} mono />
            <div>
              <p className="text-xs text-gray-400">Parol</p>
              <Can
                do="users.password"
                fallback={<p className="mt-1 text-sm text-gray-400">Yashirin</p>}
              >
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openModal("viewUserPassword", { id: student.id })}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    <Eye className="size-3.5" strokeWidth={1.5} />
                    Ko'rish
                  </button>
                  <button
                    type="button"
                    onClick={() => openModal("resetUserPassword", { id: student.id })}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    <Key className="size-3.5" strokeWidth={1.5} />
                    Tiklash
                  </button>
                </div>
              </Can>
            </div>
          </div>
        </Card>
      </div>

      {/* ── SANOQLAR ───────────────────────── */}
      {/* ⚠️ FOIZ YONIDA MAXRAJ HAM TURADI. "73%" degan son 10 savoldan
          chiqqanmi yoki 100 savoldanmi — bu butunlay boshqa ishonch
          darajasi. Savol va javob sanoqlari aynan shu maxrajni
          ko'rsatadi, shuning uchun ular ko'rsatkichlar qatoridan
          tushirilmaydi. */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Count label="Testlar soni" value={summary.attempts} tone="text-gray-900" />
        <Count label="Umumiy savollar" value={summary.totalQuestions ?? 0} tone="text-primary" />
        <Count label="To'g'ri javoblar" value={summary.correct ?? 0} tone="text-emerald-600" />
        <Count label="Noto'g'ri javoblar" value={summary.wrong ?? 0} tone="text-rose-600" />
        <Count
          label={`Yaxshi · ${summary.distribution?.good.percent ?? 0}%`}
          value={summary.distribution?.good.count ?? 0}
          tone="text-emerald-600"
        />
        <Count
          label={`O'rta · ${summary.distribution?.medium.percent ?? 0}%`}
          value={summary.distribution?.medium.count ?? 0}
          tone="text-amber-600"
        />
        <Count
          label={`Zaif · ${summary.distribution?.bad.percent ?? 0}%`}
          value={summary.distribution?.bad.count ?? 0}
          tone="text-rose-600"
        />
        <Count
          label="O'rtacha natija"
          value={summary.averageScore != null ? `${summary.averageScore}%` : "—"}
          tone="text-primary"
        />
      </div>

      {/* ── FANLAR BO'YICHA NATIJA ─────────── */}
      {/* ⚠️ MANBA — O'QUVCHI PANELI BILAN AYNI (`studentDashboard`).
          Fan kesimi javob qatorlaridan hisoblanadi, ya'ni aralash test
          ham o'z fanlariga bo'linadi. Ikkinchi hisoblagich yozilsa,
          xodim ko'rgan raqam o'quvchi ko'rgan raqamdan farq qilardi. */}
      {dashboard?.subjects?.length > 0 && (
        <Card className="!p-0">
          <div className="p-4 xs:p-5">
            <h2 className="font-semibold text-gray-900">Fanlar bo'yicha natija</h2>
          </div>
          <Table
            columns={[
              "Fan",
              { label: "Testlar soni", align: "right" },
              { label: "Savollar", align: "right" },
              { label: "O'rtacha natija", align: "right" },
              "Daraja",
            ]}
          >
            {dashboard.subjects.map((subject) => (
              <Tr key={subject.subjectId || subject.subject}>
                <Td className="font-medium text-gray-900">{subject.subject}</Td>
                <Td align="right" className="tabular-nums text-gray-500">
                  {subject.tests}
                </Td>
                <Td align="right" className="tabular-nums text-gray-500">
                  {subject.questions}
                </Td>
                <Td align="right" className="font-semibold tabular-nums">
                  {subject.averageScore != null ? (
                    <span style={{ color: gradeColor(subject.averageScore) }}>
                      {Math.round(subject.averageScore)}%
                    </span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </Td>
                <Td>
                  <GradeBadge grade={subject.grade} />
                </Td>
              </Tr>
            ))}
          </Table>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* ── DINAMIKA ─────────────────────── */}
        <Card className="lg:col-span-2">
          <h2 className="font-semibold text-gray-900">O'sish dinamikasi</h2>

          {trend.length < 2 ? (
            <EmptyState
              icon={TrendingUp}
              title="Taqqoslash uchun ma'lumot kam"
              description="Dinamika ko'rinishi uchun kamida ikkita yakunlangan urinish kerak."
            />
          ) : (
            <div className="mt-4">
              <TrendChart
                points={trend.map((t) => ({
                  date: t.date,
                  score: t.score,
                  attempts: 1,
                }))}
                height={230}
              />
            </div>
          )}
        </Card>

        {/* ── XATOLAR SABABI ───────────────── */}
        {/* ⚠️ BU BLOK SHU O'QUVCHINIKI, MAKTABNIKI EMAS. Ilgari u
            diagnostikaning umumiy dashboardida turardi va u yerda
            "maktabda xatolarning 60% shoshilishdan" degan xulosa
            hech kimga foydali emasdi — chunki bu xulosadan keyin
            qiladigan ish yo'q. Bitta o'quvchi uchun esa aynan
            shundan suhbat boshlanadi. */}
        <Card>
          <h2 className="font-semibold text-gray-900">Xatolar sababi</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            "Nima uchun xato qilyapti" degan savolga javob
          </p>

          {!errorRows.length ? (
            <EmptyState
              icon={AlertTriangle}
              title="Xato yo'q"
              description="Tanlangan davrda xato javoblar qayd etilmagan."
            />
          ) : (
            <div className="mt-4 space-y-3">
              {errorRows.map((row) => {
                const meta = ERROR_REASONS[row.key];

                return (
                  <div key={row.key}>
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-gray-700">{meta.label}</span>
                      <span className="font-medium tabular-nums text-gray-900">
                        {row.value}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full transition-[width] duration-700 motion-reduce:transition-none"
                        style={{
                          width: `${row.value}%`,
                          backgroundColor: meta.color,
                        }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-400">{meta.hint}</p>
                  </div>
                );
              })}

              <p className="pt-1 text-xs text-gray-400">
                Jami {errorPatterns.wrongCount} ta xato javob
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* ── ENG KUCHLI MAVZULAR ────────────── */}
      {/* ⚠️ ZAIF MAVZULAR BILAN YONMA-YON: faqat kamchilikni ko'rsatish
          ota-ona bilan suhbatni bir tomonlama qiladi. Ikkovi bitta
          chegaradan chiqadi, ya'ni mavzu ikkalasida ham turolmaydi. */}
      {dashboard?.strongTopics?.length > 0 && (
        <Card>
          <h2 className="font-semibold text-gray-900">Eng kuchli mavzular</h2>
          <p className="mt-0.5 text-sm text-gray-500">Eng yaxshi o'zlashtirilgan</p>

          <div className="mt-3 space-y-2.5">
            {dashboard.strongTopics.map((topic) => (
              <div
                key={`${topic.subject}-${topic.topicId || topic.topic}`}
                className="flex items-center gap-2.5"
              >
                <span className="h-8 w-1 shrink-0 rounded-full bg-emerald-500" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {topic.topic}
                  </p>
                  <p className="truncate text-[11px] text-gray-400">{topic.subject}</p>
                </div>
                <span className="shrink-0 text-sm font-bold tabular-nums text-emerald-600">
                  {Math.round(topic.score)}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── ENG ZAIF MAVZULAR ──────────────── */}
      {/* ⚠️ SHU O'QUVCHINING zaif mavzulari. Jadval ko'rinishi ataylab:
          faqat foiz emas, MAXRAJ ham ko'rinadi ("42% — 12 savoldan").
          Bitta savoldan chiqqan 0% bilan o'n savoldan chiqqan 40% ni
          bir xil qizil chiziq bilan ko'rsatish o'qituvchini noto'g'ri
          mavzuga yuborardi. */}
      <Card className="!p-0">
        <div className="flex items-center justify-between gap-3 p-4 xs:p-5">
          <div>
            <h2 className="font-semibold text-gray-900">Eng zaif mavzular</h2>
            <p className="mt-0.5 text-sm text-gray-500">
              Shu yerdan boshlansa, o'sish eng tez bo'ladi
            </p>
          </div>
        </div>

        {weakTopics.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="Zaif mavzu topilmadi"
            description="Tanlangan davrda barcha mavzular yaxshi o'zlashtirilgan yoki ma'lumot yetarli emas."
          />
        ) : (
          <Table
            columns={[
              "Mavzu",
              { label: "O'rtacha", align: "right" },
              { label: "Savollar", align: "right" },
              { label: "To'g'ri", align: "right" },
              { label: "Urinishlar", align: "right" },
              "Daraja",
            ]}
          >
            {weakTopics.map((topic) => (
              <Tr key={topic.key}>
                <Td className="max-w-[260px] truncate" nowrap={false}>
                  {topic.label}
                </Td>
                <Td align="right" className="font-medium tabular-nums">
                  {topic.averageScore != null ? `${topic.averageScore}%` : "—"}
                </Td>
                <Td align="right" className="tabular-nums text-gray-500">
                  {topic.questions ?? 0}
                </Td>
                <Td align="right" className="tabular-nums text-emerald-600">
                  {topic.correct ?? 0}
                </Td>
                <Td align="right" className="tabular-nums text-gray-500">
                  {topic.attempts}
                </Td>
                <Td>
                  <ToneBadge score={topic.averageScore} showScore={false} />
                </Td>
              </Tr>
            ))}
          </Table>
        )}
      </Card>

      {/* ── MAVZULAR RADARI ────────────────── */}
      {topics.length >= 3 && (
        <Card>
          <h2 className="font-semibold text-gray-900">Mavzular manzarasi</h2>
          <div className="mt-3 grid items-center gap-4 md:grid-cols-[300px_1fr]">
            <RadarChart
              data={topics.slice(0, 8).map((t) => ({
                label: t.label,
                value: t.averageScore ?? 0,
              }))}
            />

            <Table
              columns={[
                "Mavzu",
                { label: "O'rtacha", align: "right" },
                { label: "O'sish", align: "right" },
                { label: "O'lchov", align: "right" },
                "Daraja",
              ]}
            >
              {topics.map((topic) => (
                <Tr key={topic.key}>
                  <Td className="max-w-[180px] truncate">{topic.label}</Td>
                  <Td align="right" className="font-medium tabular-nums">
                    {topic.averageScore}%
                  </Td>
                  <Td align="right" className="tabular-nums">
                    {topic.growth == null ? (
                      <span className="text-gray-300">—</span>
                    ) : (
                      <span
                        className={cn(
                          "font-medium",
                          topic.growth > 0 && "text-emerald-600",
                          topic.growth < 0 && "text-rose-600",
                        )}
                      >
                        {topic.growth > 0 ? "+" : ""}
                        {topic.growth}
                      </span>
                    )}
                  </Td>
                  <Td align="right" className="tabular-nums text-gray-500">
                    {topic.attempts}
                  </Td>
                  <Td>
                    <ToneBadge score={topic.averageScore} showScore={false} />
                  </Td>
                </Tr>
              ))}
            </Table>
          </div>
        </Card>
      )}

      {/* ── URINISHLAR ─────────────────────── */}
      <Card className="!p-0">
        <div className="p-4 xs:p-5">
          <h2 className="font-semibold text-gray-900">Urinishlar tarixi</h2>
        </div>

        {attempts.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Urinish yo'q"
            description="Tanlangan davrda diagnostika topshirilmagan."
          />
        ) : (
          <Table
            columns={[
              "Sana",
              "Rejim",
              { label: "Natija", align: "right" },
              "Daraja",
              { label: "To'g'ri", align: "right" },
              { label: "", align: "right" },
            ]}
          >
            {[...attempts].reverse().map((attempt) => (
              <Tr key={attempt.id}>
                <Td className="text-gray-700">
                  {attempt.submittedAt ? formatDateTimeUz(attempt.submittedAt) : "—"}
                </Td>
                <Td className="text-gray-500">{MODE_LABELS[attempt.mode]}</Td>
                <Td align="right" className="font-semibold tabular-nums">
                  {attempt.score != null ? `${Math.round(attempt.score)}%` : "—"}
                </Td>
                <Td>
                  <GradeBadge grade={attempt.grade} />
                </Td>
                <Td align="right" className="tabular-nums text-gray-500">
                  {attempt.correctCount ?? 0}/{attempt.totalQuestions ?? 0}
                </Td>
                <Td align="right">
                  <Link
                    to={`/diagnostics/attempts/${attempt.id}`}
                    className="inline-flex items-center gap-0.5 text-sm font-medium text-primary hover:underline"
                  >
                    Natija
                    <ChevronRight className="size-4" strokeWidth={1.5} />
                  </Link>
                </Td>
              </Tr>
            ))}
          </Table>
        )}
      </Card>
      </>
      )}
    </div>
  );
};

/** Yorliq + qiymat juftligi. */
const Info = ({ label, value, mono }) => (
  <div className="min-w-0">
    <p className="text-xs text-gray-400">{label}</p>
    <p
      className={cn(
        "mt-0.5 truncate text-sm font-medium text-gray-900",
        mono && "font-mono",
      )}
    >
      {value}
    </p>
  </div>
);

/** Sanoq kartasi — profil tepasidagi ko'rsatkichlar qatori. */
const Count = ({ label, value, tone }) => (
  <div className="rounded-2xl bg-white p-4">
    <p className={cn("text-2xl font-semibold tabular-nums", tone)}>{value}</p>
    <p className="mt-0.5 truncate text-xs text-gray-500">{label}</p>
  </div>
);

const Metric = ({ label, value }) => (
  <div className="rounded-xl bg-gray-50 p-3">
    <p className="text-xs text-gray-400">{label}</p>
    <p className="mt-1 font-semibold tabular-nums text-gray-900">{value}</p>
  </div>
);

export default StudentProfilePage;
