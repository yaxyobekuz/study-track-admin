// Hooks
import { usePanelVersions } from "../queries/changelog.queries";

// Utils
import { formatUzDate } from "@/shared/utils/formatDate";

// Components
import Card from "@/shared/components/ui/Card";

// Data
import { PANEL_META, PANEL_ORDER } from "../data/changelog.data";

/**
 * Har bir panelning joriy versiyasi — sahifa tepasidagi kartochkalar.
 * Hech qanday yozuvi yo'q panel `v0.0.0` bo'lib, xiraroq ko'rsatiladi.
 */
const ChangelogVersionHeader = () => {
  const { data: versions = [], isLoading } = usePanelVersions();

  const byPanel = Object.fromEntries(versions.map((item) => [item.panel, item]));

  return (
    <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-3 lg:grid-cols-5">
      {PANEL_ORDER.map((panel) => {
        const info = byPanel[panel];
        const meta = PANEL_META[panel];
        const isEmpty = !info || info.entryCount === 0;

        return (
          <Card key={panel} className="p-4">
            <p className="text-xs text-gray-500">{meta?.label || panel}</p>

            <p
              className={`font-mono text-xl font-semibold ${
                isEmpty ? "text-gray-400" : "text-gray-900"
              }`}
            >
              {isLoading ? "…" : `v${info?.version || "0.0.0"}`}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              {isEmpty
                ? "yozuv yo'q"
                : `${formatUzDate(info.lastDate)} · ${info.entryCount} ta yozuv`}
            </p>
          </Card>
        );
      })}
    </div>
  );
};

export default ChangelogVersionHeader;
