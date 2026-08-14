// Router
import { Link, useParams, useSearchParams } from "react-router-dom";

// Icons
import { ArrowLeft, Pencil, Plus, TriangleAlert, UserPlus } from "lucide-react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import Can from "@/shared/components/guards/Can";
import Button from "@/shared/components/ui/button/Button";
import Pagination from "@/shared/components/ui/Pagination";
import TariffVersionsTable from "../components/TariffVersionsTable";
import AssignedStudentsTable from "../components/AssignedStudentsTable";
import AddTariffVersionModal from "../components/AddTariffVersionModal";
import EditTariffVersionModal from "../components/EditTariffVersionModal";
import AssignTariffModal from "../components/AssignTariffModal";
import ChangeStudentTariffModal from "../components/ChangeStudentTariffModal";
import EditTariffModal from "../components/EditTariffModal";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Utils & helpers
import { formatMoney } from "@/shared/utils/formatMoney";
import { formatMonthRange } from "@/shared/helpers/month.helpers";

// Data & queries
import { getTariffStatus } from "../data/finance.data";
import { financeQueries } from "../queries/finance.queries";

/**
 * Tarif detali — to'liq sahifa.
 *
 * Asosiy sahifaning tablari bu yerda ko'rsatilmaydi (route
 * `FinanceMainLayout` dan tashqarida): detal sahifa contentga to'liq
 * egalik qiladi.
 */
const TariffDetailPage = () => {
  const { id } = useParams();
  const { openModal } = useModal();

  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;

  const { data: tariff, isLoading } = useQuery(financeQueries.tariffDetail(id));

  // Biriktirilgan o'quvchilar — summasi joriy oyga hal qilingan holda
  const { data: assignmentData } = useQuery(
    financeQueries.assignmentList({ tariffId: id, page, limit: 24 }),
  );

  const assignments = assignmentData?.data ?? [];
  const pagination = assignmentData?.pagination;

  if (isLoading) {
    return <div className="py-8 text-center text-gray-500">Yuklanmoqda...</div>;
  }

  if (!tariff) {
    return (
      <Card className="text-center">
        <p className="text-sm text-gray-500">Tarif topilmadi</p>
      </Card>
    );
  }

  const status = getTariffStatus(tariff);

  return (
    <div className="space-y-4">
      {/* Sarlavha va amallar */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-start gap-2">
          <Link
            to="/finance/main/tariffs"
            className="flex items-center justify-center size-9 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft strokeWidth={1.5} className="size-5" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="page-title">{tariff.name}</h1>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${status.className}`}
              >
                {status.label}
              </span>
            </div>
            {tariff.description && (
              <p className="text-sm text-gray-500 mt-0.5">
                {tariff.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <Can do="tariffs.update">
            <Button
              variant="secondary"
              onClick={() => openModal("editTariff", { tariff })}
            >
              <Pencil />
              Tahrirlash
            </Button>
          </Can>

          <Can do="tariffs.assign">
            <Button
              variant="secondary"
              onClick={() => openModal("assignTariff", { tariff })}
            >
              <UserPlus />
              O'quvchi biriktirish
            </Button>
          </Can>

          <Can do="tariffs.versions">
            <Button onClick={() => openModal("addTariffVersion", { tariff })}>
              <Plus />
              Narx qo'shish
            </Button>
          </Can>
        </div>
      </div>

      {/* Qisqacha ma'lumot */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs text-gray-500">Joriy oylik narx</p>
          {tariff.currentVersion ? (
            <>
              <p className="mt-1 text-xl font-semibold text-gray-900">
                {formatMoney(tariff.currentVersion.monthlyAmount)}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">
                {formatMonthRange(
                  tariff.currentVersion.startMonth,
                  tariff.currentVersion.endMonth,
                )}
              </p>
            </>
          ) : (
            <p className="mt-1 text-sm text-red-600">Narx belgilanmagan</p>
          )}
        </Card>

        <Card>
          <p className="text-xs text-gray-500">Biriktirilgan o'quvchilar</p>
          <p className="mt-1 text-xl font-semibold text-gray-900">
            {tariff.assignedStudentCount}
          </p>
        </Card>

        <Card>
          <p className="text-xs text-gray-500">Narx versiyalari</p>
          <p className="mt-1 text-xl font-semibold text-gray-900">
            {tariff.versions?.length ?? 0}
          </p>
        </Card>
      </div>

      {/* Bo'shliqlar — xato emas, lekin odatda kiritish unutilganini bildiradi */}
      {tariff.gaps?.length > 0 && (
        <div className="flex items-start gap-2 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
          <TriangleAlert className="size-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Ba'zi oylar uchun narx belgilanmagan</p>
            <p className="mt-0.5">
              {tariff.gaps.map((gap) => gap.label).join(", ")} — bu oylarda
              hisob-kitob qilib bo'lmaydi.
            </p>
          </div>
        </div>
      )}

      {/* Narx tarixi */}
      <div className="space-y-2">
        <h2 className="font-semibold text-gray-900">Narx tarixi</h2>
        <TariffVersionsTable
          tariffId={tariff.id}
          versions={tariff.versions ?? []}
        />
        <p className="text-xs text-gray-500">
          Narx o'zgarsa, biriktirilgan o'quvchilarga yangi oydan boshlab
          avtomatik yangi narx qo'llanadi — biriktirishlarni qayta yozish
          shart emas.
        </p>
      </div>

      {/* Biriktirilgan o'quvchilar */}
      <div className="space-y-2">
        <h2 className="font-semibold text-gray-900">Biriktirilgan o'quvchilar</h2>
        <AssignedStudentsTable assignments={assignments} />

        {pagination && pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            hasNextPage={pagination.hasNextPage}
            hasPrevPage={pagination.hasPrevPage}
            onPageChange={(next) =>
              setSearchParams((prev) => {
                prev.set("page", String(next));
                return prev;
              })
            }
          />
        )}
      </div>

      {/* Modals */}
      <EditTariffModal />
      <AddTariffVersionModal />
      <EditTariffVersionModal />
      <AssignTariffModal />
      <ChangeStudentTariffModal />
    </div>
  );
};

export default TariffDetailPage;
