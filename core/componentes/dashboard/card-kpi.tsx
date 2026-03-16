import React from "react";
import Link from "next/link";

interface CardKpiProps {
  titulo: string;
  valor: string | number;
  icone?: React.ReactNode;
  tendencia?: {
    valor: number;
    positiva: boolean;
  };
  variante?: "padrao" | "destaque";
  negativo?: boolean;
  /** Receita=azul, Despesa=vermelho, Lucro=verde (positivo) ou vermelho (negativo). */
  tipoFinanceiro?: "receita" | "despesa" | "lucro";
  href?: string;
  className?: string;
}

export function CardKpi({
  titulo,
  valor,
  icone,
  tendencia,
  variante = "padrao",
  negativo = false,
  tipoFinanceiro,
  href,
  className = "",
}: CardKpiProps): React.JSX.Element {
  const isDestaque = variante === "destaque";
  const corValor =
    tipoFinanceiro === "receita"
      ? "text-blue-600"
      : tipoFinanceiro === "despesa"
        ? "text-red-600"
        : tipoFinanceiro === "lucro"
          ? negativo
            ? "text-red-600"
            : "text-green-600"
          : negativo
            ? "text-red-600"
            : isDestaque
              ? "text-highsoft-primario"
              : "text-slate-900";
  const corIcone =
    tipoFinanceiro === "receita"
      ? "bg-blue-100 text-blue-600"
      : tipoFinanceiro === "despesa"
        ? "bg-red-100 text-red-600"
        : tipoFinanceiro === "lucro"
          ? negativo
            ? "bg-red-100 text-red-600"
            : "bg-green-100 text-green-600"
          : isDestaque
            ? "bg-highsoft-primario/10 text-highsoft-primario"
            : "bg-slate-100 text-slate-600";

  const conteudo = (
    <>
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-500">{titulo}</p>
          <p
            className={`mt-1 text-xl sm:text-2xl font-bold break-words ${corValor}`}
          >
            {valor}
          </p>
          {tendencia && (
            <p
              className={`mt-1 text-xs font-medium ${
                tendencia.positiva ? "text-blue-600" : "text-red-600"
              }`}
            >
              {tendencia.positiva ? "↑" : "↓"} {Math.abs(tendencia.valor)}%
            </p>
          )}
        </div>
        {icone && (
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center ${corIcone}`}
          >
            {icone}
          </div>
        )}
      </div>
    </>
  );

  const baseClass = `rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md ${className}`;
  const interactiveClass = href
    ? "cursor-pointer hover:border-highsoft-primario/40"
    : "";

  if (href) {
    return (
      <Link href={href} className={`${baseClass} ${interactiveClass} block`}>
        {conteudo}
      </Link>
    );
  }

  return <div className={`${baseClass} ${interactiveClass}`}>{conteudo}</div>;
}
