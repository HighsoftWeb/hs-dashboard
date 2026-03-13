/**
 * Filtros globais do BI - conforme Guia Mestre seção 5.2.
 * Todo módulo do dashboard deve aceitar estes filtros.
 */

export interface FiltrosBI {
  /** Obrigatório - código da empresa */
  codEmpresa: number;
  /** Período - data início */
  dataInicio: string;
  /** Período - data fim */
  dataFim: string;
  /** Opcional - filtrar por cliente */
  codCliFor?: number;
  /** Opcional - filtrar por representante */
  codRepresentante?: number;
  /** Opcional - filtrar por centro de custo */
  codCentroCusto?: string;
  /** Opcional - filtrar por unidade de negócio */
  codUnidadeNegocio?: string;
  /** Opcional - filtrar por conta gerencial */
  codContaGerencial?: string;
}

/**
 * Valores padrão para filtros BI (exceto codEmpresa que é obrigatório).
 */
export function obterFiltrosBIPadrao(_codEmpresa: number): Omit<FiltrosBI, "codEmpresa"> {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();
  return {
    dataInicio: new Date(ano, mes, 1).toISOString().slice(0, 10),
    dataFim: new Date(ano, mes + 1, 0).toISOString().slice(0, 10),
  };
}
