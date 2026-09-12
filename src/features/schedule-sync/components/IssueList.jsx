// React
import { useState } from "react";

// Components
import Notice from "./Notice";

// Data
import { ISSUE_PREVIEW_LIMIT } from "../data/scheduleSync.data";

/**
 * Xatolar / ogohlantirishlar / to'siqlar ro'yxati.
 *
 * Uzun ro'yxat qisqartiriladi — 200 ta qatorli xato ekranni to'ldirib,
 * ostidagi "nima o'zgaradi" qismini ko'rinmas qilardi. Hammasi bitta
 * bosishda ochiladi.
 *
 * @param {object} props
 * @param {Array<{code?: string, message: string, cell?: string}|string>} props.items
 * @param {"danger"|"warning"|"info"} [props.tone]
 * @param {string} props.title
 * @param {string} [props.description]
 */
const IssueList = ({ items = [], tone = "danger", title, description = "" }) => {
  const [expanded, setExpanded] = useState(false);

  if (items.length === 0) return null;

  const visible = expanded ? items : items.slice(0, ISSUE_PREVIEW_LIMIT);
  const hidden = items.length - visible.length;

  return (
    <Notice tone={tone} title={`${title} (${items.length})`}>
      {description && <p className="mb-1.5">{description}</p>}

      <ul className="list-disc space-y-1 pl-4">
        {visible.map((item, index) => {
          const issue = typeof item === "string" ? { message: item } : item;
          return (
            <li key={`${issue.code ?? "issue"}-${issue.cell ?? ""}-${index}`}>
              {issue.message}
              {issue.cell && (
                <span className="ml-1 text-gray-500">(katak {issue.cell})</span>
              )}
            </li>
          );
        })}
      </ul>

      {items.length > ISSUE_PREVIEW_LIMIT && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-1.5 font-medium text-blue-600 hover:text-blue-800"
        >
          {expanded ? "Qisqartirish" : `Yana ${hidden} ta`}
        </button>
      )}
    </Notice>
  );
};

export default IssueList;
