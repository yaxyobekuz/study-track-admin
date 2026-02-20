// Utils
import { cn } from "@/shared/utils/cn";

/**
 * Card - Basic container with optional title.
 *
 * @param {object} props
 * @param {string} [props.className=""] - Extra class names.
 * @param {React.ReactNode} props.children - Card content.
 * @param {boolean} [props.responsive=false] - Apply responsive padding/rounding.
 * @param {string} [props.title=""] - Optional title text.
 * @returns {JSX.Element}
 */
const Card = ({ className = "", children, responsive = false, title = "" }) => {
  return (
    <div
      className={cn(
        responsive
          ? "xs:p-5 xs:rounded-2xl xs:bg-white"
          : "bg-white p-4 rounded-2xl xs:p-5",
        className,
      )}
    >
      {title && (
        <h2 className="font-semibold mb-2 text-blue-600 xs:mb-3.5">{title}</h2>
      )}
      {children}
    </div>
  );
};

export default Card;
