import React, { InputHTMLAttributes, useRef } from "react";

interface NbInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  isCurrency?: boolean;
}

export default function NbInput({ label, isCurrency, className = "", ...props }: NbInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isCurrency) {
      const rawValue = e.target.value.replace(/[^0-9]/g, "");
      e.target.value = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
    if (props.onChange) {
      props.onChange(e);
    }
  };

  const isNumberField = props.type === "number" && !isCurrency;

  const handleCounter = (step: number) => {
    if (inputRef.current) {
      const currentVal = parseInt(inputRef.current.value.replace(/[^0-9-]/g, ""), 10);
      const newVal = isNaN(currentVal) ? 0 : currentVal + step;

      // Cara aman memicu event onChange React secara programatis
      const nativeInputValueSetter = typeof window !== 'undefined' 
        ? Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set
        : undefined;
        
      nativeInputValueSetter?.call(inputRef.current, newVal.toString());

      const event = new Event("input", { bubbles: true });
      inputRef.current.dispatchEvent(event);
    }
  };

  const resolvedProps = { ...props };
  if (isCurrency) {
    if (resolvedProps.value !== undefined && resolvedProps.value !== null) {
      resolvedProps.value = String(resolvedProps.value)
        .replace(/[^0-9]/g, "")
        .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
    if (resolvedProps.defaultValue !== undefined && resolvedProps.defaultValue !== null) {
      resolvedProps.defaultValue = String(resolvedProps.defaultValue)
        .replace(/[^0-9]/g, "")
        .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
  }

  // Menghindari konflik dengan spread props
  const { value, defaultValue, ...restProps } = resolvedProps;

  const inputElement = (
    <input
      {...restProps}
      value={value}
      defaultValue={defaultValue}
      ref={inputRef}
      type={isCurrency || isNumberField ? "text" : props.type}
      inputMode={isCurrency || isNumberField ? "numeric" : props.inputMode}
      onChange={handleChange}
      className={`
        w-full
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
        ${isNumberField ? "text-center" : ""}
        ${className}
      `}
    />
  );

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-xs font-bold uppercase tracking-widest text-nb-black/60">
          {label}
        </label>
      )}
      {isNumberField ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleCounter(-1)}
            className="w-12 h-11 flex-shrink-0 flex items-center justify-center bg-nb-pink text-white font-black text-lg border-2 border-nb-black rounded-lg shadow-[2px_2px_0px_#0A0A0A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
          >
            -
          </button>
          {inputElement}
          <button
            type="button"
            onClick={() => handleCounter(1)}
            className="w-12 h-11 flex-shrink-0 flex items-center justify-center bg-nb-green text-nb-black font-black text-lg border-2 border-nb-black rounded-lg shadow-[2px_2px_0px_#0A0A0A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
          >
            +
          </button>
        </div>
      ) : (
        inputElement
      )}
    </div>
  );
}