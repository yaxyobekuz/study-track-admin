// TanStack Query
import { useQuery } from "@tanstack/react-query";

// React
import { useState } from "react";

// Router
import { useSearchParams } from "react-router-dom";

// Icons
import { Trash2, MessageSquareReply, MessageSquareWarning } from "lucide-react";

// Utils
import { formatDateTimeUz } from "@/shared/utils/date.utils";

// Hooks
import useModal from "@/shared/hooks/useModal";
import usePermissions from "@/shared/hooks/usePermissions";

// Queries
import {
  issuesQueries,
  useActiveIssueCategories,
} from "../queries/issues.queries";

// Data
import {
  ISSUE_STATUS_TABS,
  issueStatusColors,
  issueStatusLabels,
  issueAuthorKindColors,
  issueAuthorKindLabels,
  issueAuthorKindOptions,
} from "../data/issues.data";

// Components
import Card from "@/shared/components/ui/Card";
import EmptyState from "@/shared/components/ui/EmptyState";
import Button from "@/shared/components/ui/button/Button";
import Pagination from "@/shared/components/ui/Pagination";
import InputField from "@/shared/components/ui/input/InputField";
import SelectField from "@/shared/components/ui/select/SelectField";
import { TabsButtons } from "@/shared/components/ui/tabs/Tabs";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import ReviewIssueForm from "../components/ReviewIssueForm";
import DeleteIssueForm from "../components/DeleteIssueForm";

const PAGE_SIZE = 20;

/**
 * "Muammolar" tabi — botdan kelgan murojaatlar ro'yxati.
 *
 * Filtrlar URL'da: muammoni aniq kesim bilan link qilib yuborish mumkin
 * ("yangilar, texnika kategoriyasi") va sahifa yangilanganda filtr
 * yo'qolmaydi — jarimalar ro'yxati bilan ayni naqsh.
 */
