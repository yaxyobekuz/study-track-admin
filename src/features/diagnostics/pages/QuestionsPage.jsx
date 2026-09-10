// React
import { Fragment, useMemo, useState } from "react";

// Router
import { useOutletContext } from "react-router-dom";
import { createPortal } from "react-dom";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Toast
import { toast } from "sonner";

// Icons
import {
  Plus,
  Upload,
  ChevronRight,
  Download,
  Edit,
  Trash2,
  Database,
  CheckCircle2,
  Clock,
  ShieldAlert,
} from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import Table, { Td, Tr } from "@/shared/components/ui/Table";
import EmptyState from "@/shared/components/ui/EmptyState";
import Pagination from "@/shared/components/ui/Pagination";
import InputField from "@/shared/components/ui/input/InputField";
import SelectField from "@/shared/components/ui/select/SelectField";
import Can from "@/shared/components/guards/Can";
import { Badge } from "../components/ToneBadge";
import QuestionFormModal from "../components/QuestionFormModal";
import {
  DeleteQuestionModal,
  ImportQuestionsModal,
} from "../components/QuestionModals";

// Hooks
import useModal from "@/shared/hooks/useModal";
import useDebounce from "@/shared/hooks/useDebounce";
import usePermissions from "@/shared/hooks/usePermissions";
import { useSubjects } from "@/features/subjects/queries/subjects.queries";

// Queries
import { questionQueries } from "../queries/diagnostics.queries";
import { useUpdateQuestionStatus } from "../queries/diagnostics.mutations";

// API
import { diagnosticQuestionsAPI } from "../api/diagnostics.api";

// Data
import {
  LEVELS,
  LEVEL_LABELS,
  LEVEL_BADGE,
  TYPE_LABELS,
  QUESTION_STATUSES,
  QUESTION_STATUS_LABELS,
  QUESTION_STATUS_BADGE,
  QUESTION_STATUS_TRANSITIONS,
  QUESTION_LANGUAGES,
  QUESTION_LANGUAGE_LABELS,
  QUESTION_SORTS,
  GRADES,
  gradeColor,
} from "../data/diagnostics.data";

// Utils
import { cn } from "@/shared/utils/cn";

/**
 * SAVOLLAR BAZASI.
 *
 * ⚠️ MODERATSIYA — ALOHIDA HUQUQ (`diagnostics.moderate`). Savol yozgan
 * odam uni o'zi tasdiqlay olmaydi (agar shu huquq berilmagan bo'lsa):
 * bankning sifati aynan shu ikki qadamning ajratilganidan kelib chiqadi —
 * tasdiqlangan savol o'quvchining darajasini o'lchaydi.
 */
