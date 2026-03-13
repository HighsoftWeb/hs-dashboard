export const FAIXAS_VENCIMENTO = [
  "vencido",
  "0-30",
  "31-60",
  "61-90",
  "acima-90",
] as const;

export type FaixaVencimento = (typeof FAIXAS_VENCIMENTO)[number];

export const LABEL_PARA_FAIXA: Record<string, FaixaVencimento> = {
  Vencido: "vencido",
  "0-30 dias": "0-30",
  "31-60 dias": "31-60",
  "61-90 dias": "61-90",
  "Acima de 90 dias": "acima-90",
};

export function obterDataRangeFaixa(faixa: FaixaVencimento): {
  dataInicio: string;
  dataFim: string;
} {
  const hoje = new Date();
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  switch (faixa) {
    case "vencido":
      return {
        dataInicio: "2000-01-01",
        dataFim: fmt(hoje),
      };
    case "0-30": {
      const fim = new Date(hoje);
      fim.setDate(fim.getDate() + 30);
      return {
        dataInicio: fmt(hoje),
        dataFim: fmt(fim),
      };
    }
    case "31-60": {
      const ini = new Date(hoje);
      ini.setDate(ini.getDate() + 31);
      const fim = new Date(hoje);
      fim.setDate(fim.getDate() + 60);
      return {
        dataInicio: fmt(ini),
        dataFim: fmt(fim),
      };
    }
    case "61-90": {
      const ini = new Date(hoje);
      ini.setDate(ini.getDate() + 61);
      const fim = new Date(hoje);
      fim.setDate(fim.getDate() + 90);
      return {
        dataInicio: fmt(ini),
        dataFim: fmt(fim),
      };
    }
    case "acima-90": {
      const ini = new Date(hoje);
      ini.setDate(ini.getDate() + 91);
      const fim = new Date(hoje);
      fim.setFullYear(fim.getFullYear() + 2);
      return {
        dataInicio: fmt(ini),
        dataFim: fmt(fim),
      };
    }
    default:
      return { dataInicio: "", dataFim: "" };
  }
}
