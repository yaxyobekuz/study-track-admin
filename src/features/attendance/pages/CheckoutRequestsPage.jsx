// React
import { useState } from "react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { Clock } from "lucide-react";

// Components
import Select from "@/shared/components/ui/select/Select";
import Pagination from "@/shared/components/ui/Pagination";
import CheckoutRequestsTable from "../components/CheckoutRequestsTable";
import ReviewCheckoutRequestModal from "../components/ReviewCheckoutRequestModal";

// Queries
import { attendanceQueries } from "../queries/attendance.queries";

// Data
import { CHECKOUT_REQUEST_STATUS_OPTIONS } from "../data/attendance.data";

/**
 * KETISH SO'ROVLARI — o'qituvchi bugungi ishlarini (baho, topshiriq)
 * tugatmay ketmoqchi bo'lsa, sabab yozib ruxsat so'raydi. Rahbar shu yerda
 * tasdiqlaydi yoki rad etadi; o'qituvchi panelida javob darhol ko'rinadi.
 *
 * ⚠️ So'rov FAQAT O'SHA KUN uchun: kechagi kutilayotgan so'rovni tasdiqlash
 * ketishni ochmaydi (u kun o'tib ketgan), faqat qarorni qayd etadi.
 */
const CheckoutRequestsPage = () => {
  const [status, setStatus] = useState("pending");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery(
    attendanceQueries.checkoutRequests({ status, page, limit: 20 }),
  );

  const requests = data?.data ?? [];
  const pagination = data?.pagination;
  const pendingCount = data?.pendingCount ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        {/* Bugun javob kutayotganlar */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="size-4" strokeWidth={1.5} />
          {pendingCount > 0 ? (
            <span>
              Bugun javob kutayotgan so'rovlar:{" "}
              <b className="text-yellow-700">{pendingCount}</b>
            </span>
          ) : (
            <span>Bugun javob kutayotgan so'rov yo'q</span>
          )}
        </div>

        <Select
          label="Holat"
          triggerClassName="w-44"
          value={status}
          options={CHECKOUT_REQUEST_STATUS_OPTIONS}
          onChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        />
      </div>

      <CheckoutRequestsTable requests={requests} isLoading={isLoading} />

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
        />
      )}

      <ReviewCheckoutRequestModal />
    </div>
  );
};

export default CheckoutRequestsPage;
