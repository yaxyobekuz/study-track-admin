// Router
import { Link, useSearchParams } from "react-router-dom";

// Icons
import { ChevronLeft } from "lucide-react";

// Components
import UserForm from "../components/UserForm";

/**
 * Yangi foydalanuvchi.
 *
 * Qaysi ro'yxatdan kelingani `?role=` orqali beriladi — shunga qarab
 * sarlavha, orqaga havolasi va formadagi boshlang'ich rol o'zgaradi.
 * Rolni forma ichida baribir almashtirsa bo'ladi.
 */
const CreateUserPage = () => {
  const [searchParams] = useSearchParams();
  const isStudent = searchParams.get("role") === "student";

  return (
    <div className="space-y-4">
      <Link
        to={isStudent ? "/users/students" : "/users/staff"}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ChevronLeft className="size-4" />
        {isStudent ? "O'quvchilar" : "Xodimlar"}
      </Link>

      <h1 className="page-title">
        {isStudent ? "Yangi o'quvchi" : "Yangi xodim"}
      </h1>

      <UserForm defaultRole={isStudent ? "student" : "teacher"} />
    </div>
  );
};

export default CreateUserPage;
