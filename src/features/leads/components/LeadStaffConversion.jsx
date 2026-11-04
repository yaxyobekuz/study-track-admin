// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { Users } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Table, { Td, Tr } from "@/shared/components/ui/Table";
import EmptyState from "@/shared/components/ui/EmptyState";

// Utils
import { cn } from "@/shared/utils/cn";

// Data & queries
import { LEAD_STAGES_FALLBACK } from "../data/leads.data";
import { leadsQueries } from "../queries/leads.queries";

/**
 * XODIMLAR KESIMIDA KONVERSIYA — "kim nechta olib keldi va nechtasi qoldi".
 *
 * ⚠️ IKKI JADVAL va ular BOSHQA-BOSHQA savol:
 *   · "Kim olib keldi" — lidni kim topib kelgani;
 *   · "Kim mas'ul bo'ldi" — sinov darsini kim o'tgani / kim ishlagani.
 * Bitta jadval bilan ayblov bir tomonga qarab qolardi: olib kelgan odam
 * bilan ushlab qolishi kerak bo'lgan odam ko'pincha boshqa-boshqa.
 *
 * ⚠️ Har pog'ona ustuni — O'SHA POG'ONAGA YETGANLAR soni, shuning uchun
 * yo'qotish aynan qaysi qadamda bo'lgani qatorning o'zidan ko'rinadi.
 */
const LeadStaffConversion = ({ dateParams }) => {
  const params = buildParams(dateParams);
  const { data, isLoading } = useQuery(leadsQueries.staffConversion(params));

  if (isLoading) {
    return <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>;
  }

  const brought = data?.brought ?? [];
  const assigned = data?.assigned ?? [];

  if (brought.length === 0 && assigned.length === 0) {
    return (
      <Card className="p-0 xs:p-0">
        <EmptyState
          icon={Users}
          title="Ma'lumot yo'q"
          description="Tanlangan davrda lid topilmadi yoki lidlarda 'kim olib keldi' / 'mas'ul xodim' belgilanmagan. Bu maydonlar lid kiritish oynasida to'ldiriladi."
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <StaffTable
        title="Kim olib keldi"
        hint="Lidni topib kelgan xodim bo'yicha"
        rows={brought}
        totalLabel="Olib keldi"
      />
      <StaffTable
        title="Kim mas'ul bo'ldi"
        hint="Sinov darsini o'tgan / lid bilan ishlagan xodim bo'yicha"
        rows={assigned}
        totalLabel="Berildi"
        footer={
          data?.unassigned > 0 ? (
            <p className="text-xs text-gray-500">
              {data.unassigned} ta lidda mas'ul xodim belgilanmagan — ular bu
              jadvalda yo'q. Mas'ulni lid oynasida belgilash mumkin.
            </p>
          ) : null
        }
      />
    </div>
  );
};

const StaffTable = ({ title, hint, rows, totalLabel, footer }) => {
  const columns = [
    { label: "Xodim", key: "staff" },
    { label: totalLabel, key: "total", align: "right" },
    ...LEAD_STAGES_FALLBACK.map((s) => ({
      label: `${s.stage}. ${s.short}`,
      key: `s${s.stage}`,
      align: "right",
    })),
    { label: "Yo'qotdi", key: "lost", align: "right" },
    { label: "Konversiya", key: "conversion", align: "right" },
  ];

  return (
    <Card title={title} className="space-y-3">
      <p className="text-xs text-gray-400">{hint}</p>

      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">Ma'lumot yo'q</p>
      ) : (
        <Table columns={columns}>
          {rows.map((row) => (
            <Tr key={row.staffId}>
              <Td className="font-medium text-gray-900">
                {row.fullName}
                {row.isArchived && (
                  <span className="block text-xs font-normal text-gray-400">arxivlangan</span>
                )}
              </Td>
              <Td align="right" className="font-semibold text-gray-900">
                {row.total}
              </Td>
              {row.stages.map((stage) => (
                <Td
                  key={stage.stage}
                  align="right"
                  className={cn(
                    stage.stage === LEAD_STAGES_FALLBACK.length
                      ? "font-semibold text-green-600"
                      : "text-gray-600",
                  )}
                >
                  {stage.reached}
                </Td>
              ))}
              <Td align="right" className={cn(row.lost > 0 ? "text-red-600" : "text-gray-400")}>
                {row.lost}
              </Td>
              <Td align="right">
                <span
                  className={cn(
                    "font-semibold",
                    row.conversion >= 50
                      ? "text-green-600"
                      : row.conversion > 0
                        ? "text-amber-600"
                        : "text-red-600",
                  )}
                >
                  {row.conversion}%
                </span>
              </Td>
            </Tr>
          ))}
        </Table>
      )}

      {footer}
    </Card>
  );
};

/** Davr tanlagichidan so'rov parametrlari (boshqa chartlar bilan AYNI). */
function buildParams(dateParams) {
  if (!dateParams) return {};
  if (dateParams.startDate || dateParams.endDate) {
    const params = {};
    if (dateParams.startDate) params.startDate = dateParams.startDate;
    if (dateParams.endDate) params.endDate = dateParams.endDate;
    return params;
  }
  if (dateParams.period) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(dateParams.period));
    return { startDate: startDate.toISOString().split("T")[0] };
  }
  return {};
}

export default LeadStaffConversion;
