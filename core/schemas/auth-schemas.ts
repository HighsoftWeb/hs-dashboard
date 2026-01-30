import { z } from "zod";

export const LoginSchema = z.object({
  login: z.string().min(1, "Login é obrigatório"),
  senha: z.string().min(1, "Senha é obrigatória"),
  codEmpresa: z.number().int().positive().optional(),
});
