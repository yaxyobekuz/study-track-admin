// Toaster
import { toast } from "sonner";

// React
import { useEffect, useState } from "react";

// API
import { authAPI } from "@/features/auth/api/auth.api";
import { usersAPI } from "@/features/profile/api/users.api";

// Tanstack Query
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";

const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  username: "",
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const ProfilePage = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(INITIAL_FORM);

  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authAPI.getMe().then((res) => res.data.data),
  });

  // Profil yuklangach, formaning boshlang'ich qiymatlarini to'ldirish
  useEffect(() => {
    if (!profile) return;
    setForm((prev) => ({
      ...prev,
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      username: profile.username || "",
    }));
  }, [profile]);

  const setField = (field) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateMutation = useMutation({
    mutationFn: (payload) => usersAPI.updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      setForm((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      toast.success("Profil muvaffaqiyatli yangilandi");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Xatolik yuz berdi");
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();

    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const username = form.username.trim();

    if (!firstName) {
      return toast.error("Ism kiritilishi shart");
    }
    if (!username || username.length < 3) {
      return toast.error("Username kamida 3 ta belgidan iborat bo'lishi kerak");
    }

    const payload = { firstName, lastName, username };

    // Parol o'zgartirish ixtiyoriy - faqat yangi parol kiritilganda yuboriladi
    const wantsPasswordChange =
      form.currentPassword || form.newPassword || form.confirmPassword;

    if (wantsPasswordChange) {
      if (!form.currentPassword) {
        return toast.error("Joriy parolni kiriting");
      }
      if (!form.newPassword || form.newPassword.length < 6) {
        return toast.error("Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak");
      }
      if (form.newPassword !== form.confirmPassword) {
        return toast.error("Yangi parol va tasdiqlash mos kelmadi");
      }
      payload.currentPassword = form.currentPassword;
      payload.newPassword = form.newPassword;
    }

    updateMutation.mutate(payload);
  };

  if (isLoading) {
    return <div className="py-8 text-center">Yuklanmoqda...</div>;
  }

  if (isError) {
    return (
      <div className="py-8 text-center text-gray-500">
        Profil ma'lumotlarini yuklab bo'lmadi
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="page-title">Profil</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Shaxsiy ma'lumotlar */}
          <Card title="Shaxsiy ma'lumotlar" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InputField
                name="firstName"
                label="Ism"
                placeholder="Ism"
                required
                value={form.firstName}
                onChange={setField("firstName")}
              />

              <InputField
                name="lastName"
                label="Familiya"
                placeholder="Familiya"
                value={form.lastName}
                onChange={setField("lastName")}
              />
            </div>

            <InputField
              name="username"
              label="Username (login)"
              placeholder="username"
              required
              value={form.username}
              onChange={setField("username")}
            />
          </Card>

          {/* Parolni o'zgartirish */}
          <Card title="Parolni o'zgartirish" className="space-y-4">
            <p className="text-sm text-gray-500">
              Parolni o'zgartirmoqchi bo'lsangizgina to'ldiring.
            </p>

            <InputField
              type="password"
              name="currentPassword"
              label="Joriy parol"
              placeholder="••••••"
              autoComplete="current-password"
              value={form.currentPassword}
              onChange={setField("currentPassword")}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InputField
                type="password"
                name="newPassword"
                label="Yangi parol"
                placeholder="••••••"
                autoComplete="new-password"
                value={form.newPassword}
                onChange={setField("newPassword")}
              />

              <InputField
                type="password"
                name="confirmPassword"
                label="Yangi parolni tasdiqlang"
                placeholder="••••••"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={setField("confirmPassword")}
              />
            </div>
          </Card>
        </div>

        {/* Submit button */}
        <Button disabled={updateMutation.isPending}>
          Saqlash{updateMutation.isPending && "..."}
        </Button>
      </form>
    </div>
  );
};

export default ProfilePage;
