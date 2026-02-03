import { NextRequest, NextResponse } from "next/server";
import { autenticacaoService } from "@/core/domains/auth/server/auth-service";
import { z } from "zod";
import { logger } from "@/core/utils/logger";
import { tratarErroAPI } from "@/core/utils/tratar-erro";

const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token é obrigatório"),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const validacao = RefreshTokenSchema.safeParse(body);

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

    const { refreshToken } = validacao.data;

    const novosTokens = await autenticacaoService.renovarToken(refreshToken);

    return NextResponse.json({
      success: true,
      data: novosTokens,
    });
  } catch (erro) {
    logger.error("Erro ao renovar token", erro, {
      endpoint: "/api/auth/refresh",
    });

    return tratarErroAPI(erro, {
      endpoint: "/api/auth/refresh",
      method: "POST",
    });
  }
}
