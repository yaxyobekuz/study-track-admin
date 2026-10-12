// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { ArrowLeftRight, ArrowRight, Building2, TriangleAlert } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

// Hooks & queries
import useModal from "@/shared/hooks/useModal";
import usePermissions from "@/shared/hooks/usePermissions";
import { branchTransfersQueries } from "../queries/branchTransfers.queries";

// Components
import Button from "@/shared/components/ui/button/Button";
import BranchTransferModal from "./BranchTransferModal";

// Data
import { KIND_LABELS, MODE_LABELS } from "../data/branchTransfers.data";

const PAYROLL_STATUS = {
  unpaid: { label: "To'lanmagan", className: "text-red-700" },
  partial: { label: "Qisman", className: "text-amber-700" },
  paid: { label: "To'langan", className: "text-green-700" },
};

/**
 * Profil: filiallararo tarix, ko'chirish tugmasi va (xodimda) oylik
 * filiallar kesimida.
 *
 * Oylik kesimi — "bir filialda to'langan oylik ikkinchisida ham ko'rinsin":
 * asosiy oylik har oy BITTA filialda (egasi belgilangan), boshqa filialda
 * faqat o'sha yerda o'tilgan dars/tyutorlik. Pul o'z filialida to'lanadi,
 * bu yerda faqat ko'rinadi.
 *
 * @param {{ user: object }} props - `branchPresence` bilan (`getUserById`)
 */
