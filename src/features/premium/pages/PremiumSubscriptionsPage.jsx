// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// Router
import { useSearchParams } from "react-router-dom";

// Icons
import {
  Crown,
  Coins,
  Clock,
  Users,
  Download,
  Plus,
  Ban,
  Calculator,
} from "lucide-react";

// API
import { premiumAPI } from "@/features/premium/api/premium.api";

// Data
import {
  subscriptionStatusOptions,
  subscriptionSourceOptions,
  statusLabels,
  statusColors,
  sourceLabels,
} from "../data/premium.data";

// Helpers
import { formatDateUZ } from "@/shared/utils/date.utils";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import Pagination from "@/shared/components/ui/Pagination";
import InputField from "@/shared/components/ui/input/InputField";
import SelectField from "@/shared/components/ui/select/SelectField";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Modals
import GrantPremiumModal from "../components/GrantPremiumModal";

// Tanstack Query
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const StatCard = ({ icon: Icon, label, value, color }) => (
  <Card className="flex items-center gap-3.5">
    <div
      className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${color}`}
    >
      <Icon className="size-5" strokeWidth={1.5} />
    </div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-bold text-gray-900">{value}</p>
    </div>
  </Card>
);

const PremiumSubscriptionsPage = () => {
  const queryClient = useQueryClient();
  const { openModal } = useModal();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const statusFilter = searchParams.get("status") || "all";
  const sourceFilter = searchParams.get("source") || "all";

  // Tanga -> so'm kalkulyatori uchun kurs (default 60 so'm)
  const [coinRate, setCoinRate] = useState(60);

  // ─── Statistika ───────────────────────────────────────────────────
  const { data: stats } = useQuery({
    queryKey: ["premium", "stats"],
    queryFn: () => premiumAPI.getStats().then((res) => res.data.data),
  });

  const totalSpentCoins = stats?.totalRevenue ?? 0;
  const formatNumber = (n) => new Intl.NumberFormat("uz-UZ").format(n || 0);

  // ─── Obunalar ro'yxati ────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: [
      "premium",
      "subscriptions",
      currentPage,
      statusFilter,
      sourceFilter,
    ],
    queryFn: () => {
      const params = { page: currentPage, limit: 20 };
      if (statusFilter !== "all") params.status = statusFilter;
      if (sourceFilter !== "all") params.source = sourceFilter;
      return premiumAPI.getSubscriptions(params).then((res) => res.data);
    },
  });

  const subscriptions = data?.data || [];
  const pagination = data?.pagination;

  const revokeMutation = useMutation({
    mutationFn: (studentId) => premiumAPI.revoke({ studentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["premium"] });
      toast.success("Premium bekor qilindi");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
  });

  const setFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") params.set(key, value);
    else params.delete(key);
    params.set("page", "1");
    setSearchParams(params);
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    setSearchParams(params);
  };

  const handleExport = async () => {
    try {
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (sourceFilter !== "all") params.source = sourceFilter;

      const response = await premiumAPI.exportSubscriptions(params);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `premium_obunalar_${new Date().toISOString().split("T")[0]}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Excel yuklab olishda xatolik");
    }
  };

  const handleRevoke = (sub) => {
    const studentId = sub.student?._id;
    if (!studentId) return;
    if (!confirm("Ushbu o'quvchining premiumini bekor qilasizmi?")) return;
    revokeMutation.mutate(studentId);
  };

  const formatName = (student) => {
    if (!student) return "-";
    return student.lastName
      ? `${student.firstName} ${student.lastName}`
      : student.firstName;
  };

  return (
    <div className="space-y-4">
      {/* Top */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="page-title">Premium hisoboti</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="outline" onClick={handleExport}>
            <Download />
            Excel
          </Button>
          <Button onClick={() => openModal("grantPremium")}>
            <Plus />
            Premium berish
          </Button>
        </div>
      </div>

      {/* Statistika */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Crown}
          label="Faol obunalar"
          value={stats?.activeCount ?? "-"}
          color="bg-yellow-100 text-yellow-600"
        />
        <StatCard
          icon={Coins}
          label="Sarflangan tangalar"
          value={stats ? formatNumber(totalSpentCoins) : "-"}
          color="bg-green-100 text-green-600"
        />
        <StatCard
          icon={Clock}
          label="7 kunda tugaydi"
          value={stats?.expiringSoon ?? "-"}
          color="bg-orange-100 text-orange-600"
        />
        <StatCard
          icon={Users}
          label="Jami obunalar"
          value={stats?.totalSubscriptions ?? "-"}
          color="bg-blue-100 text-blue-600"
        />
      </div>

      {/* Sarflangan tangalar kalkulyatori */}
      <Card
        className="space-y-4"
        title="Sarflangan tangalar kalkulyatori"
        icon={<Calculator className="size-5 text-green-600" />}
      >
        <div className="flex flex-wrap items-end gap-3">
          <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm">
            <span className="text-gray-500">Tangalar: </span>
            <span className="font-semibold text-gray-900">
              {formatNumber(totalSpentCoins)}
            </span>
          </div>

          <span className="pb-2 text-lg text-gray-400">×</span>

          <InputField
            min="0"
            type="number"
            className="w-32"
            value={coinRate}
            onChange={(e) => setCoinRate(Math.max(0, Number(e.target.value)))}
          />

          <span className="pb-2 text-lg text-gray-400">=</span>

          <div className="rounded-lg bg-green-50 px-3 py-2 text-sm">
            <span className="text-green-700">Qiymati: </span>
            <span className="font-bold text-green-700">
              {formatNumber(totalSpentCoins * coinRate)} so'm
            </span>
          </div>
        </div>
      </Card>

      {/* Filtrlar */}
      <div className="flex items-end gap-4 flex-wrap">
        <SelectField
          label="Holat"
          className="w-auto"
          value={statusFilter}
          onChange={(v) => setFilter("status", v)}
          options={subscriptionStatusOptions}
        />
        <SelectField
          label="Manba"
          className="w-auto"
          value={sourceFilter}
          onChange={(v) => setFilter("source", v)}
          options={subscriptionSourceOptions}
        />
      </div>

      {/* Ro'yxat */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : subscriptions.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-sm text-gray-500">Obunalar topilmadi</p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg">
          <table className="text-sm w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="py-2.5 px-3">O'quvchi</th>
                <th className="py-2.5 px-3">Manba</th>
                <th className="py-2.5 px-3">Narx</th>
                <th className="py-2.5 px-3">Boshlangan</th>
                <th className="py-2.5 px-3">Tugaydi</th>
                <th className="py-2.5 px-3">Holat</th>
                <th className="py-2.5 px-3">Harakat</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => (
                <tr key={sub._id} className="border-b border-gray-50">
                  <td className="py-2.5 px-3">
                    <p className="font-medium text-gray-800">
                      {formatName(sub.student)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {sub.student?.username || "-"}
                    </p>
                  </td>
                  <td className="py-2.5 px-3 text-xs text-gray-600">
                    {sourceLabels[sub.source] || sourceLabels.purchase}
                  </td>
                  <td className="py-2.5 px-3 text-xs">
                    {sub.coinCost > 0 ? (
                      <span className="inline-flex items-center gap-1 text-yellow-700">
                        <Coins className="size-3" />
                        {sub.coinCost}
                      </span>
                    ) : (
                      <span className="text-gray-400">Bepul</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-xs text-gray-500">
                    {formatDateUZ(sub.startDate)}
                  </td>
                  <td className="py-2.5 px-3 text-xs text-gray-500">
                    {formatDateUZ(sub.endDate)}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${statusColors[sub.status]}`}
                    >
                      {statusLabels[sub.status]}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    {sub.status === "active" && (
                      <button
                        onClick={() => handleRevoke(sub)}
                        className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                        title="Bekor qilish"
                      >
                        <Ban size={14} />
                        Bekor qilish
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* Modals */}
      <GrantPremiumModal />
    </div>
  );
};

export default PremiumSubscriptionsPage;
