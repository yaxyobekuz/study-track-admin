// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { BarChart3 } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Select from "@/shared/components/ui/select/Select";
import EmptyState from "@/shared/components/ui/EmptyState";
import LoaderCard from "@/shared/components/ui/LoaderCard";
import Table, { Td, Tr } from "@/shared/components/ui/Table";
import CertificateStatsCards from "./CertificateStatsCards";

// Utils
import { cn } from "@/shared/utils/cn";

// Queries & data
import { useClasses } from "@/features/classes/queries/classes.queries";
import { certificatesQueries } from "../queries/certificates.queries";
import { ALL, NO_CLASS } from "../data/certificates.data";

/**
 * STATISTIKA TABI.
 *
 * Uch kesim: yo'nalish, sinf va MUDDAT OYI. Oylar xronologik tartibda —
 * "qaysi oyda nechta o'quvchi topshiradi" degan savol vaqt bo'yicha
 * o'qiladi.
 *
 * ⚠️ Sinf filtri BUTUN ekranga ta'sir qiladi (kartalar ham): tanlanganda
 * ekran bitta sinf haqida bo'lishi kerak, aks holda kartalar maktabni,
 * jadvallar esa sinfni ko'rsatib turardi.
 *
 * ⚠️ Ikki sinfda o'qiydigan o'quvchi HAR IKKI sinf kesimida sanaladi,
 * "Jami" da esa bir marta — sinflar ro'yxatidagi AYNI qoida. Shu sababli
 * sinflar ustunlari yig'indisi jamidan katta bo'lishi mumkin.
 */
const CertificateStatsTab = ({ classId, onClassChange }) => {
  const { data: classes = [] } = useClasses();

  const params = classId && classId !== ALL ? { classId } : undefined;
  const { data: stats, isLoading } = useQuery(certificatesQueries.stats(params));

  const scopeLabel =
    classId === NO_CLASS
      ? "Sinfsiz o'quvchilar"
      : classId && classId !== ALL
        ? (classes.find((cls) => cls.id === classId)?.name ?? "Tanlangan sinf")
        : "Butun maktab";

  const classOptions = [
    { value: ALL, label: "Butun maktab" },
    { value: NO_CLASS, label: "Sinfsiz" },
    ...classes.map((cls) => ({ value: cls.id, label: cls.name })),
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          Sertifikat rejalari — joriy o'quvchilar bo'yicha
        </p>

        <Select
          name="statsClass"
          value={classId || ALL}
          onChange={onClassChange}
          options={classOptions}
          placeholder="Sinf"
          triggerClassName="w-full sm:w-48"
        />
      </div>

      <CertificateStatsCards totals={stats?.totals} scopeLabel={scopeLabel} />

      {isLoading && !stats ? (
        <LoaderCard title="Statistika yuklanmoqda..." />
      ) : !stats || stats.totals.plans === 0 ? (
        <Card>
          <EmptyState
            icon={BarChart3}
            title="Reja yo'q"
            description={`${scopeLabel} bo'yicha faol sertifikat rejasi topilmadi.`}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <BreakdownCard
            title="Yo'nalishlar bo'yicha"
            rows={stats.byTrack}
            total={stats.totals.students}
            nameLabel="Yo'nalish"
          />

          <BreakdownCard
            title="Sinflar bo'yicha"
            rows={stats.byClass}
            total={stats.totals.students}
            nameLabel="Sinf"
          />

          <div className="xl:col-span-2">
            <BreakdownCard
              title="Muddat oylari bo'yicha"
              rows={stats.byMonth.map((row) => ({ ...row, name: row.label }))}
              total={stats.totals.plans}
              nameLabel="Oy"
              countBy="plans"
            />
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Bitta kesim jadvali.
 *
 * `countBy` — ulush qaysi raqamdan hisoblanadi. Oylar kesimida REJALAR
 * (bitta o'quvchining ikki muddati ikki oyga tushadi), qolganlarida
 * O'QUVCHILAR.
 */
const BreakdownCard = ({ title, rows, total, nameLabel, countBy = "students" }) => (
  <Card title={title} className="overflow-hidden">
    {rows.length === 0 ? (
      <p className="px-1 py-6 text-center text-sm text-gray-500">Ma'lumot yo'q</p>
    ) : (
      <Table
        className="mt-3"
        columns={[
          nameLabel,
          { label: "O'quvchi", align: "right" },
          { label: "Reja", align: "right" },
          { label: "Ulush", align: "right", className: "w-32" },
        ]}
      >
        {rows.map((row) => {
          const value = row[countBy] ?? 0;
          const percent = total > 0 ? Math.round((value / total) * 100) : 0;

          return (
            <Tr key={row.id ?? row.month}>
              <Td className="font-medium text-gray-900">{row.name}</Td>
              <Td align="right">{row.students}</Td>
              <Td align="right">{row.plans}</Td>
              <Td align="right">
                <div className="flex items-center justify-end gap-2">
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={cn("h-full rounded-full bg-primary")}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                  <span className="w-9 text-xs text-gray-500">{percent}%</span>
                </div>
              </Td>
            </Tr>
          );
        })}
      </Table>
    )}
  </Card>
);

export default CertificateStatsTab;
