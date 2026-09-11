// React
import { useState } from "react";

// Query
import { useQuery } from "@tanstack/react-query";

// Toast
import { toast } from "sonner";

// Icons
import { X, RotateCcw, Eye, ArrowLeft } from "lucide-react";

// Components
import Button from "@/shared/components/ui/button/Button";

// Queries
import { schedulesQueries } from "../queries/schedules.queries";
import { useRestoreRevision } from "../queries/schedules.mutations";

// Utils
import { formatDateTimeUz } from "@/shared/utils/date.utils";

const ACTION_META = {
  edit: { label: "Tahrir", cls: "bg-blue-100 text-blue-700" },
  restore: { label: "Qaytarish", cls: "bg-amber-100 text-amber-700" },
};

/**
 * Dars jadvali TAHRIRLAR TARIXI (Google Sheets revision uslubida).
 * Kim/qachon/IP/xulosa, versiyani ko'rish va o'sha holatga qaytarish.
 */
const ScheduleHistoryModal = ({ classId, className, onClose }) => {
  const [selectedId, setSelectedId] = useState(null);

  const { data: list, isLoading } = useQuery(schedulesQueries.revisions(classId));
  const { data: detail } = useQuery(schedulesQueries.revision(selectedId));
  const { mutate: restore, isPending } = useRestoreRevision();

  const revisions = list?.data ?? [];

  const handleRestore = (revId) => {
    if (
      !window.confirm(
        "Shu versiyaga qaytarilsinmi? Joriy jadval yangi versiya sifatida almashtiriladi.",
      )
    )
      return;
    restore(revId, {
      onSuccess: () => {
        toast.success("Versiya qayta tiklandi");
        onClose();
      },
      onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <div className="flex items-center gap-2">
            {selectedId && (
              <button onClick={() => setSelectedId(null)} title="Orqaga">
                <ArrowLeft className="size-4 text-gray-500" />
              </button>
            )}
            <h3 className="font-semibold text-gray-900">
              Tahrirlar tarixi — {className}
            </h3>
          </div>
          <button onClick={onClose} title="Yopish">
            <X className="size-5 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {selectedId && detail ? (
            <RevisionDetail
              detail={detail}
              onRestore={() => handleRestore(selectedId)}
              restoring={isPending}
            />
          ) : isLoading ? (
            <p className="py-8 text-center text-gray-500">Yuklanmoqda...</p>
          ) : revisions.length === 0 ? (
            <p className="py-8 text-center text-gray-500">Hali tahrir tarixi yo'q</p>
          ) : (
            <div className="space-y-2">
              {revisions.map((r) => {
                const a = ACTION_META[r.action] || ACTION_META.edit;
                return (
                  <div
                    key={r.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-gray-200 p-3"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex rounded-md px-1.5 py-0.5 text-xs font-medium ${a.cls}`}
                        >
                          {a.label}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {r.summary}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {r.editedByName || "?"}
                        {r.editedByRole ? ` (${r.editedByRole})` : ""} ·{" "}
                        {formatDateTimeUz(r.createdAt)} · IP {r.ip || "—"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        title="Ko'rish"
                        onClick={() => setSelectedId(r.id)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      >
                        <Eye className="size-4" />
                      </button>
                      <button
                        title="Qaytarish"
                        onClick={() => handleRestore(r.id)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-amber-50 hover:text-amber-600"
                      >
                        <RotateCcw className="size-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const RevisionDetail = ({ detail, onRestore, restoring }) => (
  <div className="space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm text-gray-500">{detail.summary}</p>
      <Button variant="outline" onClick={onRestore} loading={restoring}>
        <RotateCcw className="size-4" />
        Shu versiyaga qaytarish
      </Button>
    </div>
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {(detail.snapshot || []).map((day) => (
        <div key={day.day} className="rounded-xl border border-gray-200 p-2">
          <p className="mb-1 text-sm font-semibold capitalize text-gray-900">
            {day.day}
          </p>
          {(day.subjects || []).length === 0 ? (
            <p className="text-xs text-gray-400">Dars yo'q</p>
          ) : (
            day.subjects.map((s, i) => (
              <p key={i} className="text-xs text-gray-600">
                {s.order}. {s.subjectName} — {s.teacherName}
                {s.startTime ? ` (${s.startTime}-${s.endTime})` : ""}
              </p>
            ))
          )}
        </div>
      ))}
    </div>
  </div>
);

export default ScheduleHistoryModal;
