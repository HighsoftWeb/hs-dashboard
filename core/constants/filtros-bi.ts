export interface FiltrosBI {
  codEmpresa: number;
  dataInicio: string;
  dataFim: string;
  codCliFor?: number;
  codRepresentante?: number;
  codCentroCusto?: string;
  codUnidadeNegocio?: string;
  codContaGerencial?: string;
}

export function obterFiltrosBIPadrao(
  _codEmpresa: number
): Omit<FiltrosBI, "codEmpresa"> {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();
  return {
    dataInicio: new Date(ano, mes, 1).toISOString().slice(0, 10),
    dataFim: new Date(ano, mes + 1, 0).toISOString().slice(0, 10),
  };
}
