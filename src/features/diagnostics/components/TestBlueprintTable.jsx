// Icons
import { Plus, Trash2 } from "lucide-react";

// Components
import Button from "@/shared/components/ui/button/Button";
import Input from "@/shared/components/ui/input/Input";
import Table, { Td, Tr } from "@/shared/components/ui/Table";

// Data
import {
  GRADES,
  BLUEPRINT_SOURCES,
  BLUEPRINT_LEVELS,
  TOPIC_MODES,
} from "../data/diagnostics.data";

// Utils
import { cn } from "@/shared/utils/cn";

/**
 * FANLAR VA SAVOLLAR TAQSIMOTI.
 *
 * Har qator: qaysi fandan, qaysi sinf bazasidan, QAYSI MAVZULAR
 * ORALIG'IDAN, nechta oson / o'rta / qiyin savol va ularni QAYERDAN
 * olish (bank yoki AI).
 *
 * ⚠️ MAVZU ORALIG'I SINFGA BOG'LIQ. "Hozirgi mavzugacha" degan tanlov
 * server tomonda sinfning joriy mavzusiga aylanadi
 * (`diagnosticTopicScope.service.js`), ya'ni chegarani panel
 * HISOBLAMAYDI — u faqat tanlovni yuboradi va serverdan kelgan raqamni
 * ko'rsatadi. Ikkinchi hisob yozilsa, oynadagi "42" bilan testdagi
 * chegara bir-biriga mos kelmay qolardi.
 *
 * ⚠️ "O'TIB KETDI" OGOHLANTIRISHINI HAM SERVER AYTADI. Panelda
 * `topicTo > joriy` tekshiruvi qotirilsa, u joriy mavzuni eskirgan
 * reja bilan solishtirardi — sinf oraliqda oldinga ketgan bo'lishi
 * mumkin.
 */
const TestBlueprintTable = ({
  rows,
  subjects = [],
  planByIndex = null,
  disabled = false,
  onChange,
  onRemove,
  onAdd,
}) => {
  const total = rows.reduce(
    (sum, row) =>
      sum + BLUEPRINT_LEVELS.reduce((n, lvl) => n + (+row[lvl.key] || 0), 0),
    0,
  );

  return (
    <>
      {rows.length === 0 ? (
        <p className="border-y border-gray-100 py-10 text-center text-sm text-gray-400">
          Fan qo'shilmagan — pastdagi tugma orqali qo'shing
        </p>
      ) : (
        <Table
          columns={[
            "Fan",
            "Sinf (baza)",
            "Savollar manbasi",
            "Mavzular",
            ...BLUEPRINT_LEVELS.map((lvl) => ({ label: lvl.label, align: "center" })),
            { label: "Jami", align: "center" },
            { label: "", align: "right" },
          ]}
        >
          {rows.map((row, index) => {
            const rowTotal = BLUEPRINT_LEVELS.reduce(
              (n, lvl) => n + (+row[lvl.key] || 0),
              0,
            );
            const plan = planByIndex?.get(index) ?? null;

            return (
              <Tr key={index}>
                <Td nowrap={false} className="min-w-[180px]">
                  <select
                    disabled={disabled}
                    value={row.subjectId}
                    onChange={(e) => onChange(index, { subjectId: e.target.value })}
                    className={selectClass}
                  >
                    <option value="">Fanni tanlang</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </Td>

                <Td className="min-w-[130px]">
                  <select
                    disabled={disabled}
                    value={row.grade}
                    onChange={(e) => onChange(index, { grade: e.target.value })}
                    className={selectClass}
                  >
                    <option value="">Barcha sinflar</option>
                    {GRADES.map((g) => (
                      <option key={g} value={g}>
                        {g}-sinf
                      </option>
                    ))}
                  </select>
                </Td>

                <Td className="min-w-[140px]">
                  <select
                    disabled={disabled}
                    value={row.source}
                    onChange={(e) => onChange(index, { source: e.target.value })}
                    className={selectClass}
                  >
                    {BLUEPRINT_SOURCES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </Td>

                {/* ── MAVZU QAMROVI ──────────── */}
                <Td nowrap={false} className="min-w-[230px]">
                  <select
                    disabled={disabled}
                    value={row.topicMode}
                    onChange={(e) => onChange(index, { topicMode: e.target.value })}
                    className={selectClass}
                  >
                    {TOPIC_MODES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>

                  {row.topicMode === "range" && (
                    <span className="mt-1.5 flex items-center gap-1.5">
                      <Input
                        type="number"
                        min={1}
                        disabled={disabled}
                        value={row.topicFrom}
                        placeholder="dan"
                        onChange={(e) => onChange(index, { topicFrom: e.target.value })}
                        className="h-9 w-20 text-center"
                      />
                      <span className="text-gray-400">—</span>
                      <Input
                        type="number"
                        min={1}
                        disabled={disabled}
                        value={row.topicTo}
                        placeholder="gacha"
                        onChange={(e) => onChange(index, { topicTo: e.target.value })}
                        className="h-9 w-20 text-center"
                      />
                    </span>
                  )}

                  {/* Serverdan kelgan JORIY mavzu — panel hisoblamaydi. */}
                  {plan?.currentTopicNumber != null && (
                    <span className="mt-1.5 block text-[11px] text-gray-500">
                      Sinf hozir{" "}
                      <b className="text-gray-700">{plan.currentTopicNumber}</b>
                      -mavzuda
                      {plan.totalTopics ? ` (jami ${plan.totalTopics})` : ""}
                    </span>
                  )}
                  {plan?.reason && (
                    <span className="mt-1.5 block text-[11px] font-medium text-rose-600">
                      {plan.reason}
                    </span>
                  )}
                </Td>

                {BLUEPRINT_LEVELS.map((lvl) => (
                  <Td key={lvl.key} align="center">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      disabled={disabled}
                      value={row[lvl.key]}
                      onChange={(e) => onChange(index, { [lvl.key]: e.target.value })}
                      className="mx-auto h-10 w-16 text-center"
                    />
                  </Td>
                ))}

                <Td align="center" className="font-semibold tabular-nums">
                  {rowTotal}
                </Td>

                <Td align="right">
                  <button
                    type="button"
                    title="Qatorni o'chirish"
                    disabled={disabled}
                    onClick={() => onRemove(index)}
                    className="rounded-lg border border-gray-200 p-1.5 text-rose-600 transition-colors hover:border-rose-200 hover:bg-rose-50 disabled:opacity-50"
                  >
                    <Trash2 className="size-4" strokeWidth={1.5} />
                  </button>
                </Td>
              </Tr>
            );
          })}
        </Table>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 p-4 xs:p-5">
        <div>
          <Button
            variant="secondary"
            className="px-3.5"
            disabled={disabled}
            onClick={onAdd}
          >
            <Plus className="mr-2 size-4" strokeWidth={2} />
            Fan qo'shish
          </Button>
          <p className="mt-2 max-w-xl text-xs text-gray-400">
            Bir xil fanni turli sinflar yoki turli mavzu oraliqlari bilan bir
            necha marta qo'shishingiz mumkin. Savollar sinf o'tgan
            mavzulardan oshmaydi.
          </p>
        </div>

        {total > 0 && (
          <p className="text-sm text-gray-500">
            Jami: <span className="font-semibold text-gray-900">{total}</span> ta
            savol
          </p>
        )}
      </div>
    </>
  );
};

const selectClass = cn(
  "h-10 w-full rounded-lg border border-gray-200 bg-white px-2.5 text-sm",
  "outline-none focus:border-primary disabled:bg-gray-50 disabled:text-gray-400",
);

export default TestBlueprintTable;
