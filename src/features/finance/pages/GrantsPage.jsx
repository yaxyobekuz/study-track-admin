// Router
import { useSearchParams, useNavigate, Link } from "react-router-dom";

// Icons
import { ArrowLeft, Gift, Users } from "lucide-react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Select from "@/shared/components/ui/select/Select";
import SelectSearch from "@/shared/components/ui/select/SelectSearch";
import EmptyState from "@/shared/components/ui/EmptyState";
import { Label } from "@/shared/components/shadcn/label";

// Utils & helpers
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";
import { currentMonthKey, buildMonthOptions } from "@/shared/helpers/month.helpers";

// Data & queries
import { financeQueries } from "../queries/finance.queries";
import { classesQueries } from "@/features/classes/queries/classes.queries";

const MONTH_OPTIONS = buildMonthOptions({ back: 12, forward: 1 });

/**
 * GRANT O'QUVCHILAR RO'YXATI.
 *
 * Moliya bosh sahifasidagi "Grant (bepul)" kartasini yoki sinf qatoridagi
 * "N grant" belgisini bosganda ochiladi. Joriy tarifi "Grand 100%" bo'lgan
 * o'quvchilar — maktab bo'yicha (sinfsiz) yoki tanlangan sinf bo'yicha.
 *
 * ⚠️ Manba — o'quvchilar REGISTRI (`filter=grant`): grant o'quvchi 0 so'm
 * to'lasa ham, hisob-fakturasi hali shakllanmagan bo'lsa ham ro'yxatda qoladi.
 */
const GrantsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const month = Number(searchParams.get("month")) || currentMonthKey();
  const classId = searchParams.get("classId") || "";

  const { data: classes = [] } = useQuery(classesQueries.list());
  const { data, isLoading } = useQuery(
    financeQueries.studentRegistry({
      filter: "grant",
      month,
      limit: 500,
      ...(classId ? { classId } : {}),
    }),
  );

  const students = data?.data ?? [];
  const count = data?.pagination?.total ?? students.length;
  const className = classId
    ? classes.find((c) => c.id === classId)?.name ?? students[0]?.className
    : null;

  const setParam = (key, value) =>
    setSearchParams((prev) => {
      if (value == null || value === "") prev.delete(key);
      else prev.set(key, String(value));
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
            <h1 className="text-lg font-semibold text-gray-900">
              Grant o'quvchilar{className ? ` — ${className}` : ""}
            </h1>
            <p className="text-xs text-gray-400">
              Joriy tarifi "Grand 100%" bo'lgan o'quvchilar
            </p>
          </div>
        </div>

        <Select
          value={String(month)}
          triggerClassName="min-w-40"
          options={MONTH_OPTIONS}
          onChange={(v) => setParam("month", Number(v))}
        />
      </div>

      {/* Qisqa sanoq + sinf filtri */}
      <div className="flex flex-wrap items-end gap-3 rounded-2xl bg-white p-3 ring-1 ring-gray-100 xs:p-4">
        <div className="flex items-center gap-2 rounded-xl bg-purple-50 px-3 py-2 text-purple-700">
          <Gift className="size-4" />
          <span className="text-lg font-bold">{count}</span>
          <span className="text-xs">ta grant</span>
        </div>

        <div className="ml-auto flex w-full flex-col gap-2 xs:w-56">
          <Label htmlFor="classId">Sinf bo'yicha</Label>
          <SelectSearch
            id="classId"
            value={classId}
            placeholder="Barcha sinflar"
            onChange={(v) => setParam("classId", v)}
            options={classes.map((c) => ({ label: c.name, value: c.id }))}
          />
        </div>
      </div>

      {/* O'quvchilar jadvali */}
      <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-gray-100">
        {isLoading ? (
          <p className="py-10 text-center text-sm text-gray-500">Yuklanmoqda...</p>
        ) : students.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Grant o'quvchi yo'q"
            description={
              classId
                ? "Bu sinfda \"Grand 100%\" tarifidagi o'quvchi topilmadi."
                : "\"Grand 100%\" tarifidagi o'quvchi topilmadi. Tarifni o'quvchiga biriktiring."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                  <th className="px-4 py-2.5 font-medium">O'quvchi</th>
                  <th className="px-4 py-2.5 font-medium">Sinf</th>
                  <th className="px-4 py-2.5 font-medium">Tarif</th>
                  <th className="px-4 py-2.5 text-right font-medium">Oylik summa</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => navigate(`/users/${s.id}`)}
                    className="cursor-pointer border-b border-gray-50 last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-2.5">
                      <span className="font-medium text-gray-900">{s.fullName}</span>
                      <span className="block text-xs text-gray-400">{s.username}</span>
                    </td>
                    <td className="px-4 py-2.5 text-gray-600">
                      {s.className ?? "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="rounded bg-purple-50 px-1.5 py-0.5 text-xs text-purple-700">
                        {s.tariff?.name ?? "—"}
                      </span>
                    </td>
                    <td
                      className={cn(
                        "px-4 py-2.5 text-right font-medium",
                        Number(s.monthlyAmount) > 0 ? "text-gray-900" : "text-gray-400",
                      )}
                    >
                      {s.monthlyAmount != null ? formatMoney(s.monthlyAmount) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default GrantsPage;
