// Router
import { useNavigate } from "react-router-dom";

// Icons
import { Users } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

/**
 * O'QUVCHILAR KARTASI — jami / grant / to'lovchi bitta kartada.
 *
 * "Umumiy" bo'limidagi uch alohida kartaning birlashmasi (manba
 * `overviewDashboard.counts`). Grant qismini bosib grant o'quvchilar
 * ro'yxatiga o'tiladi.
 */
const StudentsKpiCard = ({ data, topServices = [], className }) => {
  const navigate = useNavigate();
  const counts = data?.counts;
  const month = data?.month;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-white p-4 ring-1 ring-gray-100 xs:p-5",
        className,
      )}
    >
      <div className="absolute -right-7 -top-7 size-24 rounded-full bg-slate-600 opacity-10" />

      <div className="relative flex items-center gap-2.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-600 text-white shadow-sm">
          <Users className="size-[18px]" />
        </span>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
          O'quvchilar
        </p>
      </div>

      <div className="relative mt-4 grid grid-cols-3 gap-2">
        <div>
          <p className="text-[11px] text-gray-400">Jami</p>
          <p className="mt-0.5 text-xl font-bold text-gray-900">
            {counts?.totalStudents ?? 0}
          </p>
        </div>

        <button
          type="button"
          title="Grant o'quvchilar ro'yxati"
          onClick={() =>
            navigate(`/finance/main/grants${month ? `?month=${month}` : ""}`)
          }
          className="-mx-1 rounded-lg px-1 text-left transition hover:bg-purple-50"
        >
          <p className="text-[11px] text-gray-400">Grant</p>
          <p className="mt-0.5 text-xl font-bold text-purple-700">
            {counts?.grantStudents ?? 0}
          </p>
        </button>

        <div>
          <p className="text-[11px] text-gray-400">To'lovchi</p>
          <p className="mt-0.5 text-xl font-bold text-blue-700">
            {counts?.payingStudents ?? 0}
          </p>
        </div>
      </div>

      {/* Eng ko'p ishlatiladigan qo'shimcha xizmatlar (doim top 3) */}
      <div className="relative mt-3 border-t border-gray-100 pt-2.5">
        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
          Ko'p ishlatiladigan xizmatlar
        </p>
        {topServices.length === 0 ? (
          <p className="mt-1 text-[11px] text-gray-400">
            Xizmatlardan foydalanuvchilar yo'q
          </p>
        ) : (
          <div className="mt-1.5 space-y-1">
            {topServices.map((s) => (
              <button
                key={s.id}
                type="button"
                title="Bu xizmatdan foydalanuvchilarni ko'rish"
                onClick={() => navigate(`/finance/main/services?serviceId=${s.id}`)}
                className="flex w-full items-center justify-between gap-2 text-xs hover:text-primary"
              >
                <span className="min-w-0 flex-1 truncate text-left text-gray-700">
                  {s.name}
                </span>
                <span className="shrink-0 rounded bg-blue-50 px-1.5 py-0.5 text-[11px] font-medium text-blue-700">
                  {s.assignedCount} ta
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentsKpiCard;