const QuestionsPage = () => {
  const { filterSlot } = useOutletContext();
  const { openModal } = useModal();
  const { can } = usePermissions();

  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    subjectId: "",
    status: "",
    difficulty: "",
    grade: "",
    language: "",
    sort: "newest",
  });

  const debouncedSearch = useDebounce(filters.search, 400);

  const params = useMemo(
    () => ({
      page,
      limit: 25,
      search: debouncedSearch,
      subjectId: filters.subjectId,
      status: filters.status,
      difficulty: filters.difficulty,
      grade: filters.grade,
      language: filters.language,
      sort: filters.sort,
    }),
    [page, debouncedSearch, filters],
  );

  const { data, isLoading } = useQuery(questionQueries.list(params));
  const { data: stats } = useQuery(questionQueries.stats());
  const { data: subjects = [] } = useSubjects();
  const { mutate: updateStatus } = useUpdateQuestionStatus();

  const rows = data?.data ?? [];
  const pagination = data?.pagination;
  const total = pagination?.total ?? 0;
  const totalAll = data?.totalAll ?? null;

  const setFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleStatus = (question, status) => {
    updateStatus(
      { id: question.id, status },
      {
        onSuccess: () =>
          toast.success(
            `${question.code}: ${QUESTION_STATUS_LABELS[status].toLowerCase()}`,
          ),
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      },
    );
  };

  const handleExport = async () => {
    try {
      const response = await diagnosticQuestionsAPI.export(params);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `diagnostika_savollar_${new Date().toISOString().split("T")[0]}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error.response?.data?.message || "Eksport qilinmadi");
    }
  };

  return (
    <div className="space-y-4">
      {filterSlot &&
        createPortal(
          <>
            <div className="w-[190px]">
              <InputField
                type="search"
                name="search"
                label="Qidiruv"
                placeholder="Savol yoki kod"
                value={filters.search}
                onChange={(e) => setFilter("search", e.target.value)}
              />
            </div>

            <div className="w-[150px]">
              <SelectField
                name="subjectId"
                label="Fan"
                value={filters.subjectId}
                options={[
                  { value: "", label: "Barcha fanlar" },
                  ...subjects.map((s) => ({ value: s.id, label: s.name })),
                ]}
                onChange={(value) => setFilter("subjectId", value)}
              />
            </div>

            <div className="w-[140px]">
              <SelectField
                name="status"
                label="Holati"
                value={filters.status}
                options={[
                  { value: "", label: "Barchasi" },
                  ...QUESTION_STATUSES.map((s) => ({
                    value: s.value,
                    label: s.label,
                  })),
                ]}
                onChange={(value) => setFilter("status", value)}
              />
            </div>

            <div className="w-[130px]">
              <SelectField
                name="difficulty"
                label="Qiyinlik"
                value={filters.difficulty}
                options={[
                  { value: "", label: "Barchasi" },
                  ...LEVELS.map((l) => ({ value: l, label: LEVEL_LABELS[l] })),
                ]}
                onChange={(value) => setFilter("difficulty", value)}
              />
            </div>

            <div className="w-[120px]">
              <SelectField
                name="grade"
                label="Sinf"
                value={filters.grade}
                options={[
                  { value: "", label: "Barcha sinflar" },
                  ...GRADES.map((g) => ({ value: String(g), label: `${g}-sinf` })),
                ]}
                onChange={(value) => setFilter("grade", value)}
              />
            </div>

            <div className="w-[120px]">
              <SelectField
                name="language"
                label="Til"
                value={filters.language}
                options={[
                  { value: "", label: "Barcha tillar" },
                  ...QUESTION_LANGUAGES.map((l) => ({
                    value: l.value,
                    label: l.label,
                  })),
                ]}
                onChange={(value) => setFilter("language", value)}
              />
            </div>

            <div className="w-[160px]">
              <SelectField
                name="sort"
                label="Saralash"
                value={filters.sort}
                options={QUESTION_SORTS}
                onChange={(value) => setFilter("sort", value)}
              />
            </div>
          </>,
          filterSlot,
        )}

      {/* ── SARLAVHA ───────────────────────── */}
      <div>
        <h2 className="font-semibold text-gray-900">Savollar bazasi</h2>
        <p className="mt-0.5 text-sm text-gray-500">
          Bazadagi barcha savollar, variantlar, to'g'ri javoblar va
          o'quvchilar natijasi
          {totalAll != null && ` · jami ${totalAll} ta`}
        </p>

        {/* ⚠️ "Jami" VA "Topildi" ALOHIDA: birinchisi bankning hajmi,
            ikkinchisi joriy filtr natijasi. Bitta songa qo'yilsa,
            "bazada nechta savol bor" degan javob ekrandagi filtrga
            qarab o'zgarib turardi. */}
        {total > 0 && (
          <p className="mt-1 text-sm text-gray-400">
            Topildi: <span className="font-semibold text-gray-700">{total}</span> ta
            savol · {(page - 1) * 25 + 1}–{Math.min(page * 25, total)}{" "}
            ko'rsatilmoqda
          </p>
        )}
      </div>

      {/* ── BANK MANZARASI ─────────────────── */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <BankStat
          label="Jami savollar"
          value={stats?.total ?? 0}
          icon={Database}
        />
        <BankStat
          label="Tasdiqlangan"
          value={stats?.status?.approved ?? 0}
          icon={CheckCircle2}
          tone="text-emerald-500"
        />
        <BankStat
          label="Ko'rikda"
          value={stats?.status?.review ?? 0}
          icon={Clock}
          tone="text-amber-500"
        />
        <BankStat
          label="O'rtacha aniqlik"
          value={stats?.usedCount ? `${stats.avgAccuracy}%` : "—"}
          hint={
            stats?.usedCount
              ? `${stats.usedCount} ta ishlatilgan savol bo'yicha`
              : "hali ishlatilmagan"
          }
          icon={ShieldAlert}
        />
      </div>

      {/* ── MUAMMOLI SAVOLLAR ──────────────── */}
      {stats?.problematic?.length > 0 && (
        <Card className="border border-amber-200 !bg-amber-50">
          <div className="flex items-start gap-3">
            <ShieldAlert className="size-5 shrink-0 text-amber-600" strokeWidth={1.5} />
            <div className="min-w-0">
              <p className="font-medium text-amber-900">
                {stats.problematic.length} ta savolda muammo bo'lishi mumkin
              </p>
              <p className="mt-0.5 text-sm text-amber-800">
                Ular ko'p marta berilgan, lekin deyarli hech kim to'g'ri javob
                bermagan — odatda bu savolning o'zida xato borligini bildiradi.
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {stats.problematic.slice(0, 8).map((q) => (
                  <button
                    key={q.id}
                    onClick={() => openModal("diagnosticQuestion", { question: q })}
                    title={q.text}
                    className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-amber-900 ring-1 ring-amber-200 hover:bg-amber-100"
                  >
                    {q.code} · {Math.round(q.accuracy)}%
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ── AMALLAR ────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Can do="diagnostics.questions">
          <div className="flex flex-wrap gap-2">
            <Button
              className="px-3.5"
              onClick={() => openModal("diagnosticQuestion", { question: null })}
            >
              <Plus className="mr-2 size-5" strokeWidth={1.5} />
              Yangi savol
            </Button>

            <Button
              variant="secondary"
              className="px-3.5"
              onClick={() => openModal("importDiagnosticQuestions")}
            >
              <Upload className="mr-2 size-5" strokeWidth={1.5} />
              {/* ⚠️ "Import" EMAS, "Excel'dan yuklash": tugma nima
                  qilishini nomining o'zi aytishi kerak. "Import" so'zi
                  yonidagi "Excelga export" bilan chalkashardi — biri
                  yuklaydi, ikkinchisi yuklab oladi. */}
              Excel'dan yuklash
            </Button>
          </div>
        </Can>

        <Can do="diagnostics.export">
          <Button variant="secondary" className="px-3.5" onClick={handleExport}>
            <Download className="size-5" strokeWidth={1.5} />
          </Button>
        </Can>
      </div>

      {/* ── RO'YXAT ────────────────────────── */}
      {isLoading ? (
        <Card className="py-10 text-center text-gray-400">Yuklanmoqda…</Card>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={Database}
            title="Savol topilmadi"
            description="Filtrlarni o'zgartiring yoki bankka yangi savol qo'shing."
            action={
              <Can do="diagnostics.questions">
                <Button
                  onClick={() => openModal("diagnosticQuestion", { question: null })}
                >
                  <Plus className="mr-2 size-5" strokeWidth={1.5} />
                  Yangi savol
                </Button>
              </Can>
            }
          />
        </Card>
      ) : (
        <>
          <Table
            columns={[
              { label: "#", align: "right" },
              "Savol",
              "Fan",
              "Sinf",
              "Til",
              "Qiyinlik",
              { label: "To'g'ri javob", align: "center" },
              "O'quvchilar natijasi",
              "Holati",
              { label: "", align: "right" },
            ]}
          >
            {rows.map((question, index) => (
              <Fragment key={question.id}>
              <Tr
                className="cursor-pointer hover:bg-gray-50"
                onClick={() =>
                  setOpenId((prev) => (prev === question.id ? null : question.id))
                }
              >
                <Td align="right" className="tabular-nums text-gray-400">
                  {(page - 1) * 25 + index + 1}
                </Td>

                <Td nowrap={false} className="max-w-[380px]">
                  <span className="flex items-start gap-2">
                    <ChevronRight
                      className={cn(
                        "mt-0.5 size-4 shrink-0 text-gray-400 transition-transform",
                        openId === question.id && "rotate-90",
                      )}
                      strokeWidth={2}
                    />
                    <span className="min-w-0">
                      <span className="line-clamp-2 block text-gray-900">
                        {question.text}
                      </span>
                      <span className="mt-0.5 block text-xs text-gray-400">
                        {TYPE_LABELS[question.type] || question.type}
                        {question.topic?.name ? ` · ${question.topic.name}` : ""}
                      </span>
                    </span>
                  </span>
                </Td>

                <Td className="text-gray-700">{question.subject?.name || "—"}</Td>

                <Td className="whitespace-nowrap text-gray-500">
                  {question.grade ? `${question.grade}-sinf` : "—"}
                </Td>

                <Td>
                  <Badge className="bg-blue-50 text-blue-700 ring-blue-200">
                    {QUESTION_LANGUAGE_LABELS[question.language] || question.language}
                  </Badge>
                </Td>

                <Td>
                  <Badge className={LEVEL_BADGE[question.difficulty]}>
                    {LEVEL_LABELS[question.difficulty]}
                  </Badge>
                </Td>

                {/* ⚠️ TO'G'RI JAVOB HARFI — jadvalda javob MATNI emas.
                    Matn ustunni cho'zib yuborardi; harf esa ochilgan
                    qatordagi variantlar bilan bir xil belgilangani
                    uchun qidirmasdan topiladi. */}
                <Td align="center">
                  <CorrectLetters question={question} />
                </Td>

                <Td>
                  <ResultCell question={question} />
                </Td>

                <Td>
                  <Badge className={QUESTION_STATUS_BADGE[question.status]}>
                    {QUESTION_STATUS_LABELS[question.status]}
                  </Badge>
                </Td>

                <Td align="right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-2">
                    {/* Moderatsiya — faqat mumkin bo'lgan o'tishlar */}
                    {can("diagnostics.moderate") &&
                      (QUESTION_STATUS_TRANSITIONS[question.status] || [])
                        .filter((next) =>
                          question.status === "review"
                            ? next === "approved"
                            : next === "review",
                        )
                        .map((next) => (
                          <button
                            key={next}
                            onClick={() => handleStatus(question, next)}
                            className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
                          >
                            {next === "approved" ? "Tasdiqlash" : "Ko'rikka"}
                          </button>
                        ))}

                    <Can do="diagnostics.questions">
                      <button
                        onClick={() =>
                          openModal("diagnosticQuestion", { question })
                        }
                        className="text-blue-600 hover:text-blue-900"
                        title="Tahrirlash"
                      >
                        <Edit className="size-4" strokeWidth={1.5} />
                      </button>
                    </Can>

                    <Can do="diagnostics.delete">
                      <button
                        onClick={() =>
                          openModal("deleteDiagnosticQuestion", { question })
                        }
                        className="text-rose-600 hover:text-rose-900"
                        title="O'chirish"
                      >
                        <Trash2 className="size-4" strokeWidth={1.5} />
                      </button>
                    </Can>
                  </div>
                </Td>
              </Tr>

              {/* ── OCHILGAN PANEL ─────────────── */}
              {openId === question.id && (
                <Tr className="bg-gray-50/60">
                  <Td colSpan={10} nowrap={false} className="!py-4">
                    <QuestionDetail question={question} />
                  </Td>
                </Tr>
              )}
              </Fragment>
            ))}
          </Table>

          {pagination && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              hasNextPage={pagination.hasNextPage}
              hasPrevPage={pagination.hasPrevPage}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      <QuestionFormModal />
      <DeleteQuestionModal />
      <ImportQuestionsModal />
    </div>
  );
};

const BankStat = ({ label, value, hint, icon: Icon, tone = "text-gray-300" }) => (
  <div className="rounded-2xl bg-white p-4">
    <div className="flex items-start justify-between gap-2">
      <p className="text-sm text-gray-500">{label}</p>
      {Icon && <Icon className={cn("size-5 shrink-0", tone)} strokeWidth={1.5} />}
    </div>
    <p className="mt-1.5 text-xl font-semibold tabular-nums text-gray-900">
      {value}
    </p>
    {hint && <p className="mt-0.5 truncate text-xs text-gray-400">{hint}</p>}
  </div>
);

/** Variant harflari: 0 → A, 1 → B … */
const LETTERS = ["A", "B", "C", "D", "E", "F"];

/**
 * TO'G'RI JAVOB HARFLARI.
 *
 * ⚠️ BIR NECHTA HARF BO'LISHI MUMKIN (`multiple` turi). Faqat
 * birinchisini ko'rsatish ko'p javobli savolda yolg'on bo'lardi.
 */
const CorrectLetters = ({ question }) => {
  const letters = (question.options || [])
    .map((opt, i) => (opt.isCorrect ? LETTERS[i] : null))
    .filter(Boolean);

  if (!letters.length) {
    // Matnli javob (`short`/`essay`) — variant yo'q.
    return <span className="text-xs text-gray-300">matn</span>;
  }

  return (
    <span className="inline-flex gap-1">
      {letters.map((letter) => (
        <span
          key={letter}
          className="flex size-6 items-center justify-center rounded-md bg-emerald-50 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200"
        >
          {letter}
        </span>
      ))}
    </span>
  );
};

/**
 * O'QUVCHILAR NATIJASI — chiziq, foiz va MAXRAJ.
 *
 * ⚠️ MAXRAJSIZ FOIZ ALDAYDI: bitta o'quvchi javob bergan 100% bilan
 * yuzta o'quvchi javob bergan 100% bir xil ko'rinardi. Javob
 * berilmagan savolda esa foiz umuman chizilmaydi — 0% "hamma xato
 * qildi" degani, "hali sinalmagan" degani emas.
 */
const ResultCell = ({ question }) => {
  if (question.correctPct == null) {
    return (
      <span className="whitespace-nowrap text-xs text-gray-400">
        — <span className="text-gray-300">(hali javob yo'q)</span>
      </span>
    );
  }

  const color = gradeColor(question.correctPct);

  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <span className="block h-1.5 w-14 overflow-hidden rounded-full bg-gray-100">
        <span
          className="block h-full rounded-full"
          style={{ width: `${question.correctPct}%`, backgroundColor: color }}
        />
      </span>
      <span className="text-sm font-bold tabular-nums" style={{ color }}>
        {question.correctPct}%
      </span>
      <span className="text-[11px] text-gray-400">
        ({question.answered} o'quvchi)
      </span>
    </span>
  );
};

/**
 * SAVOL TAFSILOTI — variantlar, to'g'ri javob va statistika.
 *
 * ⚠️ TO'G'RI JAVOB RANG BILAN EMAS, BELGI BILAN HAM ko'rsatiladi
 * (yashil fon + galochka): rang ko'rmaydigan foydalanuvchi uchun
 * yashil ramka hech narsa anglatmasdi.
 */
const QuestionDetail = ({ question }) => {
  const options = question.options || [];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="rounded-md bg-white px-2 py-1 font-mono text-gray-500 ring-1 ring-gray-200">
          {question.code}
        </span>
        <span className="text-gray-500">
          Mavzu:{" "}
          <span className="font-medium text-gray-900">
            {question.topic?.name || "Mavzusiz"}
          </span>
        </span>
      </div>

      {options.length > 0 ? (
        <div className="grid gap-2 lg:grid-cols-2">
          {options.map((option, i) => (
            <div
              key={option.id}
              className={cn(
                "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm",
                option.isCorrect
                  ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                  : "border-gray-200 bg-white text-gray-700",
              )}
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold",
                  option.isCorrect
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-gray-100 text-gray-500",
                )}
              >
                {LETTERS[i]}
              </span>
              <span className="min-w-0 flex-1 break-words">{option.text}</span>
              {option.isCorrect && (
                <CheckCircle2
                  className="size-4 shrink-0 text-emerald-600"
                  strokeWidth={2}
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          Bu savol matnli javob talab qiladi — variantlar yo'q.
        </p>
      )}

      {/* Statistika jumlasi — ustundagi foizning so'z bilan aytilgani. */}
      <p className="text-xs text-gray-500">
        {question.answered > 0 ? (
          <>
            Bu savolga{" "}
            <span className="font-semibold text-gray-900">
              {question.answered}
            </span>{" "}
            ta o'quvchi javob bergan,{" "}
            <span className="font-semibold text-emerald-600">
              {question.correctCount}
            </span>{" "}
            tasi to'g'ri ({question.correctPct}%).
          </>
        ) : (
          "Bu savol hali birorta testda ishlatilmagan."
        )}
      </p>

    </div>
  );
};

export default QuestionsPage;
