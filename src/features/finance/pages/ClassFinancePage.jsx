// Router
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";

// Icons
import { ArrowLeft, Gift, Users, Wallet, TrendingDown } from "lucide-react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Select from "@/shared/components/ui/select/Select";
import EmptyState from "@/shared/components/ui/EmptyState";

// Utils & helpers
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";
import { currentMonthKey, buildMonthOptions } from "@/shared/helpers/month.helpers";

// Data & queries
import { FINANCE_STATUS_META } from "../data/finance.data";
import { financeQueries } from "../queries/finance.queries";
import { classesQueries } from "@/features/classes/queries/classes.queries";

const MONTH_OPTIONS = buildMonthOptions({ back: 12, forward: 1 });

/**
 * SINF MOLIYAVIY SAHIFASI.
 *
 * Moliya bosh sahifasidagi sinf qatorini bosganda ochiladi. Bir sinfning
 * BARCHA o'quvchisi (grantdagilar ham — 0 so'm to'lasa ham) va har birining
 * shu oydagi moliyaviy holati: tarif, oylik summa, qarz, holat.
 *
 * ⚠️ Manba — o'quvchilar REGISTRI, hisob-faktura ro'yxati emas: registr sinfning
 * jonli a'zoligidan chiqadi, shuning uchun hisob-fakturasi hali yo'q yoki 0
 * so'mlik (grant) o'quvchi ham ro'yxatda qoladi.
 */
const ClassFinancePage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const month = Number(searchParams.get("month")) || currentMonthKey();

  const { data: classes = [] } = useQuery(classesQueries.list());
  const { data, isLoading } = useQuery(
    financeQueries.studentRegistry({ classId, month, limit: 500 }),
  );

  const students = data?.data ?? [];
  const className =
    classes.find((c) => c.id === classId)?.name ??
    students[0]?.className ??
    "Sinf";

  const grantCount = students.filter((s) => s.isGrant).length;
  const totalDebt = data?.totals?.totalDebt ?? "0.00";

  const setMonth = (v) =>
    setSearchParams((prev) => {
      prev.set("month", String(v));
      return prev;
    });

  return (
    <div className="space-y-4">
      {/* Sarlavha + orqaga + oy */}
      <div className="flex flex-col gap-3 xs:flex-row xs:items-center xs:justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/finance/main/overview"
            className="flex size-9 items-center justify-center rounded-xl text-gray-500 ring-1 ring-gray-200 hover:bg-gray-50"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{className}</h1>
            <p className="text-xs text-gray-400">Sinfning moliyaviy holati</p>
          </div>
        </div>

        <Select
          value={String(month)}
          triggerClassName="min-w-40"
          options={MONTH_OPTIONS}
          onChange={(v) => setMonth(Number(v))}
        />
      </div>

      {/* Qisqa sanoq */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat icon={Users} accent="text-slate-600" label="O'quvchi" value={students.length} />
        <MiniStat icon={Gift} accent="text-purple-600" label="Grant" value={grantCount} />
        <MiniStat
          icon={Wallet}
          accent="text-blue-600"
          label="To'lovchi"
          value={students.length - grantCount}
        />
        <MiniStat
          icon={TrendingDown}
          accent="text-red-600"
          label="Jami qarz"
          value={formatMoney(totalDebt)}
          isMoney
        />
      </div>

      {/* O'quvchilar jadvali */}
      <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-gray-100">
        {isLoading ? (
          <p className="py-10 text-center text-sm text-gray-500">Yuklanmoqda...</p>
        ) : students.length === 0 ? (
          <EmptyState
            icon={Users}
            title="O'quvchi yo'q"
            description="Bu sinfda o'quvchi topilmadi."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                  <th className="px-4 py-2.5 font-medium">O'quvchi</th>
                  <th className="px-4 py-2.5 font-medium">Tarif</th>
                  <th className="px-4 py-2.5 text-right font-medium">Oylik summa</th>
                  <th className="px-4 py-2.5 text-right font-medium">Qarz</th>
                  <th className="px-4 py-2.5 font-medium">Holat</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const badge = FINANCE_STATUS_META[s.status] ?? null;
                  return (
                    <tr
                      key={s.id}
                      onClick={() => navigate(`/users/${s.id}`)}
                      className="cursor-pointer border-b border-gray-50 last:border-0 hover:bg-gray-50"
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {s.fullName}
                          </span>
                          {s.isGrant && (
                            <span className="rounded bg-purple-50 px-1.5 py-0.5 text-xs text-purple-700">
                              Grant
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">{s.username}</span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-600">
                        {s.tariff?.name ?? "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right text-gray-900">
                        {s.monthlyAmount != null ? formatMoney(s.monthlyAmount) : "—"}
                      </td>
                      <td
                        className={cn(
                          "px-4 py-2.5 text-right font-medium",
                          Number(s.debt) > 0 ? "text-red-600" : "text-gray-400",
                        )}
                      >
                        {formatMoney(s.debt)}
                      </td>
                      <td className="px-4 py-2.5">
                        {badge && (
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

/** Kichik sanoq katakchasi (sinf sarlavhasi ostida). */
const MiniStat = ({ icon: Icon, accent, label, value, isMoney }) => (
  <div className="rounded-2xl bg-white p-3 ring-1 ring-gray-100">
    <div className="flex items-center gap-1.5 text-gray-500">
      <Icon className={cn("size-3.5", accent)} />
      <span className="text-[11px] font-medium uppercase tracking-wide">{label}</span>
    </div>
    <p
      className={cn(
        "mt-1 font-bold text-gray-900",
        isMoney ? "text-base" : "text-xl",
      )}
    >
      {value}
    </p>
  </div>
);

export default ClassFinancePage;
