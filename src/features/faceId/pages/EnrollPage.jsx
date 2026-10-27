// React
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";

// Router
import { useOutletContext, useSearchParams } from "react-router-dom";

// Icons
import { ScanFace, Search, UserRound, Users } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Button from "@/shared/components/ui/button/Button";
import Input from "@/shared/components/ui/input/Input";
import Select from "@/shared/components/ui/select/Select";
import Table, { Tr, Td } from "@/shared/components/ui/Table";
import Pagination from "@/shared/components/ui/Pagination";
import EmptyState from "@/shared/components/ui/EmptyState";
import LoaderCard from "@/shared/components/ui/LoaderCard";
import EnrollModal from "../components/EnrollModal";

// Hooks
import useModal from "@/shared/hooks/useModal";
import usePermissions from "@/shared/hooks/usePermissions";
import useDebounce from "@/shared/hooks/useDebounce";

// Queries
import { faceIdQueries } from "../queries/faceId.queries";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateTimeUz } from "@/shared/utils/date.utils";

// Data
import {
  ENROLLED_FILTERS,
  PERSON_ROLE_FILTERS,
  RECOMMENDED_SAMPLES,
} from "../data/faceId.data";

/**
 * RO'YXATGA OLISH — "kimni ro'yxatga olish kerak".
 *
 * ⚠️ RO'YXAT `User` DAN BOSHLANADI, profil jadvalidan EMAS. Bo'limning
 * asosiy savoli "kim HALI ro'yxatda yo'q" va u faqat profillar
 * ro'yxatidan javob olmaydi: ro'yxatga olinmagan odamning profili ham
 * yo'q, ya'ni u ekranda umuman ko'rinmasdi.
 *
 * ⚠️ DEFAULT FILTR — "ro'yxatga olinmaganlar". Xodim bu ekranga aynan
 * shu ish uchun keladi (bittalab o'tkazib chiqish); ro'yxatga olinganlar
 * esa tekshirish uchun kerak bo'ladi, ya'ni kamroq.
 */
