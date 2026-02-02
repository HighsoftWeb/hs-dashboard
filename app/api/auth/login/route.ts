import { NextRequest, NextResponse } from "next/server";
import { validarVariaveisAmbiente } from "@/core/db/validar-env";
import { autenticacaoService } from "@/core/service/autenticacao-service";
import { LoginSchema } from "@/core/schemas/auth-schemas";
import { rateLimitLogin } from "@/core/middleware/rate-limit";
import { logger } from "@/core/utils/logger";

try {
  validarVariaveisAmbiente();
} catch (erro) {
  logger.warn("Algumas variáveis de ambiente não estão definidas (sistema de empresas pode ser usado)", {
    error: erro instanceof Error ? erro.message : String(erro),
  });
}

export async function POST(
  request: NextRequest
): Promise<NextResponse> {
  const rateLimit = rateLimitLogin(request);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Muitas tentativas de login. Tente novamente mais tarde.",
        },
      },
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

  try {
    const body = await request.json();
    const validacao = LoginSchema.safeParse(body);

    if (!validacao.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: validacao.error.issues.map((e) => e.message).join(", "),
          },
        },
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

    return NextResponse.json({
      success: true,
      data: dadosAutenticacao,
    });
  } catch (erro) {
    logger.error("Erro no login", erro, {
      endpoint: "/api/auth/login",
    });

    const mensagem =
      erro instanceof Error ? erro.message : "Erro ao processar login";

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "LOGIN_ERROR",
          message: mensagem,
        },
      },
      { status: 401 }
    );
  }
}
