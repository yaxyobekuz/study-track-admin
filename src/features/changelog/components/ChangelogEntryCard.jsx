// Hooks
import useModal from "@/shared/hooks/useModal";

// Icons
import { Edit, Trash2 } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Can from "@/shared/components/guards/Can";

// Data
import { BUMP_META, PANEL_META } from "../data/changelog.data";

/**
 * Bitta o'zgarish yozuvi: panel nishonchasi, versiya, daraja, sarlavha va
 * o'zgarishlar ro'yxati.
 */
const ChangelogEntryCard = ({ entry }) => {
  const { openModal } = useModal();

  const panel = PANEL_META[entry.panel] || { label: entry.panel, className: "bg-gray-100 text-gray-800" };
  const bump = BUMP_META[entry.bump] || { label: entry.bump, className: "bg-gray-100 text-gray-700" };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${panel.className}`}
          >
            {panel.label}
          </span>

          <span className="font-mono text-sm font-semibold text-gray-900">
            v{entry.version}
          </span>

          <span
            className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${bump.className}`}
          >
            {bump.label}
          </span>
        </div>

        <div className="flex shrink-0 gap-2">
          <Can do="changelog.update">
            <button
              onClick={() => openModal("editChangelog", entry)}
              className="p-1 text-blue-600 hover:text-blue-800"
            >
              <Edit className="size-4" />
            </button>
          </Can>

          <Can do="changelog.delete">
            <button
              onClick={() => openModal("deleteChangelog", entry)}
              className="p-1 text-red-600 hover:text-red-800"
            >
              <Trash2 className="size-4" />
            </button>
          </Can>
        </div>
      </div>

      {entry.title ? (
        <p className="mt-2 font-medium text-gray-900">{entry.title}</p>
      ) : null}

      {entry.items?.length > 0 ? (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-600">
          {entry.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      ) : null}

      {entry.notes ? (
        <p className="mt-3 border-t border-gray-100 pt-3 text-sm text-gray-500">
          {entry.notes}
        </p>
      ) : null}
    </Card>
  );
};

export default ChangelogEntryCard;
