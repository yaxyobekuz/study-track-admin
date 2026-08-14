// Router
import { Link, useParams } from "react-router-dom";

// Icons
import { ChevronLeft } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import StaffDetail from "../components/detail/StaffDetail";
import StudentDetail from "../components/detail/StudentDetail";

// Queries
import { usersQueries } from "../queries/users.queries";

/**
 * Foydalanuvchi detal sahifasi — faqat yo'naltiruvchi.
 *
 * Ma'lumotni shu yer yuklaydi, ko'rinishni esa rolga mos komponent chizadi:
 * xodim va o'quvchining tablari, maydonlari va harakatlari boshqacha, shuning
 * uchun ular bitta faylda `role` shartlari bilan chalkashmaydi.
 */
const UserDetailPage = () => {
  const { userId } = useParams();
  const { data: user, isLoading, isError } = useQuery(usersQueries.detail(userId));

  if (isLoading) {
    return <div className="py-8 text-center text-gray-500">Yuklanmoqda...</div>;
  }

  if (isError || !user) {
    return (
      <div className="space-y-4">
        <Link
          to="/users"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="size-4" />
          Foydalanuvchilar
        </Link>

        <Card className="text-center">
          <p className="text-sm text-red-500">Foydalanuvchi topilmadi</p>
        </Card>
      </div>
    );
  }

  return user.role === "student" ? (
    <StudentDetail user={user} />
  ) : (
    <StaffDetail user={user} />
  );
};

export default UserDetailPage;
