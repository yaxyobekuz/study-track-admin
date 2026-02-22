import {
  TabsList,
  TabsContent,
  TabsTrigger,
  Tabs as ShadcnTabs,
} from "@/shared/components/shadcn/tabs";
import { Link } from "react-router-dom";

/**
 * @typedef {Object} TabItem
 * @property {string} value - Unique tab value.
 * @property {import("react").ReactNode} label - Label shown in tab trigger.
 * @property {import("react").ReactNode} [content] - Optional tab content.
 * @property {boolean} [disabled] - Disables the trigger when true.
 */

/**
 * Reusable tabs component powered by a simple items array.
 * Supports controlled/uncontrolled mode and optional path-based links for each tab.
 *
 * @param {Object} props
 * @param {TabItem[]} props.items - Tabs source data.
 * @param {string} [props.value] - Controlled active value.
 * @param {string} [props.defaultValue] - Initial value for uncontrolled mode.
 * @param {(value: string) => void} [props.onValueChange] - Active tab change callback.
 * @param {(item: TabItem) => string} [props.getItemHref] - Returns a normal route path for a tab.
 * @param {string} [props.className] - Root container classes.
 * @param {string} [props.listClassName] - Tabs list classes.
 * @param {string} [props.triggerClassName] - Trigger classes.
 * @param {string} [props.contentClassName] - Content classes.
 * @param {boolean} [props.renderContent=true] - Renders tab content blocks when true.
 * @returns {import("react").ReactElement | null}
 */
const Tabs = ({
  items = [],
  value,
  defaultValue,
  onValueChange,
  getItemHref,
  className,
  listClassName,
  triggerClassName,
  contentClassName,
  renderContent = false,
}) => {
  if (!items.length) return null;

  const fallbackValue = items[0]?.value;

  return (
    <ShadcnTabs
      value={value}
      defaultValue={defaultValue ?? fallbackValue}
      onValueChange={onValueChange}
      className={className}
    >
      <TabsList className={listClassName}>
        {items.map((item) => {
          const href = getItemHref?.(item);

          return (
            <TabsTrigger
              key={item.value}
              value={item.value}
              disabled={item.disabled}
              className={triggerClassName}
              asChild={Boolean(href)}
            >
              {href ? <Link to={href}>{item.label}</Link> : item.label}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {renderContent &&
        items.map((item) => (
          <TabsContent
            key={item.value}
            value={item.value}
            className={contentClassName}
          >
            {item.content}
          </TabsContent>
        ))}
    </ShadcnTabs>
  );
};

export default Tabs;
