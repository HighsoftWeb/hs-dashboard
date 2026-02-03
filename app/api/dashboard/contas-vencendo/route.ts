import { NextRequest, NextResponse } from "next/server";
import { validarAutenticacao } from "@/core/middleware/auth-middleware";
import { dashboardService } from "@/core/domains/dashboard/services/dashboard-service";
import { logger } from "@/core/utils/logger";
import { DASHBOARD_PADRAO } from "@/core/constants/paginacao";
import { obterEmpresaConfigDoCookie } from "@/core/utils/obter-empresa-cookie";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const payload = validarAutenticacao(request);
    const empresaConfig = obterEmpresaConfigDoCookie(request);
    const { searchParams } = new URL(request.url);
    const diasRaw = searchParams.get("dias")
      ? parseInt(searchParams.get("dias")!, 10)
      : DASHBOARD_PADRAO.DIAS_VENCIMENTO;
    const dias = Math.min(Math.max(diasRaw, 1), 365);

    const [titulosReceber, titulosPagar] = await Promise.all([
      dashboardService.listarTitulosReceberVencendo(
        payload.codEmpresa,
        dias,
        empresaConfig
      ),
      dashboardService.listarTitulosPagarVencendo(
        payload.codEmpresa,
        dias,
        empresaConfig
      ),
    ]);

    const contasVencendo = [
      ...titulosReceber.map((tit) => ({
        id: `${tit.COD_EMPRESA}-${tit.COD_CLI_FOR}-${tit.COD_TIPO_TITULO}-${tit.NUM_TITULO}-${tit.SEQ_TITULO}`,
        tipo: "receber" as const,
        descricao: `Receber de ${tit.RAZ_CLI_FOR || "Cliente"}`,
        valor: tit.VLR_ABERTO,
        dataVencimento: tit.VCT_ORIGINAL,
        clienteId: tit.COD_CLI_FOR.toString(),
      })),
      ...titulosPagar.map((tit) => ({
        id: `${tit.COD_EMPRESA}-${tit.NUM_INTERNO}-${tit.NUM_PARCELA}`,
        tipo: "pagar" as const,
        descricao: `Pagar para ${tit.RAZ_CLI_FOR || "Fornecedor"}`,
        valor: tit.VLR_ABERTO,
        dataVencimento: tit.VCT_ORIGINAL,
        fornecedorId: tit.COD_CLI_FOR.toString(),
      })),
    ].sort((a, b) => a.dataVencimento.getTime() - b.dataVencimento.getTime());

    return NextResponse.json({
      success: true,
      data: contasVencendo,
    });
  } catch (erro) {
    logger.error("Erro ao listar contas vencendo", erro, {
      endpoint: "/api/dashboard/contas-vencendo",
      method: "GET",
    });

    const mensagem =
      erro instanceof Error ? erro.message : "Erro ao processar requisição";

    const status = mensagem.includes("Token") ? 401 : 500;

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DASHBOARD_CONTAS_ERROR",
          message: mensagem,
        },
      },
      { status }
    );
  }
}
