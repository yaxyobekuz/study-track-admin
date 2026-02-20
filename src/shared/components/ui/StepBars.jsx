// Utils
import { cn } from "@/shared/utils/cn";

/**
 * StepBars - Renders progress bars for multi-step flows.
 *
 * @param {object} props
 * @param {number} [props.totalSteps=0] - Total number of steps.
 * @param {number|{number: number}} [props.currentStep=1] - Current step index or object.
 * @param {string} [props.activeClassName="bg-blue-500"] - Active bar classes.
 * @param {string} [props.inactiveClassName="bg-gray-100"] - Inactive bar classes.
 * @param {string} [props.className=""] - Extra class names.
 * @returns {JSX.Element}
 */
const StepBars = ({
  totalSteps = 0,
  currentStep = 1,
  activeClassName = "bg-blue-500",
  inactiveClassName = "bg-gray-100",
  className = "",
}) => {
  const currentNumber =
    typeof currentStep === "number" ? currentStep : currentStep?.number || 1;
  const steps = Math.max(Number(totalSteps) || 0, 0);

  return (
    <div className={cn("flex items-center gap-1.5 w-full h-1.5", className)}>
      {Array.from({ length: steps }).map((_, index) => (
        <div
          key={index}
          className={cn(
            index + 1 <= currentNumber ? activeClassName : inactiveClassName,
            "size-full rounded-full",
          )}
        />
      ))}
    </div>
  );
};

export default StepBars;
