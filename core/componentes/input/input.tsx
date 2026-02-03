import React, { useId } from "react";

interface PropsInput extends React.InputHTMLAttributes<HTMLInputElement> {
  rotulo?: string;
  erro?: string;
}

export function Input({
  rotulo,
  erro,
  className = "",
  id,
  ...props
}: PropsInput): React.JSX.Element {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className="w-full">
      {rotulo && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {rotulo}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full px-4 py-2 border rounded-lg
          bg-white
          text-gray-900
          border-[#A4A5A6]
          focus:outline-none focus:ring-2 focus:ring-[#094A73] focus:border-[#094A73]
          disabled:opacity-50 disabled:cursor-not-allowed
          ${erro ? "border-[#EF4444] focus:ring-[#EF4444]" : ""}
          ${className}
        `}
        {...props}
      />
      {erro && <p className="mt-1 text-sm text-red-600">{erro}</p>}
    </div>
  );
}
