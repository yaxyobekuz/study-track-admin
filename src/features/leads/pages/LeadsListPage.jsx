// React
import { useRef } from "react";

// Router
import { Link } from "react-router-dom";

// Icons
import { Eye, ListChecks, Pencil, UserPlus } from "lucide-react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Data
import {
  leadStatusLabels,
  leadStatusColors,
  leadStatusOptions,
  leadStageOptions,
} from "@/features/leads/data/leads.data";

// Utils
import { formatDateUz } from "@/shared/utils/date.utils";
import { formatPhoneUz } from "@/shared/utils/phone.utils";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import useModal from "@/shared/hooks/useModal";

// Components
import Can from "@/shared/components/guards/Can";
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import Pagination from "@/shared/components/ui/Pagination";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import SelectField from "@/shared/components/ui/select/SelectField";
import LeadStageBar from "@/features/leads/components/LeadStageBar";
import { LeadFormModal } from "@/features/leads/components/LeadFormModal";
import { LeadStageModal } from "@/features/leads/components/LeadStageModal";

// Queries
import { leadsQueries } from "@/features/leads/queries/leads.queries";

/**
 * LIDLAR RO'YXATI (Sotuvlar).
 *
 * ⚠️ IKKI XIL FILTR va ular BOSHQA-BOSHQA savol:
 *   · "Holat" — HOZIR qaysi holatda turibdi;
 *   · "Bosqich" — shu pog'onagacha YETGANLAR (to'lov qilgan bola
 *     "keldi" filtriga ham tushadi, chunki u o'sha qadamdan o'tgan).
 * Ikkalasi birga berilsa shart KESISHADI — "darsga kirgan, lekin
 * keyin yo'qolgan" degan ma'noli savol.
 */
