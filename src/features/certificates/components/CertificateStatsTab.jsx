// React
import { useState } from "react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Toast
import { toast } from "sonner";

// Icons
import {
  Archive,
  ArchiveRestore,
  BarChart3,
  Pencil,
  Plus,
  Users,
} from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Badge from "@/shared/components/ui/badge/Badge";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import EmptyState from "@/shared/components/ui/EmptyState";
import LoaderCard from "@/shared/components/ui/LoaderCard";
import Table, { Td, Tr } from "@/shared/components/ui/Table";
import CertificateStatsCards from "./CertificateStatsCards";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Utils
import { cn } from "@/shared/utils/cn";

// Queries & data
import { useClasses } from "@/features/classes/queries/classes.queries";
import { certificatesQueries } from "../queries/certificates.queries";
import { useUpdateCertificateTrack } from "../queries/certificates.mutations";
import { ALL, NO_CLASS } from "../data/certificates.data";

/**
 * STATISTIKA TABI.
 *
 * To'rt kesim: YO'NALISHLAR (umumiy), GURUH + FAN (o'quvchilar ismi bilan),
 * sinflar va muddat oylari.
 *
 * ⚠️ YO'NALISHLAR KATALOGI SHU YERDAN boshqariladi — alohida tab YO'Q
 * (biznes qarori, 2026-10-19: umumiy jadval uni ortiqcha qildi). Lekin
 * MAKTAB FANIGA BOG'LASH yo'qolmasligi kerak: aynan o'sha bog'lanish mavzu
 * progressini beradi, ya'ni usiz IELTS/CEFR da foiz umuman chiqmaydi.
 * Shuning uchun "Maktab fani" ustuni va arxivlash shu jadvalda.
 *
 * ⚠️ Rejasi YO'Q yo'nalish ham ro'yxatda (0 bilan) va arxivlangani
 * ALOHIDA, yopiq holda: aks holda ularni fanga bog'lash ham, arxivdan
 * qaytarish ham mumkin bo'lmay qolardi.
 *
 * ⚠️ Sinf filtri BUTUN ekranga ta'sir qiladi (kartalar ham): tanlanganda
 * ekran bitta sinf haqida bo'lishi kerak.
 *
 * ⚠️ Ikki sinfda o'qiydigan o'quvchi HAR IKKI sinf kesimida sanaladi,
 * "Jami" da esa bir marta — shu sababli kesimlar yig'indisi jamidan katta
 * bo'lishi mumkin (sinflar ro'yxatidagi AYNI qoida).
 */
const CertificateStatsTab = ({ classId, onClassChange, canManage }) => {
  const { openModal } = useModal();
  const { data: classes = [] } = useClasses();
  const [showArchived, setShowArchived] = useState(false);

  const params = classId && classId !== ALL ? { classId } : undefined;
  const { data: stats, isLoading } = useQuery(certificatesQueries.stats(params));

  const scopeLabel =
    classId === NO_CLASS
      ? "Sinfsiz o'quvchilar"
      : classId && classId !== ALL
        ? (classes.find((cls) => cls.id === classId)?.name ?? "Tanlangan sinf")
        : "Butun maktab";

  const classOptions = [
    { value: ALL, label: "Butun maktab" },
    { value: NO_CLASS, label: "Sinfsiz" },
    ...classes.map((cls) => ({ value: cls.id, label: cls.name })),
  ];

  const tracks = stats?.byTrack ?? [];
  const activeTracks = tracks.filter((track) => track.isActive);
  const archivedTracks = tracks.filter((track) => !track.isActive);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          Sertifikat rejalari — joriy o'quvchilar bo'yicha
        </p>

        <div className="flex items-center gap-2.5">
          {canManage && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => openModal("certificateTrack", { track: null })}
            >
              <Plus className="size-4" strokeWidth={2} />
              Yo'nalish
            </Button>
          )}

          <Select
            name="statsClass"
            value={classId || ALL}
            onChange={onClassChange}
            options={classOptions}
            placeholder="Sinf"
            triggerClassName="w-full sm:w-48"
          />
        </div>
      </div>

      <CertificateStatsCards totals={stats?.totals} scopeLabel={scopeLabel} />

      {isLoading && !stats ? (
        <LoaderCard title="Statistika yuklanmoqda..." />
      ) : !stats ? (
        <Card>
          <EmptyState icon={BarChart3} title="Ma'lumot yo'q" />
        </Card>
      ) : (
        <>
          <TrackTable
            rows={activeTracks}
            archived={archivedTracks}
            showArchived={showArchived}
            onToggleArchived={() => setShowArchived((prev) => !prev)}
            totalStudents={stats.totals.students}
            canManage={canManage}
          />

          <ClassTrackTable rows={stats.byClassTrack} />

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <BreakdownCard
              title="Sinflar bo'yicha"
              rows={stats.byClass}
              total={stats.totals.students}
              nameLabel="Sinf"
            />

            <BreakdownCard
              title="Muddat oylari bo'yicha"
              rows={stats.byMonth.map((row) => ({ ...row, name: row.label }))}
              total={stats.totals.plans}
              nameLabel="Oy"
              countBy="plans"
            />
          </div>
        </>
      )}
    </div>
  );
};

