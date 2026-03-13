/**
 * Tipos para análises avançadas das dashboards (visão gestor)
 */

export interface AgingReceber {
  faixa: string;
  quantidade: number;
  valor: number;
}

export interface AgingPagar {
  faixa: string;
  quantidade: number;
  valor: number;
}

export interface TendenciaMensal {
  mes: string;
  mesAno: string;
  receitas: number;
  despesas: number;
  lucro: number;
  orcamentos: number;
  nfVendas: number;
}

export interface TopCliente {
  codCliFor: number;
  razaoSocial: string;
  valorTotal: number;
  quantidade: number;
}

export interface TopProduto {
  codProduto: number;
  descricao: string;
  quantidade: number;
  valorTotal: number;
}

export interface FunilVendas {
  status: string;
  quantidade: number;
  valor: number;
}

export interface MetaRealizado {
  meta: number;
  realizado: number;
  percentual: number;
  periodo: string;
}

export interface ResumoEstoqueAvancado {
  valorTotalEstoque: number;
  totalProdutos: number;
  produtosAbaixoMinimo: number;
  produtosSemMovimento90Dias: number;
  produtosMaisVendidos: TopProduto[];
  depositos: { codDeposito: string; descricao: string; quantidade: number }[];
}

export interface ResumoClientes {
  totalClientes: number;
  clientesNovosPeriodo: number;
  inadimplentes: number;
  valorInadimplente: number;
  porEstado: { estado: string; quantidade: number }[];
  porTipo: { tipo: string; quantidade: number }[];
}

export interface AnalyticsGeral {
  agingReceber: AgingReceber[];
  agingPagar: AgingPagar[];
  tendenciaMensal: TendenciaMensal[];
  topClientes: TopCliente[];
  topProdutos: TopProduto[];
  funilVendas: FunilVendas[];
  metaRealizado: MetaRealizado | null;
}

/** Produto com lucro/prejuízo (NF de venda) */
export interface ProdutoLucro {
  codProduto: number;
  descricao: string;
  quantidade: number;
  receita: number;
  custo: number;
  lucro: number;
  margemPercentual: number;
}

/** Produto parado (com estoque, sem venda há X dias) */
export interface ProdutoParado {
  codProduto: number;
  descricao: string;
  quantidadeEstoque: number;
  valorEstoque: number;
  diasSemVenda: number;
  dataUltimaSaida: string | null;
}

/** Cliente que comprava e parou */
export interface ClienteInativo {
  codCliFor: number;
  razaoSocial: string;
  valorUltimoAno: number;
  dataUltimaCompra: string | null;
  diasSemCompra: number;
}

/** Indicadores de caixa */
export interface IndicadoresCaixa {
  receitasMesAtual: number;
  despesasMesAtual: number;
  saldoMesAtual: number;
  receitasMesAnterior: number;
  despesasMesAnterior: number;
  saldoMesAnterior: number;
  variacaoPercentual: number;
  tendencia: "subindo" | "descendo" | "estavel";
}

/** Indicadores de inadimplência */
export interface IndicadoresInadimplencia {
  valorTotalReceber: number;
  valorVencido: number;
  percentualInadimplencia: number;
  quantidadeTitulosVencidos: number;
  quantidadeClientesInadimplentes: number;
}

/** Fluxo de recebimento por mês (vencimento) */
export interface FluxoRecebimentoMensal {
  mes: string;
  mesAno: string;
  valor: number;
  quantidade: number;
}
