// React
import { useCallback, useMemo, useRef, useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Info,
  Upload,
} from "lucide-react";

// Components
import Badge from "@/shared/components/ui/badge/Badge";
import Input from "@/shared/components/ui/input/Input";
import Button from "@/shared/components/ui/button/Button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import StudentPicker from "./StudentPicker";

// Utils
import { cn } from "@/shared/utils/cn";

// Mutations & data
import {
  useConfirmCertificateImport,
  usePreviewCertificateImport,
} from "../queries/certificates.mutations";
import {
  MATCH_LABELS,
  MATCH_VARIANTS,
  RESOLVED_MATCHES,
  dueToInputValue,
} from "../data/certificates.data";

/**
 * FAYLDAN YUKLASH — IKKI QADAM.
 *
 * 1. FAYL → server o'qiydi, o'quvchilarni moslashtiradi va KO'RIB CHIQISH
 *    jadvalini qaytaradi. HECH NARSA YOZILMAYDI.
 * 2. ODAM KO'RGANINI tasdiqlaydi → rejalar yoziladi.
 *
 * ⚠️ Moslanmagan qator JIM TASHLANMAYDI: u jadvalda "Topilmadi" bo'lib
 * turadi va admin o'quvchini qo'lda tanlaydi. Taxmin qilib ulash begona
 * o'quvchiga reja yozardi va u ekranida o'ziga tegishli bo'lmagan muddatni
 * ko'rardi.
 *
 * ⚠️ TANLANGAN QATORLARNING O'ZI serverga qaytariladi — yoziladigan narsa
 * aynan ekranda ko'rilgani. Shu sababli fayl serverda saqlanmaydi.
 *
 * ⚠️ Bir yo'nalish ikki marta yozilgan qatorda ikkinchisi SUKUT BO'YICHA
 * TANLANMAYDI: bitta sertifikatga ikki muddat ma'nosiz, qaysi biri
 * to'g'ri ekanini admin hal qiladi.
 */
const ImportCertificatesModal = () => (
  <ResponsiveModal
    name="importCertificates"
    title="Fayldan yuklash"
    description="Google Forms javoblari yoki Excel jadvali (.xlsx / .csv)"
    className="max-w-5xl"
  >
    <Content />
  </ResponsiveModal>
);

/** Qator kaliti — fayl qatori + yo'nalish ustunining o'rni. */
const entryKey = (rowNumber, index) => `${rowNumber}:${index}`;

