import { cn } from "@/shared/utils/cn";

const Button = ({
  onClick,
  children,
  size = "lg",
  className = "",
  variant = "primary",
  ...props
}) => {
  const variants = {
    neutral: "bg-gray-100 hover:bg-gray-200 disabled:!bg-gray-100",
    danger: "bg-red-500 text-white hover:bg-red-600 disabled:!bg-red-500",
    primary: "bg-indigo-500 text-white hover:bg-indigo-600 disabled:!bg-indigo-500",
    lightindigo: `bg-indigo-100 text-indigo-500 hover:bg-indigo-200 disabled:!bg-indigo-100`,
  };

  const sizeClasses = {
    none: "",
    sm: "h-9 rounded-sm",
    md: "h-10 rounded-md",
    lg: "h-11 rounded-lg",
    xl: "h-12 rounded-xl",
  };

  return (
    <button
      {...props}
      onClick={onClick}
      children={children}
      className={cn(
        "flex items-center justify-center transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed",
        variants[variant],
        sizeClasses[size],
        className
      )}
    />
  );
};

export default Button;
