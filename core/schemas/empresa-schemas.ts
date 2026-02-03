import { z } from "zod";

export const CriarEmpresaSchema = z.object({
  cnpj: z.string().min(1, "CNPJ é obrigatório"),
  nomeEmpresa: z.string().min(1, "Nome da empresa é obrigatório"),
  host: z.string().min(1, "Host é obrigatório"),
  porta: z
    .union([
      z.number().int().positive().max(65535),
      z.string().transform((val) => {
        const num = parseInt(val, 10);
        if (isNaN(num) || num <= 0 || num > 65535) {
          throw new Error("Porta inválida");
        }
        return num;
      }),
    ])
    .pipe(z.number().int().positive().max(65535)),
  nomeBase: z.string().min(1, "Nome da base é obrigatório"),
  usuario: z.string().min(1, "Usuário é obrigatório"),
  senha: z.string().min(1, "Senha é obrigatória"),
  codigosUsuariosPermitidos: z.string().nullable().optional(),
});

export const AtualizarEmpresaSchema = CriarEmpresaSchema.partial().extend({
  cnpj: z.string().min(1, "CNPJ é obrigatório").optional(),
  nomeEmpresa: z.string().min(1, "Nome da empresa é obrigatório").optional(),
  host: z.string().min(1, "Host é obrigatório").optional(),
  nomeBase: z.string().min(1, "Nome da base é obrigatório").optional(),
  usuario: z.string().min(1, "Usuário é obrigatório").optional(),
  senha: z.string().min(1, "Senha é obrigatória").optional(),
});
