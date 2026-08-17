// Router
import { useNavigate } from "react-router-dom";

// Icons
import {
  Archive,
  ArchiveRestore,
  Eye,
  Key,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";

// Components
import Can from "@/shared/components/guards/Can";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/shadcn/dropdown-menu";

// Hooks
import useModal from "@/shared/hooks/useModal";

/**
 * Foydalanuvchi ustidagi harakatlar: parolni ko'rish tugmasi + qolgan hamma
 * narsa uchun vertikal three-dot menyu.
 *
 * Nega ikkiga bo'lingan: parolni ko'rish — kundalik, bir bosishlik amal;
 * tahrirlash/arxivlash/o'chirish esa kamdan-kam va qaytarib bo'lmaydigan,
 * shuning uchun ular menyu ichida — tasodifan bosilmaydi.
 *
 * Menyu `modal={false}` bilan ishlaydi: Radix aks holda `body` ga
 * `pointer-events: none` qo'yadi va menyudan ochilgan modal bloklanib qoladi.
 *
 * @param {object} props
 * @param {object} props.user - foydalanuvchi obyekti
 * @param {boolean} [props.isArchived] - arxiv ro'yxatidami (arxivdan qaytarish uchun)
 * @param {boolean} [props.showEdit] - "Tahrirlash" (detal sahifada keraksiz)
 * @param {string} [props.redirectAfterDelete] - o'chirilgandan keyingi manzil
 */
const UserRowActions = ({
  user,
  isArchived = false,
  showEdit = true,
  redirectAfterDelete,
}) => {
  const navigate = useNavigate();
  const { openModal } = useModal();

  const isStudent = user.role === "student";
  const isOwner = user.role === "owner";

  return (
    <div className="flex items-center justify-end gap-1">
      {/* Parolni ko'rish — eng ko'p ishlatiladigan amal, shuning uchun ochiq */}
      <Can do="users.password">
        <button
          type="button"
          title="Parolni ko'rish"
          onClick={() => openModal("viewUserPassword", user)}
          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <Eye className="size-4" strokeWidth={1.75} />
        </button>
      </Can>

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            title="Qo'shimcha harakatlar"
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 data-[state=open]:bg-gray-100 data-[state=open]:text-gray-600"
          >
            <MoreVertical className="size-4" strokeWidth={1.75} />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="min-w-44">
          {showEdit && (
            <Can do="users.update">
              <DropdownMenuItem onSelect={() => navigate(`/users/${user.id}`)}>
                <Pencil />
                Tahrirlash
              </DropdownMenuItem>
            </Can>
          )}

          <Can do="users.password">
            <DropdownMenuItem
              onSelect={() => openModal("resetUserPassword", user)}
            >
              <Key />
              Parolni tiklash
            </DropdownMenuItem>
          </Can>

          {/* Owner'ni o'chirib ham, arxivlab ham bo'lmaydi — server rad etadi */}
          {!isOwner && (
            <>
              <DropdownMenuSeparator />

              {/* Arxivlash — xodimda ham, o'quvchida ham bor. Arxivlangan
                  foydalanuvchi tizimga kira olmaydi, lekin uning davomati va
                  tarixi hisobotlarda qolaveradi. */}
              {isArchived ? (
                <Can do="users.restore">
                  <DropdownMenuItem
                    onSelect={() => openModal("restoreUser", user)}
                  >
                    <ArchiveRestore />
                    Arxivdan qaytarish
                  </DropdownMenuItem>
                </Can>
              ) : (
                <Can do="users.archive">
                  <DropdownMenuItem
                    onSelect={() => openModal("archiveUser", user)}
                  >
                    <Archive />
                    Arxivlash
                  </DropdownMenuItem>
                </Can>
              )}

              {/* Butunlay o'chirish faqat xodimda: o'quvchining ma'lumotlari
                  boshqa bo'limlarga bog'liq, server ham uni rad etadi */}
              {!isStudent && (
                <Can do="users.delete">
                  <DropdownMenuItem
                    onSelect={() =>
                      openModal("deleteUser", {
                        ...user,
                        redirectTo: redirectAfterDelete,
                      })
                    }
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 />
                    O'chirish
                  </DropdownMenuItem>
                </Can>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserRowActions;
