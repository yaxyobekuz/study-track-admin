// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import {
  Archive,
  ArchiveRestore,
  BedDouble,
  Pencil,
  Plus,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import Can from "@/shared/components/guards/Can";
import Table, { Td, Tr } from "@/shared/components/ui/Table";
import Button from "@/shared/components/ui/button/Button";
import EmptyState from "@/shared/components/ui/EmptyState";
import Pagination from "@/shared/components/ui/Pagination";
import InputSearch from "@/shared/components/ui/input/InputSearch";
import SelectSearch from "@/shared/components/ui/select/SelectSearch";
import { TabsButtons } from "@/shared/components/ui/tabs/Tabs";
import ReasonModal from "../components/ReasonModal";
import AssignServiceModal, {
  EditServiceAssignmentModal,
} from "../components/AssignServiceModal";
import {
  CreateServiceModal,
  EditServiceModal,
} from "../components/ServiceFormModal";

// Hooks
import useModal from "@/shared/hooks/useModal";
import useDebounce from "@/shared/hooks/useDebounce";

// Utils
import { formatMoney } from "@/shared/utils/formatMoney";
import { currentMonthKey, prevMonthKey } from "@/shared/helpers/month.helpers";

// Data & queries
import {
  SERVICE_TABLE_COLUMNS,
  SERVICE_STUDENT_TABLE_COLUMNS,
} from "../data/finance.data";
import { financeQueries } from "../queries/finance.queries";
import {
  useArchiveService,
  useDeleteService,
  useCloseServiceAssignment,
  useDeleteServiceAssignment,
} from "../queries/finance.mutations";
import { classesQueries } from "@/features/classes/queries/classes.queries";

const VIEW_TABS = [
  { value: "students", label: "O'quvchilar" },
  { value: "catalog", label: "Xizmatlar katalogi" },
];

/**
 * Qo'shimcha xizmatlar (yotoqxona, ovqat, transport, ...).
 *
 * Xizmat summasi o'quvchining oylik hisob-fakturasiga tarif narxi USTIGA
 * qo'shiladi va qarzdorlarda birga ko'rinadi. Biriktirish/o'zgartirish/olib
 * tashlashda to'lanmagan hisob-fakturalar server tomonda AVTOMATIK qayta
 * hisoblanadi — qo'lda hech narsa shakllantirilmaydi.
 */
