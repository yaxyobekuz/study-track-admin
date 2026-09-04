// React
import { useMemo, useState } from "react";

// Router
import { Link, useParams } from "react-router-dom";

// Toast
import { toast } from "sonner";

// Icons
import { ArrowLeft, Save, Send, Paperclip, Lock } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Can from "@/shared/components/guards/Can";
import Card from "@/shared/components/ui/Card";
import Select from "@/shared/components/ui/select/Select";
import Button from "@/shared/components/ui/button/Button";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";
import { formatDateUz } from "@/shared/utils/date.utils";

// Data & queries
import {
  CHECK_SUBMIT_HINT,
  REASONS_REQUIRING_NOTE,
  reasonOptionsFor,
} from "../data/inventory.data";
import { inventoryQueries } from "../queries/inventory.queries";
import {
  useAttachCheckFiles,
  useSubmitCheck,
  useUpdateCheckLines,
} from "../queries/inventory.mutations";

/**
 * KUNLIK HISOBOT VARAG'I — mas'ul shaxs shu ekranda ishlaydi.
 *
 * Har bir jihoz uchun uchta raqam kiritiladi:
 *   Bugun singani · Bugun yo'qolgani · Bugun ta'mirlangani
 *
 * "Mavjud" ustuni varaq OCHILGAN paytdagi surat — u bilan taqqoslab
 * kiritiladi (talabdagi "Mavjud: 20 ta | Bugun singani: 1 ta" shakli).
 *
 * ⚠️ YUBORILGANDAN KEYIN VARAQ MUHRLANADI: inputlar o'chadi va faqat
 * o'qish rejimi qoladi. Sabab — yuborish paytida xatlovga yozuvlar
 * tushgan va zarar hodisalari shakllangan.
 */
const CheckDetailPage = () => {
  const { id } = useParams();
  const { data: check, isLoading } = useQuery(inventoryQueries.check(id));

  if (isLoading) {
    return <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>;
  }
  if (!check) return null;

  /**
   * ⚠️ `key` — varaq almashganda yoki YUBORILGANDA lokal forma holati
   * to'liq qayta quriladi.
   *
   * Muqobil yo'l — `useEffect` ichida `setState` bilan sinxronlash edi, u
   * esa kaskadli render hosil qiladi (React'ning "you might not need an
   * effect" qoidasi). `key` bilan qayta mount qilish shu holatning
   * kanonik yechimi: boshlang'ich qiymat `useState` initializer'ida bir
   * marta o'qiladi va effekt umuman kerak bo'lmaydi.
   */
  return <CheckSheet key={`${check.id}:${check.status}`} check={check} />;
};

