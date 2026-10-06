// Toast
import { toast } from "sonner";

// Utils
import { formatMoney } from "@/shared/utils/formatMoney";

/**
 * Davr yopilgan / tahrirlangandan keyin server bekor qilgan hisob-fakturalar
 * haqida xabar (`invoiceImpact.cancelled`). Bekor qilinmay qolganlari
 * (ruxsat yo'q / yiqildi) server `warnings` ida keladi.
 *
 * @param {{cancelled?: Array<object>, releasedToDeposit?: string}|null} impact
 */
export const notifyInvoiceImpact = (impact) => {
  const cancelled = impact?.cancelled ?? [];
  if (cancelled.length === 0) return;

  const months = cancelled
    .map((invoice) => `${invoice.monthLabel} (${formatMoney(invoice.amount)})`)
    .join(", ");

  const released = Number(impact.releasedToDeposit) > 0
    ? ` — to'langan ${formatMoney(impact.releasedToDeposit)} depozitga qaytdi`
    : "";

  toast.success(`Hisob-faktura bekor qilindi: ${months}${released}`);
};
