// Icons
import { ShieldCheck, Sparkles } from "lucide-react";

// Components
import InfoCard from "./InfoCard";

// Hooks
import useAuth from "@/shared/hooks/useAuth";
import useModal from "@/shared/hooks/useModal";

// Queries
import { useRoles } from "@/features/roles/queries/roles.queries";

// Data
import { getRoleBadgeClass } from "../../data/users.data";

/**
 * KO'P ROLLILIK KARTASI — "bu odam yana nima qila oladi".
 *
 * ⚠️ ASOSIY ROL VA QO'SHIMCHA ROLLAR — IKKI XIL NARSA va karta buni
 * ko'rsatib turishi kerak.
 *
 *   ASOSIY (`role`)      — odamning KIM ekani. Profil, ro'yxatdagi
 *                          yorliq, hisobotlardagi kesim, ish vaqti va
 *                          jarima summasi — hammasi shundan chiqadi.
 *                          Uni bu yerdan o'zgartirib bo'lmaydi.
 *   QO'SHIMCHA (`extraRoles`) — odam yana NIMA QILA OLADI. Faqat
 *                          avtorizatsiyaga ta'sir qiladi: "o'qituvchi
 *                          bo'lib qolib, ma'muriyat bo'limlariga ham
 *                          kira olsin".
 *
 * Ikkalasini bitta ro'yxatga qo'shib qo'ysak, "bu odam kim" degan
 * savolga javob yo'qolardi — hisobotlarda bir odam ikki marta
 * sanalardi.
 *
 * ⚠️ FAQAT OWNER TAHRIRLAYDI. Server ham shuni talab qiladi
 * (`authorize(ROLES.OWNER)`), bu yerdagi tekshiruv esa faqat UI
 * qatlami: rol berish — ruxsat berishdan KUCHLIROQ amal, chunki u
 * o'sha rolga bog'langan hamma joyni birdan ochadi.
 *
 * ⚠️ FILIALGA XOS. Rollar `permissions` bilan bir xil qoidaga
 * bo'ysunadi: odam Chilonzorda o'qituvchi + kassir, Yunusobodda esa
 * faqat o'qituvchi bo'lishi mumkin. Karta JORIY filialdagi holatni
 * ko'rsatadi — buni sarlavha ostidagi izoh aytadi.
 *
 * @param {object} props
 * @param {object} props.user
 */
const UserRolesCard = ({ user }) => {
  const { user: actor } = useAuth();
  const { openModal } = useModal();
  const { data: roles = [] } = useRoles();

  const isOwner = actor?.role === "owner";
  const extraRoles = user.extraRoles ?? [];

  const labelOf = (value) =>
    roles.find((role) => role.value === value)?.name ?? value;

  return (
    <InfoCard
      title="Rollar"
      canEdit={isOwner}
      // ⚠️ `editPermission` ATAYLAB `users.update` EMAS. Tahrirlash
      // huquqi bu kartani ochmasligi kerak — `Can` uni baribir
      // owner'dan boshqa hech kimga ko'rsatmaydi (katalogda "roles"
      // kaliti yo'q, ya'ni `can("roles")` faqat owner uchun `true`).
      editPermission="roles"
      onEdit={() => openModal("editUserRoles", user)}
    >
      <div className="space-y-4">
        {/* ── Asosiy rol ─────────────────────────────────────────── */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Asosiy rol
          </p>

          <div className="mt-2 flex items-center gap-2">
            <ShieldCheck className="size-4 text-gray-400" strokeWidth={1.75} />
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${getRoleBadgeClass(user.role)}`}
            >
              {labelOf(user.role)}
            </span>
          </div>

          <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
            Odamning kim ekani — profil, hisobotlar va ish vaqti shundan
            olinadi. Uni faqat xodimni qayta yaratish orqali o'zgartirish
            mumkin.
          </p>
        </div>

        {/* ── Qo'shimcha rollar ──────────────────────────────────── */}
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Qo'shimcha rollar
          </p>

          {extraRoles.length > 0 ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {extraRoles.map((value) => (
                <span
                  key={value}
                  className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700"
                >
                  <Sparkles className="size-3" strokeWidth={2} />
                  {labelOf(value)}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-gray-400">Qo'shimcha rol berilmagan</p>
          )}

          <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
            Faqat kirish huquqiga ta'sir qiladi va joriy filialga tegishli.
            Rol berilganda uning ruxsatlari avtomatik qo'shiladi, olib
            tashlanganda avtomatik qaytarib olinadi.
          </p>
        </div>
      </div>
    </InfoCard>
  );
};

export default UserRolesCard;
