// React
import { useState } from "react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { Paperclip, Eye, FileClock } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Table, { Td, Tr } from "@/shared/components/ui/Table";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import Pagination from "@/shared/components/ui/Pagination";
import EmptyState from "@/shared/components/ui/EmptyState";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Utils
import { formatDateTimeUz } from "@/shared/utils/date.utils";
import { formatMoney } from "@/shared/utils/formatMoney";

// Data & queries
import {
  REQUEST_TYPE_LABELS,
  REQUEST_STATUS_META,
  REQUEST_STATUS_OPTIONS,
  REQUEST_TYPE_OPTIONS,
} from "../data/payroll.data";
import { payrollQueries } from "../queries/payroll.queries";

// Modal
import SalaryRequestReviewModal from "../components/SalaryRequestReviewModal";

const COLUMNS = ["Xodim", "Turi", "Taklif / izoh", "Hujjat", "Sana", "Holat", ""];

const StatusBadge = ({ status }) => {
  const meta =
    REQUEST_STATUS_META[status] ?? { label: status, className: "bg-gray-100 text-gray-600" };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.className}`}>
      {meta.label}
    </span>
  );
};

const proposalText = (r) => {
  if (r.proposedHourlyRate) return `${formatMoney(r.proposedHourlyRate)} / soat`;
  if (r.proposedAmount) return formatMoney(r.proposedAmount);
  return r.reason || "—";
};

const SalaryRequestsPage = () => {
  const { openModal } = useModal();
  const [status, setStatus] = useState("pending");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery(
    payrollQueries.salaryRequests({
      page,
      limit: 20,
      ...(status ? { status } : {}),
      ...(type ? { type } : {}),
    }),
  );

  const requests = data?.data ?? [];

  return (
    <div className="space-y-4">
      {/* Filtrlar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-3 ring-1 ring-gray-100 xs:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Select
            triggerClassName="min-w-40"
            value={status}
            options={REQUEST_STATUS_OPTIONS}
            onChange={(v) => { setStatus(v); setPage(1); }}
          />
          <Select
            triggerClassName="min-w-40"
            value={type}
            options={REQUEST_TYPE_OPTIONS}
            onChange={(v) => { setType(v); setPage(1); }}
          />
        </div>
        {data?.pendingCount > 0 && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
            {data.pendingCount} ta kutilmoqda
          </span>
        )}
      </div>

      {isLoading ? (
        <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>
      ) : requests.length === 0 ? (
        <Card className="p-0 xs:p-0">
          <EmptyState icon={FileClock} title="So'rov yo'q" description="Bu filtr bo'yicha oylik so'rovi topilmadi." />
        </Card>
      ) : (
        <>
          <Table columns={COLUMNS}>
            {requests.map((r) => (
              <Tr key={r.id}>
                <Td className="font-medium text-gray-900">{r.staffName}</Td>
                <Td className="text-gray-600">{REQUEST_TYPE_LABELS[r.type] || r.type}</Td>
                <Td className="max-w-xs truncate text-gray-600">{proposalText(r)}</Td>
                <Td>
                  {r.attachments?.length > 0 ? (
                    <span className="inline-flex items-center gap-1 text-gray-500">
                      <Paperclip className="size-3.5" /> {r.attachments.length}
                    </span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </Td>
                <Td className="text-gray-500">{formatDateTimeUz(r.createdAt)}</Td>
                <Td><StatusBadge status={r.status} /></Td>
                <Td>
                  <Button
                    size="sm"
                    variant={r.status === "pending" ? "default" : "outline"}
                    onClick={() => openModal("reviewSalaryRequest", { request: r })}
                  >
                    <Eye className="size-4" />
                    {r.status === "pending" ? "Ko'rish" : "Batafsil"}
                  </Button>
                </Td>
              </Tr>
            ))}
          </Table>
          {data?.pagination?.totalPages > 1 && (
            <Pagination currentPage={page} totalPages={data.pagination.totalPages} onPageChange={setPage} />
          )}
        </>
      )}

      <SalaryRequestReviewModal />
    </div>
  );
};

export default SalaryRequestsPage;
