// React
import { useMemo } from "react";

// Icons
import { Check, Eraser, Save, Undo2, WandSparkles } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateTimeUz } from "@/shared/utils/date.utils";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import Table, { Td, Tr } from "@/shared/components/ui/Table";
import SelectSearch from "@/shared/components/ui/select/SelectSearch";
import Pill from "./Pill";

// Helpers & data
import {
  baseTargetOf,
  buildOptionList,
  candidateLabel,
  mappingRowId,
  suggestionOf,
} from "../helpers/scheduleSync.helpers";
import {
  EDITED_META,
  MAPPING_COLUMNS,
  RESOLUTION_STATUS,
} from "../data/scheduleSync.data";

/**
 * Taklif qilingan yozuv yorlig'i — tanlagichdagi bilan AYNI (o'qituvchida
 * login va fanlar bilan): "Taklif: Aliyev A." adashlar orasida ma'nosiz.
 */
const suggestionLabel = (row, labelById) => {
  const id = suggestionOf(row);
  if (!id) return "—";
  const candidate =
    row.candidates?.find((c) => c.id === id) ?? { id, name: row.targetName || "—" };
  return candidateLabel(candidate, labelById);
};

/**
 * Tanlagich ostidagi izoh — nega qator shu holatda va nima qilish kerak.
 * @param {Map<string, string>} labelById - variant id → yorliq
 */
const hintOf = (row, edit, labelById) => {
  if (edit) {
    return edit.targetId === null
      ? "Saqlansa moslash o'chiriladi"
      : "Saqlanmagan o'zgarish";
  }
  if (!row.inRevision) return "Oxirgi o'qilgan sheet'da uchramadi";

  switch (row.status) {
    case "suggested":
      return `Taklif: ${suggestionLabel(row, labelById)}`;
    case "ambiguous":
      // Yorliqda vergul bor (fanlar ro'yxati) — nomzodlar ";" bilan ajratiladi
      return row.candidates?.length
        ? `Bir nechta mos: ${row.candidates
            .map((c) => candidateLabel(c, labelById))
            .join("; ")}`
        : "Bir nechta mos yozuv bor — to'g'risini tanlang";
    case "unresolved":
      return "Platformada mos nom topilmadi — qo'lda tanlang";
    case "missing_target":
      return `Biriktirilgan yozuv o'chirilgan${
        row.targetName ? ` (${row.targetName})` : ""
      } — boshqasini tanlang`;
    case "archived_target":
      return `${row.targetName || "Biriktirilgan xodim"} arxivlangan — boshqasini tanlang`;
    case "manual":
      return row.stored?.updatedBy
        ? `${row.stored.updatedBy.name}, ${formatDateTimeUz(row.stored.updatedAt)}`
        : "";
    default:
      return "";
  }
};

/** Noaniq qatorda nomzodlar ro'yxat BOSHIDA turadi. */
const optionsFor = (row, optionList) => {
  if (!row.candidates?.length) return optionList;
  const ids = new Set(row.candidates.map((c) => c.id));
  return [
    ...optionList.filter((o) => ids.has(o.value)),
    ...optionList.filter((o) => !ids.has(o.value)),
  ];
};

const MappingRow = ({ row, kindMeta, optionList, labelById, draft, canEdit }) => {
  const edit = draft.editOf(row);
  const value = edit ? edit.targetId ?? "" : baseTargetOf(row);
  const suggestion = suggestionOf(row);
  const isClearing = edit?.targetId === null;
  const hint = hintOf(row, edit, labelById);

  return (
    <Tr className={cn(edit && "bg-blue-50/50")}>
      <Td nowrap={false} className="min-w-36">
        <p className="font-medium text-gray-900">{row.label}</p>
        {row.cells.length > 0 && (
          <p className="text-xs text-gray-400">{row.cells.join(", ")}</p>
        )}
      </Td>

      <Td align="center" className="text-gray-600">
        {row.inRevision && row.count !== null ? row.count : "—"}
      </Td>

      <Td>
        <div className="flex flex-wrap gap-1">
          {RESOLUTION_STATUS[row.status] && (
            <Pill meta={RESOLUTION_STATUS[row.status]} />
          )}
          {edit && <Pill meta={EDITED_META} />}
        </div>
      </Td>

      <Td nowrap={false} className="min-w-56">
        {/* `idValues` — ro'yxat elementi id bo'yicha ajraladi (yorliqlari
            bir xil variantlar ham alohida), qidiruv esa yorliq bo'yicha */}
        <SelectSearch
          idValues
          value={value}
          disabled={!canEdit}
          placeholder={kindMeta.placeholder}
          triggerClassName="w-full"
          options={optionsFor(row, optionList)}
          onChange={(next) => draft.change(row, next)}
        />
        {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
      </Td>

      <Td align="right">
        <div className="flex justify-end gap-1.5">
          {canEdit && suggestion && !edit && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => draft.setTarget(row, suggestion)}
            >
              <Check className="size-4" strokeWidth={1.5} />
              Tasdiqlash
            </Button>
          )}

          {canEdit && row.stored && !isClearing && (
            <Button
              size="sm"
              variant="ghost"
              title="Qo'lda qilingan moslashni o'chirish"
              onClick={() => draft.setTarget(row, null)}
            >
              <Eraser className="size-4" strokeWidth={1.5} />
              Tozalash
            </Button>
          )}

          {edit && (
            <Button
              size="sm"
              variant="ghost"
              title="Tahrirni bekor qilish"
              aria-label="Tahrirni bekor qilish"
              onClick={() => draft.reset(row)}
            >
              <Undo2 className="size-4" strokeWidth={1.5} />
            </Button>
          )}
        </div>
      </Td>
    </Tr>
  );
};

