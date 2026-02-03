/**
 * Status genérico para entidades do sistema
 */
export enum Status {
  /** Ativo - Entidade disponível para uso */
  ATIVO = "A",
  /** Inativo - Entidade desabilitada */
  INATIVO = "I",
  /** Suspenso - Entidade temporariamente indisponível */
  SUSPENSO = "S",
}

/**
 * Status específico de produtos
 */
export enum StatusProduto {
  ATIVO = Status.ATIVO,
  INATIVO = Status.INATIVO,
  EM_DESENVOLVIMENTO = "D",
}

/**
 * Status de orçamentos/ordens de serviço
 */
export enum StatusOrcamentoOS {
  ABERTO = "AB",
  APROVADO = "AP",
  CANCELADO = "CA",
  PROCESSADO = "PR",
  FATURADO = "FA",
  ROMANEIO = "RO",
}

/**
 * Tipo de produto ou serviço
 */
export enum TipoProdutoServico {
  PRODUTO = "P",
  SERVICO = "S",
}

/**
 * Tipo de documento comercial
 */
export enum TipoDocumento {
  ORCAMENTO = "orcamento",
  ORDEM_SERVICO = "ordem-servico",
  NOTA_FISCAL_VENDA = "nota-fiscal-venda",
  PEDIDO = "pedido",
}

/**
 * Indicadores genéricos (Sim/Não)
 */
export enum Indicador {
  SIM = "S",
  NAO = "N",
}

/**
 * Tipo de criptografia de senha
 */
export enum TipoCriptografia {
  HS = "HS",
  BCRYPT = "BC",
  NENHUMA = "N",
}
