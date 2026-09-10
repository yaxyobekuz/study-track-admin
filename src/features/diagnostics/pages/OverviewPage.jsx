// React
import { useMemo, useState } from "react";

// Router
import { Link, useOutletContext } from "react-router-dom";
import { createPortal } from "react-dom";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import {
  ClipboardList,
  Users,
  Target,
  ArrowRight,
  School,
  UsersRound,
} from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import EmptyState from "@/shared/components/ui/EmptyState";
import DonutChart from "../components/charts/DonutChart";
import TrendChart from "../components/charts/TrendChart";
import StatCard from "../components/StatCard";
import DateRangeFilter from "../components/DateRangeFilter";
import TodayCards from "../components/TodayCards";
import ClassParticipationCard from "../components/ClassParticipationCard";
import SubjectBars from "../components/SubjectBars";
import Sparkline from "../components/charts/Sparkline";

// Queries
import {
  analyticsQueries,
  questionQueries,
} from "../queries/diagnostics.queries";

// Data
import { TONES, defaultRange } from "../data/diagnostics.data";

// Utils
import { formatDurationShortUz } from "@/shared/utils/date.utils";

/**
 * DIAGNOSTIKA — UMUMIY MANZARA.
 *
 * Rahbar bir ekranda javob oladi: qancha o'quvchi o'lchandi, o'rtacha
 * daraja qanday, u o'sdimi, qaysi mavzular cho'kib turibdi va nima
 * uchun xato qilinyapti.
 */
const DISTRIBUTION_ROWS = [
  { key: "good", tone: "mastered", label: "Yaxshi" },
  { key: "medium", tone: "developing", label: "O'rta" },
  { key: "bad", tone: "gap", label: "Zaif" },
];