/**
 * Bitta tur (sinflar / fanlar / o'qituvchilar) uchun moslash jadvali.
 *
 * Tahrirlar `draft` da (`useMappingDraft`) LOKAL to'planadi va sahifadagi
 * bitta "Saqlash" bilan ketadi.
 *
 * @param {object} props
 * @param {object} props.kindMeta - `MAPPING_KINDS` dagi yozuv
 * @param {object[]} props.rows - `buildMappingRows` natijasi
 * @param {object[]} [props.options] - shu turdagi tanlov ro'yxati (`options[...]`)
 * @param {object[]} [props.subjects] - `options.subjects` — o'qituvchi fanlarini
 *   yorliqqa yozish uchun (adashlarni ajratadi)
 * @param {object} props.draft - `useMappingDraft()`
 * @param {boolean} props.canEdit
 * @param {string} [props.description]
 * @param {string} [props.emptyText]
 */
const MappingEditor = ({
  kindMeta,
  rows,
  options,
  subjects,
  draft,
  canEdit,
  description = "",
  emptyText = "Hozircha nom yo'q",
}) => {
  const optionList = useMemo(
    () => buildOptionList(kindMeta.kind, options, subjects),
    [kindMeta.kind, options, subjects],
  );
  const labelById = useMemo(
    () => new Map(optionList.map((option) => [option.value, option.label])),
    [optionList],
  );

  // Faqat hali tasdiqlanmagan takliflar
  const pendingSuggestions = rows.filter(
    (row) => suggestionOf(row) && !draft.editOf(row),
  );

  const confirmAll = () =>
    pendingSuggestions.forEach((row) => draft.setTarget(row, suggestionOf(row)));

  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-semibold text-gray-900">
            {kindMeta.label}{" "}
            <span className="text-sm font-normal text-gray-500">({rows.length})</span>
          </h2>
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>

        {/* ⚠️ O'qituvchilarda YO'Q — `MAPPING_KINDS` izohiga qarang */}
        {kindMeta.bulkConfirm && canEdit && pendingSuggestions.length > 0 && (
          <Button size="sm" variant="outline" onClick={confirmAll}>
            <WandSparkles className="size-4" strokeWidth={1.5} />
            Barcha takliflarni tasdiqlash ({pendingSuggestions.length})
          </Button>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-gray-500">{emptyText}</p>
      ) : (
        <Table columns={MAPPING_COLUMNS} className="border border-gray-100">
          {rows.map((row) => (
            <MappingRow
              key={mappingRowId(row)}
              row={row}
              kindMeta={kindMeta}
              optionList={optionList}
              labelById={labelById}
              draft={draft}
              canEdit={canEdit}
            />
          ))}
        </Table>
      )}
    </Card>
  );
};

/**
 * Saqlanmagan moslashlar paneli — pastda yopishib turadi, odam jadval
 * bo'ylab aylanganda ham "saqlash kerak" degan belgi ko'rinib turadi.
 */
export const MappingSaveBar = ({ draft, canEdit }) => {
  if (draft.count === 0) return null;

  return (
    <div className="sticky bottom-0 z-20 -mx-4 flex flex-col gap-3 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur xs:flex-row xs:items-center xs:justify-between">
      <p className="text-sm text-gray-700">
        {draft.count} ta saqlanmagan o'zgarish
      </p>

      <div className="flex flex-col-reverse gap-2 xs:flex-row">
        <Button
          variant="secondary"
          disabled={draft.isSaving}
          onClick={draft.resetAll}
        >
          Bekor qilish
        </Button>
        <Button disabled={!canEdit || draft.isSaving} onClick={draft.save}>
          <Save className="size-4" strokeWidth={1.5} />
          Saqlash{draft.isSaving && "..."}
        </Button>
      </div>
    </div>
  );
};

export default MappingEditor;
