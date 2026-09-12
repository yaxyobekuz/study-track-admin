// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import { Download, FileSpreadsheet, Lock, Users, Wallet } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import EmptyState from "@/shared/components/ui/EmptyState";
import { Label } from "@/shared/components/shadcn/label";
import SelectSearch from "@/shared/components/ui/select/SelectSearch";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";

// Utils
import { formatMoney } from "@/shared/utils/formatMoney";

// Queries & API
import { financeQueries } from "../queries/finance.queries";
import { invoicesAPI } from "../api/invoices.api";
import { classesQueries } from "@/features/classes/queries/classes.queries";

/**
 * HISOBLAR — moliyaviy hisobotlar va Excel eksporti markazi.
 *
 * Hozircha: qarzdorlar hisoboti. Butun maktab yoki bitta sinf tanlab,
 * telefon/sinf/hisoblangan/to'langan/qolgan qarz bilan chiroyli xlsx qilib
 * yuklab olinadi. Ma'lumot manbai qarzdorlar sahifasi bilan bir xil.
 */
const ReportsPage = () => {
  const { can } = usePermissions();
  const allowed = can("debtors.view");

  const [classId, setClassId] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: classes = [] } = useQuery(classesQueries.list());

  // Tanlangan qamrov bo'yicha qisqa oldindan ko'rinish (nechta qarzdor, jami)
  const { data: preview } = useQuery({
    ...financeQueries.debtors({ page: 1, limit: 1, ...(classId ? { classId } : {}) }),
    enabled: allowed,
  });

  const totals = preview?.totals;
  const scopeLabel =
    classes.find((c) => c.id === classId)?.name || "Butun maktab";

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await invoicesAPI.exportDebtors(
        classId ? { classId } : {},
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const today = new Date().toISOString().split("T")[0];
      const safeScope = scopeLabel.replace(/[^\p{L}\p{N}_-]+/gu, "-");
      link.download = `qarzdorlar_${safeScope}_${today}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Excel yuklab olindi");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Excel yuklab olishda xatolik",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  if (!allowed) {
    return (
      <Card className="p-0 xs:p-0">
        <EmptyState
          icon={Lock}
          title="Ruxsat yo'q"
          description="Hisobotlarni ko'rish uchun ruxsatingiz yo'q. Kerak bo'lsa administratordan so'rang."
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card title="Qarzdorlar hisoboti">
        <p className="mb-4 text-sm text-gray-500">
          Qarzdorlar ro'yxatini Excel qilib yuklab oling: ism, familiya, sinf,
          telefon, ota-ona telefoni, hisoblangan, to'langan va qolgan qarz.
          Butun maktab yoki bitta sinf bo'yicha.
        </p>

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex w-full flex-col gap-2 xs:w-64">
            <Label htmlFor="reportClass">Qamrov</Label>
            <SelectSearch
              id="reportClass"
              value={classId}
              placeholder="Butun maktab"
              onChange={setClassId}
              options={classes.map((c) => ({ label: c.name, value: c.id }))}
            />
          </div>

          <Button onClick={handleDownload} disabled={isDownloading}>
            <Download />
            {isDownloading ? "Yuklanmoqda..." : "Excel yuklab olish"}
          </Button>
        </div>

        {/* Tanlangan qamrov bo'yicha qisqa oldindan ko'rinish */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl bg-red-50 p-3">
            <span className="rounded-lg bg-red-100 p-2 text-red-600">
              <Wallet className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-gray-500">{scopeLabel} — jami qarz</p>
              <p className="truncate text-lg font-semibold text-gray-900">
                {formatMoney(totals?.totalDebt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-amber-50 p-3">
            <span className="rounded-lg bg-amber-100 p-2 text-amber-600">
              <Users className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Qarzdorlar soni</p>
              <p className="truncate text-lg font-semibold text-gray-900">
                {totals?.debtorCount ?? 0} ta
              </p>
            </div>
          </div>
        </div>

        {totals?.debtorCount === 0 && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-gray-50 p-3 text-sm text-gray-500">
            <FileSpreadsheet className="size-4 shrink-0" />
            {scopeLabel} bo'yicha qarzdor yo'q — yuklab olinadigan ma'lumot bo'sh
            bo'ladi.
          </div>
        )}
      </Card>
    </div>
  );
};

export default ReportsPage;
