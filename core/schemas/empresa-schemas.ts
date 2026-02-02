import { z } from "zod";

export const ListarEmpresasQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().max(100).optional(),
  ativo: z.coerce.boolean().optional(),
});

export const CriarEmpresaSchema = z.object({
  nome: z.string().min(1).max(100),
  cnpj: z.string().min(14).max(14).optional(),
  email: z.string().email().max(100).optional(),
  telefone: z.string().max(20).optional(),
  ativo: z.boolean().default(true).optional(),
});

export const AtualizarEmpresaSchema = CriarEmpresaSchema.partial();
