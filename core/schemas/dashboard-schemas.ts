import { z } from "zod";

export const EstatisticasDashboardSchema = z.object({
  totalUsuarios: z.number().int().nonnegative(),
  totalEmpresas: z.number().int().nonnegative(),
  totalClientes: z.number().int().nonnegative(),
  totalProdutos: z.number().int().nonnegative(),
  orcamentosHoje: z.number().int().nonnegative(),
  orcamentosMes: z.number().int().nonnegative(),
  receitasMes: z.number().nonnegative(),
  despesasMes: z.number().nonnegative(),
  lucroMes: z.number(),
});

export const OrcamentoOSSchema = z.object({
  COD_EMPRESA: z.number().int().positive(),
  IND_ORCAMENTO_OS: z.string().length(2),
  NUM_ORCAMENTO_OS: z.number().int().positive(),
  COD_CLI_FOR: z.number().int().positive(),
  COD_SERIE_ORC_OS: z.string().max(3),
  NUM_DOCUMENTO: z.string().max(30).nullable(),
  DAT_EMISSAO: z.date().nullable(),
  VLR_LIQUIDO: z.number().nullable(),
  SIT_ORCAMENTO_OS: z.string().max(2).nullable(),
  RAZ_CLI_FOR: z.string().max(60).nullable(),
});

export const TituloReceberSchema = z.object({
  COD_EMPRESA: z.number().int().positive(),
  COD_CLI_FOR: z.number().int().positive(),
  COD_TIPO_TITULO: z.string().min(1).max(3),
  NUM_TITULO: z.string().max(15),
  SEQ_TITULO: z.number().int().positive(),
  VCT_ORIGINAL: z.date(),
  VLR_ABERTO: z.number(),
  SIT_TITULO: z.string().length(2),
  RAZ_CLI_FOR: z.string().max(60).nullable(),
});

export const TituloPagarSchema = z.object({
  COD_EMPRESA: z.number().int().positive(),
  NUM_INTERNO: z.number().int().positive(),
  NUM_PARCELA: z.number().int().positive(),
  COD_CLI_FOR: z.number().int().positive(),
  VCT_ORIGINAL: z.date(),
  VLR_ABERTO: z.number(),
  SIT_TITULO: z.string().length(2),
  RAZ_CLI_FOR: z.string().max(60).nullable(),
});
