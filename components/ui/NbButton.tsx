import { ButtonHTMLAttributes } from "react";

type Variant = "yellow" | "blue" | "pink" | "green" | "orange" | "black" | "ghost";

interface NbButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
}

const variantStyles: Record<Variant, string> = {
  yellow: "bg-nb-yellow text-nb-black",
  blue:   "bg-nb-blue text-white",
  pink:   "bg-nb-pink text-white",
  green:  "bg-nb-green text-nb-black",
  orange: "bg-nb-orange text-white",
  black:  "bg-nb-black text-white",
  ghost:  "bg-white text-nb-black",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2.5 text-sm gap-2",
  lg: "px-6 py-3 text-sm gap-2",
};

export default function NbButton({
  variant = "yellow",
  size = "md",
  className = "",
  children,
  ...props
}: NbButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center
        border-2 border-nb-black
        rounded-lg
        shadow-[3px_3px_0px_#0A0A0A]
        font-bold tracking-wide
        transition-all duration-100
        hover:-translate-x-0.5 hover:-translate-y-0.5
        hover:shadow-[5px_5px_0px_#0A0A0A]
        active:translate-x-0.5 active:translate-y-0.5
        active:shadow-[1px_1px_0px_#0A0A0A]
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}