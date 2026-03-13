/**
 * Utilitários para navegação deep-dive nos dashboards.
 * Converte IDs e dados em URLs para consultas e detalhes.
 */

import type { ContaVencendo } from "@/core/domains/dashboard/services/dashboard-client";
import type { Orcamento } from "@/core/tipos";

/** URLs de listagens/consultas */
export const DEEP_DIVE = {
  contasReceber: "/dashboard/financeiro/contas-receber",
  contasPagar: "/dashboard/financeiro/contas-pagar",
  clientes: "/dashboard/cadastros/comercial/clientes",
  clienteDetalhe: (codCliFor: number) =>
    `/dashboard/cadastros/clientes/${codCliFor}`,
  produtos: "/dashboard/cadastros/comercial/produtos",
  produtoDetalhe: (codProduto: number) =>
    `/dashboard/cadastros/produtos/${codProduto}`,
  orcamentos: "/dashboard/cadastros/saidas/orcamentos-os",
  orcamentoDetalhe: (codEmpresa: number, indOrc: string, numOrc: number) =>
    `/dashboard/comercial/orcamentos/${codEmpresa}/${encodeURIComponent(indOrc)}/${numOrc}`,
  notasFiscaisVenda: "/dashboard/comercial/saidas/notas-fiscais-venda",
  metricasClientes: "/dashboard/metricas/clientes",
  metricasProdutos: "/dashboard/metricas/produtos",
  metricasCaixa: "/dashboard/metricas/caixa",
} as const;

/**
 * Retorna a URL do detalhe de um título a partir do id da ContaVencendo.
 * id formato receber: "codEmpresa-codCliFor-codTipoTitulo-numTitulo-seqTitulo"
 * id formato pagar: "codEmpresa-numInterno-numParcela"
 */
export function obterUrlTitulo(conta: ContaVencendo): string {
  const partes = conta.id.split("-");
  if (conta.tipo === "receber" && partes.length >= 5) {
    const [codEmpresa, codCliFor, codTipoTitulo, ...restNum] = partes;
    const numTitulo = restNum.slice(0, -1).join("-");
    const seqTitulo = restNum[restNum.length - 1];
    return `/dashboard/financeiro/titulos-receber/${codEmpresa}/${codCliFor}/${encodeURIComponent(codTipoTitulo)}/${encodeURIComponent(numTitulo)}/${seqTitulo}`;
  }
  if (conta.tipo === "pagar" && partes.length >= 3) {
    const [codEmpresa, numInterno, numParcela] = partes;
    return `/dashboard/financeiro/titulos-pagar/${codEmpresa}/${numInterno}/${numParcela}`;
  }
  return conta.tipo === "receber" ? DEEP_DIVE.contasReceber : DEEP_DIVE.contasPagar;
}

/**
 * Retorna a URL do detalhe de um orçamento/OS a partir do id.
 * id formato: "codEmpresa-indOrcamentoOS-numOrcamentoOS"
 */
export function obterUrlOrcamento(orc: Orcamento): string {
  const partes = orc.id.split("-");
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
