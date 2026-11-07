// React
import { useState } from "react";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";

// Hooks
import { useTopicSubjectStatus } from "@/features/subjects/queries/topics.queries";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateUz } from "@/shared/utils/date.utils";

// Icons
import { CircleCheck, CircleDashed, Upload } from "lucide-react";

/**
 * FANLAR BO'YICHA MAVZU HOLATI — "qaysisiga yuklangan, qaysisiga yo'q".
 *
 * ⚠️ Ro'yxat FANLAR katalogidan keladi (server shunday quradi), mavzulardan
 * EMAS: mavzudan yig'ilsa aynan javob kerak bo'lgan fan — mavzusi
 * yo'qlari — ro'yxatda umuman ko'rinmasdi.
 *
 * ⚠️ Holat HECH NARSANI TO'SMAYDI: yuklangan fanga ham yangi fayl
 * yuklanaveradi (yuklash ro'yxatni almashtiradi). Shuning uchun har
 * qatorda yuklash tugmasi bor va u yuklangan fanda ham ochiq turadi.
 */

const FILTERS = [
  { value: "all", label: "Hammasi" },
  { value: "loaded", label: "Yuklangan" },
  { value: "missing", label: "Yuklanmagan" },
];

const SubjectTopicStatus = ({ selectedSubject, onSelect, onUpload }) => {
  const { data, isLoading } = useTopicSubjectStatus();
  const [filter, setFilter] = useState("all");

  const items = data?.items ?? [];
  const totals = data?.totals;

  // Ro'yxat fanlar soni bilan chegaralangan (o'nlab qator) — memolash
  // kerak emas va u faqat bog'liqliklar ro'yxatini chalkashtirardi.
  const visible =
    filter === "all"
      ? items
      : items.filter((item) =>
          filter === "loaded" ? item.hasTopics : !item.hasTopics,
        );

  if (isLoading) {
    return (
      <Card className="mb-6">
        <p className="text-sm text-gray-500">Fanlar holati yuklanmoqda...</p>
      </Card>
    );
  }

  if (items.length === 0) return null;

  return (
    <Card className="mb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Fanlar bo'yicha mavzular
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Jami {totals?.subjects ?? items.length} ta fan —{" "}
            <span className="font-medium text-green-700">
              {totals?.withTopics ?? 0} tasiga yuklangan
            </span>
            ,{" "}
            <span className="font-medium text-amber-700">
              {totals?.withoutTopics ?? 0} tasiga yuklanmagan
            </span>
          </p>
        </div>

        {/* Filtr: "yuklanmaganlar" — ish qoladigan ro'yxat */}
        <div className="flex shrink-0 gap-1 rounded-lg bg-gray-100 p-1">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                filter === item.value
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">
          {filter === "missing"
            ? "Hamma fanga mavzular yuklangan"
            : "Hali birorta fanga mavzu yuklanmagan"}
        </p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((subject) => (
            <SubjectRow
              key={subject.id}
              subject={subject}
              isSelected={subject.id === selectedSubject}
              onSelect={() => onSelect(subject.id)}
              onUpload={() => onUpload(subject.id)}
            />
          ))}
        </div>
      )}
    </Card>
  );
};

const SubjectRow = ({ subject, isSelected, onSelect, onUpload }) => {
  const { hasTopics, topicCount, lastUploadedAt, isActive, name } = subject;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border p-3 transition-colors",
        isSelected
          ? "border-blue-500 bg-blue-50"
          : hasTopics
            ? "border-gray-200 hover:border-gray-300"
            : "border-amber-200 bg-amber-50/50 hover:border-amber-300",
      )}
    >
      {/* Qatorga bosish — o'sha fanning mavzularini ochadi */}
      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-start gap-2 text-left"
      >
        {hasTopics ? (
          <CircleCheck
            className="mt-0.5 size-4 shrink-0 text-green-600"
            strokeWidth={1.5}
          />
        ) : (
          <CircleDashed
            className="mt-0.5 size-4 shrink-0 text-amber-600"
            strokeWidth={1.5}
          />
        )}

        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="truncate text-sm font-medium text-gray-900">
              {name}
            </span>
            {!isActive && (
              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-500">
                Nofaol
              </span>
            )}
          </span>

          <span className="mt-0.5 block text-xs text-gray-500">
            {hasTopics ? (
              <>
                {topicCount} ta mavzu
                {lastUploadedAt && ` · ${formatDateUz(lastUploadedAt)}`}
              </>
            ) : (
              "Mavzular yuklanmagan"
            )}
          </span>
        </span>
      </button>

      {/* ⚠️ Yuklangan fanda ham ochiq: yangi fayl eskisini almashtiradi */}
      <Button
        type="button"
        variant="outline"
        className="h-9 w-9 shrink-0 p-0"
        title={hasTopics ? "Ustiga qayta yuklash" : "Mavzular yuklash"}
        onClick={onUpload}
      >
        <Upload className="size-4" strokeWidth={1.5} />
      </Button>
    </div>
  );
};

export default SubjectTopicStatus;
