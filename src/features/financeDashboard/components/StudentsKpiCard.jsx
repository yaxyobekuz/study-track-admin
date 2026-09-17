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
const StudentsKpiCard = ({ data, className }) => {
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

      <p className="relative mt-3 border-t border-gray-100 pt-2.5 text-[11px] text-gray-400">
        Grant — "Grand 100%" tarifidagilar. Bosib ro'yxatni ko'ring.
      </p>
    </div>
  );
};

export default StudentsKpiCard;
