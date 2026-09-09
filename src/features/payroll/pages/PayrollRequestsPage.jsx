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
import { TabsButtons } from "@/shared/components/ui/tabs/Tabs";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Utils
import { formatDateTimeUz } from "@/shared/utils/date.utils";

// Data & queries
import {
  REQUESTS_TABS,
  REQUEST_KIND_LABELS,
  REQUEST_STATUS_META,
  REQUEST_STATUS_OPTIONS,
  REQUEST_KIND_OPTIONS,
} from "../data/payroll.data";
import { payrollQueries } from "../queries/payroll.queries";

// Modal
import PayrollRequestReviewModal from "../components/PayrollRequestReviewModal";

const REQUEST_COLUMNS = ["Xodim", "Maqsad", "Tafsilot", "Hujjat", "Sana", "Holat", ""];
const AUDIT_COLUMNS = ["Amal", "Tafsilot", "Bajardi", "Sana"];

const StatusBadge = ({ status }) => {
  const meta = REQUEST_STATUS_META[status] ?? { label: status, className: "bg-gray-100 text-gray-600" };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.className}`}>
      {meta.label}
    </span>
  );
};

// ── Zayavkalar ro'yxati ──
const RequestsView = () => {
  const { openModal } = useModal();
  const [status, setStatus] = useState("pending");
  const [kind, setKind] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery(
    payrollQueries.requests({ page, limit: 20, ...(status ? { status } : {}), ...(kind ? { kind } : {}) }),
  );

  const requests = data?.data ?? [];

  return (
    <div className="space-y-4">
      {/* Filterlar */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500">Holat</p>
          <Select
            triggerClassName="min-w-40"
            value={status}
            options={REQUEST_STATUS_OPTIONS}
            onChange={(v) => { setStatus(v); setPage(1); }}
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500">Maqsad</p>
          <Select
            triggerClassName="min-w-44"
            value={kind}
            options={REQUEST_KIND_OPTIONS}
            onChange={(v) => { setKind(v); setPage(1); }}
          />
        </div>
        {data?.pendingCount > 0 && (
          <span className="ml-auto rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
            {data.pendingCount} ta kutilmoqda
          </span>
        )}
      </div>

      {isLoading ? (
        <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>
      ) : requests.length === 0 ? (
        <Card className="p-0 xs:p-0">
          <EmptyState icon={FileClock} title="Zayavka yo'q" description="Bu filtr bo'yicha zayavka topilmadi." />
        </Card>
      ) : (
        <>
          <Table columns={REQUEST_COLUMNS}>
            {requests.map((r) => (
              <Tr key={r.id}>
                <Td className="font-medium text-gray-900">{r.staffName}</Td>
                <Td className="text-gray-600">{REQUEST_KIND_LABELS[r.kind] || r.kind}</Td>
                <Td className="text-gray-600">
                  {r.kind === "bonus"
                    ? `${r.bonusLabel || "Ustama"} — ${r.bonusValue}${r.bonusType === "percent" ? "%" : " so'm"}`
                    : r.requestedCategoryName || "—"}
                </Td>
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
                    onClick={() => openModal("reviewPayrollRequest", { request: r })}
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
    </div>
  );
};

// ── O'zgarishlar tarixi (audit) ──
const AuditView = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery(payrollQueries.audit({ page, limit: 30 }));
  const rows = data?.data ?? [];

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Oylik strukturasidagi har bir o'zgarish: lavozim maoshi, toifa biriktirish,
        ustama tasdiqlash — kim va qachon.
      </p>
      {isLoading ? (
        <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>
      ) : rows.length === 0 ? (
        <Card className="p-0 xs:p-0">
          <EmptyState icon={FileClock} title="Tarix bo'sh" description="Hali o'zgarish qayd etilmagan." />
        </Card>
      ) : (
        <>
          <Table columns={AUDIT_COLUMNS}>
            {rows.map((a) => (
              <Tr key={a.id}>
                <Td className="font-mono text-xs text-gray-500">{a.action}</Td>
                <Td className="text-gray-700">{a.summary || "—"}</Td>
                <Td className="text-gray-600">{a.actorName}</Td>
                <Td className="text-gray-500">{a.createdAtLabel || formatDateTimeUz(a.createdAt)}</Td>
              </Tr>
            ))}
          </Table>
          {data?.pagination?.totalPages > 1 && (
            <Pagination currentPage={page} totalPages={data.pagination.totalPages} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  );
};

const PayrollRequestsPage = () => {
  const [tab, setTab] = useState("requests");

  const tabs = REQUESTS_TABS.map((item) => ({
    ...item,
    content: item.value === "requests" ? <RequestsView /> : <AuditView />,
  }));

  return (
    <div className="space-y-4">
      <TabsButtons items={tabs} value={tab} onChange={setTab} contentClassName="mt-4" />
      <PayrollRequestReviewModal />
    </div>
  );
};

export default PayrollRequestsPage;
