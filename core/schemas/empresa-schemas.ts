import { z } from "zod";

export const ListarEmpresasQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().max(100).optional(),
  ativo: z.coerce.boolean().optional(),
});

export const CriarEmpresaSchema = z.object({
  nome: z.string().min(1).max(100),
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/),
  ativo: z.boolean().default(true),
});

export const AtualizarEmpresaSchema = CriarEmpresaSchema.partial();
