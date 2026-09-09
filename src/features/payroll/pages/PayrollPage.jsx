// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import { Ban, Pencil, Plus, RefreshCw, Trash2, Users, Wallet, XCircle } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Can from "@/shared/components/guards/Can";
import Card from "@/shared/components/ui/Card";
import Table, { Td, Tr } from "@/shared/components/ui/Table";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import Pagination from "@/shared/components/ui/Pagination";
import EmptyState from "@/shared/components/ui/EmptyState";
import { TabsButtons } from "@/shared/components/ui/tabs/Tabs";
import ConfirmPopover from "@/shared/components/ui/ConfirmPopover";
import {
  SalaryRuleModal,
  SalaryPaymentModal,
  VoidSalaryPaymentModal,
  CancelPayrollEntryModal,
  RegeneratePayrollEntryModal,
} from "../components/PayrollModals";
import {
  DepartmentModal,
  PositionModal,
  CategoryV2Modal,
  AssignStaffModal,
} from "../components/PayrollV2Modals";
import StaffDepartmentView from "../components/StaffDepartmentView";
import TeachingDepartmentView from "../components/TeachingDepartmentView";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";
import {
  currentMonthKey,
  monthKeyToInputValue,
  inputValueToMonthKey,
  formatMonthKey,
} from "@/shared/helpers/month.helpers";

// Data & queries
import {
  ENTRY_STATUS_META,
  ENTRY_STATUS_OPTIONS,
  ENTRY_TABLE_COLUMNS,
  PAYROLL_TABS,
  RULE_TABLE_COLUMNS,
  DIRECTION_OPTIONS,
  getRuleFormula,
  getRuleFormulaHint,
  getRuleStatus,
} from "../data/payroll.data";
import { payrollQueries } from "../queries/payroll.queries";
import {
  useGeneratePayroll,
  useCloseSalary,
  useDeleteSalary,
  useDeleteDepartment,
} from "../queries/payroll.mutations";

/**
 * XODIMLAR OYLIGI — chiqim tomonining o'quvchi registriga o'xshashi.
 *
 * Qoida belgilanadi → har oy majburiyat hisoblanadi → to'lov uni yopadi.
 * Shu tufayli "kimga qancha qarzdormiz" degan savolga javob bor.
 */
const PayrollPage = () => {
  const [tab, setTab] = useState("structure");

  const tabs = PAYROLL_TABS.map((item) => ({
    ...item,
    content:
      item.value === "structure" ? (
        <StructureView />
      ) : item.value === "entries" ? (
        <EntriesView />
      ) : (
        <RulesView />
      ),
  }));

  return (
    <div className="space-y-4">
      <TabsButtons
        items={tabs}
        value={tab}
        onChange={setTab}
        contentClassName="mt-4"
      />

      {/* Struktura modallari */}
      <DepartmentModal />
      <PositionModal />
      <CategoryV2Modal />
      <AssignStaffModal />
      {/* Majburiyat/to'lov modallari */}
      <SalaryRuleModal />
      <SalaryPaymentModal />
      <VoidSalaryPaymentModal />
      <CancelPayrollEntryModal />
      <RegeneratePayrollEntryModal />
    </div>
  );
};

// ─────────────────────────────────────────────
// STRUKTURA — Yo'nalish × Bo'lim → dinamik kontent
//
// ⚠️ Bu tashkiliy qatlam: bo'lim/lavozim/toifa bo'yicha hisoblangan oylik
// KO'RSATILADI. Haqiqiy majburiyat "Oyliklar" tabidan (StaffSalary) chiqadi.
// ─────────────────────────────────────────────

