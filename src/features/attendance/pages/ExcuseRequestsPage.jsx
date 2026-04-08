import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import Select from "@/shared/components/ui/select/Select";
import Pagination from "@/shared/components/ui/Pagination";

import { attendanceAPI } from "../api/attendance.api";
import ExcuseRequestsTable from "../components/ExcuseRequestsTable";

const EXCUSE_STATUS_OPTIONS = [
  { label: "Barcha so'rovlar", value: "all" },
  { label: "Kutilmoqda", value: "pending" },
  { label: "Tasdiqlangan", value: "approved" },
  { label: "Rad etilgan", value: "rejected" },
];

const ExcuseRequestsPage = () => {
  const [status, setStatus] = useState("pending");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["attendance", "excuses", { status, page }],
    queryFn: () =>
      attendanceAPI
        .getAllExcuses({ status: status || undefined, page, limit: 20 })
        .then((r) => r.data),
  });

  const excuses = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      {/* Top */}
      <div className="flex items-center justify-between">
        <h1 className="page-title">Uzrli so'rovlar</h1>

        <Select
          label="Holat"
          triggerClassName="w-40"
          value={status || "all"}
          options={EXCUSE_STATUS_OPTIONS}
          onChange={(v) => {
            setStatus(v === "all" ? "" : v);
            setPage(1);
          }}
        />
      </div>

      <ExcuseRequestsTable excuses={excuses} isLoading={isLoading} />

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};

export default ExcuseRequestsPage;
