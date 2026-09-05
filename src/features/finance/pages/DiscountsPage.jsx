// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import { Archive, ArchiveRestore, Pencil, Percent, Plus, Trash2, UserPlus } from "lucide-react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import Can from "@/shared/components/guards/Can";
import Table, { Td, Tr } from "@/shared/components/ui/Table";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import EmptyState from "@/shared/components/ui/EmptyState";
import Pagination from "@/shared/components/ui/Pagination";
import { TabsButtons } from "@/shared/components/ui/tabs/Tabs";
import AssignDiscountModal from "../components/AssignDiscountModal";
import ReasonModal from "../components/ReasonModal";
import {
  CreateDiscountModal,
  EditDiscountModal,
} from "../components/DiscountFormModal";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Utils
import { formatMoney } from "@/shared/utils/formatMoney";

// Data & queries
import {
  DISCOUNT_ASSIGNMENT_TABLE_COLUMNS,
  DISCOUNT_STATUS_OPTIONS,
  DISCOUNT_TABLE_COLUMNS,
  DISCOUNT_TYPE_LABELS,
  getPeriodStatus,
} from "../data/finance.data";
import { financeQueries } from "../queries/finance.queries";
import {
  useArchiveDiscount,
  useDeleteDiscount,
  useDeleteDiscountAssignment,
} from "../queries/finance.mutations";
import { currentMonthKey } from "@/shared/helpers/month.helpers";

const VIEW_TABS = [
  { value: "catalog", label: "Katalog" },
  { value: "assignments", label: "Kimga berilgan" },
];

/**
 * Chegirmalar — turlar katalogi va o'quvchilarga biriktirish.
 *
 * Tariflardan alohida bo'lim: tarif "qancha turadi" degan savolga,
 * chegirma esa "kimga arzonlashtirdik va nima uchun" degan savolga
 * javob beradi. Ikkinchisi tekshiruvchi eng ko'p so'raydigan savol.
 */