const LeadsListPage = () => {
  const contentRef = useRef(null);
  const { openModal } = useModal();

  const { state, setField, setFields } = useObjectState({
    page: 1,
    statusFilter: "all",
    stageFilter: "all",
    sourceFilter: "all",
    search: "",
    searchInput: "",
  });

  const { data: sources = [] } = useQuery(leadsQueries.sources());

  const { data, isLoading } = useQuery(
    leadsQueries.list({
      page: state.page,
      limit: 20,
      ...(state.statusFilter !== "all" ? { status: state.statusFilter } : {}),
      ...(state.stageFilter !== "all" ? { stage: state.stageFilter } : {}),
      ...(state.sourceFilter !== "all" ? { source: state.sourceFilter } : {}),
      ...(state.search ? { search: state.search } : {}),
    }),
  );

  const leads = data?.data ?? [];
  const pagination = data?.pagination;

  const handleSearch = (event) => {
    event.preventDefault();
    setFields({ search: state.searchInput, page: 1 });
  };

  return (
    <div ref={contentRef} className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-800">
          Sotuvlar <span className="opacity-70">({pagination?.total || 0})</span>
        </h1>

        <Can do="leads.create">
          <Button onClick={() => openModal("leadForm", { lead: null })}>
            <UserPlus />
            Lid qo'shish
          </Button>
        </Can>
      </div>

      {/* Filters */}
      <Card className="space-y-4">
        <InputGroup className="grid-cols-1 sm:grid-cols-3">
          <SelectField
            label="Holat (hozir)"
            name="statusFilter"
            value={state.statusFilter}
            onChange={(v) => setFields({ statusFilter: v, page: 1 })}
            options={leadStatusOptions}
          />

          <SelectField
            label="Bosqich (yetganlar)"
            name="stageFilter"
            value={state.stageFilter}
            onChange={(v) => setFields({ stageFilter: v, page: 1 })}
            options={leadStageOptions}
          />

          <SelectField
            searchable
            label="Manba"
            name="sourceFilter"
            value={state.sourceFilter}
            onChange={(v) => setFields({ sourceFilter: v, page: 1 })}
            options={[
              { value: "all", label: "Barcha manbalar" },
              ...sources.map((s) => ({ value: s.id, label: s.name })),
            ]}
          />
        </InputGroup>

        <form onSubmit={handleSearch} className="w-full">
          <InputField
            type="search"
            label="Qidirish"
            name="search"
            value={state.searchInput}
            onChange={(e) => setField("searchInput", e.target.value)}
            placeholder="Ism, telefon yoki kelgan maktabi..."
          />
        </form>
      </Card>

      {/* Table */}
      {isLoading ? (
        <Card className="py-10 text-center text-gray-400">Yuklanmoqda...</Card>
      ) : leads.length === 0 ? (
        <Card className="py-10 text-center text-gray-400">
          Lid topilmadi.
          <Can do="leads.create">
            <span className="ml-1">
              Yuqoridagi "Lid qo'shish" tugmasi bilan ro'yxatga olish mumkin.
            </span>
          </Can>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-3 py-2.5 text-left">Ism</th>
                <th className="px-3 py-2.5 text-left">Telefon</th>
                <th className="px-3 py-2.5 text-left">Kelgan maktabi</th>
                <th className="px-3 py-2.5 text-left">Bosqich</th>
                <th className="px-3 py-2.5 text-center">Holat</th>
                <th className="px-3 py-2.5 text-left">Olib keldi</th>
                <th className="px-3 py-2.5 text-left">Mas'ul</th>
                <th className="px-3 py-2.5 text-left">Sana</th>
                <th className="px-3 py-2.5 text-center"></th>
              </tr>
            </thead>

            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-3 py-2.5">
                    <p className="font-medium text-gray-800">
                      {lead.firstName} {lead.lastName}
                    </p>
                    {lead.classInterest && (
                      <p className="text-xs text-gray-400">{lead.classInterest}</p>
                    )}
                  </td>

                  <td className="px-3 py-2.5 text-gray-600">
                    {formatPhoneUz(lead.phone)}
                    {(lead.additionalPhone || lead.parentPhone) && (
                      <span className="block text-xs text-gray-400">
                        {formatPhoneUz(lead.additionalPhone || lead.parentPhone)}
                      </span>
                    )}
                  </td>

                  <td className="px-3 py-2.5 text-gray-600">
                    {lead.previousSchool || "—"}
                  </td>

                  <td className="px-3 py-2.5">
                    <LeadStageBar stage={lead.stage} isExited={lead.isExited} />
                  </td>

                  <td className="px-3 py-2.5 text-center">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${leadStatusColors[lead.status]}`}
                    >
                      {lead.statusLabel || leadStatusLabels[lead.status]}
                    </span>
                  </td>

                  <td className="px-3 py-2.5 text-xs text-gray-500">
                    {lead.broughtBy
                      ? `${lead.broughtBy.firstName} ${lead.broughtBy.lastName ?? ""}`.trim()
                      : "—"}
                  </td>

                  <td className="px-3 py-2.5 text-xs text-gray-500">
                    {lead.assignedTo
                      ? `${lead.assignedTo.firstName} ${lead.assignedTo.lastName ?? ""}`.trim()
                      : "—"}
                  </td>

                  <td className="px-3 py-2.5 text-xs text-gray-500">
                    {formatDateUz(lead.createdAt)}
                  </td>

                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <Can do="leads.status">
                        <button
                          title="Bosqichni belgilash"
                          onClick={() => openModal("leadStage", { lead })}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-primary/10 hover:text-primary"
                        >
                          <ListChecks className="size-4" />
                        </button>
                      </Can>

                      <Can do="leads.update">
                        <button
                          title="Tahrirlash"
                          onClick={() => openModal("leadForm", { lead })}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                        >
                          <Pencil className="size-4" />
                        </button>
                      </Can>

                      <Link
                        to={`/leads/${lead.id}`}
                        title="Batafsil"
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                      >
                        <Eye className="size-4" />
                      </Link>
                    </div>
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

      <LeadFormModal />
      <LeadStageModal />
    </div>
  );
};

export default LeadsListPage;
