import { NextRequest, NextResponse } from "next/server";
import { validarAutenticacao } from "@/core/middleware/auth-middleware";
import { dashboardService } from "@/core/domains/dashboard/services/dashboard-service";
import { logger } from "@/core/utils/logger";
import { DASHBOARD_PADRAO } from "@/core/constants/paginacao";
import {
  obterEmpresaConfigDoCookie,
  obterCodEmpresaDoCookie,
} from "@/core/utils/obter-empresa-cookie";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const payload = validarAutenticacao(request);
    const empresaConfig = obterEmpresaConfigDoCookie(request);
    const { searchParams } = new URL(request.url);
    const limiteRaw = searchParams.get("limite")
      ? parseInt(searchParams.get("limite")!, 10)
      : DASHBOARD_PADRAO.LIMITE_ORCAMENTOS;
    const limite = Math.min(limiteRaw, 100);

    const codEmpresa = obterCodEmpresaDoCookie(request) ?? payload.codEmpresa;
    const orcamentos = await dashboardService.listarOrcamentosRecentes(
      codEmpresa,
      limite,
      empresaConfig
    );

    return NextResponse.json({
      success: true,
      data: orcamentos,
    });
  } catch (erro) {
    logger.error("Erro ao listar orçamentos recentes", erro, {
      endpoint: "/api/dashboard/orcamentos-recentes",
      method: "GET",
    });

    const mensagem =
      erro instanceof Error ? erro.message : "Erro ao processar requisição";

    const status = mensagem.includes("Token") ? 401 : 500;

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DASHBOARD_ORCAMENTOS_ERROR",
          message: mensagem,
        },
      },
      { status }
    );
  }
}
