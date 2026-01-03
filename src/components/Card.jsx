// Utils
import { cn } from "@/utils/tailwind.utils";

const Card = ({ className = "", children }) => {
  return (
    <div className={cn(className, "bg-white p-5 rounded-3xl border")}>
      {children}
    </div>
  );
};

export default Card;
