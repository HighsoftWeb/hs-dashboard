export interface IntervaloPeriodo {
  dataInicio: string;
  dataFim: string;
  label: string;
  codigo: string;
}

function formatarData(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function obterIntervalosPeriodo(): IntervaloPeriodo[] {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();

  return [
    {
      codigo: "hoje",
      label: "Hoje",
      dataInicio: formatarData(hoje),
      dataFim: formatarData(hoje),
    },
    {
      codigo: "ontem",
      label: "Ontem",
      dataInicio: formatarData(new Date(ano, mes, hoje.getDate() - 1)),
      dataFim: formatarData(new Date(ano, mes, hoje.getDate() - 1)),
    },
    {
      codigo: "7d",
      label: "Últimos 7 dias",
      dataInicio: formatarData(new Date(ano, mes, hoje.getDate() - 6)),
      dataFim: formatarData(hoje),
    },
    {
      codigo: "15d",
      label: "Últimos 15 dias",
      dataInicio: formatarData(new Date(ano, mes, hoje.getDate() - 14)),
      dataFim: formatarData(hoje),
    },
    {
      codigo: "30d",
      label: "Últimos 30 dias",
      dataInicio: formatarData(new Date(ano, mes, hoje.getDate() - 29)),
      dataFim: formatarData(hoje),
    },
    {
      codigo: "mes_atual",
      label: "Mês atual",
      dataInicio: formatarData(new Date(ano, mes, 1)),
      dataFim: formatarData(new Date(ano, mes + 1, 0)),
    },
    {
      codigo: "mes_anterior",
      label: "Mês anterior",
      dataInicio: formatarData(new Date(ano, mes - 1, 1)),
      dataFim: formatarData(new Date(ano, mes, 0)),
    },
    {
      codigo: "3m",
      label: "Últimos 3 meses",
      dataInicio: formatarData(new Date(ano, mes - 2, 1)),
      dataFim: formatarData(new Date(ano, mes + 1, 0)),
    },
    {
      codigo: "6m",
      label: "Últimos 6 meses",
      dataInicio: formatarData(new Date(ano, mes - 5, 1)),
      dataFim: formatarData(new Date(ano, mes + 1, 0)),
    },
    {
      codigo: "ano_atual",
      label: "Ano atual",
      dataInicio: formatarData(new Date(ano, 0, 1)),
      dataFim: formatarData(new Date(ano, 11, 31)),
    },
    {
      codigo: "ano_anterior",
      label: "Ano anterior",
      dataInicio: formatarData(new Date(ano - 1, 0, 1)),
      dataFim: formatarData(new Date(ano - 1, 11, 31)),
    },
  ];
}

export function aplicarPresetPeriodo(codigo: string): IntervaloPeriodo | null {
  const intervalos = obterIntervalosPeriodo();
  return intervalos.find((i) => i.codigo === codigo) ?? null;
}

export function obterIntervaloPadraoBI(): IntervaloPeriodo {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();
  return {
    codigo: "mes_atual",
    label: "Mês atual",
    dataInicio: formatarData(new Date(ano, mes, 1)),
    dataFim: formatarData(new Date(ano, mes + 1, 0)),
  };
}
