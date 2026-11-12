// Components
import Card from "@/shared/components/ui/Card";
import LanguageBadge from "@/shared/components/ui/LanguageBadge";

// Utils
import { cn } from "@/shared/utils/cn";

// Icons
import { CircleCheck, CircleX, Info, TriangleAlert, Users } from "lucide-react";

/**
 * HAR O'QUVCHIGA MOSLANGAN TEST — OLDINDAN KO'RISH.
 *
 * ⚠️ EKRANNING ASOSIY SAVOLI: "kim qaysi oraliqda test oladi va KIMGA
 * TUSHMAYDI". Ikkinchisi birinchisidan muhimroq: "25 tadan 24 tasiga test
 * tushdi" degan holat NORMAL, lekin u JIM qolmasligi kerak.
 *
 * ⚠️ QAMROV GURUHLARI OCHIQ KO'RSATILADI: admin "25 bolaga 25 xil test"
 * deb o'ylamasligi kerak — bir xil mavzu oralig'idagi bolalar AYNI
 * savollarni oladi va bu AI chaqiruvlari sonini ham belgilaydi (pul).
 *
 * ⚠️ O'QUVCHINI BELGIDAN CHIQARISH — testdan chiqarish: ro'yxat serverga
 * `studentIds` bo'lib ketadi. Belgilanmaganiga savol yozilmaydi ham,
 * tanlanmaydi ham.
 */
const StudentPlanCard = ({
  plan,
  stale,
  excluded = [],
  onToggleStudent,
  onToggleAll,
}) => {
  if (!plan) return null;

  const students = plan.students ?? [];
  const totals = plan.totals ?? {};
  const ready = students.filter(
    (row) => row.status === "ready" && !excluded.includes(row.student.id),
  );

  return (
    <Card
      className={cn(
        "border-2",
        stale
          ? "border-amber-300 bg-amber-50/40"
          : plan.canBuild
            ? "border-emerald-200"
            : "border-red-200",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex flex-wrap items-center gap-2 font-semibold text-gray-900">
            <Users className="size-4 text-gray-500" strokeWidth={1.5} />
            Har o'quvchiga moslangan test
            <LanguageBadge language={plan.language} asClass />
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            {plan.class?.name} · {ready.length} o'quvchiga test tushadi
            {totals.failed > 0 && (
              <span className="text-red-700"> · {totals.failed} tasiga yo'q</span>
            )}
          </p>
        </div>

        {onToggleAll && (
          <button
            type="button"
            onClick={onToggleAll}
            className="text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            {excluded.length > 0 ? "Hammasini belgilash" : "Belgini olish"}
          </button>
        )}
      </div>

      {stale && (
        <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-amber-100 p-2.5 text-xs text-amber-900">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0" strokeWidth={1.5} />
          Taqsimot o'zgardi — natija eskirdi. Qayta <b>Tekshirish</b> ni bosing.
        </p>
      )}

      {/* ── QAMROV GURUHLARI (AI narxi) ── */}
      {plan.groups?.length > 0 && (
        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3">
          <p className="flex items-start gap-1.5 text-xs text-gray-700">
            <Info className="mt-0.5 size-3.5 shrink-0 text-gray-400" strokeWidth={1.5} />
            <span>
              <b>{totals.scopeGroups}</b> xil mavzu oralig'i —{" "}
              <b>{totals.questionsPerStudent}</b> savol har bolaga.
              {totals.aiQuestions > 0 && (
                <> AI <b>{totals.aiQuestions}</b> ta savol yozadi.</>
              )}{" "}
              Bir xil oraliqdagi o'quvchilar ayni savollarni oladi.
            </span>
          </p>

          <ul className="mt-2 space-y-1">
            {plan.groups.map((group) => (
              <li key={group.signature} className="text-xs text-gray-600">
                • {group.label || "Mavzu qamrovi yo'q"} —{" "}
                <b>{group.students}</b> o'quvchi
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── O'QUVCHILAR ── */}
      <div className="mt-4 max-h-[420px] space-y-2 overflow-y-auto pr-1 show-scrollbar">
        {students.map((row) => (
          <StudentRow
            key={row.student.id}
            row={row}
            isExcluded={excluded.includes(row.student.id)}
            onToggle={() => onToggleStudent?.(row.student.id)}
          />
        ))}
      </div>

      {/* ── XATO VA OGOHLANTIRISHLAR ── */}
      {plan.errors?.length > 0 && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3">
          <p className="mb-1 text-xs font-semibold text-red-900">
            Tuzatilishi kerak ({plan.errors.length})
          </p>
          <ul className="space-y-0.5">
            {plan.errors.map((error, index) => (
              <li key={index} className="text-xs text-red-800">
                • {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {plan.warnings?.length > 0 && (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="mb-1 text-xs font-semibold text-amber-900">
            Diqqat ({plan.warnings.length})
          </p>
          <ul className="space-y-0.5">
            {plan.warnings.slice(0, 20).map((warning, index) => (
              <li key={index} className="text-xs text-amber-800">
                • {warning}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};

const StudentRow = ({ row, isExcluded, onToggle }) => {
  const name = `${row.student.lastName ?? ""} ${row.student.firstName ?? ""}`.trim();
  const failed = row.status !== "ready";

  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-xl border p-2.5 transition-colors",
        failed
          ? "border-red-200 bg-red-50/50"
          : isExcluded
            ? "border-gray-200 bg-gray-50 opacity-60"
            : "border-gray-200",
      )}
    >
      {/* Belgidan chiqarilgan o'quvchi testga KIRMAYDI */}
      <input
        type="checkbox"
        checked={!failed && !isExcluded}
        disabled={failed}
        onChange={onToggle}
        className="mt-1 size-4 shrink-0 rounded border-gray-300 disabled:opacity-40"
      />

      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-gray-900">
          {failed ? (
            <CircleX className="size-3.5 shrink-0 text-red-600" strokeWidth={1.5} />
          ) : (
            <CircleCheck
              className="size-3.5 shrink-0 text-emerald-600"
              strokeWidth={1.5}
            />
          )}
          <span className="truncate">{name}</span>
          {!failed && row.inherited && (
            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-600">
              Guruh bilan
            </span>
          )}
        </p>

        {failed ? (
          <p className="mt-0.5 text-xs text-red-800">{row.reason}</p>
        ) : (
          <div className="mt-1 space-y-0.5">
            {row.rows
              .filter((scope) => scope.topicMode)
              .map((scope) => (
                <p key={scope.index} className="text-xs text-gray-600">
                  {scope.subjectName}:{" "}
                  <b>
                    {scope.topicFrom}–{scope.topicTo}-mavzu
                  </b>{" "}
                  ({scope.topicCount} ta)
                  {scope.step > 1 && ` · 1 dars = ${scope.step} mavzu`}
                  {scope.clamped && (
                    <span className="text-amber-700"> · oraliq kesildi</span>
                  )}
                </p>
              ))}

            {row.shortfall > 0 && (
              <p className="text-xs text-amber-700">
                Bankda {row.shortfall} ta savol yetmaydi
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentPlanCard;
