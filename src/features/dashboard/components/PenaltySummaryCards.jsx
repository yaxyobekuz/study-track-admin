// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Queries
import { penaltiesQueries } from "@/features/penalties/queries/penalties.queries";

// Components
import Card from "@/shared/components/ui/Card";
import Counter from "@/shared/components/ui/Counter";
import BranchSplit from "@/shared/components/ui/BranchSplit";

/**
 * JARIMA SANOQLARI — bosh sahifadagi uchta raqam.
 *
 * ⚠️ TANGA BLOKINING O'NG USTUNI (o'quvchilar natijalari) CHAP USTUNDAN
 * BALAND (biznes qarori, 2026-10-26): ilgari chap ustun grafikdan keyin
 * tugab, ostida bo'sh oq joy qolardi va jarima sanoqlari o'sha bo'shliqdan
 * keyin boshlanardi. Endi ular o'sha joyni to'ldiradi — sanoqlar yuqorida,
 * ro'yxat va grafik pastdagi "Jarimalar" blokida.
 *
 * ⚠️ SO'ROV BITTA: `penaltiesQueries.stats()` ni pastdagi blok ham
 * chaqiradi, TanStack esa AYNI kalitni bitta so'rovga yig'adi.
 */
const PenaltySummaryCards = () => {
  const { data: stats } = useQuery(penaltiesQueries.stats());

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <SummaryCard
        title="Jami jarima ballar"
        path="totalApprovedPoints"
        stats={stats}
        className="text-red-500"
      />
      <SummaryCard
        title="Kamaytirilgan ballar"
        path="totalReducedPoints"
        stats={stats}
        className="text-green-500"
      />
      <SummaryCard
        title="Kutilayotgan jarimalar"
        path="pendingCount"
        stats={stats}
        className="text-yellow-500"
      />
    </div>
  );
};

/** Sarlavha va raqam BIR QATORDA, shuning uchun filiallar kesimi — chip. */
const SummaryCard = ({ title, path, stats, className }) => (
  <Card title={title} className="flex items-center justify-between gap-2">
    <div className="flex items-center gap-2">
      <BranchSplit variant="chip" data={stats} path={path} to="/penalties" />
      <Counter
        value={stats?.[path] ?? 0}
        className={`text-2xl font-bold ${className}`}
      />
    </div>
  </Card>
);

export default PenaltySummaryCards;