const CheckSheet = ({ check }) => {
  const id = check.id;

  const { mutate: saveLines, isPending: isSaving } = useUpdateCheckLines();
  const { mutate: submitCheck, isPending: isSubmitting } = useSubmitCheck();

  // Kiritilayotgan raqamlar — LOKAL forma holati (server keshi emas).
  // Kalit: lineId → { brokenQuantity, missingQuantity, repairedQuantity, note }
  const [draft, setDraft] = useState(() =>
    Object.fromEntries(
      (check.lines ?? []).map((line) => [
        line.id,
        {
          brokenQuantity: line.brokenQuantity || "",
          missingQuantity: line.missingQuantity || "",
          repairedQuantity: line.repairedQuantity || "",
          // Sabab har bir tur uchun ALOHIDA: bitta satrda "3 tasi sindi,
          // 1 tasi yo'qoldi" bo'lishi mumkin va ular boshqa-boshqa zarar
          // hodisasiga aylanadi
          brokenReason: line.brokenReason || "",
          missingReason: line.missingReason || "",
          note: line.note || "",
        },
      ]),
    ),
  );
  const [note, setNote] = useState(check.note || "");

  const linesPayload = useMemo(
    () =>
      Object.entries(draft).map(([lineId, values]) => ({
        id: lineId,
        brokenQuantity: Number(values.brokenQuantity) || 0,
        missingQuantity: Number(values.missingQuantity) || 0,
        repairedQuantity: Number(values.repairedQuantity) || 0,
        brokenReason: values.brokenReason || "",
        missingReason: values.missingReason || "",
        note: values.note,
      })),
    [draft],
  );

  const changedCount = linesPayload.filter(
    (l) => l.brokenQuantity > 0 || l.missingQuantity > 0 || l.repairedQuantity > 0,
  ).length;

  const isSealed = check.isSubmitted;

  const setValue = (lineId, key, value) =>
    setDraft((prev) => ({ ...prev, [lineId]: { ...prev[lineId], [key]: value } }));

  const handleSave = () => {
    saveLines(
      { id, data: { note, lines: linesPayload } },
      {
        onSuccess: () => toast.success("Saqlandi"),
        onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      },
    );
  };

  /**
   * Sabab MAJBURIY tekshiruvi — server ham tekshiradi, lekin bu yerda
   * BARCHA yetishmayotgan satrlar bitta xabarda chiqadi va varaq
   * serverga bormasdan turib to'g'rilanadi.
   *
   * Nomlar `check.lines` dan olinadi: `draft` faqat kalit → qiymat
   * lug'ati va jihoz nomini bilmaydi.
   */
  const missingReasons = useMemo(() => {
    const nameByLineId = new Map((check.lines ?? []).map((l) => [l.id, l.itemName]));
    const problems = [];

    for (const line of linesPayload) {
      const name = nameByLineId.get(line.id) ?? "Jihoz";

      if (line.brokenQuantity > 0 && !line.brokenReason) {
        problems.push(`"${name}" — singan sababi`);
      }
      if (line.missingQuantity > 0 && !line.missingReason) {
        problems.push(`"${name}" — yo'qolgan sababi`);
      }

      // "Boshqa" izohsiz ma'nosiz — hisobot "boshqa: 47 ta" degan
      // javobsiz qatorga aylanmasin
      const needsNote =
        (line.brokenQuantity > 0 && REASONS_REQUIRING_NOTE.includes(line.brokenReason)) ||
        (line.missingQuantity > 0 && REASONS_REQUIRING_NOTE.includes(line.missingReason));

      if (needsNote && !line.note?.trim()) {
        problems.push(`"${name}" — "Boshqa" uchun izoh`);
      }
    }

    return problems;
  }, [linesPayload, check.lines]);

  const handleSubmit = () => {
    if (missingReasons.length > 0) {
      toast.error(`Sabab to'ldirilmagan: ${missingReasons.join(", ")}`);
      return;
    }

    if (!window.confirm(CHECK_SUBMIT_HINT + "\n\nHisobot yuborilsinmi?")) return;

    submitCheck(
      { id, data: { note, lines: linesPayload } },
      {
        onSuccess: () => toast.success("Hisobot yuborildi"),
        onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      },
    );
  };

  return (
    <div className="space-y-4">
      {/* ── Sarlavha ── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Link
            to="/inventory/checks"
            className="mt-0.5 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <ArrowLeft className="size-4" />
          </Link>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">{check.locationName}</h2>
            <p className="text-sm text-gray-500">
              {formatDateUz(check.date, { utc: true })}
              {check.reporterName && ` · ${check.reporterName}`}
            </p>
          </div>
        </div>

        {!isSealed && (
          <Can do="monitoring.submit">
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={handleSave} disabled={isSaving}>
                <Save />
                Saqlash
              </Button>

              <Button onClick={handleSubmit} disabled={isSubmitting}>
                <Send />
                Yuborish
              </Button>
            </div>
          </Can>
        )}
      </div>

      {/* ── Muhrlangan holat ── */}
      {isSealed ? (
        <Card className="border border-green-200 bg-green-50">
          <div className="flex items-start gap-3">
            <Lock className="mt-0.5 size-4 shrink-0 text-green-700" />
            <div>
              <p className="text-sm font-medium text-green-900">
                Hisobot yuborilgan va muhrlangan
              </p>
              <p className="mt-0.5 text-xs text-green-800">
                Singan: {check.brokenCount} ta · Yo'qolgan: {check.missingCount} ta ·
                Ta'mirlangan: {check.repairedCount} ta · Zarar:{" "}
                {formatMoney(check.damageAmount)}
              </p>
              <p className="mt-1 text-xs text-green-700">
                O'zgartirish uchun zarar yozuvini bekor qiling yoki xatlovni qo'lda to'g'rilang.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="border border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-900">
            <span className="font-medium">Qoralama.</span> {CHECK_SUBMIT_HINT}
          </p>
          {changedCount > 0 && (
            <p className="mt-1 text-xs text-amber-800">
              {changedCount} ta jihozda o'zgarish kiritilgan.
            </p>
          )}
        </Card>
      )}

      {/* ── Satrlar ── */}
      <Card className="p-0 xs:p-0">
        <div className="overflow-x-auto rounded-2xl">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-white">
                  Jihoz
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-right font-medium text-white">
                  Mavjud
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-center font-medium text-white">
                  Bugun singani
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-center font-medium text-white">
                  Yo'qolgani
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-center font-medium text-white">
                  Ta'mirlangani
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-white">
                  Sabab
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-white">
                  Izoh
                </th>
              </tr>
            </thead>

            <tbody>
              {check.lines?.map((line) => {
                const values = draft[line.id] ?? {};

                return (
                  <tr key={line.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900">{line.itemName}</span>
                      {line.expectedBroken > 0 && (
                        <span className="block text-xs text-amber-600">
                          {line.expectedBroken} tasi yaroqsiz
                        </span>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <span className="font-semibold text-gray-900">
                        {line.expectedQuantity}
                      </span>
                      <span className="ml-1 text-xs text-gray-400">{line.unit}</span>
                    </td>

                    <QuantityCell
                      value={values.brokenQuantity}
                      max={line.expectedServiceable}
                      disabled={isSealed}
                      tone="amber"
                      onChange={(v) => setValue(line.id, "brokenQuantity", v)}
                    />

                    <QuantityCell
                      value={values.missingQuantity}
                      max={line.expectedQuantity}
                      disabled={isSealed}
                      tone="red"
                      onChange={(v) => setValue(line.id, "missingQuantity", v)}
                    />

                    <QuantityCell
                      value={values.repairedQuantity}
                      max={line.expectedBroken}
                      disabled={isSealed || line.expectedBroken === 0}
                      tone="green"
                      onChange={(v) => setValue(line.id, "repairedQuantity", v)}
                    />

                    <ReasonCell
                      line={line}
                      values={values}
                      disabled={isSealed}
                      onChange={(key, v) => setValue(line.id, key, v)}
                    />

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          disabled={isSealed}
                          value={values.note ?? ""}
                          placeholder="Nima bo'ldi?"
                          onChange={(e) => setValue(line.id, "note", e.target.value)}
                          className="w-full min-w-40 rounded-lg border border-gray-200 px-2 py-1 text-sm disabled:bg-gray-50 disabled:text-gray-400"
                        />

                        {!isSealed && (
                          <AttachButton checkId={id} lineId={line.id} count={line.attachments?.length ?? 0} />
                        )}

                        {isSealed && line.attachments?.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                            <Paperclip className="size-3" />
                            {line.attachments.length}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Umumiy izoh ── */}
      <Card>
        <p className="text-sm font-medium text-gray-700">Umumiy izoh</p>
        <textarea
          rows={2}
          value={note}
          disabled={isSealed}
          placeholder="Xona bo'yicha qo'shimcha ma'lumot"
          onChange={(e) => setNote(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-400"
        />
      </Card>
    </div>
  );
};

const TONE_CLASS = {
  amber: "focus:border-amber-400",
  red: "focus:border-red-400",
  green: "focus:border-green-400",
};

/**
 * SABAB KATAGI — "nima bo'ldi" degan savolga javob.
 *
 * Tanlagich faqat tegishli MIQDOR kiritilganda ko'rinadi: 40 ta satrning
 * hammasida ikkita bo'sh tanlagich turgan varaq o'qib bo'lmas bo'lardi,
 * mas'ul shaxs esa o'zgargan bir-ikkita satrni qidirib topa olmasdi.
 *
 * Ikkala tanlagich ham bir vaqtda chiqishi mumkin: bitta satrda "3 tasi
 * sindi, 1 tasi yo'qoldi" bo'lsa, ular boshqa-boshqa zarar hodisasiga
 * aylanadi va sabablari ham boshqa bo'lishi kerak.
 */
const ReasonCell = ({ line, values, disabled, onChange }) => {
  const hasBroken = Number(values.brokenQuantity) > 0;
  const hasMissing = Number(values.missingQuantity) > 0;

  // Muhrlangan varaqda yorliq serverdan tayyor keladi — enum kalitini
  // qayta yorliqqa aylantirish frontendning ishi emas
  if (disabled) {
    const labels = [line.brokenReasonLabel, line.missingReasonLabel].filter(Boolean);

    return (
      <td className="px-4 py-3">
        {labels.length > 0 ? (
          <span className="text-sm text-gray-700">{labels.join(" · ")}</span>
        ) : (
          <span className="text-gray-300">—</span>
        )}
      </td>
    );
  }

  if (!hasBroken && !hasMissing) {
    return (
      <td className="px-4 py-3 text-center">
        <span className="text-xs text-gray-300">—</span>
      </td>
    );
  }

  return (
    <td className="px-4 py-3">
      <div className="space-y-1.5">
        {hasBroken && (
          <Select
            value={values.brokenReason ?? ""}
            placeholder="Nega yaroqsiz?"
            triggerClassName="h-9 w-full min-w-44 text-sm"
            onChange={(v) => onChange("brokenReason", v)}
            options={reasonOptionsFor("broken")}
          />
        )}

        {hasMissing && (
          <Select
            value={values.missingReason ?? ""}
            placeholder="Nega yo'q?"
            triggerClassName="h-9 w-full min-w-44 text-sm"
            onChange={(v) => onChange("missingReason", v)}
            options={reasonOptionsFor("missing")}
          />
        )}
      </div>
    </td>
  );
};

/** Raqam katagi — bo'sh qiymat 0 bilan bir xil ma'noni bildiradi. */
const QuantityCell = ({ value, max, disabled, tone, onChange }) => (
  <td className="px-4 py-3 text-center">
    <input
      min={0}
      max={max}
      type="number"
      disabled={disabled}
      value={value ?? ""}
      placeholder="0"
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "w-16 rounded-lg border border-gray-200 px-2 py-1 text-center text-sm outline-none",
        TONE_CLASS[tone],
        "disabled:bg-gray-50 disabled:text-gray-300",
        Number(value) > 0 && "border-gray-300 font-semibold",
      )}
    />
  </td>
);

/** Satrga rasm biriktirish — faqat sindirilgan satrga kerak bo'ladi. */
const AttachButton = ({ checkId, lineId, count }) => {
  const { mutate: attach, isPending } = useAttachCheckFiles();

  const handleChange = (e) => {
    const files = [...(e.target.files ?? [])];
    if (files.length === 0) return;

    attach(
      { id: checkId, lineId, files },
      {
        onSuccess: () => toast.success("Fayl biriktirildi"),
        onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      },
    );

    e.target.value = "";
  };

  return (
    <label
      title="Rasm biriktirish"
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600",
        isPending && "pointer-events-none opacity-50",
      )}
    >
      <Paperclip className="size-3.5" />
      {count > 0 && <span className="text-xs">{count}</span>}
      <input type="file" multiple accept="image/*" className="hidden" onChange={handleChange} />
    </label>
  );
};

export default CheckDetailPage;
