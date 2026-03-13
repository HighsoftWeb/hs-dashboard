import React from "react";

interface CardGraficoProps {
  titulo: string;
  children: React.ReactNode;
  className?: string;
}

export function CardGrafico({
  titulo,
  children,
  className = "",
}: CardGraficoProps): React.JSX.Element {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden ${className}`}
    >
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-base font-semibold text-slate-800">{titulo}</h3>
      </div>
      <div className="p-5 min-h-[200px]">{children}</div>
    </div>
  );
}
