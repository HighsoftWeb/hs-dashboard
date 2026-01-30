import { NextRequest, NextResponse } from "next/server";
import { validarAutenticacao } from "@/core/middleware/auth-middleware";
import { autenticacaoService } from "@/core/service/autenticacao-service";
import { logger } from "@/core/utils/logger";

export async function GET(
  request: NextRequest
): Promise<NextResponse> {
  try {
    const payload = validarAutenticacao(request);

    const usuario = await autenticacaoService.obterUsuarioPorToken(
      payload.codUsuario
    );

    if (!usuario) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "Usuário não encontrado",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: usuario,
    });
  } catch (erro) {
    logger.error("Erro ao obter usuário", erro, {
      endpoint: "/api/auth/me",
      method: "GET",
    });

    const mensagem =
      erro instanceof Error ? erro.message : "Erro ao processar requisição";

    const status = mensagem.includes("Token") ? 401 : 500;

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "AUTH_ERROR",
          message: mensagem,
        },
      },
      { status }
    );
  }
}
