"use client";

import React from "react";
import { Calendar } from "lucide-react";
import {
  obterIntervalosPeriodo,
  obterIntervaloPadraoBI,
} from "@/core/constants/filtros-periodo";

interface FiltroPeriodoProps {
  dataInicio: string;
  dataFim: string;
  onChange: (dataInicio: string, dataFim: string) => void;
  className?: string;
  /** Se true, mostra todos os presets do Guia Mestre (hoje, 7d, 30d, etc.) */
  presetsCompletos?: boolean;
}

/** Intervalo padrão: mês atual (retrocompatível com código existente) */
function obterIntervaloPadrao(): { dataInicio: string; dataFim: string } {
  const padrao = obterIntervaloPadraoBI();
  return {
    dataInicio: padrao.dataInicio,
    dataFim: padrao.dataFim,
  };
}

export function FiltroPeriodo({
  dataInicio,
  dataFim,
  onChange,
  className = "",
  presetsCompletos = false,
}: FiltroPeriodoProps): React.JSX.Element {
  const todosPresets = obterIntervalosPeriodo();
  const presets = presetsCompletos
    ? todosPresets
    : [
        todosPresets.find((p) => p.codigo === "mes_atual"),
        todosPresets.find((p) => p.codigo === "mes_anterior"),
        todosPresets.find((p) => p.codigo === "30d"),
        todosPresets.find((p) => p.codigo === "3m"),
      ].filter((p): p is NonNullable<typeof p> => !!p);

  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${className}`}
      title="Período da análise"
    >
      <Calendar className="w-4 h-4 text-slate-500 flex-shrink-0" />
      <input
        type="date"
        value={dataInicio}
        onChange={(e) => onChange(e.target.value, dataFim)}
        className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 bg-white"
      />
      <span className="text-slate-400 text-sm">até</span>
      <input
        type="date"
        value={dataFim}
        onChange={(e) => onChange(dataInicio, e.target.value)}
        className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 bg-white"
      />
      <div className="flex flex-wrap gap-1 ml-2">
        {presets.map((p) => (
          <button
            key={p.codigo}
            type="button"
            onClick={() => onChange(p.dataInicio, p.dataFim)}
            className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export { obterIntervaloPadrao };
