import { InputHTMLAttributes } from "react";

interface NbInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function NbInput({ label, className = "", ...props }: NbInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-bold uppercase tracking-widest text-nb-black/60">
          {label}
        </label>
      )}
      <input
        className={`
          border-2 border-nb-black
          rounded-lg
          shadow-[2px_2px_0px_#0A0A0A]
          px-3.5 py-2.5
          text-sm font-semibold
          bg-white
          outline-none
          focus:shadow-[4px_4px_0px_#0A0A0A]
          transition-shadow duration-100
          placeholder:text-gray-300
          placeholder:font-normal
          ${className}
        `}
        {...props}
      />
    </div>
  );
}