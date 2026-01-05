// Utils
import { cn } from "@/utils/tailwind.utils";

const Card = ({ className = "", children, responsive = false }) => {
  return (
    <div
      className={cn(
        "bg-white",
        responsive
          ? "md:p-5 md:rounded-3xl md:border"
          : "p-5 rounded-3xl border",
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;
