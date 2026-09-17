// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Button from "@/shared/components/ui/button/Button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";
import { useArchiveUser } from "@/features/users/queries/users.mutations";

// Queries
import { financeQueries } from "@/features/finance/queries/finance.queries";

// Utils
import formatMoney from "@/shared/utils/formatMoney";

const NOTE_MAX = 500;

const ArchiveUserModal = () => (
  <ResponsiveModal
    name="archiveUser"
    title="Arxivlash"
    description="Foydalanuvchi asosiy ro'yxatdan yashiriladi va tizimga kira olmaydi. Ma'lumotlari o'chmaydi — keyinchalik qaytarish mumkin."
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, ...user }) => {
  const { mutate: archiveUser } = useArchiveUser();
  const { can } = usePermissions();

  const [note, setNote] = useState("");
  const [resetCoins, setResetCoins] = useState(false);
  const [resetPenalties, setResetPenalties] = useState(false);
  const [resetDebt, setResetDebt] = useState(false);

  const isStudent = user.role === "student";

  // Qarzni 0 ga tushirish — MOLIYA amali: server bekor qilish va to'g'rilash
  // huquqini birga talab qiladi, shuning uchun tugma ham shunda ko'rinadi.
  // `finance.view` — qancha qarz tushishini ko'rsatish uchun (usiz summa
  // so'rovi 403 qaytarib, "qarz yo'q" deb yolg'on ko'rsatardi)
  const canResetDebt =
    isStudent &&
    can("finance.view") &&
    can("finance.cancel") &&
    can("finance.adjust");

  // Qancha qarz 0 ga tushishini oldindan ko'rsatamiz — "belgiladim, nima
  // bo'lganini bilmayman" bo'lmasin
  const { data: finance, isLoading: isDebtLoading } = useQuery({
    ...financeQueries.studentInvoices(user.id),
    enabled: Boolean(user.id) && canResetDebt,
  });

  const debt = Number(finance?.totals?.debt ?? 0);
  const hasDebt = debt > 0;

  const handleArchiveUser = (e) => {
    e.preventDefault();
    setIsLoading(true);

    archiveUser(
      {
        id: user.id,
        data: {
          note: note.trim(),
          resetCoins,
          resetPenalties,
          resetDebt: canResetDebt && hasDebt && resetDebt,
        },
      },
      {
        onSuccess: (response) => {
          close();

          const writeOff = response?.data?.debtWriteOff;
          const name = user.fullName || "Foydalanuvchi";

          if (!writeOff || writeOff.total === 0) {
            toast.success(`${name} arxivlandi`);
            return;
          }

          if (writeOff.failed?.length > 0) {
            const months = writeOff.failed.map((f) => f.monthLabel).join(", ");
            toast.warning(
              `${name} arxivlandi, lekin ${months} qarzi 0 ga tushmadi — moliya bo'limida qo'lda to'g'rilang`,
            );
            return;
          }

          toast.success(
            `${name} arxivlandi, ${formatMoney(writeOff.amount)} qarzdorlik 0 ga tushirildi`,
          );
        },
        onError: (err) => {
          toast.error(err.response?.data?.message || "Xatolik yuz berdi");
        },
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <form onSubmit={handleArchiveUser} className="flex flex-col gap-4">
      {isStudent && (
        <p className="text-sm text-gray-500">
          O'quvchi barcha sinflardan chiqariladi. Qaytarilganda sinflar qo'lda
          belgilanadi.
        </p>
      )}

      {/* Izoh */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Izoh (ixtiyoriy)
        </label>
        <textarea
          rows={3}
          value={note}
          maxLength={NOTE_MAX}
          placeholder="Masalan: boshqa maktabga o'tdi"
          onChange={(e) => setNote(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
        />
      </div>

      {/* Reset options */}
      <div className="flex flex-col gap-2.5">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={resetCoins}
            onChange={(e) => setResetCoins(e.target.checked)}
            className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
          />
          Tangalarni 0 ga tushirish
        </label>

        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={resetPenalties}
            onChange={(e) => setResetPenalties(e.target.checked)}
            className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
          />
          Jarimalarni 0 ga tushirish
        </label>

        {canResetDebt && (
          <div className="flex flex-col gap-1">
            <label
              className={`flex items-center gap-2 text-sm ${hasDebt ? "cursor-pointer" : "cursor-not-allowed text-gray-400"}`}
            >
              <input
                type="checkbox"
                disabled={!hasDebt}
                checked={hasDebt && resetDebt}
                onChange={(e) => setResetDebt(e.target.checked)}
                className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              Moliyaviy qarzdorlikni 0 ga tushirish
              <span className={hasDebt ? "text-red-600 font-medium" : ""}>
                {isDebtLoading
                  ? "(hisoblanmoqda...)"
                  : hasDebt
                    ? `(${formatMoney(debt)})`
                    : "(qarz yo'q)"}
              </span>
            </label>

            {hasDebt && resetDebt && (
              <p className="ml-6 text-xs text-gray-500">
                To'lanmagan oylar bekor qilinadi, qisman to'langan oyda qolgan
                summa kechiriladi. To'langan pul joyida qoladi.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col-reverse gap-3.5 w-full xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          onClick={close}
          variant="secondary"
          className="w-full xs:w-32"
        >
          Bekor qilish
        </Button>

        <Button
          variant="danger"
          disabled={isLoading}
          className="w-full xs:w-32"
        >
          Arxivlash
          {isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

export default ArchiveUserModal;
