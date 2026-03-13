import React from "react";

interface PropsBotao extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: "primario" | "secundario" | "perigo";
  tamanho?: "pequeno" | "medio" | "grande";
  carregando?: boolean;
}

export function Botao({
  variante = "primario",
  tamanho = "medio",
  carregando = false,
  children,
  className = "",
  disabled,
  ...props
}: PropsBotao): React.JSX.Element {
  const classesVariante = {
    primario:
      "bg-highsoft-primario text-white hover:bg-highsoft-primario-hover shadow-lg hover:shadow-xl",
    secundario: "bg-highsoft-cinza text-white hover:bg-slate-500",
    perigo: "bg-highsoft-erro text-white hover:bg-red-600",
  };

  const classesTamanho = {
    pequeno: "px-3 py-1.5 text-sm",
    medio: "px-4 py-2 text-base",
    grande: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={`
        rounded-lg font-medium transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${classesVariante[variante]}
        ${classesTamanho[tamanho]}
        ${className}
      `}
      disabled={disabled || carregando}
      {...props}
    >
      {carregando ? "Carregando..." : children}
    </button>
  );
}
