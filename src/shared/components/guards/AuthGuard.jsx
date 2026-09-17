// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Router
import { Navigate, Outlet } from "react-router-dom";

// Icons
import logoIcon from "@/shared/assets/icons/logo.svg";

// Components
import Button from "@/shared/components/ui/button/Button";

// API
import { authAPI } from "@/features/auth/api/auth.api";

const AuthGuard = () => {
  const token = localStorage.getItem("authToken");

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authAPI.getMe().then((res) => res.data.data),
    enabled: Boolean(token),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center fixed inset-0 z-50 size-full bg-gray-100">
        <img
          width={64}
          height={64}
          src={logoIcon}
          className="size-16"
          alt="MBSI logo icon svg"
        />
      </div>
    );
  }

  // ⚠️ TIZIMDAN FAQAT 401 CHIQARADI. Ilgari `/auth/me` ning HAR QANDAY xatosi
  // (so'rovlar chegarasi 429, server 500, internet uzilishi) tokenni o'chirib
  // login sahifasiga otardi: ish o'rtasida, masalan arxivlash tugmasi
  // bosilgach sahifa yangilanib, `auth/me` qayta so'ralganda. Token
  // yaroqsizligini faqat 401 aytadi (uni `http.js` interceptori ham ushlaydi).
  // Ma'lumot keshda bo'lsa, fon yangilanishi yiqilgani sahifani to'xtatmaydi.
  if (isError && !data) {
    if (error?.response?.status === 401) {
      localStorage.removeItem("authToken");
      return <Navigate to="/login" replace />;
    }

    return (
      <div className="flex flex-col items-center justify-center gap-4 fixed inset-0 z-50 size-full bg-gray-100 px-4 text-center">
        <img
          width={64}
          height={64}
          src={logoIcon}
          className="size-16"
          alt="MBSI logo icon svg"
        />
        <p className="text-sm text-gray-600">
          Server bilan bog'lanib bo'lmadi. Internetni tekshirib, qayta urinib
          ko'ring.
        </p>
        <Button onClick={() => refetch()} disabled={isFetching}>
          Qayta urinish
          {isFetching && "..."}
        </Button>
      </div>
    );
  }

  return <Outlet />;
};

export default AuthGuard;