const DiscountsPage = () => {
  const { openModal } = useModal();

  const [view, setView] = useState("catalog");
  const [status, setStatus] = useState("active");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery(
    financeQueries.discountList({ page, limit: 24, status, withUsage: "true" }),
  );

  const { data: assignmentsData } = useQuery({
    ...financeQueries.discountAssignments({ page, limit: 24, activeOnly: "true" }),
    enabled: view === "assignments",
  });

  const discounts = data?.data ?? [];
  const pagination = data?.pagination;

  const { mutate: archiveDiscount } = useArchiveDiscount();
  const { mutate: deleteDiscount } = useDeleteDiscount();
  const { mutate: deleteAssignment } = useDeleteDiscountAssignment();

  const handleError = (err) =>
    toast.error(err.response?.data?.message || "Xatolik yuz berdi");

  const askArchive = (discount) => {
    const next = !discount.isArchived;
    openModal("financeReason", {
      description: `"${discount.name}" ${next ? "arxivlanadi" : "arxivdan qaytariladi"}.`,
      consequences: next
        ? [
            "Yangi o'quvchilarga biriktirib bo'lmaydi",
            "Mavjud biriktirishlar ishlashda davom etadi",
          ]
        : ["Chegirma yana biriktirilishi mumkin bo'ladi"],
      label: "Izoh",
      confirmLabel: next ? "Arxivlash" : "Qaytarish",
      onConfirm: (_reason, { close, setIsLoading }) => {
        setIsLoading(true);
        archiveDiscount(
          { id: discount.id, isArchived: next },
          {
            onSuccess: () => {
              close();
              toast.success(next ? "Arxivlandi" : "Arxivdan qaytarildi");
            },
            onError: handleError,
            onSettled: () => setIsLoading(false),
          },
        );
      },
    });
  };

  const askDelete = (discount) =>
    openModal("financeReason", {
      description: `"${discount.name}" butunlay o'chiriladi.`,
      warning:
        "Bu amalni qaytarib bo'lmaydi. Biriktirilgan chegirmani o'chirib bo'lmaydi — uni arxivlang.",
      label: "Izoh",
      confirmLabel: "O'chirish",
      onConfirm: (_reason, { close, setIsLoading }) => {
        setIsLoading(true);
        deleteDiscount(discount.id, {
          onSuccess: () => {
            close();
            toast.success("Chegirma o'chirildi");
          },
          onError: handleError,
          onSettled: () => setIsLoading(false),
        });
      },
    });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <TabsButtons
          items={VIEW_TABS}
          value={view}
          onChange={(v) => {
            setView(v);
            setPage(1);
          }}
        />

        <div className="flex flex-wrap items-center gap-2">
          {view === "catalog" && (
            <Select
              value={status}
              triggerClassName="min-w-40"
              options={DISCOUNT_STATUS_OPTIONS}
              onChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
            />
          )}

          <Can do="discounts.assign">
            <Button variant="outline" onClick={() => openModal("assignDiscount", {})}>
              <UserPlus />
              Biriktirish
            </Button>
          </Can>

          <Can do="discounts.create">
            <Button onClick={() => openModal("createDiscount", {})}>
              <Plus />
              Yangi chegirma
            </Button>
          </Can>
        </div>
      </div>

      {view === "catalog" ? (
        <>
          {isLoading ? (
            <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>
          ) : discounts.length === 0 ? (
            <Card className="p-0 xs:p-0">
              <EmptyState
                icon={Percent}
                title="Chegirma yo'q"
                description="Aka-uka, xodim farzandi, a'lochi kabi chegirma turlarini yarating va o'quvchilarga biriktiring."
                action={
                  <Can do="discounts.create">
                    <Button onClick={() => openModal("createDiscount", {})}>
                      <Plus />
                      Yangi chegirma
                    </Button>
                  </Can>
                }
              />
            </Card>
          ) : (
            <Table columns={DISCOUNT_TABLE_COLUMNS}>
              {discounts.map((discount) => (
                <Tr key={discount.id}>
                  <Td nowrap={false}>
                    <p className="font-medium text-gray-900">
                      {discount.name}
                      {discount.isExclusive && (
                        <span className="ml-1.5 rounded-md bg-purple-50 px-1.5 py-0.5 text-xs text-purple-700">
                          yakka
                        </span>
                      )}
                    </p>
                    {discount.description && (
                      <p className="text-xs text-gray-500">{discount.description}</p>
                    )}
                  </Td>

                  <Td className="text-gray-500">
                    {DISCOUNT_TYPE_LABELS[discount.type]}
                  </Td>

                  <Td align="right" className="font-medium">{discount.valueLabel}</Td>

                  <Td align="right" className="text-gray-500">{discount.studentCount ?? 0} ta</Td>

                  <Td>
                    {discount.isArchived ? (
                      <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        Arxivlangan
                      </span>
                    ) : discount.isActive ? (
                      <span className="inline-flex items-center rounded-md bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        Faol
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                        Nofaol
                      </span>
                    )}
                  </Td>

                  <Td>
                    <div className="flex items-center justify-end gap-1">
                      {!discount.isArchived && (
                        <Can do="discounts.assign">
                          <button
                            title="O'quvchi biriktirish"
                            onClick={() => openModal("assignDiscount", { discount })}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <UserPlus className="size-3.5" />
                          </button>
                        </Can>
                      )}

                      <Can do="discounts.update">
                        <button
                          title="Tahrirlash"
                          onClick={() =>
                            openModal("editDiscount", {
                              discount: {
                                ...discount,
                                totalAssignments: discount.studentCount,
                              },
                            })
                          }
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        >
                          <Pencil className="size-3.5" />
                        </button>

                        <button
                          title={discount.isArchived ? "Arxivdan qaytarish" : "Arxivlash"}
                          onClick={() => askArchive(discount)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        >
                          {discount.isArchived ? (
                            <ArchiveRestore className="size-3.5" />
                          ) : (
                            <Archive className="size-3.5" />
                          )}
                        </button>
                      </Can>

                      {(discount.studentCount ?? 0) === 0 && (
                        <Can do="discounts.delete">
                          <button
                            title="O'chirish"
                            onClick={() => askDelete(discount)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </Can>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))}
            </Table>
          )}

          {pagination && pagination.totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={pagination.totalPages}
              hasNextPage={pagination.hasNextPage}
              hasPrevPage={pagination.hasPrevPage}
              onPageChange={setPage}
            />
          )}
        </>
      ) : (
        <AssignmentsView
          data={assignmentsData}
          page={page}
          onPageChange={setPage}
          onDelete={(assignment) =>
            deleteAssignment(assignment.id, {
              onSuccess: () => toast.success("Biriktirish o'chirildi"),
              onError: handleError,
            })
          }
        />
      )}

      {/* Modals */}
      <CreateDiscountModal />
      <EditDiscountModal />
      <AssignDiscountModal />
      <ReasonModal />
    </div>
  );
};

/** Kimga qaysi chegirma berilgan. */
const AssignmentsView = ({ data, page, onPageChange, onDelete }) => {
  const assignments = data?.data ?? [];
  const pagination = data?.pagination;
  const month = data?.month ?? currentMonthKey();

  if (assignments.length === 0) {
    return (
      <Card className="p-0 xs:p-0">
        <EmptyState
          icon={UserPlus}
          title="Biriktirilgan chegirma yo'q"
          description="Katalogdan chegirma tanlab, o'quvchiga yoki butun sinfga biriktiring."
        />
      </Card>
    );
  }

  return (
    <>
      <Table columns={DISCOUNT_ASSIGNMENT_TABLE_COLUMNS}>
        {assignments.map((assignment) => {
          const period = getPeriodStatus(
            assignment.startMonth,
            assignment.endMonth,
            month,
          );

          return (
            <Tr key={assignment.id}>
              <Td nowrap={false}>
                <p className="font-medium text-gray-900">
                  {assignment.student
                    ? `${assignment.student.firstName} ${assignment.student.lastName ?? ""}`.trim()
                    : "Noma'lum"}
                </p>
                {assignment.note && (
                  <p className="text-xs text-gray-500">{assignment.note}</p>
                )}
              </Td>

              <Td className="text-gray-500">{assignment.discount?.name ?? "—"}</Td>

              <Td align="right" className="font-medium">
                {assignment.discount?.valueLabel ?? "—"}
              </Td>

              <Td className="text-gray-500">{assignment.periodLabel}</Td>

              <Td>
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${period.className}`}
                >
                  {period.label}
                </span>
              </Td>

              <Td>
                <div className="flex items-center justify-end gap-1">
                  {assignment.startMonth > month && (
                    <Can do="discounts.assign">
                      <button
                        title="O'chirish"
                        onClick={() => onDelete(assignment)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </Can>
                  )}
                </div>
              </Td>
            </Tr>
          );
        })}
      </Table>

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={pagination.totalPages}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
};

export default DiscountsPage;
