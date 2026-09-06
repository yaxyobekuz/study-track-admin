// React
import { useMemo, useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import { Check, Info, ShieldAlert } from "lucide-react";

// Components
import Button from "@/shared/components/ui/button/Button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Utils
import { cn } from "@/shared/utils/cn";

// Queries
import { useRoles } from "@/features/roles/queries/roles.queries";
import { useSetUserRoles } from "@/features/users/queries/users.mutations";

/**
 * QO'SHIMCHA ROLLARNI TAHRIRLASH — faqat owner ochadi.
 *
 * ⚠️ ASOSIY ROL BU YERDA O'ZGARMAYDI va ro'yxatda ham turmaydi. Sabab:
 * `role` — odamning KIM ekani va u hisobotlarga, ish vaqtiga, jarima
 * summasiga ta'sir qiladi. Uni o'zgartirish tizimning boshqa
 * burchagidagi raqamlarni jimgina qayta yozardi, shuning uchun bunday
 * endpoint umuman yo'q (server ham `updateUser` da rolni qabul
 * qilmaydi).
 *
 * ⚠️ HAR QANDAY ROL BERILADI — cheklov YO'Q. Bu oynani faqat tizim
 * EGASI ocha oladi va "kim kimga nima bera oladi" degan qaror unga
 * tegishli. Ikki rolning oqibati boshqalardan farq qiladi va shuning
 * uchun ular tanlanganda ekran OGOHLANTIRADI (jim o'tkazib yuborish
 * yolg'on bo'lardi):
 *   • `owner`   — TO'LIQ HUQUQ, barcha filiallarga
 *   • `student` — o'quvchi panelining yo'llari (moliyaga tegmaydi)
 *
 * ⚠️ RUXSATLAR IKKI TOMONGA AVTOMAT: rol berilganda uning standart
 * ruxsatlari qo'shiladi, olib tashlanganda esa QAYTARIB OLINADI —
 * lekin faqat qolgan rollarning birortasi ularni bermayotgan bo'lsa.
 * Qo'lda berilgan ruxsatlar tegilmaydi.
 *
 * ⚠️ TO'LIQ RO'YXAT YUBORILADI, "qo'sh"/"olib tashla" emas: qisman
 * amallarda ikkita parallel so'rov bir-birining natijasini yo'q qilardi
 * (ikkinchisi birinchisi ko'rmagan ro'yxat ustiga yozardi).
 */

/**
 * Oqibati alohida tushuntirishni talab qiladigan rollar.
 * Ular TAQIQLANMAGAN — faqat tanlanganda ogohlantirish chiqadi.
 */
const SENSITIVE = {
  owner: "Bu odam butun tizimga va barcha filiallarga to'liq huquq oladi.",
  student:
    "O'quvchi panelining yo'llari ochiladi. Hisob-faktura yoki o'qish davri yaratilmaydi.",
};

const EditUserRolesModal = () => (
  <ResponsiveModal
    name="editUserRoles"
    title="Qo'shimcha rollar"
    description="Odam bir vaqtning o'zida bir nechta rolda ishlashi mumkin"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, ...user }) => {
  const { data: roles = [] } = useRoles();
  const { mutate: setRoles } = useSetUserRoles();

  const [selected, setSelected] = useState(() => user.extraRoles ?? []);

  // Asosiy rol ro'yxatda takrorlanmasin — u allaqachon odamda bor va
  // uni "qo'shish" hech narsani o'zgartirmasdi
  // ⚠️ Faqat ASOSIY rol chiqarib tashlanadi — u allaqachon odamda bor
  // va uni "qo'shish" hech narsani o'zgartirmasdi. Boshqa cheklov yo'q.
  const options = useMemo(
    () => roles.filter((role) => role.value !== user.role),
    [roles, user.role],
  );

  // Tanlanganlar orasida oqibati alohida bo'lgani bormi
  const warnings = selected
    .filter((value) => SENSITIVE[value])
    .map((value) => ({
      value,
      name: roles.find((r) => r.value === value)?.name ?? value,
      text: SENSITIVE[value],
    }));

  const primary = roles.find((role) => role.value === user.role);

  const toggle = (value) =>
    setSelected((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setRoles(
      { id: user.id, extraRoles: selected },
      {
        onSuccess: () => {
          close();
          toast.success("Rollar saqlandi");
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Asosiy rol — o'zgarmasligi ko'rinib tursin */}
      <div className="rounded-xl bg-gray-50 px-3.5 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          Asosiy rol
        </p>
        <p className="mt-1 text-sm font-medium text-gray-900">
          {primary?.name ?? user.role}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-gray-500">
          O'zgarmaydi — hisobotlar, ish vaqti va jarimalar shunga bog'liq.
        </p>
      </div>

      {/* Qo'shimcha rollar ro'yxati */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          Qo'shimcha rollar
        </p>

        {options.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-400">
            Berish mumkin bo'lgan boshqa rol yo'q
          </p>
        ) : (
          <div className="max-h-[280px] space-y-1 overflow-y-auto">
            {options.map((role) => {
              const active = selected.includes(role.value);

              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => toggle(role.value)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left transition-colors",
                    active
                      ? "bg-indigo-50 text-indigo-900"
                      : "bg-white text-gray-700 hover:bg-gray-50",
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">
                      {role.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-gray-400">
                      {SENSITIVE[role.value]
                        ? "Kengaytirilgan huquq"
                        : `${role.usersCount ?? 0} ta xodimda asosiy rol`}
                    </span>
                  </span>

                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                      active
                        ? "border-indigo-500 bg-indigo-500 text-white"
                        : "border-gray-300 bg-white",
                    )}
                  >
                    {active && <Check className="size-3.5" strokeWidth={3} />}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ⚠️ Oqibati kuchli rollar uchun ALOHIDA ogohlantirish — u
          umumiy izohdan YUQORIDA va boshqa rangda turadi: ikkalasi
          bir xil ko'rinsa, "to'liq huquq beryapman" degan xabar
          oddiy ma'lumot bo'lib o'qilardi. */}
      {warnings.length > 0 && (
        <div className="flex gap-2 rounded-xl bg-rose-50 px-3.5 py-3">
          <ShieldAlert
            className="mt-0.5 size-4 shrink-0 text-rose-600"
            strokeWidth={2}
          />
          <div className="space-y-1 text-xs leading-relaxed text-rose-800">
            {warnings.map((item) => (
              <p key={item.value}>
                <b>{item.name}</b> — {item.text}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Nima bo'lishini oldindan aytish — "saqlash" tugmasi kutilmagan
          natija bermasligi kerak */}
      <div className="flex gap-2 rounded-xl bg-amber-50/70 px-3.5 py-3">
        <Info className="mt-0.5 size-4 shrink-0 text-amber-600" strokeWidth={2} />
        <p className="text-xs leading-relaxed text-amber-800">
          Rol berilganda uning boshlang'ich ruxsatlari{" "}
          <b>avtomatik qo'shiladi</b>, olib tashlanganda esa{" "}
          <b>avtomatik qaytarib olinadi</b>. Boshqa rol o'sha ruxsatni
          berayotgan bo'lsa, u joyida qoladi. "Ruxsatlar" tabidan qo'lda
          berilgan ruxsatlar tegilmaydi.
        </p>
      </div>

      <div className="mt-5 flex w-full flex-col-reverse gap-3.5 xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          onClick={close}
          variant="secondary"
          className="w-full xs:w-32"
        >
          Bekor qilish
        </Button>

        <Button autoFocus className="w-full xs:w-32" disabled={isLoading}>
          Saqlash
          {isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

export default EditUserRolesModal;
