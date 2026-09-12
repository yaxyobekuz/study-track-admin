// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import LoaderCard from "@/shared/components/ui/LoaderCard";
import MappingEditor, { MappingSaveBar } from "./MappingEditor";
import LoadError from "./LoadError";
import Notice from "./Notice";

// Hooks, queries, helpers & data
import useMappingDraft from "../hooks/useMappingDraft";
import { scheduleSyncQueries } from "../queries/scheduleSync.queries";
import { buildMappingRows } from "../helpers/scheduleSync.helpers";
import { MAPPING_KINDS } from "../data/scheduleSync.data";

/**
 * "Moslash" tabi — sheet'dagi nomlar va platformadagi yozuvlar.
 *
 * Qatorlar ikki manbadan: oxirgi o'qilgan holatdagi nomlar va saqlangan
 * moslashlar (oxirgi holatda uchramagani ham ko'rinadi — keyingi o'qishda
 * u yana ishga tushadi).
 *
 * @param {{ status: object }} props
 */
const MappingTab = ({ status }) => {
  const latestId = status.latestRevision?.id ?? null;
  const canEdit = Boolean(status.can?.review || status.can?.source);

  const mappingsQuery = useQuery(scheduleSyncQueries.mappings());
  const reviewQuery = useQuery(scheduleSyncQueries.revision(latestId));
  const draft = useMappingDraft();

  if (mappingsQuery.isLoading || (latestId && reviewQuery.isLoading)) {
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
  const resolution = reviewQuery.data?.resolution;

  return (
    <div className="space-y-4">
      {!canEdit && (
        <Notice tone="info" title="Faqat ko'rish">
          Moslashni o'zgartirish uchun "O'zgarishlarni ko'rib chiqish" yoki
          "Manbani almashtirish" ruxsati kerak.
        </Notice>
      )}

      {latestId && reviewQuery.isError && (
        <Notice tone="warning" title="Oxirgi o'qilgan holat yuklanmadi">
          Faqat saqlangan moslashlar ko'rsatilmoqda.
        </Notice>
      )}

      {MAPPING_KINDS.map((meta) => (
        <MappingEditor
          key={meta.kind}
          kindMeta={meta}
          rows={buildMappingRows(meta.kind, resolution?.[meta.kind], items)}
          options={options[meta.optionsKey]}
          subjects={options.subjects}
          draft={draft}
          canEdit={canEdit}
          description={meta.description}
          emptyText={
            latestId
              ? "Bu turdagi nom yo'q"
              : "Sheet hali o'qilmagan — nomlar birinchi tekshiruvdan keyin chiqadi"
          }
        />
      ))}

      <MappingSaveBar draft={draft} canEdit={canEdit} />
    </div>
  );
};

export default MappingTab;
