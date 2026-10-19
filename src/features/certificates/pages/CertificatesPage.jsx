// React
import { useCallback, useMemo } from "react";

// Router
import { useSearchParams } from "react-router-dom";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Toast
import { toast } from "sonner";

// Icons
import {
  BadgeCheck,
  CalendarClock,
  GraduationCap,
  Pencil,
  Plus,
  Upload,
  XCircle,
} from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Badge from "@/shared/components/ui/badge/Badge";
import Input from "@/shared/components/ui/input/Input";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import TabsButtons from "@/shared/components/ui/tabs/TabsButtons";
import Pagination from "@/shared/components/ui/Pagination";
import EmptyState from "@/shared/components/ui/EmptyState";
import LoaderCard from "@/shared/components/ui/LoaderCard";
import Table, { Td, Tr } from "@/shared/components/ui/Table";
import TopicProgress from "../components/TopicProgress";
import CertificateStatsTab from "../components/CertificateStatsTab";
import StudentProgressModal from "../components/StudentProgressModal";
import CertificatePlanModal from "../components/CertificatePlanModal";
import CertificateTrackModal from "../components/CertificateTrackModal";
import ImportCertificatesModal from "../components/ImportCertificatesModal";
import CancelCertificatePlanModal from "../components/CancelCertificatePlanModal";

// Hooks
import useModal from "@/shared/hooks/useModal";
import usePermissions from "@/shared/hooks/usePermissions";

// Utils
import { cn } from "@/shared/utils/cn";

// Queries & data
import { useClasses } from "@/features/classes/queries/classes.queries";
import { certificatesQueries } from "../queries/certificates.queries";
import { useMarkCertificatePassed } from "../queries/certificates.mutations";
import {
  ALL,
  CERTIFICATES_PAGE_LIMIT,
  NO_CLASS,
  PLAN_STATUS,
  PLAN_STATUS_LABELS,
  PLAN_STATUS_VARIANTS,
  dueOptions,
  statusOptions,
} from "../data/certificates.data";

/**
 * ⚠️ "YO'NALISHLAR" ALOHIDA TAB EMAS (biznes qarori, 2026-10-19): umumiy
 * jadval uni ortiqcha qildi va katalog shu jadvalning o'zidan boshqariladi
 * (maktab faniga bog'lash, arxivlash). Alohida ekran qaytarilsa, bitta
 * narsa ikki joydan boshqariladigan bo'lib qolardi.
 */
const TABS = Object.freeze({ PLANS: "plans", STATS: "stats" });

/**
 * SERTIFIKAT REJALARI — "kim qaysi sertifikatni qachon topshirmoqchi".
 *
 * Uch tab: rejalar ro'yxati, statistika va yo'nalishlar katalogi.
 *
 * ⚠️ FILTRLAR URL DA (`tab`, `search`, `class`, `track`, `status`, `due`,
 * `month`, `page`) — ro'yxat holatini havola qilib yuborsa bo'ladi va
 * o'quvchi profiliga kirib qaytganda filtr yo'qolmaydi (`replace`).
 *
 * ⚠️ MUDDATI O'TGAN rejalar ro'yxatning BOSHIDA turadi (server
 * `dueDate asc`, muddatsizlar oxirida): ekranning boshida harakat talab
 * qiladigan qatorlar bo'lishi kerak.
 *
 * Ruxsat: `certificates.view` (route guard), yozish — `certificates.manage`,
 * fayldan yuklash — `certificates.import`.
 */
