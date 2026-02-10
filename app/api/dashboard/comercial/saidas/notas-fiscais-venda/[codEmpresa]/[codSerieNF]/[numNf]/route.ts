import { NextRequest, NextResponse } from "next/server";
import { validarAutenticacao } from "@/core/middleware/auth-middleware";
import { tratarErroAPI } from "@/core/utils/tratar-erro";
import { notasRepository } from "@/core/repository/notas-repository";
import { DEFAULT_COD_EMPRESA } from "@/core/db/validar-env";
import { obterEmpresaConfigDoCookie } from "@/core/utils/obter-empresa-cookie";

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      codEmpresa: string;
      codSerieNF: string;
      numNf: string;
    }>;
  }
): Promise<NextResponse> {
  try {
    const usuario = validarAutenticacao(request);
    const empresaConfig = obterEmpresaConfigDoCookie(request);
    const { codEmpresa: codEmpresaParam, codSerieNF, numNf } = await params;

    const codEmpresa =
      usuario.codEmpresa ||
      Number.parseInt(codEmpresaParam, 10) ||
      DEFAULT_COD_EMPRESA;
    const numNfNum = Number.parseInt(numNf, 10);

    if (isNaN(codEmpresa) || isNaN(numNfNum)) {
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

    const notaCompleta = await notasRepository.obterNotaCompleta(
      codEmpresa,
      codSerieNF,
      numNfNum,
      empresaConfig
    );

    return NextResponse.json({
      success: true,
      data: {
        nota: notaCompleta.nota,
        itens: notaCompleta.itens,
      },
    });
  } catch (erro) {
    return tratarErroAPI(erro, {
      endpoint:
        "/api/dashboard/comercial/saidas/notas-fiscais-venda/[codEmpresa]/[codSerieNF]/[numNf]",
      method: "GET",
    });
  }
}
