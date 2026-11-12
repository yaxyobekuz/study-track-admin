// React
import { useState } from "react";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import LanguageBadge from "@/shared/components/ui/LanguageBadge";

// Data — o'quv tili (server bilan qo'lda sinxron)
import { languageClassLabel } from "@/shared/data/teachingLanguage.data";

// Hooks
import { useTopicSubjectStatus } from "@/features/subjects/queries/topics.queries";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateUz } from "@/shared/utils/date.utils";

// Icons
import { CircleCheck, CircleDashed, TriangleAlert, Upload } from "lucide-react";

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
 *
 * ⚠️ HOLAT TANLANGAN TIL BO'YICHA (2026-11-12): "Matematikaga reja
 * yuklangan" degan javob RUS guruh uchun yolg'on bo'lishi mumkin — unda
 * faqat o'zbek rejasi bor. Shuning uchun qatorda uch tilning kesimi ham
 * turadi va "GURUH BOR, REJA YO'Q" holati alohida ogohlantirish bo'lib
 * chiqadi.
 */

const FILTERS = [
  { value: "all", label: "Hammasi" },
  { value: "loaded", label: "Yuklangan" },
  { value: "missing", label: "Yuklanmagan" },
];

const SubjectTopicStatus = ({
  selectedSubject,
  onSelect,
  onUpload,
  language,
  onLanguageChange,
}) => {
  // ⚠️ Til filtri SERVERGA ketadi: sanoq ("5 fanga yuklangan") o'sha
  // tilning raqami bo'lishi kerak, aks holda rus guruh bilan ishlayotgan
  // odam o'zbek rejasining sanog'ini ko'rardi.
  const { data, isLoading } = useTopicSubjectStatus(language);
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
          <h3 className="flex flex-wrap items-center gap-2 text-base font-semibold text-gray-900">
            Fanlar bo'yicha mavzular
            <LanguageBadge language={language} asClass />
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

      {/* ⚠️ TIL KESIMI: "ingliz guruh bor, lekin ingliz rejasi yuklanmagan"
          holatini admin aynan shu yerdan ko'radi. Usiz u har tilni qo'lda
          tanlab tekshirib chiqishi kerak bo'lardi. */}
      {totals?.byLanguage?.length > 0 && (
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {totals.byLanguage.map((row) => (
            <LanguageSummary
              key={row.language}
              row={row}
              isActive={row.language === language}
              onClick={() => onLanguageChange?.(row.language)}
            />
          ))}
        </div>
      )}

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
              language={language}
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

/**
 * TIL KESIMI — "shu tilda nechta fanga reja bor va nechta guruh bor".
 *
 * ⚠️ Qator BOSILADI va tilni almashtiradi: raqamni ko'rgan odam darhol
 * o'sha tilga o'tishi kerak, ikkinchi tanlagichni qidirmasligi kerak.
 */
const LanguageSummary = ({ row, isActive, onClick }) => {
  // ⚠️ OGOHLANTIRISH SHARTI: guruh bor-u, birorta fanga reja yo'q. Bu
  // holatda o'sha guruhlarning jadvalida mavzu UMUMAN ko'rinmaydi.
  const warn = row.classes > 0 && row.subjects === 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border p-3 text-left transition-colors",
        isActive
          ? "border-blue-500 bg-blue-50"
          : warn
            ? "border-amber-300 bg-amber-50/60 hover:border-amber-400"
            : "border-gray-200 hover:border-gray-300",
      )}
    >
      <span className="flex items-center gap-2">
        <LanguageBadge language={row.language} asClass />
        {warn && (
          <TriangleAlert className="size-3.5 text-amber-600" strokeWidth={1.5} />
        )}
      </span>

      <span className="mt-1.5 block text-sm text-gray-700">
        {row.subjects} fanda reja · {row.topics} mavzu
      </span>
      <span className="mt-0.5 block text-xs text-gray-500">
        {row.classes} ta faol guruh
        {warn && " — rejasi yo'q"}
      </span>
    </button>
  );
};

const SubjectRow = ({ subject, language, isSelected, onSelect, onUpload }) => {
  const { hasTopics, topicCount, lastUploadedAt, isActive, name } = subject;

  // Boshqa tillarda reja bor-yo'qligi: "o'zbekchasi bor, ruschasi yo'q"
  // degan holat qatorning o'zidan ko'rinishi kerak.
  const others = (subject.languages ?? []).filter(
    (row) => row.language !== language && row.hasTopics,
  );

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
              `${languageClassLabel(language)} rejasi yuklanmagan`
            )}
          </span>

          {/* Boshqa tillarda reja bor — qaysi tilda yetishmayotgani aniq bo'lsin */}
          {others.length > 0 && (
            <span className="mt-1 flex flex-wrap items-center gap-1">
              <span className="text-[11px] text-gray-400">Boshqa tillarda:</span>
              {others.map((row) => (
                <LanguageBadge key={row.language} language={row.language} />
              ))}
            </span>
          )}
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