const UserTransfersCard = ({ user }) => {
  const { can } = usePermissions();
  const { openModal } = useModal();
  const isStudent = user.role === "student";
  const presence = user.branchPresence;
  const isLive = presence?.live !== false;

  const { data: transfers = [] } = useQuery(branchTransfersQueries.userTransfers(user.id));
  const canPayroll = !isStudent && can("payroll.view");
  const { data: payroll } = useQuery({
    ...branchTransfersQueries.userPayroll(user.id),
    enabled: canPayroll,
  });

  // O'quvchining boshqa filiallardagi moliya tarixi. Ko'chishda OCHIQ holat
  // (qarz va depozit) o'quvchi bilan ketadi, YOPILGAN fakt (to'langan oy va
  // uning cheki) o'z filialida qoladi — u shu yerda KO'RINADI.
  const canFinance = isStudent && can("finance.view");
  const { data: finance } = useQuery({
    ...branchTransfersQueries.userFinance(user.id),
    enabled: canFinance,
  });
  const financeBranches = finance?.branches ?? [];

  const kind = isStudent ? "student" : "staff";
  const canTransfer =
    isLive &&
    !user.isArchived &&
    user.role !== "owner" &&
    can(isStudent ? "transfers.students" : "transfers.staff");
  const multiBranch = (payroll?.branches?.length ?? 0) > 1;

  if (
    isLive &&
    !canTransfer &&
    transfers.length === 0 &&
    !multiBranch &&
    financeBranches.length === 0
  ) {
    return null;
  }

  return (
    <section className="space-y-3 rounded-2xl bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold text-gray-900">Filiallar tarixi</h2>
        {canTransfer && (
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              openModal("branchTransfer", {
                kind,
                items: [{ id: user.id, label: user.fullName || `${user.firstName} ${user.lastName ?? ""}`.trim() }],
              })
            }
          >
            <ArrowLeftRight className="size-4" />
            Boshqa filialga ko'chirish
          </Button>
        )}
      </div>

      {!isLive && (
        <p className="flex gap-2 rounded-xl bg-amber-50 px-3.5 py-3 text-sm text-amber-800">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <span>
            {isStudent ? "O'quvchi" : "Xodim"} hozir "{presence?.homeBranch?.name ?? "boshqa"}" filialida.
            Bu yerda faqat shu filialdagi tarixi (baholar, davomat, to'lovlar) saqlanadi — o'zgartirish
            o'sha filialda qilinadi.
          </span>
        </p>
      )}

      {transfers.length > 0 && (
        <ul className="space-y-2">
          {transfers.map((t) => (
            <li key={t.id} className="rounded-xl border border-gray-100 px-3.5 py-2.5">
              <p className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-gray-900">
                {t.source.name}
                <ArrowRight className="size-3.5 text-gray-400" />
                {t.target.name}
                <span className="font-normal text-gray-500">
                  · {KIND_LABELS[t.kind]} · {MODE_LABELS[t.mode]}
                </span>
              </p>
              <p className="text-xs text-gray-500">
                {t.effectiveDateLabel} dan · {t.createdBy.name || "—"} · {t.reason}
              </p>
              {t.item?.warnings?.length > 0 && (
                <p className="mt-1 text-xs text-amber-700">{t.item.warnings.join("; ")}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      {canPayroll && multiBranch && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-900">Oylik filiallar kesimida</p>
          <p className="text-xs text-gray-500">
            Asosiy oylik har oy faqat bitta filialda hisoblanadi; boshqa filialda faqat u yerda
            o'tilgan dars va tyutorlik.
          </p>
          <div className="divide-y rounded-xl border border-gray-100">
            {payroll.months.map((m) => (
              <div key={m.month} className="space-y-1 px-3.5 py-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-gray-900">{m.monthLabel}</span>
                  {m.owner && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] text-blue-700">
                      <Building2 className="size-3" />
                      Asosiy oylik: {m.owner.name}
                    </span>
                  )}
                </div>
                {m.branches.length === 0 ? (
                  <p className="text-xs text-gray-500">Oylik shakllanmagan</p>
                ) : (
                  m.branches.map((b) => {
                    const status = PAYROLL_STATUS[b.status] ?? PAYROLL_STATUS.unpaid;
                    return (
                      <p key={b.branch.id} className="flex flex-wrap justify-between gap-2 text-xs text-gray-600">
                        <span>
                          {b.branch.name}
                          {b.isCurrent && " (shu filial)"}
                        </span>
                        <span>
                          {formatMoney(b.amount)} ·{" "}
                          <span className={cn("font-medium", status.className)}>
                            {status.label}
                            {b.status === "partial" && ` (${formatMoney(b.paidAmount)})`}
                          </span>
                        </span>
                      </p>
                    );
                  })
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {financeBranches.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-900">Boshqa filiallardagi moliya tarixi</p>
          <p className="text-xs text-gray-500">
            Ko'chishda qarz va depozit o'quvchi bilan ketadi; to'langan oylar va ularning cheklari
            esa o'sha filialda qoladi — pul o'sha kassaga tushgan. Bu yerda ular faqat ko'rinadi.
          </p>
          <div className="divide-y rounded-xl border border-gray-100">
            {financeBranches.map((row) => (
              <div key={row.branch.id} className="space-y-1.5 px-3.5 py-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-900">
                    <Building2 className="size-3.5 text-gray-400" />
                    {row.branch.name}
                  </span>
                  {row.totals && (
                    <span className="text-xs text-gray-600">
                      To'langan: {formatMoney(row.totals.paid)}
                      {row.totals.debt !== "0.00" && (
                        <span className="ml-2 font-medium text-red-700">
                          Qarz: {formatMoney(row.totals.debt)}
                        </span>
                      )}
                      {row.totals.deposit !== "0.00" && (
                        <span className="ml-2 font-medium text-blue-700">
                          Depozit: {formatMoney(row.totals.deposit)}
                        </span>
                      )}
                    </span>
                  )}
                </div>
                {row.error ? (
                  <p className="text-xs text-amber-700">{row.error}</p>
                ) : (
                  <p className="text-xs text-gray-500">
                    {row.invoices.length} ta oy · {row.payments.length} ta chek
                    {row.payments[0] && ` · oxirgi to'lov ${row.payments[0].paidAtLabel}`}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {canTransfer && <BranchTransferModal />}
    </section>
  );
};

export default UserTransfersCard;