const IssuesPage = () => {
  const { openModal } = useModal();
  const { can } = usePermissions();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const status = searchParams.get("status") || "all";
  const categoryId = searchParams.get("categoryId") || "all";
  const authorKind = searchParams.get("authorKind") || "all";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const search = searchParams.get("search") || "";
  const [searchInput, setSearchInput] = useState(search);

  const { data: categories = [] } = useActiveIssueCategories();
  const { data: counts } = useQuery(issuesQueries.counts());

  const { data, isLoading } = useQuery(
    issuesQueries.list({
      page: currentPage,
      limit: PAGE_SIZE,
      ...(status !== "all" && { status }),
      ...(categoryId !== "all" && { categoryId }),
      ...(authorKind !== "all" && { authorKind }),
      ...(from && { from }),
      ...(to && { to }),
      ...(search && { search }),
    }),
  );

  const issues = data?.data ?? [];
  const pagination = data?.pagination;

  /** Filtr o'zgarsa sahifa BIRGA QAYTADI — aks holda bo'sh sahifa chiqardi. */
  const setParam = (key, value, { resetPage = true } = {}) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") params.set(key, value);
    else params.delete(key);
    if (resetPage) params.set("page", "1");
    setSearchParams(params);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setParam("search", searchInput);
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    setSearchParams(params);
  };

  const clearDates = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("from");
    params.delete("to");
    params.set("page", "1");
    setSearchParams(params);
  };

  // Tab yorliqlariga sanoq qo'shiladi; sanoq hali kelmagan bo'lsa yorliq
  // raqamsiz turadi (nol deb ko'rsatish yolg'on bo'lardi).
  const statusTabs = ISSUE_STATUS_TABS.map((tab) => ({
    value: tab.value,
    label:
      counts?.[tab.countKey] != null
        ? `${tab.label} (${counts[tab.countKey]})`
        : tab.label,
  }));

  const categoryOptions = [
    { label: "Barcha kategoriyalar", value: "all" },
    ...categories.map((c) => ({ label: c.name, value: c.id })),
  ];

  return (
    <div className="space-y-4">
      {/* Holat tablari */}
      <TabsButtons
        items={statusTabs}
        value={status}
        onChange={(value) => setParam("status", value)}
        listClassName="max-w-full justify-start overflow-x-auto hidden-scrollbar"
        triggerClassName="shrink-0"
      />

      {/* Filtrlar */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-end gap-4">
          <SelectField
            label="Kategoriya"
            className="w-auto"
            value={categoryId}
            options={categoryOptions}
            onChange={(value) => setParam("categoryId", value)}
          />

          <SelectField
            label="Kimdan"
            className="w-auto"
            value={authorKind}
            options={issueAuthorKindOptions}
            onChange={(value) => setParam("authorKind", value)}
          />
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <InputField
            type="date"
            label="Dan"
            value={from}
            max={to || undefined}
            className="w-auto"
            onChange={(e) => setParam("from", e.target.value)}
          />

          <InputField
            type="date"
            label="Gacha"
            value={to}
            min={from || undefined}
            className="w-auto"
            onChange={(e) => setParam("to", e.target.value)}
          />

          {(from || to) && (
            <Button variant="outline" className="mt-auto" onClick={clearDates}>
              Tozalash
            </Button>
          )}
        </div>
      </div>

      <form onSubmit={handleSearchSubmit} className="flex items-end gap-2">
        <InputField
          type="search"
          value={searchInput}
          placeholder="Muammo matni bo'yicha..."
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <Button type="submit">Qidirish</Button>
      </form>

      {/* Ro'yxat */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500" />
        </div>
      ) : issues.length === 0 ? (
        <Card>
          <EmptyState
            icon={MessageSquareWarning}
            title="Muammo topilmadi"
            description={
              counts?.total
                ? "Tanlangan kesimda murojaat yo'q — filtrlarni o'zgartirib ko'ring."
                : "Botdan muammo kelganda u shu yerda ko'rinadi. Avval kategoriyalarni sozlang."
            }
          />
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg">
          <table className="text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-3 py-2.5">Kimdan</th>
                <th className="px-3 py-2.5">Kategoriya</th>
                <th className="px-3 py-2.5">Muammo</th>
                <th className="px-3 py-2.5">Holat</th>
                <th className="px-3 py-2.5">Sana</th>
                <th className="px-3 py-2.5">Harakatlar</th>
              </tr>
            </thead>

            <tbody>
              {issues.map((issue) => (
                <tr key={issue.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2.5">
                    {/* Muallif o'chirilgan bo'lishi mumkin — yetim qator */}
                    <p className="font-medium text-gray-800">
                      {issue.author?.fullName || "Noma'lum"}
                    </p>

                    <span
                      className={`mt-0.5 inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium ${
                        issueAuthorKindColors[issue.authorKind] ||
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {issueAuthorKindLabels[issue.authorKind] ||
                        issue.authorKind}
                    </span>
                  </td>

                  <td className="px-3 py-2.5 text-xs text-gray-600">
                    {issue.categoryName || "—"}

                    {/* O'chirilgan kategoriya — eski muammolarda qoladi */}
                    {issue.categoryIsActive === false && (
                      <span className="block text-[10px] text-gray-400">
                        (o'chirilgan)
                      </span>
                    )}
                  </td>

                  <td className="px-3 py-2.5">
                    <p className="max-w-80 truncate text-xs text-gray-800">
                      {issue.body}
                    </p>

                    {issue.reply && (
                      <p className="mt-0.5 max-w-80 truncate text-[11px] text-green-700">
                        Javob: {issue.reply}
                      </p>
                    )}
                  </td>

                  <td className="px-3 py-2.5 text-center">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${
                        issueStatusColors[issue.status]
                      }`}
                    >
                      {issueStatusLabels[issue.status]}
                    </span>

                    {/* ⚠️ Javob yozilgan, lekin yetib bormagan (odam botni
                        bloklagan) — ma'muriyat buni bilishi kerak */}
                    {issue.reviewedAt && issue.reply && !issue.repliedAt && (
                      <span className="mt-0.5 block text-[10px] text-red-500">
                        javob yetib bormadi
                      </span>
                    )}
                  </td>

                  <td className="px-3 py-2.5 text-xs text-gray-500">
                    {formatDateTimeUz(issue.createdAt)}
                  </td>

                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-center gap-2">
                      {can("issues.review") && (
                        <button
                          title="Ko'rib chiqish"
                          onClick={() => openModal("reviewIssue", issue)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <MessageSquareReply size={16} />
                        </button>
                      )}

                      {can("issues.delete") && (
                        <button
                          title="O'chirish"
                          onClick={() => openModal("deleteIssue", issue)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Sahifalash */}
      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          onPageChange={handlePageChange}
        />
      )}

      {/* Ko'rib chiqish */}
      <ResponsiveModal
        name="reviewIssue"
        title="Muammoni ko'rib chiqish"
        className="max-w-lg"
      >
        <ReviewIssueForm />
      </ResponsiveModal>

      {/* O'chirish */}
      <ResponsiveModal
        name="deleteIssue"
        title="Muammoni o'chirish"
        description="Muammo butunlay o'chiriladi va qaytarib bo'lmaydi."
      >
        <DeleteIssueForm />
      </ResponsiveModal>
    </div>
  );
};

export default IssuesPage;
