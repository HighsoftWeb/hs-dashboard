export interface ProdutoServicoDB {
  COD_EMPRESA: number;
  COD_PRODUTO: number;
  DES_PRODUTO: string | null;
  COD_UNIDADE_MEDIDA: string | null;
  IND_PRODUTO_SERVICO: string | null;
  SIT_PRODUTO: string | null;
  OBS_PRODUTO: string | null;
  DAT_CADASTRO: Date | null;
  DAT_ALTERACAO: Date | null;
  COD_USUARIO: number | null;
}

export interface DerivacaoDB {
  COD_EMPRESA: number;
  COD_PRODUTO: number;
  COD_DERIVACAO: string;
  DES_DERIVACAO: string | null;
  COD_BARRA: string | null;
  SIT_DERIVACAO: string | null;
  OBS_DERIVACAO: string | null;
  DAT_CADASTRO: Date | null;
  DAT_ALTERACAO: Date | null;
  COD_USUARIO: number | null;
}

export interface EstoqueDB {
  COD_EMPRESA: number;
  COD_PRODUTO: number;
  COD_DEPOSITO: string;
  COD_DERIVACAO: string;
  QTD_ATUAL: number | null;
  QTD_RESERVADA: number | null;
  ACE_ESTOQUE_NEGATIVO: string | null;
  DAT_ALTERACAO: Date | null;
  COD_USUARIO: number | null;
}
