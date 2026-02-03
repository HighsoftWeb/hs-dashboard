import { NextRequest, NextResponse } from "next/server";
import { validarVariaveisAmbiente } from "@/core/db/validar-env";
import { autenticacaoService } from "@/core/domains/auth/server/auth-service";
import { LoginSchema } from "@/core/schemas/auth-schemas";
import { rateLimitLogin } from "@/core/middleware/rate-limit";
import { logger } from "@/core/utils/logger";
import { criarHandler } from "@/core/utils/api-handler";
import {
  criarRespostaSucesso,
  criarRespostaErro,
} from "@/core/utils/resposta-api";

try {
  validarVariaveisAmbiente();
} catch (erro) {
  logger.warn(
    "Algumas variáveis de ambiente não estão definidas (sistema de empresas pode ser usado)",
    {
      error: erro instanceof Error ? erro.message : String(erro),
    }
  );
}

export const POST = criarHandler(
  async (request: NextRequest): Promise<NextResponse> => {
    const rateLimit = rateLimitLogin(request);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        criarRespostaErro(
          "Muitas tentativas de login. Tente novamente mais tarde.",
          "RATE_LIMIT_EXCEEDED"
        ),
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": "5",
            "X-RateLimit-Remaining": rateLimit.remaining.toString(),
            "X-RateLimit-Reset": new Date(rateLimit.resetAt).toISOString(),
          },
        }
      );
    }

    const body = await request.json();
    const validacao = LoginSchema.safeParse(body);

    if (!validacao.success) {
      return NextResponse.json(
        criarRespostaErro(
          validacao.error.issues.map((e) => e.message).join(", "),
          "VALIDATION_ERROR"
        ),
        { status: 400 }
      );
    }

    const { login, senha, codEmpresa, cnpj } = validacao.data;

    const dadosAutenticacao = await autenticacaoService.fazerLogin({
      login,
      senha,
      codEmpresa,
      cnpj,
    });

    return NextResponse.json(criarRespostaSucesso(dadosAutenticacao));
  },
  { requerAutenticacao: false }
);
