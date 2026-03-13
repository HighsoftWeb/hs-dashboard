import { NextRequest, NextResponse } from "next/server";
import { validarAutenticacao } from "@/core/middleware/auth-middleware";
import { dashboardService } from "@/core/domains/dashboard/services/dashboard-service";
import { logger } from "@/core/utils/logger";
import {
  obterEmpresaConfigDoCookie,
  obterCodEmpresaDoCookie,
} from "@/core/utils/obter-empresa-cookie";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const payload = validarAutenticacao(request);
    const empresaConfig = obterEmpresaConfigDoCookie(request);
    const codEmpresa =
      obterCodEmpresaDoCookie(request) ?? payload.codEmpresa;

    const resumo = await dashboardService.obterResumoEstoque(
      codEmpresa,
      empresaConfig
    );

    return NextResponse.json({
      success: true,
      data: resumo,
    });
  } catch (erro) {
    logger.error("Erro ao obter resumo estoque", erro, {
      endpoint: "/api/dashboard/estoque/resumo",
      method: "GET",
    });

    const mensagem =
      erro instanceof Error ? erro.message : "Erro ao processar requisição";
    const status = mensagem.includes("Token") ? 401 : 500;

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "ESTOQUE_RESUMO_ERROR",
          message: mensagem,
        },
      },
      { status }
    );
  }
}
