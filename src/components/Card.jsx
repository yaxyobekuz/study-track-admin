// Utils
import { cn } from "@/utils/tailwind.utils";

const Card = ({ className = "", children }) => {
  return (
    <div className={cn("bg-white p-5 rounded-3xl border", className)}>
      {children}
    </div>
  );
};

export default Card;
