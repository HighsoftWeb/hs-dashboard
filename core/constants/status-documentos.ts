/**
 * Status de documentos - regras oficiais do sistema HS.
 * Fonte: Regra.txt e documento BI DE MÉTRICAS - DASHBOARD HS
 */

/** Status de Nota Fiscal (SIT_NF) */
export const SIT_NF = {
  /** Digitada - apenas análises operacionais, nunca faturamento consolidado */
  DIGITADA: "DG",
  /** Processada - faturamento real */
  PROCESSADA: "PR",
  /** Cancelada - excluir sempre */
  CANCELADA: "CA",
} as const;

/** Status de Orçamento/OS (SIT_ORCAMENTO_OS) */
export const SIT_ORCAMENTO_OS = {
  ABERTO: "AB",
  AGUARDANDO_APROVACAO: "AA",
  APROVADO: "AP",
  PROCESSADO: "PR",
  CANCELADO: "CA",
  ROMANEIO: "RO",
  FATURADO_PARCIAL: "FP",
  ORDEM_PRODUCAO: "OP",
} as const;

/** Status para funil comercial: AA, AP, PR, FP */
export const SIT_ORCAMENTO_FUNIL_COMERCIAL = [
  SIT_ORCAMENTO_OS.AGUARDANDO_APROVACAO,
  SIT_ORCAMENTO_OS.APROVADO,
  SIT_ORCAMENTO_OS.PROCESSADO,
  SIT_ORCAMENTO_OS.FATURADO_PARCIAL,
] as const;

/** Status para conversão comercial: AP, PR, FP, RO */
export const SIT_ORCAMENTO_CONVERSAO = [
  SIT_ORCAMENTO_OS.APROVADO,
  SIT_ORCAMENTO_OS.PROCESSADO,
  SIT_ORCAMENTO_OS.FATURADO_PARCIAL,
  SIT_ORCAMENTO_OS.ROMANEIO,
] as const;
