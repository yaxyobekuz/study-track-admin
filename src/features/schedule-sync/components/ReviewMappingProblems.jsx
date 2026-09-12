// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import LoaderCard from "@/shared/components/ui/LoaderCard";
import MappingEditor, { MappingSaveBar } from "./MappingEditor";
import LoadError from "./LoadError";

// Hooks, queries, helpers & data
import useMappingDraft from "../hooks/useMappingDraft";
import { scheduleSyncQueries } from "../queries/scheduleSync.queries";
import { buildMappingRows } from "../helpers/scheduleSync.helpers";
import { MAPPING_KINDS, PROBLEM_STATUSES } from "../data/scheduleSync.data";

const isProblem = (res) => PROBLEM_STATUSES.includes(res.status);

/**
 * "O'zgarishlar" tabidagi HAL QILINMAGAN nomlar — faqat muammoli qatorlar
 * ("Moslash" tabidagi AYNI tahrirlagich). Odam xatoni ko'rgan joyida
 * tuzatadi, boshqa tabga o'tib qidirmaydi.
 *
 * @param {object} props
 * @param {object} props.resolution - `Review.resolution`
 * @param {boolean} props.canEdit - `review` yoki `source` ruxsati
 */
const ReviewMappingProblems = ({ resolution, canEdit }) => {
  const problemCount = MAPPING_KINDS.reduce(
    (sum, { kind }) => sum + (resolution?.[kind] ?? []).filter(isProblem).length,
    0,
  );

  const mappingsQuery = useQuery({
    ...scheduleSyncQueries.mappings(),
    enabled: problemCount > 0,
  });
  const draft = useMappingDraft();

  if (problemCount === 0) return null;

  if (mappingsQuery.isLoading) {
    return <LoaderCard title="Nomlar yuklanmoqda..." />;
  }

  if (mappingsQuery.isError) {
    return (
      <LoadError
        title="Moslash ro'yxatini yuklab bo'lmadi"
        onRetry={mappingsQuery.refetch}
      />
    );
  }

  const items = mappingsQuery.data?.items ?? [];
  const options = mappingsQuery.data?.options ?? {};

  const sections = MAPPING_KINDS.map((meta) => ({
    meta,
    rows: buildMappingRows(meta.kind, resolution?.[meta.kind], items).filter(
      (row) => row.inRevision && isProblem(row),
    ),
  })).filter((section) => section.rows.length > 0);

  return (
    <section className="space-y-4" aria-label="Hal qilinmagan nomlar">
      <div>
        <h2 className="font-semibold text-gray-900">
          Hal qilinmagan nomlar ({problemCount})
        </h2>
        <p className="text-sm text-gray-500">
          Sheet'dagi nomni platformadagi sinf, fan yoki o'qituvchiga bog'lang.
          Saqlangandan keyin farq qayta hisoblanadi.
        </p>
      </div>

      {sections.map(({ meta, rows }) => (
        <MappingEditor
          key={meta.kind}
          kindMeta={meta}
          rows={rows}
          options={options[meta.optionsKey]}
          subjects={options.subjects}
          draft={draft}
          canEdit={canEdit}
        />
      ))}

      <MappingSaveBar draft={draft} canEdit={canEdit} />
    </section>
  );
};

export default ReviewMappingProblems;
