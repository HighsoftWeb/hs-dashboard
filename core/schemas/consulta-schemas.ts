import { z } from "zod";
import { PAGINACAO_PADRAO } from "../constants/paginacao";

export const schemaParametrosConsulta = z.object({
  page: z.preprocess((val) => {
    if (val === null || val === undefined || val === "") return undefined;
    const num = typeof val === "string" ? parseInt(val, 10) : Number(val);
    return isNaN(num) ? undefined : num;
  }, z.number().int().positive().default(1).optional()),
  pageSize: z.preprocess((val) => {
    if (val === null || val === undefined || val === "") return undefined;
    const num = typeof val === "string" ? parseInt(val, 10) : Number(val);
    return isNaN(num) ? undefined : num;
  }, z.number().int().positive().max(100).default(PAGINACAO_PADRAO.PAGE_SIZE).optional()),
  sort: z.preprocess(
    (val) => (val === null || val === "" ? undefined : val),
    z.string().optional()
  ),
  order: z.preprocess(
    (val) => (val === null || val === "" ? "asc" : val),
    z.enum(["asc", "desc"]).default("asc").optional()
  ),
  search: z.preprocess(
    (val) => (val === null || val === "" ? undefined : val),
    z.string().optional()
  ),
});

export const schemaFiltroClienteFornecedor = schemaParametrosConsulta.extend({
  sit: z.preprocess(
    (val) => (val === null || val === "" ? undefined : val),
    z.enum(["A", "I"]).optional()
  ),
  tipo: z.preprocess(
    (val) => (val === null || val === "" ? undefined : val),
    z.enum(["C", "F", "A", "P", "M", "O"]).optional()
  ),
  tipCliFor: z.preprocess(
    (val) => (val === null || val === "" ? undefined : val),
    z.enum(["F", "J"]).optional()
  ),
});

export const schemaFiltroProduto = schemaParametrosConsulta.extend({
  sit: z.preprocess(
    (val) => (val === null || val === "" ? undefined : val),
    z.string().optional()
  ),
  ind: z.preprocess(
    (val) => (val === null || val === "" ? undefined : val),
    z.string().optional()
  ),
});

export const schemaFiltroOrcamentoOS = schemaParametrosConsulta.extend({
  ind: z.preprocess(
    (val) => (val === null || val === "" ? undefined : val),
    z.enum(["OR", "OS"]).optional()
  ),
  sit: z.preprocess(
    (val) => (val === null || val === "" ? undefined : val),
    z.string().optional()
  ),
  codCliFor: z.preprocess((val) => {
    if (val === null || val === "" || val === undefined) return undefined;
    const num = typeof val === "string" ? parseInt(val, 10) : Number(val);
    return isNaN(num) || num <= 0 ? undefined : num;
  }, z.number().int().positive().optional()),
});

const FAIXAS_VENCIMENTO = [
  "vencido",
  "0-30",
  "31-60",
  "61-90",
  "acima-90",
] as const;

export const schemaFiltroTitulo = schemaParametrosConsulta.extend({
  faixa: z.preprocess(
    (val) => (val === null || val === "" ? undefined : val),
    z.enum(FAIXAS_VENCIMENTO).optional()
  ),
  sit: z.preprocess(
    (val) => (val === null || val === "" ? undefined : val),
    z.string().optional()
  ),
  codCliFor: z.preprocess((val) => {
    if (val === null || val === "" || val === undefined) return undefined;
    const num = typeof val === "string" ? parseInt(val, 10) : Number(val);
    return isNaN(num) || num <= 0 ? undefined : num;
  }, z.number().int().positive().optional()),
  dataInicio: z.preprocess(
    (val) => (val === null || val === "" ? undefined : val),
    z.string().optional()
  ),
  dataFim: z.preprocess(
    (val) => (val === null || val === "" ? undefined : val),
    z.string().optional()
  ),
});

export type ParametrosConsulta = z.infer<typeof schemaParametrosConsulta>;
export type FiltroClienteFornecedor = z.infer<
  typeof schemaFiltroClienteFornecedor
>;
export type FiltroProduto = z.infer<typeof schemaFiltroProduto>;
export type FiltroOrcamentoOS = z.infer<typeof schemaFiltroOrcamentoOS>;
export type FiltroTitulo = z.infer<typeof schemaFiltroTitulo>;
