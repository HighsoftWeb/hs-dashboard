"use client";

import React from "react";
import { FiltroPeriodo } from "./filtro-periodo";

interface PaginaBIProps {
  titulo: string;
  dataInicio: string;
  dataFim: string;
  onPeriodoChange: (dataInicio: string, dataFim: string) => void;
  children: React.ReactNode;
  presetsCompletos?: boolean;
}

/**
 * Layout padrão para páginas BI conforme Guia Mestre.
 * 6 blocos: KPIs, Tendências, Distribuições, Rankings, Tabela, Alertas.
 * Máximo de gráficos, mínimo de texto.
 */
export function PaginaBI({
  titulo,
  dataInicio,
  dataFim,
  onPeriodoChange,
  children,
  presetsCompletos = false,
}: PaginaBIProps): React.JSX.Element {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-xl font-bold text-slate-900">{titulo}</h1>
        <FiltroPeriodo
          dataInicio={dataInicio}
          dataFim={dataFim}
          onChange={onPeriodoChange}
          presetsCompletos={presetsCompletos}
        />
      </div>
      {children}
    </div>
  );
}