const OverviewPage = () => {
  const { filterSlot } = useOutletContext();
  const [range, setRange] = useState(defaultRange);

  const params = useMemo(() => ({ from: range.from, to: range.to }), [range]);

  const { data: summary, isLoading } = useQuery(analyticsQueries.summary(params));
  const { data: trend } = useQuery(analyticsQueries.trend(params));
  const { data: subjects } = useQuery(analyticsQueries.cut("subjects", params));
  const { data: bank } = useQuery(questionQueries.stats());
  const { data: today } = useQuery(analyticsQueries.today());
  const { data: classParticipation } = useQuery(
    analyticsQueries.classParticipation(params),
  );

  const kpis = summary?.kpis;
  const distribution = summary?.distribution;

  /**
   * Taqsimot guruhlari — halqa ham, ro'yxat ham SHU tartibda chiziladi.
   * Ikki joyda alohida yozilsa, rang va tartib bir kun ajralib qolardi.
   */
  const bands = useMemo(() => {
    const t = distribution?.thresholds;
    if (!t) return {};
    return {
      good: `${t.good}–100%`,
      medium: `${t.medium}–${t.good - 1}%`,
      bad: `0–${t.medium - 1}%`,
    };
  }, [distribution]);
  return (
    <div className="space-y-4">
      {filterSlot &&
        createPortal(
          <DateRangeFilter from={range.from} to={range.to} onChange={setRange} />,
          filterSlot,
        )}

      {/* ── KO'RSATKICHLAR QATORI ──────────── */}
      {/* ⚠️ AYNAN BESHTA KARTA VA TARTIB QAT'IY: maktab hajmi (sinf,
          o'quvchi) → faollik (test ishlaganlar) → sifat (o'rtacha
          natija) → sifatning taqsimoti. Har biri oldingisining
          maxraji: 576 o'quvchidan 519 tasi test ishlagan, ularning
          o'rtachasi 55%, o'sha 55% esa shunday taqsimlangan.

          ⚠️ "Sinflar" va "O'quvchilar" SANA FILTRIDAN MUSTAQIL — ular
          maktabning HOZIRGI hajmi. Oraliqqa bog'lansa "avgustda 0 ta
          sinf bo'lgan" degan ma'nosiz xulosa chiqardi, shuning uchun
          ularda o'zgarish ustuni ham yo'q. */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="Sinflar"
          value={isLoading ? "…" : (kpis?.classes?.value ?? 0)}
          hint="maktabdagi jami"
          icon={School}
        />
        <StatCard
          label="O'quvchilar"
          value={isLoading ? "…" : (kpis?.students.totalStudents ?? 0)}
          hint="arxivlanmagan"
          icon={UsersRound}
        />
        <StatCard
          label="Test ishlaganlar"
          value={isLoading ? "…" : (kpis?.students.value ?? 0)}
          delta={kpis?.students.growth}
          /* ⚠️ QIYMAT — O'QUVCHILAR SONI, urinishlar soni EMAS: yorliq
             "kim ishlagan" deb so'rayapti. Urinishlar soni izohda
             turadi — ikkovi bir xil emas, bitta o'quvchi bir necha
             marta ishlashi mumkin. */
          hint={
            kpis
              ? `${kpis.attempts.value} ta urinish · ${kpis.students.coverage}% qamrov`
              : ""
          }
          icon={Users}
        />
        <StatCard
          label="O'rtacha natija"
          value={
            isLoading
              ? "…"
              : kpis?.averageScore.value != null
                ? `${kpis.averageScore.value}%`
                : "—"
          }
          delta={kpis?.averageScore.growth}
          deltaSuffix=" punkt"
          /* Izoh YO'Q: grafik va o'zgarish yonma-yon turganda kartada
             joy qolmaydi va matn qirqilib ketardi. "+6.8 punkt"
             o'zi ham o'tgan davr bilan taqqoslanganini bildiradi. */
          icon={Target}
          chart={
            <Sparkline
              data={(trend?.points ?? []).map((p) => p.score).filter((v) => v != null)}
              width={72}
              height={28}
              color={
                (kpis?.averageScore.growth ?? 0) < 0
                  ? TONES.gap.color
                  : TONES.mastered.color
              }
            />
          }
        />

        {/* Beshinchi karta — taqsimotning ixcham ko'rinishi. Pastdagi
            katta kartani ochish uchun pastga tushish shart emas. */}
        <div className="col-span-2 rounded-2xl bg-white p-4 lg:col-span-1 xs:p-5">
          {!distribution || !distribution.total ? (
            <p className="text-sm text-gray-400">Taqsimot uchun ma'lumot yo'q</p>
          ) : (
            <div className="flex items-center gap-4">
              <DonutChart
                size={62}
                stroke={9}
                segments={DISTRIBUTION_ROWS.map((row) => ({
                  label: row.label,
                  value: distribution[row.key],
                  color: TONES[row.tone].color,
                }))}
              />
              <div className="min-w-0 flex-1 space-y-1">
                {DISTRIBUTION_ROWS.map((row) => (
                  <div key={row.key} className="flex items-center gap-2">
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: TONES[row.tone].color }}
                    />
                    <span className="flex-1 truncate text-xs text-gray-500">
                      {row.label}
                    </span>
                    <span className="text-xs font-semibold tabular-nums text-gray-900">
                      {distribution.shares[row.key]}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* ── TAQSIMOT ─────────────────────── */}
        <Card>
          <h2 className="font-semibold text-gray-900">Natijalar taqsimoti</h2>

          {!distribution || distribution.good + distribution.medium + distribution.bad === 0 ? (
            <EmptyState
              icon={Target}
              title="Ma'lumot yo'q"
              description="Tanlangan davrda diagnostika topshirilmagan."
            />
          ) : (
            <>
              {/* ⚠️ HALQA TAQSIMOTNI CHIZADI, O'RTACHA BALLNI EMAS.
                  Ilgari bu yerda bitta yoy (o'rtacha ball) turardi va
                  "Natijalar taqsimoti" degan sarlavha ostida taqsimot
                  umuman ko'rinmasdi: uch guruhning ulushi faqat pastdagi
                  ro'yxatda qolib ketardi. O'rtacha ball yuqoridagi
                  ko'rsatkichlar qatorida allaqachon bor. */}
              <div className="mt-4 flex justify-center">
                <DonutChart
                  size={168}
                  stroke={22}
                  segments={DISTRIBUTION_ROWS.map((row) => ({
                    label: row.label,
                    value: distribution[row.key],
                    color: TONES[row.tone].color,
                  }))}
                >
                  <span className="text-3xl font-semibold tabular-nums text-gray-900">
                    {distribution.total ??
                      distribution.good + distribution.medium + distribution.bad}
                  </span>
                  <span className="mt-0.5 text-xs text-gray-500">jami</span>
                </DonutChart>
              </div>

              <div className="mt-5 space-y-2.5">
                {DISTRIBUTION_ROWS.map((row) => (
                  <div key={row.key} className="flex items-center gap-3">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: TONES[row.tone].color }}
                    />
                    <span className="flex-1 truncate text-sm text-gray-600">
                      {row.label}
                      {/* Chegara SOZLAMADAN keladi — yorliqda 70/40 ni
                          qotirib qo'yish admin chegarani o'zgartirgan
                          kunda yolg'on oraliq ko'rsatardi. */}
                      {bands[row.key] && (
                        <span className="ml-1 text-gray-400">({bands[row.key]})</span>
                      )}
                    </span>
                    <span className="text-sm font-medium tabular-nums text-gray-900">
                      {distribution[row.key]}
                    </span>
                    <span className="w-14 text-right text-sm tabular-nums text-gray-400">
                      ({distribution.shares[row.key]}%)
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        {/* ── DINAMIKA ─────────────────────── */}
        <Card className="lg:col-span-1 xl:col-span-1">
          <h2 className="font-semibold text-gray-900">
            Natijaning o'sish dinamikasi
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">
            {trend?.granularity === "week" ? "Haftalik" : "Kunlik"} o'rtacha ball —
            oldingi davr bilan taqqoslangan
          </p>

          {!trend?.points?.some((p) => p.score != null) ? (
            <EmptyState
              icon={ClipboardList}
              title="Chizish uchun ma'lumot yo'q"
              description="Tanlangan davrda yakunlangan urinish yo'q."
            />
          ) : (
            <div className="mt-4">
              <TrendChart points={trend.points} height={230} showPrevious />
            </div>
          )}
        </Card>

        {/* ── FANLAR ───────────────────────── */}
        {/* ⚠️ SHU QATORDA, pastda emas: uchala karta bitta savolning uch
            kesimi — "natijalar qanday taqsimlangan", "vaqt bo'yicha
            qanday o'zgaryapti" va "qaysi fanda". Pastga tushirilsa,
            ular orasidagi bog'liqlik ko'rinmay qolardi. */}
        <SubjectBars
          rows={subjects?.data ?? []}
          thresholds={distribution?.thresholds}
          action={
            <Link
              to="/diagnostics/subjects"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Batafsil
              <ArrowRight className="size-4" strokeWidth={1.5} />
            </Link>
          }
        />
      </div>

      {/* ⚠️ "ENG ZAIF MAVZULAR" VA "XATOLAR SABABI" BU YERDA EMAS.
          Ikkalasi ham BITTA O'QUVCHI haqidagi savolga javob beradi
          ("u nimani bilmaydi", "u nega xato qilyapti") va ular
          o'quvchining profilida turadi. Umumiy manzara esa boshqa
          savolga javob beradi: "maktab qanday ketyapti". Maktab
          kesimidagi zaif mavzular kerak bo'lsa — "Tahlil" bo'limida,
          mavzular kesimida, filtrlari bilan birga. */}

      {/* ── BUGUN ───────────────────────────── */}
      <TodayCards today={today} />

      {/* ── SINFLAR BO'YICHA QATNASHUV ──────── */}
      <ClassParticipationCard data={classParticipation} />
    </div>
  );
};

export default OverviewPage;
