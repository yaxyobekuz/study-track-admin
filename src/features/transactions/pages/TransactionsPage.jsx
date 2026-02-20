// React
import { useState } from "react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Utils
import { formatUzDate } from "@/shared/utils/formatDate";

// Components
import Card from "@/shared/components/ui/Card";
import List from "@/shared/components/ui/List";
import LoaderCard from "@/shared/components/ui/LoaderCard";
import BottomNavbar from "@/shared/components/ui/BottomNavbar";

// API
import { coinsAPI } from "@/features/transactions/api/coins.api";

// Icons
import { Coins, ChevronLeft, ChevronRight, ArrowDownLeft } from "lucide-react";

const TransactionsPage = () => {
  const [page, setPage] = useState(1);

  const { data: balanceData } = useQuery({
    queryKey: ["coins", "balance"],
    queryFn: () => coinsAPI.getBalance().then((res) => res.data.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["coins", "transactions", page],
    queryFn: () =>
      coinsAPI.getTransactions({ page, limit: 20 }).then((res) => res.data),
    keepPreviousData: true,
  });

  const transactionItems = (data?.transactions ?? []).map((tx) => ({
    key: tx._id,
    icon: ArrowDownLeft,
    title: tx.description,
    gradientTo: "to-green-700",
    gradientFrom: "from-green-400",
    description: formatUzDate(tx.date),
    trailing: <p className="font-bold text-green-600 text-sm">+{tx.amount}</p>,
  }));

  return (
    <div className="min-h-screen pb-28 bg-gray-100 animate__animated animate__fadeIn">
      <div className="container pt-5 space-y-5">
        <h1 className="text-blue-500 font-bold text-xl">M Coin</h1>

        {/* Balans kartasi */}
        <Card title="Joriy balans">
          <div className="flex items-center justify-center gap-2 py-2">
            <Coins className="size-8 text-yellow-500" />
            <span className="text-4xl font-bold text-gray-900">
              {balanceData?.coinBalance ?? 0}
            </span>
            <span className="text-lg text-gray-400 font-medium">coin</span>
          </div>
        </Card>

        {/* Tranzaksiyalar */}
        {isLoading ? (
          <LoaderCard className="bg-transparent p-0 xs:p-0" />
        ) : !data?.transactions?.length ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <Coins className="size-10 mb-2 opacity-30" />
            <p className="text-sm">Hali tranzaksiyalar yo'q</p>
          </div>
        ) : (
          <List items={transactionItems} />
        )}

        {/* Pagination */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!data.pagination.hasPrevPage}
              className="flex items-center gap-1 text-sm text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="size-4" />
              Oldingi
            </button>
            <span className="text-xs text-gray-400">
              {data.pagination.page} / {data.pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!data.pagination.hasNextPage}
              className="flex items-center gap-1 text-sm text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Keyingi
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </div>

      <BottomNavbar />
    </div>
  );
};

export default TransactionsPage;