const ServicesPage = () => {
  const { openModal } = useModal();

  const [view, setView] = useState("students");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [classId, setClassId] = useState("");
  const [serviceFilterId, setServiceFilterId] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const { data: services = [], isLoading: isCatalogLoading } = useQuery(
    financeQueries.serviceList({ includeArchived: "true" }),
  );
  const { data: classes = [] } = useQuery(classesQueries.list());

  const { data: studentsData, isFetching } = useQuery({
    ...financeQueries.serviceStudents({
      page,
      limit: 24,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(classId ? { classId } : {}),
      ...(serviceFilterId ? { serviceId: serviceFilterId } : {}),
    }),
    enabled: view === "students",
  });

  const { mutate: archiveService } = useArchiveService();
  const { mutate: deleteService } = useDeleteService();
  const { mutate: closeAssignment } = useCloseServiceAssignment();
  const { mutate: deleteAssignment } = useDeleteServiceAssignment();

  const students = studentsData?.data ?? [];
  const pagination = studentsData?.pagination;
  const month = studentsData?.month ?? currentMonthKey();

  const handleError = (err) =>
    toast.error(err.response?.data?.message || "Xatolik yuz berdi");

  const askArchive = (service) => {
    const next = !service.isArchived;
    openModal("financeReason", {
      description: `"${service.name}" ${next ? "arxivlanadi" : "arxivdan qaytariladi"}.`,
      consequences: next
        ? [
            "Yangi o'quvchilarga biriktirib bo'lmaydi",
            "Mavjud biriktirishlar ishlashda davom etadi",
          ]
        : ["Xizmat yana biriktirilishi mumkin bo'ladi"],
      label: "Izoh",
      confirmLabel: next ? "Arxivlash" : "Qaytarish",
      onConfirm: (_reason, { close, setIsLoading }) => {
        setIsLoading(true);
        archiveService(
          { id: service.id, isArchived: next },
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

  const askDelete = (service) =>
    openModal("financeReason", {
      description: `"${service.name}" butunlay o'chiriladi.`,
      warning:
        "Bu amalni qaytarib bo'lmaydi. Biriktirilgan xizmatni o'chirib bo'lmaydi — uni arxivlang.",
      label: "Izoh",
      confirmLabel: "O'chirish",
      onConfirm: (_reason, { close, setIsLoading }) => {
        setIsLoading(true);
        deleteService(service.id, {
          onSuccess: () => {
            close();
            toast.success("Xizmat o'chirildi");
          },
          onError: handleError,
          onSettled: () => setIsLoading(false),
        });
      },
    });

  /**
   * Xizmatni o'quvchidan olib tashlash. Joriy/kelajak oydan boshlangan
   * biriktirma O'CHIRILADI; eskiroq biriktirma esa o'tgan oyda YOPILADI —
   * ikkala holatda ham joriy oyning to'lanmagan hisob-fakturasi avtomatik
   * qayta hisoblanadi (to'langan oylar o'zgarmaydi).
   */
  const askRemoveAssignment = (student, assignment) =>
    openModal("financeReason", {
      description: `"${assignment.service?.name}" xizmati ${student.fullName} dan olib tashlanadi.`,
      consequences: [
        "Joriy oyning to'lanmagan hisob-fakturasi avtomatik qayta hisoblanadi",
        "To'langan oylar o'zgarmaydi",
      ],
      label: "Izoh",
      confirmLabel: "Olib tashlash",
      onConfirm: (_reason, { close, setIsLoading }) => {
        setIsLoading(true);
        const done = {
          onSuccess: () => {
            close();
            toast.success("Xizmat olib tashlandi");
          },
          onError: handleError,
          onSettled: () => setIsLoading(false),
        };

        if (assignment.startMonth >= month) {
          deleteAssignment(assignment.id, done);
        } else {
          closeAssignment({ id: assignment.id, endMonth: prevMonthKey(month) }, done);
        }
      },
    });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white p-3 ring-1 ring-gray-100 xs:p-4">
        <TabsButtons
          items={VIEW_TABS}
          value={view}
          onChange={(v) => {
            setView(v);
            setPage(1);
          }}
        />

        <div className="flex flex-wrap items-center gap-2">
          {view === "students" && (
            <>
              <SelectSearch
                value={serviceFilterId}
                triggerClassName="min-w-40"
                placeholder="Barcha xizmatlar"
                onChange={(v) => {
                  setServiceFilterId(v);
                  setPage(1);
                }}
                options={services.map((s) => ({ label: s.name, value: s.id }))}
              />

              <SelectSearch
                value={classId}
                triggerClassName="min-w-40"
                placeholder="Barcha sinflar"
                onChange={(v) => {
                  setClassId(v);
                  setPage(1);
                }}
                options={classes.map((c) => ({ label: c.name, value: c.id }))}
              />

              <div className="w-full sm:w-56">
                <InputSearch
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Ism yoki username..."
                />
              </div>
            </>
          )}

          <Can do="services.assign">
            <Button variant="outline" onClick={() => openModal("assignService", {})}>
              <UserPlus />
              Biriktirish
            </Button>
          </Can>

          <Can do="services.create">
            <Button onClick={() => openModal("createService", {})}>
              <Plus />
              Yangi xizmat
            </Button>
          </Can>
        </div>
      </div>

      {view === "students" ? (
        <>
          {students.length === 0 ? (
            <Card className="p-0 xs:p-0">
              <EmptyState
                icon={BedDouble}
                title={isFetching ? "Yuklanmoqda..." : "O'quvchi topilmadi"}
                description="O'quvchini tanlab yotoqxona, ovqat kabi xizmatlarni biriktiring — summa tarif narxiga qo'shilib qarzda ko'rinadi."
              />
            </Card>
          ) : (
            <Table columns={SERVICE_STUDENT_TABLE_COLUMNS}>
              {students.map((student) => (
                <Tr key={student.id}>
                  <Td nowrap={false}>
                    <p className="font-medium text-gray-900">{student.fullName}</p>
                    <p className="text-xs text-gray-500">{student.username}</p>
                  </Td>

                  <Td className="text-gray-500">{student.className ?? "—"}</Td>

                  <Td nowrap={false}>
                    {student.services.length === 0 ? (
                      <span className="text-xs text-gray-400">Xizmat yo'q</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {student.services.map((assignment) => (
                          <span
                            key={assignment.id}
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                          >
                            <button
                              type="button"
                              title="Tahrirlash"
                              className="hover:underline"
                              onClick={() =>
                                openModal("editServiceAssignment", {
                                  assignment: { ...assignment, student },
                                })
                              }
                            >
                              {assignment.service?.name} ·{" "}
                              {formatMoney(assignment.effectiveAmount)}
                            </button>
                            <Can do="services.assign">
                              <button
                                type="button"
                                title="Olib tashlash"
                                onClick={() => askRemoveAssignment(student, assignment)}
                                className="rounded p-0.5 text-blue-400 hover:bg-blue-100 hover:text-blue-700"
                              >
                                <X className="size-3" />
                              </button>
                            </Can>
                          </span>
                        ))}
                      </div>
                    )}
                  </Td>

                  <Td align="right" className="font-medium">
                    {student.services.length
                      ? formatMoney(student.servicesTotal)
                      : "—"}
                  </Td>

                  <Td>
                    <div className="flex items-center justify-end">
                      <Can do="services.assign">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openModal("assignService", { student })}
                        >
                          <Plus className="size-3.5" />
                          Xizmat
                        </Button>
                      </Can>
                    </div>
                  </Td>
                </Tr>
              ))}
            </Table>
          )}

          {pagination && pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              hasNextPage={pagination.hasNextPage}
              hasPrevPage={pagination.hasPrevPage}
              onPageChange={setPage}
            />
          )}
        </>
      ) : (
        <CatalogView
          services={services}
          isLoading={isCatalogLoading}
          onCreate={() => openModal("createService", {})}
          onAssign={(service) => openModal("assignService", { service })}
          onEdit={(service) => openModal("editService", { service })}
          onArchive={askArchive}
          onDelete={askDelete}
        />
      )}

      {/* Modals */}
      <CreateServiceModal />
      <EditServiceModal />
      <AssignServiceModal />
      <EditServiceAssignmentModal />
      <ReasonModal />
    </div>
  );
};

