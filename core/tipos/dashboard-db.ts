export interface OrcamentoOSDB {
  COD_EMPRESA: number;
  IND_ORCAMENTO_OS: string;
  NUM_ORCAMENTO_OS: number;
  COD_CLI_FOR: number;
  COD_SERIE_ORC_OS: string;
  NUM_DOCUMENTO: string | null;
  DAT_EMISSAO: Date | null;
  VLR_LIQUIDO: number | null;
  SIT_ORCAMENTO_OS: string | null;
  RAZ_CLI_FOR: string | null;
}

export interface TituloReceberDB {
  COD_EMPRESA: number;
  COD_CLI_FOR: number;
  COD_TIPO_TITULO: string;
  NUM_TITULO: string;
  SEQ_TITULO: number;
  VCT_ORIGINAL: Date;
  VLR_ABERTO: number;
  SIT_TITULO: string;
  RAZ_CLI_FOR: string | null;
}

export interface TituloPagarDB {
  COD_EMPRESA: number;
  NUM_INTERNO: number;
  NUM_PARCELA: number;
  COD_CLI_FOR: number;
  VCT_ORIGINAL: Date;
  VLR_ABERTO: number;
  SIT_TITULO: string;
  RAZ_CLI_FOR: string | null;
}

export interface EstatisticasDashboard {
  totalUsuarios: number;
  totalEmpresas: number;
  totalClientes: number;
  totalProdutos: number;
  orcamentosHoje: number;
  orcamentosMes: number;
  receitasMes: number;
  despesasMes: number;
  lucroMes: number;
  contasReceberHoje?: number;
  contasPagarHoje?: number;
  contasReceberMes?: number;
  contasPagarMes?: number;
}
