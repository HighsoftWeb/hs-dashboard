import { NextRequest, NextResponse } from "next/server";
import { validarAutenticacao } from "@/core/middleware/auth-middleware";
import { tratarErroAPI } from "@/core/utils/tratar-erro";
import { detalhesRepository } from "@/core/repository/detalhes-repository";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ codEmpresa: string }> }
): Promise<NextResponse> {
  try {
    validarAutenticacao(request);
    const { codEmpresa } = await params;
    const codEmpresaNum = Number.parseInt(codEmpresa, 10);

    if (isNaN(codEmpresaNum)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Parâmetro inválido",
          },
        },
        { status: 400 }
      );
    }

    const empresa = await detalhesRepository.obterEmpresaCompleto(codEmpresaNum);

    return NextResponse.json({
      success: true,
      data: empresa,
    });
  } catch (erro) {
    return tratarErroAPI(erro, {
      endpoint: "/api/dashboard/cadastros/empresas/[codEmpresa]",
      method: "GET",
    });
  }
}
