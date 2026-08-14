// Router
import { Link, useParams } from "react-router-dom";

// Icons
import { ChevronLeft } from "lucide-react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Queries
import { usersQueries } from "../queries/users.queries";

// Components
import UserForm from "../components/UserForm";
import StudentAttendanceSummary from "@/features/attendance/components/StudentAttendanceSummary";
import StudentFinanceSection from "@/features/finance/components/StudentFinanceSection";

const EditUserPage = () => {
  const { userId } = useParams();

  const { data, isLoading } = useQuery(usersQueries.detail(userId));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link
          to="/users"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="size-4" />
          Foydalanuvchilar
        </Link>
      </div>

      <h1 className="page-title">Foydalanuvchini tahrirlash</h1>

      {isLoading ? (
        <div className="py-8 text-center text-gray-500">Yuklanmoqda...</div>
      ) : data ? (
        <>
          <UserForm mode="edit" initialData={data} />
          {data.role === "student" && (
            <>
              <div className="mt-6 border border-gray-100 rounded-xl p-4">
                <StudentAttendanceSummary studentId={userId} />
              </div>

              {/* Moliya bo'limi — finance feature'iga tegishli, o'zi fetch qiladi */}
              <div className="mt-6 border border-gray-100 rounded-xl p-4">
                <StudentFinanceSection studentId={userId} />
              </div>
            </>
          )}
        </>
      ) : (
        <div className="py-8 text-center text-red-500">
          Foydalanuvchi topilmadi
        </div>
      )}
    </div>
  );
};

export default EditUserPage;
