import { z } from "zod";

export const CriarProdutoSchema = z
  .object({
    DES_PRODUTO: z
      .string()
      .max(200, "DES_PRODUTO deve ter no máximo 200 caracteres")
      .nullable()
      .optional(),
    desProduto: z
      .string()
      .max(200, "desProduto deve ter no máximo 200 caracteres")
      .nullable()
      .optional(),
    COD_UNIDADE_MEDIDA: z.string().max(5).nullable().optional(),
    codUnidadeMedida: z.string().max(5).nullable().optional(),
    IND_PRODUTO_SERVICO: z.string().max(1).nullable().optional(),
    indProdutoServico: z.string().max(1).nullable().optional(),
    SIT_PRODUTO: z.string().max(1).nullable().optional(),
    sitProduto: z.string().max(1).nullable().optional(),
    OBS_PRODUTO: z.string().max(200).nullable().optional(),
    obsProduto: z.string().max(200).nullable().optional(),
  })
  .refine(
    (data) => {
      const desProduto = data.DES_PRODUTO || data.desProduto;
      return (
        desProduto !== undefined &&
        desProduto !== null &&
        desProduto.trim().length > 0
      );
    },
    {
      message: "DES_PRODUTO ou desProduto é obrigatório e não pode ser vazio",
    }
  );

export const AtualizarProdutoSchema = z
  .object({
    DES_PRODUTO: z
      .string()
      .max(200, "DES_PRODUTO deve ter no máximo 200 caracteres")
      .nullable()
      .optional(),
    desProduto: z
      .string()
      .max(200, "desProduto deve ter no máximo 200 caracteres")
      .nullable()
      .optional(),
    COD_UNIDADE_MEDIDA: z.string().max(5).nullable().optional(),
    codUnidadeMedida: z.string().max(5).nullable().optional(),
    IND_PRODUTO_SERVICO: z.string().max(1).nullable().optional(),
    indProdutoServico: z.string().max(1).nullable().optional(),
    SIT_PRODUTO: z.string().max(1).nullable().optional(),
    sitProduto: z.string().max(1).nullable().optional(),
    OBS_PRODUTO: z.string().max(200).nullable().optional(),
    obsProduto: z.string().max(200).nullable().optional(),
  })
  .refine(
    (data) => {
      const desProduto = data.DES_PRODUTO || data.desProduto;
      if (desProduto === undefined) return true;
      return desProduto === null || desProduto.trim().length > 0;
    },
    {
      message: "DES_PRODUTO ou desProduto não pode ser vazio se fornecido",
    }
  );
