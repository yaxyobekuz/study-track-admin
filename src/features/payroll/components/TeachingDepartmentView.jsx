// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { Plus, Pencil, Trash2, Archive, ChevronLeft, GraduationCap } from "lucide-react";

// Components
import Can from "@/shared/components/guards/Can";
import Card from "@/shared/components/ui/Card";
import Table, { Td, Tr } from "@/shared/components/ui/Table";
import Button from "@/shared/components/ui/button/Button";
import EmptyState from "@/shared/components/ui/EmptyState";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Utils
import { formatMoney } from "@/shared/utils/formatMoney";

// Data & queries
import { CATEGORY_V2_COLUMNS, TEACHER_PAYROLL_COLUMNS } from "../data/payroll.data";
import { payrollQueries } from "../queries/payroll.queries";
import { useDeleteCategory, useArchiveCategory } from "../queries/payroll.mutations";

/** TEACHING bo'lim: toifalar (reference jadval) → toifani bosib o'qituvchilar. */
const TeachingDepartmentView = ({ department, month }) => {
  const { openModal } = useModal();
  const [selected, setSelected] = useState(null); // tanlangan toifa

  if (selected) {
    return <CategoryTeachers department={department} category={selected} month={month} onBack={() => setSelected(null)} />;
  }
  return <CategoryList department={department} month={month} onOpen={setSelected} />;
};

// ── Toifalar ro'yxati ──
const CategoryList = ({ department, month, onOpen }) => {
  const { openModal } = useModal();
  const { data: categories = [], isLoading } = useQuery(
    payrollQueries.categories({ departmentId: department.id, status: "active" }),
  );
  const { mutate: deleteCategory } = useDeleteCategory();
  const { mutate: archiveCategory } = useArchiveCategory();

  const handleDelete = (c) => {
    if (!window.confirm(`"${c.name}" toifasini o'chirasizmi?`)) return;
    deleteCategory(c.id, { onSuccess: () => toast.success("O'chirildi"), onError: (err) => toast.error(err.response?.data?.message || "Xatolik") });
  };
  const handleArchive = (c) =>
    archiveCategory({ id: c.id, isArchived: true }, { onSuccess: () => toast.success("Arxivlandi"), onError: (err) => toast.error(err.response?.data?.message || "Xatolik") });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Toifani bosing — unga tegishli o'qituvchilar va hisoblangan oylik ko'rinadi.</p>
        <Can do="payroll.assign">
          <Button onClick={() => openModal("categoryV2", { departmentId: department.id, departmentName: department.name })}>
            <Plus /> Toifa qo'shish
          </Button>
        </Can>
      </div>

      {isLoading ? (
        <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>
      ) : categories.length === 0 ? (
        <Card className="p-0 xs:p-0">
          <EmptyState icon={GraduationCap} title="Toifa yo'q" description="Bu bo'lim uchun malaka toifalarini qo'shing (bir soat/bir oy/dars soati/asosiy maosh)." action={
            <Can do="payroll.assign"><Button onClick={() => openModal("categoryV2", { departmentId: department.id, departmentName: department.name })}><Plus /> Toifa qo'shish</Button></Can>
          } />
        </Card>
      ) : (
        <Table columns={CATEGORY_V2_COLUMNS}>
          {categories.map((c) => (
            <Tr key={c.id} className="cursor-pointer hover:bg-gray-50" onClick={() => onOpen(c)}>
              <Td className="font-medium text-gray-900">{c.name}</Td>
              <Td>{formatMoney(c.perHourRate)}</Td>
              <Td>{formatMoney(c.monthlyPerHour)}</Td>
              <Td className="text-gray-600">{c.hoursPerStavka} soat</Td>
              <Td className="font-medium">{formatMoney(c.baseSalary)}</Td>
              <Td className="text-gray-500">{c.usageCount}</Td>
              <Td onClick={(ev) => ev.stopPropagation()}>
                <div className="flex items-center justify-end gap-1">
                  <Can do="payroll.assign">
                    <button title="Tahrirlash" onClick={() => openModal("categoryV2", { category: c, departmentName: department.name })} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"><Pencil className="size-3.5" /></button>
                    <button title="Arxivlash" onClick={() => handleArchive(c)} className="rounded-lg p-1.5 text-gray-400 hover:bg-amber-50 hover:text-amber-600"><Archive className="size-3.5" /></button>
                    {c.usageCount === 0 && (
                      <button title="O'chirish" onClick={() => handleDelete(c)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="size-3.5" /></button>
                    )}
                  </Can>
                </div>
              </Td>
            </Tr>
          ))}
        </Table>
      )}
    </div>
  );
};

// ── Toifa o'qituvchilari (drill-down) ──
const CategoryTeachers = ({ department, category, month, onBack }) => {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery(
    payrollQueries.teacherPayroll({ categoryId: category.id, month, limit: 100, ...(search ? { search } : {}) }),
  );
  const teachers = data?.data ?? [];
  const cat = data?.category;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ChevronLeft className="size-4" /> Toifalar
        </button>
        <input value={search} placeholder="Qidirish..." onChange={(e) => setSearch(e.target.value)} className="h-10 w-56 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-primary" />
      </div>

      <Card className="flex flex-wrap items-center gap-x-6 gap-y-1 bg-indigo-50 text-sm">
        <span className="font-semibold text-indigo-900">{department.name} · {category.name}</span>
        <span className="text-indigo-700">Bir soat: <b>{formatMoney(cat?.perHourRate ?? category.perHourRate)}</b></span>
        <span className="text-indigo-700">Stavka: <b>{cat?.hoursPerStavka ?? category.hoursPerStavka} soat</b></span>
        <span className="text-indigo-700">Asosiy maosh: <b>{formatMoney(cat?.baseSalary ?? category.baseSalary)}</b></span>
        {data?.totals && <span className="ml-auto text-indigo-900">Yakuniy jami: <b>{formatMoney(data.totals.amount)}</b></span>}
      </Card>

      {isLoading ? (
        <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>
      ) : teachers.length === 0 ? (
        <Card className="p-0 xs:p-0"><EmptyState icon={GraduationCap} title="O'qituvchi yo'q" description="Bu toifaga hali o'qituvchi biriktirilmagan." /></Card>
      ) : (
        <Table columns={TEACHER_PAYROLL_COLUMNS}>
          {teachers.map((t) => (
            <Tr key={t.id}>
              <Td className="font-medium text-gray-900">{t.fullName}</Td>
              <Td className="text-gray-600">{t.lessonHours} soat</Td>
              <Td className="font-medium">{formatMoney(t.kpiAmount)}</Td>
              <Td className={Number(t.allowanceAmount) > 0 ? "text-amber-600" : "text-gray-400"}>{formatMoney(t.allowanceAmount)}</Td>
              <Td className="font-semibold text-green-700">{formatMoney(t.amount)}</Td>
            </Tr>
          ))}
        </Table>
      )}
    </div>
  );
};

export default TeachingDepartmentView;
