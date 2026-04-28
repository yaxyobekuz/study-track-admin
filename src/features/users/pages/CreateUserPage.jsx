// Router
import { Link } from "react-router-dom";

// Icons
import { ChevronLeft } from "lucide-react";

// Components
import UserForm from "../components/UserForm";

const CreateUserPage = () => (
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

    <h1 className="page-title">Yangi foydalanuvchi</h1>

    <UserForm mode="create" />
  </div>
);

export default CreateUserPage;
