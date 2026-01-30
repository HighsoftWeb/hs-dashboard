import { z } from "zod";

export const ListarUsuariosQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().max(100).optional(),
  sit: z.string().max(1).optional(),
});

export const CriarUsuarioSchema = z.object({
  nome: z.string().min(1).max(40),
  email: z.string().email().max(100),
  ativo: z.boolean().default(true),
});

export const AtualizarUsuarioSchema = CriarUsuarioSchema.partial();
