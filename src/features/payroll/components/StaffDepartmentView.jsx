// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { Plus, Pencil, Trash2, UserCog, Briefcase } from "lucide-react";

// Components
import Can from "@/shared/components/guards/Can";
import Card from "@/shared/components/ui/Card";
import Table, { Td, Tr } from "@/shared/components/ui/Table";
import Button from "@/shared/components/ui/button/Button";
import Pagination from "@/shared/components/ui/Pagination";
import EmptyState from "@/shared/components/ui/EmptyState";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Utils
import { formatMoney } from "@/shared/utils/formatMoney";

// Data & queries
import { STAFF_PAYROLL_COLUMNS, POSITION_COLUMNS } from "../data/payroll.data";
import { payrollQueries } from "../queries/payroll.queries";
import { useDeletePosition } from "../queries/payroll.mutations";

const SummaryTile = ({ label, value, cls = "text-gray-900" }) => (
  <Card>
    <p className="text-xs font-medium text-gray-500">{label}</p>
    <p className={`mt-1 text-xl font-bold ${cls}`}>{value}</p>
  </Card>
);

/** STAFF bo'lim: lavozimlar (maosh) + xodimlar (hisoblangan oylik). */
const StaffDepartmentView = ({ department, month }) => {
  const { openModal } = useModal();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data: positions = [] } = useQuery(payrollQueries.positions(department.id));
  const { data, isLoading } = useQuery(
    payrollQueries.staffPayroll({ departmentId: department.id, month, page, limit: 20, ...(search ? { search } : {}) }),
  );
  const { mutate: deletePosition } = useDeletePosition();

  const employees = data?.data ?? [];
  const totals = data?.totals;

  const handleDeletePosition = (p) => {
    if (!window.confirm(`"${p.name}" lavozimini o'chirasizmi?`)) return;
    deletePosition(p.id, {
      onSuccess: () => toast.success("O'chirildi"),
      onError: (err) => toast.error(err.response?.data?.message || "Xatolik"),
    });
  };

  return (
    <div className="space-y-4">
      {/* Lavozimlar */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Briefcase className="size-4 text-gray-400" /> Lavozimlar va bazaviy maosh
          </h3>
          <Can do="payroll.assign">
            <Button variant="outline" onClick={() => openModal("position", { departmentId: department.id, departmentName: department.name })}>
              <Plus /> Lavozim qo'shish
            </Button>
          </Can>
        </div>
        {positions.length === 0 ? (
          <Card className="py-6 text-center text-sm text-gray-500">Lavozim yo'q — qo'shing</Card>
        ) : (
          <Table columns={POSITION_COLUMNS}>
            {positions.map((p) => (
              <Tr key={p.id}>
                <Td className="font-medium text-gray-900">{p.name}</Td>
                <Td className="font-medium">{formatMoney(p.baseSalary)}</Td>
                <Td className="text-gray-500">{p.staffCount}</Td>
                <Td>
                  <div className="flex items-center justify-end gap-1">
                    <Can do="payroll.assign">
                      <button title="Tahrirlash" onClick={() => openModal("position", { position: p, departmentName: department.name })} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                        <Pencil className="size-3.5" />
                      </button>
                      {p.staffCount === 0 && (
                        <button title="O'chirish" onClick={() => handleDeletePosition(p)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500">
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </Can>
                  </div>
                </Td>
              </Tr>
            ))}
          </Table>
        )}
      </div>

      {/* Yakuniy summalar */}
      {totals && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryTile label="Bazaviy jami" value={formatMoney(totals.fixedAmount)} />
          <SummaryTile label="Ustama jami" value={formatMoney(totals.allowanceAmount)} cls="text-amber-600" />
          <SummaryTile label="Yakuniy jami" value={formatMoney(totals.amount)} cls="text-green-700" />
        </div>
      )}

      {/* Xodimlar */}
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-gray-700">Xodimlar</h3>
        <input
          value={search}
          placeholder="Qidirish..."
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="h-10 w-56 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-primary"
        />
      </div>

      {isLoading ? (
        <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>
      ) : employees.length === 0 ? (
        <Card className="p-0 xs:p-0">
          <EmptyState icon={UserCog} title="Xodim yo'q" description="Bu bo'limga hali xodim biriktirilmagan. Xodimni lavozimga biriktiring (xodim profilida yoki bu yerdan)." />
        </Card>
      ) : (
        <>
          <Table columns={STAFF_PAYROLL_COLUMNS}>
            {employees.map((e) => (
              <Tr key={e.id}>
                <Td className="font-medium text-gray-900">{e.fullName}<span className="block text-xs font-normal text-gray-400">{e.role}</span></Td>
                <Td className="text-gray-600">{e.positionName || "—"}</Td>
                <Td className="font-medium">{formatMoney(e.fixedAmount)}</Td>
                <Td className={Number(e.allowanceAmount) > 0 ? "text-amber-600" : "text-gray-400"}>{formatMoney(e.allowanceAmount)}</Td>
                <Td className="font-semibold text-green-700">{formatMoney(e.amount)}</Td>
                <Td>
                  <Can do="payroll.assign">
                    <button title="Biriktirish" onClick={() => openModal("assignStaff", { staff: e, department })} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                      <UserCog className="size-3.5" />
                    </button>
                  </Can>
                </Td>
              </Tr>
            ))}
          </Table>
          {data?.pagination?.totalPages > 1 && (
            <Pagination currentPage={page} totalPages={data.pagination.totalPages} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  );
};

export default StaffDepartmentView;