/* ─────────────────── YO'NALISHLAR (umumiy) ─────────────────── */

/**
 * "UMUMIY" JADVALI — sertifikat fani va o'quvchilar soni.
 *
 * Katalog ham shu yerdan boshqariladi: "Maktab fani" ustuni mavzu
 * progressining manbai va uni bog'lamasdan IELTS/CEFR da foiz chiqmaydi.
 */
const TrackTable = ({
  rows,
  archived,
  showArchived,
  onToggleArchived,
  totalStudents,
  canManage,
}) => {
  const { openModal } = useModal();
  const { mutateAsync: updateTrack, isPending } = useUpdateCertificateTrack();

  const toggleArchive = async (track) => {
    try {
      await updateTrack({ id: track.id, isActive: !track.isActive });
      toast.success(track.isActive ? "Yo'nalish arxivlandi" : "Yo'nalish qaytarildi");
    } catch (error) {
      toast.error(error.response?.data?.message || "Amalni bajarib bo'lmadi");
    }
  };

  const columns = [
    "Sertifikat fani",
    { label: "O'quvchilar soni", align: "right" },
    { label: "Rejalar", align: "right" },
    { label: "Ulush", align: "right", className: "w-32" },
    ...(canManage ? ["Maktab fani", { label: "", align: "right" }] : ["Maktab fani"]),
  ];

  const renderRow = (track) => {
    const percent =
      totalStudents > 0 ? Math.round((track.students / totalStudents) * 100) : 0;

    return (
      <Tr key={track.id} className={track.isActive ? "" : "bg-gray-50/60"}>
        <Td className="font-medium text-gray-900">
          {track.name}
          {!track.isActive && (
            <Badge variant="outline" className="ml-2 text-[10px]">
              arxivda
            </Badge>
          )}
        </Td>

        <Td align="right" className="font-semibold text-gray-900">
          {track.students}
        </Td>

        <Td align="right" className="text-gray-500">
          {track.plans}
        </Td>

        <Td align="right">
          <div className="flex items-center justify-end gap-2">
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.min(percent, 100)}%` }}
              />
            </div>
            <span className="w-9 text-xs text-gray-500">{percent}%</span>
          </div>
        </Td>

        <Td>
          {track.subject ? (
            track.subject.name
          ) : (
            <span
              className="text-amber-700"
              title="Fan bog'lanmagan — mavzu progressi ko'rsatilmaydi"
            >
              Bog'lanmagan
            </span>
          )}
        </Td>

        {canManage && (
          <Td align="right">
            <div className="flex justify-end gap-1">
              <Button
                size="icon"
                variant="ghost"
                title="Nomi va maktab fanini o'zgartirish"
                onClick={() => openModal("certificateTrack", { track })}
              >
                <Pencil className="size-4" strokeWidth={1.75} />
              </Button>

              <Button
                size="icon"
                variant="ghost"
                disabled={isPending}
                title={track.isActive ? "Arxivlash" : "Arxivdan qaytarish"}
                onClick={() => toggleArchive(track)}
              >
                {track.isActive ? (
                  <Archive className="size-4" strokeWidth={1.75} />
                ) : (
                  <ArchiveRestore className="size-4" strokeWidth={1.75} />
                )}
              </Button>
            </div>
          </Td>
        )}
      </Tr>
    );
  };

  return (
    <Card title="Yo'nalishlar bo'yicha — umumiy" className="overflow-hidden">
      {rows.length === 0 && archived.length === 0 ? (
        <p className="px-1 py-6 text-center text-sm text-gray-500">
          Yo'nalish yo'q — fayldan yuklashda ular avtomatik yaratiladi
        </p>
      ) : (
        <>
          <Table className="mt-3" columns={columns}>
            {rows.map(renderRow)}
            {showArchived && archived.map(renderRow)}
          </Table>

          {archived.length > 0 && (
            <button
              type="button"
              onClick={onToggleArchived}
              className="mt-2 text-xs text-gray-500 underline-offset-2 hover:underline"
            >
              {showArchived
                ? "Arxivlanganlarni yashirish"
                : `Arxivlangan yo'nalishlar (${archived.length})`}
            </button>
          )}
        </>
      )}
    </Card>
  );
};