/** Xizmatlar katalogi — nom, narx, nechta o'quvchiga biriktirilgani. */
const CatalogView = ({
  services,
  isLoading,
  onCreate,
  onAssign,
  onEdit,
  onArchive,
  onDelete,
}) => {
  if (isLoading) {
    return <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>;
  }

  if (services.length === 0) {
    return (
      <Card className="p-0 xs:p-0">
        <EmptyState
          icon={BedDouble}
          title="Xizmat yo'q"
          description="Yotoqxona, ovqat, transport kabi qo'shimcha xizmatlarni yarating va o'quvchilarga biriktiring."
          action={
            <Can do="services.create">
              <Button onClick={onCreate}>
                <Plus />
                Yangi xizmat
              </Button>
            </Can>
          }
        />
      </Card>
    );
  }

  return (
    <Table columns={SERVICE_TABLE_COLUMNS}>
      {services.map((service) => (
        <Tr key={service.id}>
          <Td nowrap={false}>
            <p className="font-medium text-gray-900">{service.name}</p>
            {service.note && <p className="text-xs text-gray-500">{service.note}</p>}
          </Td>

          <Td align="right" className="font-medium">
            {formatMoney(service.monthlyAmount)}
          </Td>

          <Td align="right" className="text-gray-500">
            {service.assignedCount ?? 0} ta
          </Td>

          <Td>
            {service.isArchived ? (
              <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                Arxivlangan
              </span>
            ) : (
              <span className="inline-flex items-center rounded-md bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                Faol
              </span>
            )}
          </Td>

          <Td>
            <div className="flex items-center justify-end gap-1">
              {!service.isArchived && (
                <Can do="services.assign">
                  <button
                    title="O'quvchiga biriktirish"
                    onClick={() => onAssign(service)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <UserPlus className="size-3.5" />
                  </button>
                </Can>
              )}

              <Can do="services.update">
                <button
                  title="Tahrirlash"
                  onClick={() => onEdit(service)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <Pencil className="size-3.5" />
                </button>

                <button
                  title={service.isArchived ? "Arxivdan qaytarish" : "Arxivlash"}
                  onClick={() => onArchive(service)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  {service.isArchived ? (
                    <ArchiveRestore className="size-3.5" />
                  ) : (
                    <Archive className="size-3.5" />
                  )}
                </button>
              </Can>

              {(service.assignedCount ?? 0) === 0 && (
                <Can do="services.delete">
                  <button
                    title="O'chirish"
                    onClick={() => onDelete(service)}
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
  );
};

export default ServicesPage;