const Content = ({ close, isLoading, setIsLoading }) => {
  const fileRef = useRef(null);

  const [preview, setPreview] = useState(null);
  const [report, setReport] = useState(null);
  // Qator → qo'lda tanlangan o'quvchi (avtomat moslanganlar bu yerda emas)
  const [picked, setPicked] = useState({});
  // Yoziladigan yo'nalish kataklari (`entryKey`)
  const [selected, setSelected] = useState(() => new Set());
  // Tahrirlangan muddatlar (`entryKey` → "YYYY-MM-DD")
  const [dues, setDues] = useState({});

  const { mutateAsync: runPreview } = usePreviewCertificateImport();
  const { mutateAsync: runConfirm } = useConfirmCertificateImport();

  /**
   * Qatorning o'quvchisi: AVTOMAT moslangani, bo'lmasa admin tanlagani.
   *
   * `useCallback` — u `useMemo` ichida ishlatiladi va har render'da yangi
   * funksiya bo'lsa, yoziladigan qatorlar ro'yxati bekordan-bekor qayta
   * hisoblanardi.
   */
  const studentOf = useCallback(
    (row) => row.match.student ?? picked[row.rowNumber] ?? null,
    [picked],
  );

  const upload = async (file) => {
    if (!file) return;

    setIsLoading(true);
    setReport(null);
    try {
      const data = await runPreview(file);

      // Sukut tanlov: yoziladigan kataklar — yo'nalishi bor va qator
      // ichida TAKRORLANMAGAN, arxivlanmagan
      const initial = new Set();
      const initialDues = {};
      for (const row of data.rows) {
        row.entries.forEach((entry, index) => {
          const key = entryKey(row.rowNumber, index);
          initialDues[key] = dueToInputValue(entry.dueDate);
          if (!entry.duplicateInRow && !entry.trackArchived) initial.add(key);
        });
      }

      setPreview(data);
      setSelected(initial);
      setDues(initialDues);
      setPicked({});
    } catch (error) {
      toast.error(error.response?.data?.message || "Faylni o'qib bo'lmadi");
    } finally {
      setIsLoading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  /** Yoziladigan qatorlar — o'quvchisi bor va kamida bitta katagi tanlangan. */
  const payloadRows = useMemo(() => {
    if (!preview) return [];

    return preview.rows
      .map((row) => {
        const student = studentOf(row);
        if (!student) return null;

        const entries = row.entries
          .map((entry, index) => {
            const key = entryKey(row.rowNumber, index);
            if (!selected.has(key)) return null;
            return { trackName: entry.trackName, dueDate: dues[key] || null };
          })
          .filter(Boolean);

        if (entries.length === 0) return null;

        return {
          rowNumber: row.rowNumber,
          studentId: student.id,
          submittedAt: row.submittedAt,
          note: row.note,
          sourceName: row.sourceName,
          sourceGroup: row.sourceGroup,
          entries,
        };
      })
      .filter(Boolean);
  }, [preview, selected, dues, studentOf]);

  const planCount = payloadRows.reduce((sum, row) => sum + row.entries.length, 0);

  const confirm = async () => {
    if (payloadRows.length === 0) {
      return toast.error("Yozish uchun qator tanlanmagan");
    }

    setIsLoading(true);
    try {
      const result = await runConfirm({ rows: payloadRows });
      setReport(result.data);
      toast.success(result.message || "Rejalar yozildi");
    } catch (error) {
      toast.error(error.response?.data?.message || "Yozib bo'lmadi");
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Natija ekrani ── */
  if (report) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-3.5">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" strokeWidth={2} />
          <div className="text-sm">
            <p className="font-medium text-emerald-900">
              {report.created} ta yangi reja, {report.replaced} ta yangilandi
            </p>
            <p className="mt-0.5 text-emerald-700">
              {report.duplicate > 0 && `${report.duplicate} ta allaqachon yuklangan. `}
              {report.older > 0 && `${report.older} ta eski topshirish o'tkazib yuborildi. `}
              {report.createdTracks?.length > 0 &&
                `Yangi yo'nalishlar: ${report.createdTracks.join(", ")}.`}
            </p>
          </div>
        </div>

        {report.failed?.length > 0 && (
          <div className="rounded-xl bg-red-50 p-3.5">
            <p className="flex items-center gap-2 text-sm font-medium text-red-900">
              <AlertTriangle className="size-4" strokeWidth={2} />
              {report.failed.length} ta qator yozilmadi
            </p>
            <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs text-red-800">
              {report.failed.map((item, index) => (
                <li key={`${item.rowNumber}-${index}`}>
                  {item.rowNumber ? `${item.rowNumber}-qator · ` : ""}
                  {item.sourceName}
                  {item.trackName ? ` (${item.trackName})` : ""} — {item.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button className="w-full" onClick={close}>
          Yopish
        </Button>
      </div>
    );
  }

  /* ── Fayl tanlash ekrani ── */
  if (!preview) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-gray-50 p-3.5 text-sm text-gray-600">
          <p className="flex items-center gap-2 font-medium text-gray-900">
            <Info className="size-4" strokeWidth={2} />
            Fayldagi ustunlar
          </p>
          <p className="mt-1.5">
            Ism familiya, Guruh, sertifikat yo'nalishi va muddati (bir nechta
            juft bo'lishi mumkin), izoh. Google Forms javoblari jadvali
            o'zgartirmasdan yuklanadi — forma to'ldirilgan vaqt ham olinadi,
            lekin u o'quvchiga ko'rinmaydi.
          </p>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(event) => upload(event.target.files?.[0])}
        />

        <Button
          className="w-full"
          disabled={isLoading}
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="size-4" strokeWidth={2} />
          {isLoading ? "O'qilmoqda..." : "Fayl tanlash"}
        </Button>
      </div>
    );
  }

  /* ── Ko'rib chiqish ekrani ── */
  const { summary, warnings, newTracks } = preview;

  return (
    <div className="space-y-3.5">
      <div className="flex flex-wrap gap-2 text-xs">
        <Chip label="Qator" value={summary.total} />
        <Chip label="Reja" value={summary.plans} />
        <Chip label="Topildi" value={summary.resolved} tone="ok" />
        <Chip label="Tasdiqlash kerak" value={summary.needsReview} tone="warn" />
        {summary.willReplace > 0 && (
          <Chip label="Yangilanadi" value={summary.willReplace} tone="warn" />
        )}
        {newTracks.length > 0 && (
          <Chip label="Yangi yo'nalish" value={newTracks.length} tone="info" />
        )}
      </div>

      {warnings.length > 0 && (
        <ul className="space-y-1 rounded-xl bg-amber-50 p-3 text-xs text-amber-900">
          {warnings.map((warning, index) => (
            <li key={index} className="flex gap-1.5">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" strokeWidth={2} />
              <span>{warning}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="max-h-[52vh] overflow-auto rounded-xl border border-gray-200">
        <table className="min-w-full text-xs">
          <thead className="sticky top-0 z-10 bg-gray-50">
            <tr className="text-left text-gray-600">
              <th className="px-2 py-2 font-medium">#</th>
              <th className="px-2 py-2 font-medium">Fayldagi ism</th>
              <th className="px-2 py-2 font-medium">O'quvchi</th>
              <th className="px-2 py-2 font-medium">Yo'nalish va muddat</th>
            </tr>
          </thead>

          <tbody>
            {preview.rows.map((row) => {
              const student = studentOf(row);
              const resolved = RESOLVED_MATCHES.has(row.match.status);

              return (
                <tr
                  key={row.rowNumber}
                  className={cn(
                    "border-t border-gray-100 align-top",
                    row.entries.length === 0 && "bg-gray-50/70 text-gray-400",
                  )}
                >
                  <td className="px-2 py-2 text-gray-500">{row.rowNumber}</td>

                  <td className="px-2 py-2">
                    <p className="font-medium text-gray-900">{row.sourceName || "—"}</p>
                    <p className="text-gray-500">{row.sourceGroup || "guruhsiz"}</p>
                    {row.repeatedInFile && (
                      <p className="mt-0.5 text-amber-700">Faylda takrorlangan</p>
                    )}
                  </td>

                  <td className="px-2 py-2">
                    {row.entries.length === 0 ? (
                      <span>Sertifikat ko'rsatilmagan</span>
                    ) : (
                      <div className="space-y-1.5">
                        <Badge variant={MATCH_VARIANTS[row.match.status]}>
                          {MATCH_LABELS[row.match.status]}
                        </Badge>

                        {resolved ? (
                          <p className="font-medium text-gray-900">
                            {row.match.student.fullName}
                            {row.match.student.classNames?.length > 0 && (
                              <span className="font-normal text-gray-500">
                                {" · "}
                                {row.match.student.classNames.join(", ")}
                              </span>
                            )}
                          </p>
                        ) : (
                          <StudentPicker
                            value={student}
                            onChange={(value) =>
                              setPicked((prev) => ({ ...prev, [row.rowNumber]: value }))
                            }
                            suggestions={row.match.candidates}
                            defaultSearch={row.sourceName}
                            classId={row.match.classId}
                          />
                        )}
                      </div>
                    )}
                  </td>

                  <td className="px-2 py-2">
                    <div className="space-y-1.5">
                      {row.entries.map((entry, index) => {
                        const key = entryKey(row.rowNumber, index);
                        const checked = selected.has(key);

                        return (
                          <div key={key} className="flex flex-wrap items-center gap-1.5">
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={entry.trackArchived}
                              onChange={() =>
                                setSelected((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(key)) next.delete(key);
                                  else next.add(key);
                                  return next;
                                })
                              }
                              className="size-3.5 shrink-0 accent-primary"
                            />

                            <span
                              className={cn(
                                "font-medium",
                                checked ? "text-gray-900" : "text-gray-400",
                              )}
                            >
                              {entry.trackName}
                            </span>

                            {!entry.trackExists && (
                              <Badge variant="outline" className="text-[10px]">
                                yangi
                              </Badge>
                            )}
                            {entry.trackArchived && (
                              <Badge variant="destructive" className="text-[10px]">
                                arxivda
                              </Badge>
                            )}
                            {entry.duplicateInRow && (
                              <Badge variant="destructive" className="text-[10px]">
                                takror
                              </Badge>
                            )}

                            <Input
                              type="date"
                              value={dues[key] ?? ""}
                              disabled={!checked}
                              onChange={(event) =>
                                setDues((prev) => ({ ...prev, [key]: event.target.value }))
                              }
                              className="h-7 w-36 px-2 text-xs"
                            />

                            {entry.dueUnreadable && (
                              <span className="text-amber-700">
                                "{entry.dueRaw}" o'qilmadi
                              </span>
                            )}

                            {entry.existing && (
                              <span className="text-amber-700">
                                hozir: {entry.existing.dueDateLabel}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <p className="text-xs text-gray-500">
          <FileSpreadsheet className="mr-1 inline size-3.5" strokeWidth={1.75} />
          {payloadRows.length} o'quvchi · {planCount} reja yoziladi
        </p>

        <div className="flex gap-2.5">
          <Button variant="outline" onClick={() => setPreview(null)} disabled={isLoading}>
            Boshqa fayl
          </Button>
          <Button onClick={confirm} disabled={isLoading || planCount === 0}>
            {isLoading ? "Yozilmoqda..." : "Yozish"}
          </Button>
        </div>
      </div>
    </div>
  );
};

const CHIP_TONES = {
  ok: "bg-emerald-50 text-emerald-800",
  warn: "bg-amber-50 text-amber-800",
  info: "bg-blue-50 text-blue-800",
  muted: "bg-gray-100 text-gray-700",
};

const Chip = ({ label, value, tone = "muted" }) => (
  <span className={cn("rounded-lg px-2 py-1", CHIP_TONES[tone])}>
    {label}: <span className="font-semibold">{value}</span>
  </span>
);

export default ImportCertificatesModal;