/* ─────────────────── GURUH + FAN ─────────────────── */

/**
 * GURUHLAR VA FANLAR BO'YICHA — o'quvchilar ISMI bilan.
 *
 * Bu hisobotning asosiy jadvali: "IT 1 da CEFR ni kim topshiradi" degan
 * savolga sanoq bilan emas, ISM bilan javob beradi.
 */
const ClassTrackTable = ({ rows }) => (
  <Card
    title="Guruhlar va fanlar bo'yicha"
    icon={Users}
    className="overflow-hidden"
  >
    {rows.length === 0 ? (
      <p className="px-1 py-6 text-center text-sm text-gray-500">Ma'lumot yo'q</p>
    ) : (
      <Table
        className="mt-3"
        columns={[
          "Guruh",
          "Sertifikat fani",
          { label: "O'quvchilar soni", align: "right" },
          "O'quvchilar ro'yxati",
        ]}
      >
        {rows.map((row) => (
          <Tr key={`${row.classId}-${row.trackId}`}>
            <Td className="font-medium text-gray-900">{row.className}</Td>
            <Td>{row.trackName}</Td>
            <Td align="right" className="font-semibold text-gray-900">
              {row.students}
            </Td>
            <Td nowrap={false} className="min-w-72 text-gray-600">
              {row.studentNames.join(", ")}
            </Td>
          </Tr>
        ))}
      </Table>
    )}
  </Card>
);

/* ─────────────────── oddiy kesimlar ─────────────────── */

const BreakdownCard = ({ title, rows, total, nameLabel, countBy = "students" }) => (
  <Card title={title} className="overflow-hidden">
    {rows.length === 0 ? (
      <p className="px-1 py-6 text-center text-sm text-gray-500">Ma'lumot yo'q</p>
    ) : (
      <Table
        className="mt-3"
        columns={[
          nameLabel,
          { label: "O'quvchi", align: "right" },
          { label: "Reja", align: "right" },
          { label: "Ulush", align: "right", className: "w-32" },
        ]}
      >
        {rows.map((row) => {
          const value = row[countBy] ?? 0;
          const percent = total > 0 ? Math.round((value / total) * 100) : 0;

          return (
            <Tr key={row.id ?? row.month}>
              <Td className="font-medium text-gray-900">{row.name}</Td>
              <Td align="right">{row.students}</Td>
              <Td align="right">{row.plans}</Td>
              <Td align="right">
                <div className="flex items-center justify-end gap-2">
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={cn("h-full rounded-full bg-primary")}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                  <span className="w-9 text-xs text-gray-500">{percent}%</span>
                </div>
              </Td>
            </Tr>
          );
        })}
      </Table>
    )}
  </Card>
);

export default CertificateStatsTab;