const EnrollPage = () => {
  const { filterSlot, overview } = useOutletContext();
  const { can } = usePermissions();
  const { openModal } = useModal();

  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const role = params.get("role") || "all";
  const enrolled = params.get("enrolled") || "false";
  const page = Number(params.get("page")) || 1;

  const { data: settingsData } = useQuery(faceIdQueries.settings());
  const settings = settingsData?.settings;

  const query = useMemo(
    () => ({
      role,
      enrolled,
      search: debouncedSearch || undefined,
      page,
      limit: 25,
    }),
    [role, enrolled, debouncedSearch, page],
  );

  const { data, isPending } = useQuery(faceIdQueries.people(query));

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (!value || value === "all") next.delete(key);
    else next.set(key, value);
    if (key !== "page") next.delete("page");
    setParams(next, { replace: true });
  };

  const rows = data?.data ?? [];
  const coverage = overview?.coverage;

  const columns = [
    "Odam",
    "Holat",
    { label: "Kadrlar", align: "center" },
    "Oxirgi tanilgan",
    { label: "", key: "actions", align: "right" },
  ];

  return (
    <>
      {filterSlot &&
        createPortal(
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ism yoki familiya"
                className="h-10 w-full pl-9 xs:w-56"
              />
            </div>

            <Select
              value={role}
              options={PERSON_ROLE_FILTERS}
              onChange={(value) => setParam("role", value)}
              triggerClassName="w-full xs:w-36"
            />

            <Select
              value={enrolled}
              options={ENROLLED_FILTERS}
              onChange={(value) => setParam("enrolled", value)}
              triggerClassName="w-full xs:w-52"
            />
          </>,
          filterSlot,
        )}

      {/* ── Qamrov kartalari ── */}
      {coverage && (
        <div className="grid gap-3 sm:grid-cols-3">
          <CoverageCard
            label="Xodimlar"
            enrolled={coverage.staff.enrolled}
            total={coverage.staff.total}
          />
          <CoverageCard
            label="O'quvchilar"
            enrolled={coverage.students.enrolled}
            total={coverage.students.total}
          />
          <div className="rounded-2xl bg-white p-4">
            <p className="text-[12px] text-gray-500">Jami kadr</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {coverage.sampleCount}
            </p>
            <p className="mt-0.5 text-[11.5px] text-gray-400">
              {coverage.model} · {coverage.dim} o'lcham · galereya v{coverage.version}
            </p>
          </div>
        </div>
      )}

      {isPending ? (
        <LoaderCard />
      ) : rows.length === 0 ? (
        <div className="rounded-2xl bg-white">
          <EmptyState
            icon={Users}
            title={
              enrolled === "false"
                ? "Hammasi ro'yxatga olingan"
                : "Odam topilmadi"
            }
            description={
              enrolled === "false"
                ? "Bu filtrda ro'yxatga olinmagan odam qolmadi."
                : "Qidiruv yoki filtrni o'zgartirib ko'ring."
            }
          />
        </div>
      ) : (
        <>
          <Table columns={columns}>
            {rows.map((row) => (
              <Tr key={row.userId}>
                <Td nowrap={false}>
                  <div className="flex items-center gap-2.5">
                    {row.photo ? (
                      <img src={row.photo} alt="" className="size-8 rounded-full object-cover" />
                    ) : (
                      <span className="flex size-8 items-center justify-center rounded-full bg-gray-100">
                        <UserRound className="size-4 text-gray-400" />
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900">{row.name}</p>
                      <p className="text-[11.5px] text-gray-500">
                        {row.role === "student" ? "O'quvchi" : "Xodim"}
                        {!row.isActive && " · login o'chirilgan"}
                      </p>
                    </div>
                  </div>
                </Td>

                <Td>
                  <StatusChip row={row} />
                </Td>

                <Td align="center">
                  <span
                    className={cn(
                      "font-medium",
                      (row.profile?.sampleCount ?? 0) >= RECOMMENDED_SAMPLES
                        ? "text-emerald-600"
                        : row.enrolled
                          ? "text-amber-600"
                          : "text-gray-300",
                    )}
                  >
                    {row.profile?.sampleCount ?? 0}
                  </span>
                </Td>

                <Td className="text-[12.5px] text-gray-500">
                  {row.profile?.lastMatchedAt
                    ? formatDateTimeUz(row.profile.lastMatchedAt)
                    : "—"}
                </Td>

                <Td align="right">
                  {can("faceId.enroll") ? (
                    <Button
                      size="sm"
                      variant={row.enrolled ? "outline" : "default"}
                      className="gap-1.5"
                      onClick={() =>
                        openModal("faceEnroll", { person: row, settings })
                      }
                    >
                      <ScanFace className="size-4" />
                      {row.enrolled ? "Kadrlar" : "Ro'yxatga olish"}
                    </Button>
                  ) : null}
                </Td>
              </Tr>
            ))}
          </Table>

          {data.pagination?.totalPages > 1 && (
            <Pagination
              className="mt-4"
              currentPage={page}
              totalPages={data.pagination.totalPages}
              hasNextPage={data.pagination.hasNextPage}
              hasPrevPage={data.pagination.hasPrevPage}
              onPageChange={(next) => setParam("page", String(next))}
            />
          )}
        </>
      )}

      <EnrollModal />
    </>
  );
};

/**
 * ⚠️ "Ro'yxatda" bilan "Yetarli" AJRATILADI. Bitta kadr bilan odam
 * formal ravishda ro'yxatda, lekin ko'zoynagini kiysa yoki yorug'lik
 * o'zgarsa kiosk uni tanimaydi. Ikkalasini bitta belgiga yig'ish
 * "ro'yxatga oldim, nega ishlamayapti" degan savolni tug'dirardi.
 */
const StatusChip = ({ row }) => {
  const count = row.profile?.sampleCount ?? 0;
  const inactive = row.profile && !row.profile.isActive;

  if (inactive) {
    return (
      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[12px] font-medium text-gray-600">
        Vaqtincha o'chirilgan
      </span>
    );
  }
  if (count === 0) {
    return (
      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[12px] font-medium text-gray-500">
        Ro'yxatda yo'q
      </span>
    );
  }
  if (count < RECOMMENDED_SAMPLES) {
    return (
      <span
        className="rounded-full bg-amber-50 px-2.5 py-1 text-[12px] font-medium text-amber-700"
        title={`Kamida ${RECOMMENDED_SAMPLES} kadr tavsiya etiladi`}
      >
        Kadr yetarli emas
      </span>
    );
  }
  return (
    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[12px] font-medium text-emerald-700">
      Ro'yxatda
    </span>
  );
};

const CoverageCard = ({ label, enrolled, total }) => {
  const percent = total > 0 ? Math.round((enrolled / total) * 100) : 0;

  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-[12px] text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">
        {enrolled}
        <span className="text-base font-normal text-gray-400"> / {total}</span>
      </p>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            percent >= 80 ? "bg-emerald-500" : percent >= 40 ? "bg-amber-500" : "bg-rose-400",
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-1 text-[11.5px] text-gray-400">{percent}% ro'yxatga olingan</p>
    </div>
  );
};

export default EnrollPage;