const CertificatesPage = () => {
  const { openModal } = useModal();
  const { can } = usePermissions();
  const canManage = can("certificates.manage");
  const canImport = can("certificates.import");

  const [searchParams, setSearchParams] = useSearchParams();

  const tab = searchParams.get("tab") || TABS.PLANS;
  const search = searchParams.get("search") || "";
  const classId = searchParams.get("class") || ALL;
  const trackId = searchParams.get("track") || ALL;
  const status = searchParams.get("status") || PLAN_STATUS.PLANNED;
  const due = searchParams.get("due") || ALL;
  const month = searchParams.get("month") || "";
  const page = Number.parseInt(searchParams.get("page") || "1", 10);

  const { data: classes = [] } = useClasses();
  const { data: tracks = [] } = useQuery(certificatesQueries.tracks());
  const { mutateAsync: markPassed } = useMarkCertificatePassed();

  /**
   * ⚠️ Filtr o'zgarsa BIRINCHI SAHIFAGA qaytadi — va bu effekt bilan emas,
   * filtrni o'zgartirgan hodisada. Usiz 5-sahifada turib filtrlanganda
   * natija bor bo'la turib ro'yxat bo'sh ko'rinardi (`devices.md` §10).
   */
  const setParam = useCallback(
    (key, value) => {
      const next = new URLSearchParams(searchParams);
      if (!value || value === ALL) next.delete(key);
      else next.set(key, value);
      if (key !== "page") next.delete("page");
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const params = useMemo(
    () => ({
      page,
      limit: CERTIFICATES_PAGE_LIMIT,
      ...(search && { search }),
      ...(classId !== ALL && { classId }),
      ...(trackId !== ALL && { trackId }),
      ...(status && { status }),
      ...(due !== ALL && { due }),
      ...(month && { month }),
    }),
    [page, search, classId, trackId, status, due, month],
  );

  const { data, isLoading, isFetching } = useQuery(
    certificatesQueries.list(tab === TABS.PLANS ? params : undefined),
  );

  const plans = data?.data ?? [];
  const pagination = data?.pagination;

  const classOptions = [
    { value: ALL, label: "Hamma sinf" },
    { value: NO_CLASS, label: "Sinfsiz" },
    ...classes.map((cls) => ({ value: cls.id, label: cls.name })),
  ];

  const trackOptions = [
    { value: ALL, label: "Hamma yo'nalish" },
    ...tracks.map((track) => ({ value: track.id, label: track.name })),
  ];

  const onPassed = async (plan) => {
    try {
      await markPassed({ id: plan.id });
      toast.success("Topshirdi deb belgilandi");
    } catch (error) {
      toast.error(error.response?.data?.message || "Belgilab bo'lmadi");
    }
  };

  return (
    <div className="space-y-4">
      {/* Sarlavha */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Sertifikat rejalari</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Kim qaysi sertifikatni qachon topshirmoqchi — muddat va mavzu
            progressi bilan
          </p>
        </div>

        <div className="flex gap-2.5">
          {canImport && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => openModal("importCertificates")}
            >
              <Upload className="size-4" strokeWidth={2} />
              Fayldan yuklash
            </Button>
          )}

          {canManage && (
            <Button size="sm" onClick={() => openModal("certificatePlan", { plan: null })}>
              <Plus className="size-4" strokeWidth={2} />
              Reja qo'shish
            </Button>
          )}
        </div>
      </div>

      <TabsButtons
        value={tab}
        onChange={(value) => setParam("tab", value === TABS.PLANS ? "" : value)}
        items={[
          { value: TABS.PLANS, label: "Rejalar" },
          { value: TABS.STATS, label: "Statistika" },
        ]}
      />

      {tab === TABS.STATS && (
        <CertificateStatsTab
          classId={classId}
          canManage={canManage}
          onClassChange={(value) => setParam("class", value)}
        />
      )}

      {tab === TABS.PLANS && (
        <>
          {/* Filtrlar */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-5">
            <Input
              value={search}
              placeholder="Ism yoki familiya"
              onChange={(event) => setParam("search", event.target.value)}
            />
            <Select
              name="class"
              value={classId}
              onChange={(value) => setParam("class", value)}
              options={classOptions}
              placeholder="Sinf"
              triggerClassName="w-full"
            />
            <Select
              name="track"
              value={trackId}
              onChange={(value) => setParam("track", value)}
              options={trackOptions}
              placeholder="Yo'nalish"
              triggerClassName="w-full"
            />
            <Select
              name="due"
              value={due}
              onChange={(value) => setParam("due", value)}
              options={dueOptions}
              placeholder="Muddat"
              triggerClassName="w-full"
            />
            <Select
              name="status"
              value={status}
              onChange={(value) => setParam("status", value)}
              options={statusOptions}
              placeholder="Holat"
              triggerClassName="w-full"
            />
          </div>

          {isLoading && plans.length === 0 ? (
            <LoaderCard title="Rejalar yuklanmoqda..." />
          ) : plans.length === 0 ? (
            <Card>
              <EmptyState
                icon={GraduationCap}
                title="Reja topilmadi"
                description="Filtrlarni o'zgartiring yoki Google Forms javoblarini fayldan yuklang."
                action={
                  canImport && (
                    <Button size="sm" onClick={() => openModal("importCertificates")}>
                      <Upload className="size-4" strokeWidth={2} />
                      Fayldan yuklash
                    </Button>
                  )
                }
              />
            </Card>
          ) : (
            <>
              <div className={cn("space-y-3", isFetching && "opacity-70")}>
                <Table
                  columns={[
                    "O'quvchi",
                    "Sinf",
                    "Yo'nalish",
                    "Muddat",
                    "Mavzu progressi",
                    ...(canManage ? [{ label: "", align: "right" }] : []),
                  ]}
                >
                  {plans.map((plan) => (
                    <Tr key={plan.id}>
                      <Td className="font-medium text-gray-900">
                        {plan.student ? (
                          <button
                            type="button"
                            title="Qaysi mavzular o'tilgani"
                            onClick={() =>
                              openModal("certificateStudent", {
                                studentId: plan.student.id,
                                studentName: plan.student.fullName,
                              })
                            }
                            className="text-left hover:text-primary hover:underline"
                          >
                            {plan.student.fullName}
                          </button>
                        ) : (
                          "—"
                        )}
                        {plan.status !== PLAN_STATUS.PLANNED && (
                          <Badge
                            variant={PLAN_STATUS_VARIANTS[plan.status]}
                            className="ml-2 text-[10px]"
                          >
                            {PLAN_STATUS_LABELS[plan.status]}
                          </Badge>
                        )}
                        {plan.note && (
                          <p
                            className="max-w-56 truncate text-xs font-normal text-gray-500"
                            title={plan.note}
                          >
                            {plan.note}
                          </p>
                        )}
                      </Td>

                      <Td>
                        {plan.student?.classes?.length > 0 ? (
                          plan.student.classes.map((cls) => cls.name).join(", ")
                        ) : (
                          <span className="text-gray-400">Sinfsiz</span>
                        )}
                      </Td>

                      <Td>
                        {plan.track.name}
                        {plan.track.subject && (
                          <p className="text-xs text-gray-500">{plan.track.subject.name}</p>
                        )}
                      </Td>

                      <Td>
                        <DueCell plan={plan} />
                      </Td>

                      <Td nowrap={false}>
                        <TopicProgress progress={plan.progress} compact />
                      </Td>

                      {canManage && (
                        <Td align="right">
                          {plan.status === PLAN_STATUS.PLANNED && (
                            <div className="flex justify-end gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                title="Tahrirlash"
                                onClick={() => openModal("certificatePlan", { plan })}
                              >
                                <Pencil className="size-4" strokeWidth={1.75} />
                              </Button>

                              <Button
                                size="icon"
                                variant="ghost"
                                title="Topshirdi deb belgilash"
                                onClick={() => onPassed(plan)}
                              >
                                <BadgeCheck className="size-4" strokeWidth={1.75} />
                              </Button>

                              <Button
                                size="icon"
                                variant="ghost"
                                title="Bekor qilish"
                                onClick={() => openModal("cancelCertificatePlan", { plan })}
                              >
                                <XCircle className="size-4 text-red-500" strokeWidth={1.75} />
                              </Button>
                            </div>
                          )}
                        </Td>
                      )}
                    </Tr>
                  ))}
                </Table>
              </div>

              {pagination?.totalPages > 1 && (
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  hasNextPage={pagination.hasNextPage}
                  hasPrevPage={pagination.hasPrevPage}
                  onPageChange={(value) => setParam("page", String(value))}
                />
              )}
            </>
          )}
        </>
      )}

      <StudentProgressModal />

      {canManage && <CertificatePlanModal />}
      {canManage && <CancelCertificatePlanModal />}
      {canManage && <CertificateTrackModal />}
      {canImport && <ImportCertificatesModal />}
    </div>
  );
};

/**
 * MUDDAT KATAGI.
 *
 * Sana SERVER bergan yorliqdan (`dueDateLabel`) olinadi: muddat `@db.Date`
 * va UTC yarim tunida yotadi — brauzerda qayta formatlansa manfiy ofsetli
 * mintaqada bir kun orqaga siljib ketardi (`dates.md` §4).
 */
const DueCell = ({ plan }) => {
  if (!plan.dueDate) {
    return <span className="text-gray-400">Muddati aniq emas</span>;
  }

  const overdue = plan.daysLeft < 0;
  const soon = plan.daysLeft >= 0 && plan.daysLeft <= 30;

  return (
    <div>
      <p className="text-gray-900">{plan.dueDateLabel}</p>
      <p
        className={cn(
          "flex items-center gap-1 text-xs",
          overdue ? "text-red-600" : soon ? "text-amber-600" : "text-gray-500",
        )}
      >
        <CalendarClock className="size-3.5 shrink-0" strokeWidth={1.75} />
        {plan.daysLeftLabel}
      </p>
    </div>
  );
};

export default CertificatesPage;
