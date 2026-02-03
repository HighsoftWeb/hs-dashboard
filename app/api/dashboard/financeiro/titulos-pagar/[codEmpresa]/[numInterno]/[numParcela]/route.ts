import { NextRequest, NextResponse } from "next/server";
import { validarAutenticacao } from "@/core/middleware/auth-middleware";
import { tratarErroAPI } from "@/core/utils/tratar-erro";
import { detalhesRepository } from "@/core/repository/detalhes-repository";
import { obterEmpresaConfigDoCookie } from "@/core/utils/obter-empresa-cookie";

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      codEmpresa: string;
      numInterno: string;
      numParcela: string;
    }>;
  }
): Promise<NextResponse> {
  try {
    validarAutenticacao(request);
    const empresaConfig = obterEmpresaConfigDoCookie(request);
    const { codEmpresa, numInterno, numParcela } = await params;
    const codEmpresaNum = Number.parseInt(codEmpresa, 10);
    const numInternoNum = Number.parseInt(numInterno, 10);
    const numParcelaNum = Number.parseInt(numParcela, 10);

    if (isNaN(codEmpresaNum) || isNaN(numInternoNum) || isNaN(numParcelaNum)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Parâmetros inválidos",
          },
        },
        { status: 400 }
      );
    }

    const titulo = await detalhesRepository.obterTituloPagarCompleto(
      codEmpresaNum,
      numInternoNum,
      numParcelaNum,
      empresaConfig
    );

    return NextResponse.json({
      success: true,
      data: titulo,
    });
  } catch (erro) {
    return tratarErroAPI(erro, {
      endpoint:
        "/api/dashboard/financeiro/titulos-pagar/[codEmpresa]/[numInterno]/[numParcela]",
      method: "GET",
    });
  }
}