const StructureView = () => {
  const { openModal } = useModal();
  const [direction, setDirection] = useState("salary");
  const [departmentId, setDepartmentId] = useState("");
  const [month, setMonth] = useState(monthKeyToInputValue(currentMonthKey()));
  const monthKey = inputValueToMonthKey(month);

  const { data: departments = [] } = useQuery(payrollQueries.departments());
  const { mutate: deleteDepartment } = useDeleteDepartment();

  const department = departments.find((d) => d.id === departmentId);

  const handleDeleteDept = () => {
    if (!department) return;
    if (!window.confirm(`"${department.name}" bo'limini o'chirasizmi?`)) return;
    deleteDepartment(department.id, {
      onSuccess: () => { toast.success("O'chirildi"); setDepartmentId(""); },
      onError: (err) => toast.error(err.response?.data?.message || "Xatolik"),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500">Yo'nalish</p>
          <Select triggerClassName="min-w-44" value={direction} options={DIRECTION_OPTIONS} onChange={setDirection} />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500">Bo'lim</p>
          <Select searchable triggerClassName="min-w-52" value={departmentId} placeholder="Bo'limni tanlang"
            onChange={setDepartmentId}
            options={departments.map((d) => ({ label: `${d.name} (${d.kind === "staff" ? "lavozim" : "toifa"})`, value: d.id }))}
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500">Oy</p>
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
            className="h-10 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-primary" />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {department && (
            <Can do="payroll.assign">
              <Button variant="outline" onClick={handleDeleteDept}><Trash2 className="size-4" /></Button>
            </Can>
          )}
          <Can do="payroll.assign">
            <Button onClick={() => openModal("department", {})}><Plus /> Bo'lim</Button>
          </Can>
        </div>
      </div>

      {direction === "bonus" ? (
        <Card className="py-10 text-center text-gray-500">
          Ustama haqlar — bu qatlamda alohida katalog yo'q. Ustama/qo'shimcha
          to'lovlar "Oyliklar" (StaffSalary qoidalari) orqali boshqariladi.
        </Card>
      ) : !department ? (
        <Card className="py-12 text-center text-gray-500">Yuqoridan bo'lim tanlang</Card>
      ) : department.kind === "staff" ? (
        <StaffDepartmentView department={department} month={monthKey} />
      ) : (
        <TeachingDepartmentView department={department} month={monthKey} />
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Oyliklar — majburiyatlar va to'lovlar
// ─────────────────────────────────────────────

const EntriesView = () => {
  const { openModal } = useModal();

  const [month, setMonth] = useState(monthKeyToInputValue(currentMonthKey()));
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const monthKey = inputValueToMonthKey(month);

  const { data, isLoading } = useQuery(
    payrollQueries.entries({
      page,
      limit: 20,
      ...(monthKey ? { month: monthKey } : {}),
      ...(status ? { status } : {}),
    }),
  );

  const { mutate: generate, isPending: isGenerating } = useGeneratePayroll();

  const items = data?.data ?? [];

  const handleGenerate = () => {
    generate(
      { month: monthKey },
      {
        onSuccess: (result) => {
          const { alreadyExists, noSalary, archived, monthOpen, noHours } =
            result.skipped;
          const restored = result.restored ?? 0;

          // ⚠️ "Allaqachon shakllantirilgan" YETARLI EMAS: shakllantirish
          // idempotent, ya'ni uni qayta bosish YANGI xodimlarga majburiyat
          // yaratadi. Nima bo'lgani va NIMA BO'LMAGANI aytilmasa,
          // foydalanuvchi tugma umuman ishlamadi deb o'ylardi.
          //
          // ⚠️ BEKOR QILINGANI endi TO'SIQ EMAS — u shu tugmaning o'zi
          // bilan qayta hisoblanib tiklanadi. Shuning uchun "qatordagi
          // Qayta shakllantirishdan foydalaning" degan yo'riqnoma olib
          // tashlandi: u boshi berk ko'chaga boshlardi.
          if (result.created > 0 || restored > 0) {
            const parts = [];
            if (result.created > 0) parts.push(`${result.created} ta shakllantirildi`);
            if (restored > 0) parts.push(`${restored} tasi bekordan qaytarildi`);

            toast.success(`${result.monthLabel}: ${parts.join(", ")}`);
          } else if (alreadyExists > 0) {
            toast.info(
              `${result.monthLabel}: yangi majburiyat yo'q — ${alreadyExists} ta allaqachon bor`,
            );
          } else if (monthOpen > 0) {
            // ⚠️ SOATBAY OY YOPILGANDAN KEYIN MUHRLANADI. Bu sabab jim
            // qolsa, "shakllantirish ishlamayapti" degan xulosa chiqardi —
            // holbuki tizim ataylab kutyapti, soat hali o'zgaradi.
            toast.info(
              `${result.monthLabel}: ${monthOpen} ta soatbay xodim oy yakunlanishini kutyapti`,
              {
                description:
                  "Dars soatiga bog'liq oylik oy tugagach shakllantiriladi — soat hali o'zgarishi mumkin.",
              },
            );
          } else if (noHours > 0) {
            toast.warning(
              `${result.monthLabel}: ${noHours} ta soatbay xodimda dars soati yo'q — majburiyat yozilmadi`,
            );
          } else if (noSalary > 0 || archived > 0) {
            toast.warning(
              `Majburiyat yaratilmadi: ${noSalary} ta xodimda oylik qoidasi yo'q` +
                (archived > 0 ? `, ${archived} tasi arxivlangan` : ""),
            );
          } else {
            toast.warning("Oylik belgilangan xodim topilmadi");
          }
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      },
    );
  };

  return (
    <div className="space-y-4">
      {/* Filtr paneli */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-3 ring-1 ring-gray-100 xs:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="month"
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-primary"
          />

          <Select
            triggerClassName="min-w-40"
            value={status}
            options={ENTRY_STATUS_OPTIONS}
            onChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
          />
        </div>

        <Can do="payroll.generate">
          <Button onClick={handleGenerate} loading={isGenerating}>
            <RefreshCw />
            Shakllantirish
          </Button>
        </Can>
      </div>

      {data?.totals && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryTile
            label="Hisoblangan"
            value={formatMoney(data.totals.accrued)}
            sub={`${data.pagination?.total ?? 0} ta majburiyat`}
          />
          <SummaryTile
            label="To'langan"
            value={formatMoney(data.totals.paid)}
            valueClassName="text-green-700"
          />
          <SummaryTile
            label="Qarzimiz"
            value={formatMoney(data.totals.debt)}
            valueClassName="text-red-600"
            sub="Xodimlarga to'lanmagan"
          />
        </div>
      )}

      {isLoading ? (
        <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>
      ) : items.length === 0 ? (
        <Card className="p-0 xs:p-0">
          <EmptyState
            icon={Wallet}
            title="Oylik majburiyati yo'q"
            description={
              monthKey
                ? `${formatMonthKey(monthKey)} uchun hali shakllantirilmagan. "Qoidalar" tabida xodimlarga oylik belgilang, so'ng "Shakllantirish" tugmasini bosing.`
                : "Oy tanlang."
            }
            action={
              <Can do="payroll.generate">
                <Button onClick={handleGenerate} loading={isGenerating}>
                  <RefreshCw />
                  Shakllantirish
                </Button>
              </Can>
            }
          />
        </Card>
      ) : (
        <>
          <Table columns={ENTRY_TABLE_COLUMNS}>
            {items.map((entry) => {
              const badge = ENTRY_STATUS_META[entry.status];
              const isCancelled = entry.status === "cancelled";

              return (
                <Tr key={entry.id} className={cn(isCancelled && "opacity-50")}>
                  <Td className="font-medium text-gray-900">
                    {entry.staffName}
                    {entry.roleLabel && (
                      <span className="block text-xs font-normal text-gray-400">
                        {entry.roleLabel}
                      </span>
                    )}
                  </Td>

                  <Td className="text-gray-500">{entry.monthLabel}</Td>
                  <Td align="right" className="font-medium">
                    {formatMoney(entry.amount)}
                  </Td>
                  <Td align="right" className="text-green-600">
                    {formatMoney(entry.paidAmount)}
                  </Td>

                  <Td align="right">
                    {isCancelled ? (
                      <span className="text-gray-400">—</span>
                    ) : (
                      <span className="font-medium text-red-600">
                        {formatMoney(entry.debt)}
                      </span>
                    )}
                  </Td>

                  <Td>
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </Td>

                  <Td>
                    <div className="flex items-center justify-end gap-1">
                      {/* QAYTA SHAKLLANTIRISH — bekor qilinganini qaytarish
                          yoki qoida to'g'rilangandan keyin summani yangilash.
                          To'lov tushgan qatorda ko'rinmaydi: summani
                          o'zgartirish taqsimotni yolg'onga aylantirardi. */}
                      {Number(entry.paidAmount) === 0 && (
                        <Can do="payroll.generate">
                          <button
                            title="Qayta shakllantirish"
                            onClick={() =>
                              openModal("regeneratePayrollEntry", { entry })
                            }
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <RefreshCw className="size-3.5" />
                          </button>
                        </Can>
                      )}

                      {!isCancelled && entry.status !== "paid" && (
                        <>
                          <Can do="payroll.pay">
                            <button
                              title="To'lash"
                              onClick={() =>
                                openModal("salaryPayment", {
                                  staff: {
                                    id: entry.staffId,
                                    firstName: entry.staffSnapshot?.firstName,
                                    lastName: entry.staffSnapshot?.lastName,
                                  },
                                })
                              }
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-green-50 hover:text-green-600"
                            >
                              <Wallet className="size-3.5" />
                            </button>
                          </Can>

                          {Number(entry.paidAmount) === 0 && (
                            <Can do="payroll.cancel">
                              <button
                                title="Majburiyatni bekor qilish"
                                onClick={() =>
                                  openModal("cancelPayrollEntry", { entry })
                                }
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                              >
                                <XCircle className="size-3.5" />
                              </button>
                            </Can>
                          )}
                        </>
                      )}
                    </div>
                  </Td>
                </Tr>
              );
            })}
          </Table>

          {data?.pagination?.totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={data.pagination.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Qoidalar — kimga qancha oylik
// ─────────────────────────────────────────────

const RulesView = () => {
  const { openModal } = useModal();
  const [page, setPage] = useState(1);
  const now = currentMonthKey();

  const { data, isLoading } = useQuery(payrollQueries.salaries({ page, limit: 20 }));
  const { mutate: closeSalary } = useCloseSalary();
  const { mutate: deleteSalary } = useDeleteSalary();

  const items = data?.data ?? [];

  const showError = (err) =>
    toast.error(err.response?.data?.message || "Xatolik yuz berdi");

  const handleClose = (rule) => {
    closeSalary(
      { id: rule.id },
      {
        onSuccess: () => toast.success("Qoida yopildi"),
        onError: showError,
      },
    );
  };

  // ⚠️ O'CHIRISH SHARTSIZ va bu XAVFSIZ: shakllangan majburiyat bu
  // qatorga ishora qilmaydi — summa, stavka, norma va formula uning
  // ichiga muhrlangan. Ya'ni o'chirish o'tgan vedomostga ham, to'lovga
  // ham tegmaydi, faqat KELAJAKDAGI shakllantirishni to'xtatadi.
  const handleDelete = (rule) => {
    deleteSalary(rule.id, {
      onSuccess: () => toast.success("Qoida o'chirildi"),
      onError: showError,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          Kimga qancha fiksa oylik belgilangani. Har oy shu qoidadan majburiyat
          hisoblanadi.
        </p>

        <Can do="payroll.assign">
          <Button onClick={() => openModal("staffSalary", {})}>
            <Plus />
            Oylik belgilash
          </Button>
        </Can>
      </div>

      {isLoading ? (
        <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>
      ) : items.length === 0 ? (
        <Card className="p-0 xs:p-0">
          <EmptyState
            icon={Users}
            title="Oylik belgilanmagan"
            description="Xodimlarga fiksa oylik belgilang — keyin har oy majburiyat avtomatik hisoblanadi."
            action={
              <Can do="payroll.assign">
                <Button onClick={() => openModal("staffSalary", {})}>
                  <Plus />
                  Oylik belgilash
                </Button>
              </Can>
            }
          />
        </Card>
      ) : (
        <>
          <Table columns={RULE_TABLE_COLUMNS}>
            {items.map((rule) => {
              const badge = getRuleStatus(rule, now);

              return (
                <Tr key={rule.id}>
                  <Td className="font-medium text-gray-900">
                    {rule.staffName}
                    {rule.staff?.role && (
                      <span className="block text-xs font-normal text-gray-400">
                        {rule.staff.role}
                      </span>
                    )}
                  </Td>

                  {/* Soatbay va aralash qoidada "summa" bitta son emas —
                      formulaning o'zi ko'rsatiladi, aks holda soatbay
                      qatori "0 so'm" bo'lib turardi */}
                  <Td align="right" nowrap={false} className="font-medium">
                    {getRuleFormula(rule)}
                    {getRuleFormulaHint(rule) && (
                      <span className="block text-xs font-normal text-gray-400">
                        {getRuleFormulaHint(rule)}
                      </span>
                    )}
                  </Td>
                  <Td nowrap={false} className="text-gray-500">
                    {rule.periodLabel}
                    {rule.note && (
                      <span className="block text-xs text-gray-400">{rule.note}</span>
                    )}
                  </Td>

                  <Td>
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </Td>

                  <Td>
                    <div className="flex items-center justify-end gap-1">
                      <Can do="payroll.assign">
                        <button
                          title="Tahrirlash"
                          onClick={() => openModal("staffSalary", { rule })}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                      </Can>

                      {rule.isOpen && (
                        <Can do="payroll.assign">
                          <button
                            title="Qoidani yopish"
                            onClick={() => handleClose(rule)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-amber-50 hover:text-amber-600"
                          >
                            <Ban className="size-3.5" />
                          </button>
                        </Can>
                      )}

                      <Can do="payroll.assign">
                        <ConfirmPopover
                          tooltip="O'chirish"
                          title="Qoida o'chirilsinmi?"
                          description="Shakllangan majburiyatlar joyida qoladi — ularning summasi allaqachon muhrlangan. Bundan keyin bu xodimga oylik hisoblanmaydi."
                          confirmLabel="O'chirish"
                          danger
                          onConfirm={() => handleDelete(rule)}
                        >
                          <button
                            type="button"
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </ConfirmPopover>
                      </Can>
                    </div>
                  </Td>
                </Tr>
              );
            })}
          </Table>

          {data?.pagination?.totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={data.pagination.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
};

const SummaryTile = ({ label, value, sub, valueClassName = "text-gray-900" }) => (
  <Card>
    <p className="text-xs font-medium text-gray-500">{label}</p>
    <p className={`mt-1 text-xl font-bold ${valueClassName}`}>{value}</p>
    {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
  </Card>
);

export default PayrollPage;
