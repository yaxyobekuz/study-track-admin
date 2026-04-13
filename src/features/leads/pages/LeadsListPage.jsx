// React
import { useRef } from "react";

// Router
import { Link } from "react-router-dom";

// Icons
import { Eye } from "lucide-react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// API
import { leadsAPI } from "@/features/leads/api/leads.api";

// Data
import {
  leadStatusLabels,
  leadStatusColors,
  leadStatusOptions,
} from "@/features/leads/data/leads.data";

// Utils
import { formatDateUZ } from "@/shared/utils/date.utils";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Components
import Card from "@/shared/components/ui/Card";
import Pagination from "@/shared/components/ui/Pagination";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import SelectField from "@/shared/components/ui/select/SelectField";

const LeadsListPage = () => {
  const contentRef = useRef(null);

  const { state, setField, setFields } = useObjectState({
    page: 1,
    statusFilter: "all",
    sourceFilter: "all",
    search: "",
    searchInput: "",
  });

  // Fetch sources for filter
  const { data: sourcesData } = useQuery({
    queryKey: ["lead-sources"],
    queryFn: () => leadsAPI.getSources().then((res) => res.data),
  });

  const sources = sourcesData?.data || [];

  // Fetch leads
  const { data, isLoading } = useQuery({
    queryKey: [
      "leads",
      state.page,
      state.statusFilter,
      state.sourceFilter,
      state.search,
    ],
    queryFn: () => {
      const params = { page: state.page, limit: 20 };
      if (state.statusFilter && state.statusFilter !== "all")
        params.status = state.statusFilter;
      if (state.sourceFilter && state.sourceFilter !== "all")
        params.source = state.sourceFilter;
      if (state.search) params.search = state.search;
      return leadsAPI.getAll(params).then((res) => res.data);
    },
  });

  const leads = data?.data || [];
  const pagination = data?.pagination;

  const handleSearch = (e) => {
    e.preventDefault();
    setFields({ search: state.searchInput, page: 1 });
  };

  return (
    <div ref={contentRef} className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-gray-800">
          Sotuvlar{" "}
          <span className="opacity-70">({pagination?.total || 0})</span>
        </h1>
      </div>

      {/* Filters */}
      <Card className="space-y-4">
        <InputGroup className="grid-cols-2">
          <SelectField
            label="Status"
            name="statusFilter"
            value={state.statusFilter}
            onChange={(v) => setFields({ statusFilter: v, page: 1 })}
            options={leadStatusOptions}
          />

          <SelectField
            searchable
            label="Manba"
            name="sourceFilter"
            value={state.sourceFilter}
            onChange={(v) => setFields({ sourceFilter: v, page: 1 })}
            options={[
              { value: "all", label: "Barcha manbalar" },
              ...sources.map((s) => ({ value: s._id, label: s.name })),
            ]}
          />
        </InputGroup>

        <form onSubmit={handleSearch} className="w-full">
          <InputField
            label="Qidirish"
            name="search"
            value={state.searchInput}
            onChange={(e) => setField("searchInput", e.target.value)}
            placeholder="Ism, telefon bo'yicha qidirish..."
          />
        </form>
      </Card>

      {/* Table */}
      {isLoading ? (
        <Card className="text-center py-10 text-gray-400">Yuklanmoqda...</Card>
      ) : leads.length === 0 ? (
        <Card className="text-center py-10 text-gray-400">
          Sotuvlar topilmadi
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2.5 px-3">Ism</th>
                <th className="text-left py-2.5 px-3">Telefon</th>
                <th className="text-left py-2.5 px-3">Manba</th>
                <th className="text-center py-2.5 px-3">Status</th>
                <th className="text-left py-2.5 px-3">Yaratgan</th>
                <th className="text-left py-2.5 px-3">Sana</th>
                <th className="text-center py-2.5 px-3"></th>
              </tr>
            </thead>

            <tbody>
              {leads.map((lead) => (
                <tr
                  key={lead._id}
                  className="border-b border-gray-50 hover:bg-gray-50/50"
                >
                  <td className="py-2.5 px-3">
                    <p className="text-gray-800 font-medium">
                      {lead.firstName} {lead.lastName}
                    </p>
                    {lead.classInterest && (
                      <p className="text-xs text-gray-400">
                        {lead.classInterest}
                      </p>
                    )}
                  </td>

                  <td className="py-2.5 px-3 text-gray-600">{lead.phone}</td>

                  <td className="py-2.5 px-3 text-gray-600">
                    {lead.source?.name || "-"}
                  </td>

                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${leadStatusColors[lead.status]}`}
                    >
                      {leadStatusLabels[lead.status]}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 text-gray-500 text-xs">
                    {lead.createdBy
                      ? `${lead.createdBy.firstName} ${lead.createdBy.lastName}`
                      : "-"}
                  </td>

                  <td className="py-2.5 px-3 text-gray-500 text-xs">
                    {formatDateUZ(lead.createdAt)}
                  </td>

                  <td className="py-2.5 px-3 text-center">
                    <Link
                      to={`/leads/${lead._id}`}
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <Eye size={13} />
                      Ko'rish
                    </Link>
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
          contentRef={contentRef}
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          onPageChange={(p) => setField("page", p)}
        />
      )}
    </div>
  );
};

export default LeadsListPage;
