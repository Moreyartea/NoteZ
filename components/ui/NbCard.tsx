interface NbCardProps {
  children: React.ReactNode;
  className?: string;
  color?: "white" | "yellow" | "blue" | "pink" | "green" | "orange" | "black";
  hover?: boolean;
  onClick?: () => void;
}

const colorStyles = {
  white:  "bg-white",
  yellow: "bg-nb-yellow",
  blue:   "bg-nb-blue text-white",
  pink:   "bg-nb-pink text-white",
  green:  "bg-nb-green",
  orange: "bg-nb-orange text-white",
  black:  "bg-nb-black text-white",
};

export default function NbCard({
  children,
  className = "",
  color = "white",
  hover = false,
  onClick,
}: NbCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        border-2 border-nb-black
        rounded-xl
        shadow-[3px_3px_0px_#0A0A0A]
        p-5
        ${colorStyles[color]}
        ${hover ? "transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#0A0A0A] cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}