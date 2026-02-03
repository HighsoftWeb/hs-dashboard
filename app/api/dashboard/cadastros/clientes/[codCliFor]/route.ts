import { NextRequest, NextResponse } from "next/server";
import { validarAutenticacao } from "@/core/middleware/auth-middleware";
import { tratarErroAPI } from "@/core/utils/tratar-erro";
import { detalhesRepository } from "@/core/repository/detalhes-repository";
import { obterEmpresaConfigDoCookie } from "@/core/utils/obter-empresa-cookie";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ codCliFor: string }> }
): Promise<NextResponse> {
  try {
    validarAutenticacao(request);
    const empresaConfig = obterEmpresaConfigDoCookie(request);
    const { codCliFor } = await params;
    const codCliForNum = Number.parseInt(codCliFor, 10);

    if (isNaN(codCliForNum)) {
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

    const cliente = await detalhesRepository.obterClienteCompleto(
      codCliForNum,
      empresaConfig
    );

    return NextResponse.json({
      success: true,
      data: cliente,
    });
  } catch (erro) {
    return tratarErroAPI(erro, {
      endpoint: "/api/dashboard/cadastros/clientes/[codCliFor]",
      method: "GET",
    });
  }
}
