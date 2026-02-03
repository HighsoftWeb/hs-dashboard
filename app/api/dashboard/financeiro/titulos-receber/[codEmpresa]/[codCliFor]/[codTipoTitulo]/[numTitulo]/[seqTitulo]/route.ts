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
      codCliFor: string;
      codTipoTitulo: string;
      numTitulo: string;
      seqTitulo: string;
    }>;
  }
): Promise<NextResponse> {
  try {
    validarAutenticacao(request);
    const empresaConfig = obterEmpresaConfigDoCookie(request);
    const { codEmpresa, codCliFor, codTipoTitulo, numTitulo, seqTitulo } =
      await params;
    const codEmpresaNum = Number.parseInt(codEmpresa, 10);
    const codCliForNum = Number.parseInt(codCliFor, 10);
    const codTipoTituloDecoded = decodeURIComponent(codTipoTitulo);
    const numTituloDecoded = decodeURIComponent(numTitulo);
    const seqTituloNum = Number.parseInt(seqTitulo, 10);

    if (isNaN(codEmpresaNum) || isNaN(codCliForNum) || isNaN(seqTituloNum)) {
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

    const titulo = await detalhesRepository.obterTituloReceberCompleto(
      codEmpresaNum,
      codCliForNum,
      codTipoTituloDecoded,
      numTituloDecoded,
      seqTituloNum,
      empresaConfig
    );

    return NextResponse.json({
      success: true,
      data: titulo,
    });
  } catch (erro) {
    return tratarErroAPI(erro, {
      endpoint:
        "/api/dashboard/financeiro/titulos-receber/[codEmpresa]/[codCliFor]/[codTipoTitulo]/[numTitulo]/[seqTitulo]",
      method: "GET",
    });
  }
}
