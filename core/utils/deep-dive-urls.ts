import type { ContaVencendo } from "@/core/domains/dashboard/services/dashboard-client";
import type { Orcamento } from "@/core/tipos/comercial";
import { LABEL_PARA_FAIXA } from "./faixa-vencimento";

export const DEEP_DIVE = {
  financeiro: "/dashboard/financeiro",
  contasReceber: "/dashboard/financeiro/contas-receber",
  contasReceberComFaixa: (faixa: string) =>
    `/dashboard/financeiro/contas-receber?faixa=${encodeURIComponent(faixa)}`,
  contasPagar: "/dashboard/financeiro/contas-pagar",
  contasPagarComFaixa: (faixa: string) =>
    `/dashboard/financeiro/contas-pagar?faixa=${encodeURIComponent(faixa)}`,
  clientes: "/dashboard/cadastros/comercial/clientes",
  clienteDetalhe: (codCliFor: number) =>
    `/dashboard/cadastros/clientes/${codCliFor}`,
  produtos: "/dashboard/cadastros/comercial/produtos",
  produtoDetalhe: (codProduto: number) =>
    `/dashboard/cadastros/produtos/${codProduto}`,
  orcamentos: "/dashboard/cadastros/saidas/orcamentos-os",
  orcamentosComSit: (sit: string) =>
    `/dashboard/cadastros/saidas/orcamentos-os?sit=${encodeURIComponent(sit)}`,
  orcamentoDetalhe: (codEmpresa: number, indOrc: string, numOrc: number) =>
    `/dashboard/comercial/orcamentos/${codEmpresa}/${encodeURIComponent(indOrc)}/${numOrc}`,
  notasFiscaisVenda: "/dashboard/comercial/saidas/notas-fiscais-venda",
  metricasClientes: "/dashboard/metricas/clientes",
  metricasProdutos: "/dashboard/metricas/produtos",
  metricasCaixa: "/dashboard/metricas/caixa",
} as const;

export function obterUrlTitulo(conta: ContaVencendo): string {
  const partes = conta.id.split("-");
  if (conta.tipo === "receber" && partes.length >= 5) {
    const codEmpresa = partes[0];
    const codCliFor = partes[1];
    const codTipoTitulo = partes[2];
    const seqTitulo = partes[partes.length - 1];
    const numTitulo = partes.slice(3, -1).join("-");
    return `/dashboard/financeiro/titulos-receber/${codEmpresa}/${codCliFor}/${encodeURIComponent(codTipoTitulo)}/${encodeURIComponent(numTitulo)}/${seqTitulo}`;
  }
  if (conta.tipo === "pagar" && partes.length >= 3) {
    const [codEmpresa, numInterno, numParcela] = partes;
    return `/dashboard/financeiro/titulos-pagar/${codEmpresa}/${numInterno}/${numParcela}`;
  }
  return conta.tipo === "receber"
    ? DEEP_DIVE.contasReceber
    : DEEP_DIVE.contasPagar;
}

export function obterUrlOrcamento(orc: Orcamento): string {
  return obterUrlOrcamentoPorId(orc.id);
}

export function obterUrlOrcamentoPorId(id: string): string {
  const partes = id.split("-");
  if (partes.length >= 3) {
    const codEmpresa = partes[0];
    const indOrc = partes[1];
    const numOrc = partes.slice(2).join("-");
    return DEEP_DIVE.orcamentoDetalhe(
      Number(codEmpresa),
      indOrc,
      Number(numOrc) || 0
    );
  }
  return DEEP_DIVE.orcamentos;
}

export function obterFaixaParam(label: string): string {
  if (LABEL_PARA_FAIXA[label]) return LABEL_PARA_FAIXA[label];
  const s = label.toLowerCase();
  if (s.includes("vencido")) return "vencido";
  if (s.startsWith("0-30")) return "0-30";
  if (s.startsWith("31-60")) return "31-60";
  if (s.startsWith("61-90")) return "61-90";
  if (s.includes("acima") || s.includes("90")) return "acima-90";
  return "vencido";
}

const STATUS_ORCAMENTO_LABEL_TO_CODE: Record<string, string> = {
  Aberto: "AB",
  "Aberto Total": "AB",
  Aguardando: "AA",
  "Aguardando Aprovação": "AA",
  Aprovado: "AP",
  Processado: "PR",
  "Faturado Parcial": "FP",
  Romaneio: "RO",
  Cancelado: "CA",
  "Ordem de Produção": "OP",
  Digitada: "DG",
  Outros: "",
};

export function obterSitOrcamento(label: string): string {
  return STATUS_ORCAMENTO_LABEL_TO_CODE[label] ?? label;
}
