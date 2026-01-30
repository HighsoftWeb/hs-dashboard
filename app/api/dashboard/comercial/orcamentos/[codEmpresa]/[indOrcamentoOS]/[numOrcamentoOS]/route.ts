import { NextRequest, NextResponse } from "next/server";
import { validarAutenticacao } from "@/core/middleware/auth-middleware";
import { tratarErroAPI } from "@/core/utils/tratar-erro";
import { orcamentoRepository } from "@/core/repository/orcamento-repository";
import { DEFAULT_COD_EMPRESA } from "@/core/db/validar-env";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ codEmpresa: string; indOrcamentoOS: string; numOrcamentoOS: string }> }
): Promise<NextResponse> {
  try {
    const usuario = validarAutenticacao(request);
    const { codEmpresa: codEmpresaParam, indOrcamentoOS, numOrcamentoOS } = await params;
    
    const codEmpresa = usuario.codEmpresa || Number.parseInt(codEmpresaParam, 10) || DEFAULT_COD_EMPRESA;
    const numOrcamentoOSNum = Number.parseInt(numOrcamentoOS, 10);

    if (isNaN(codEmpresa) || isNaN(numOrcamentoOSNum)) {
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

    const [orcamentoCompleto, apontamentos, trocas] = await Promise.all([
      orcamentoRepository.obterOrcamentoCompleto(
        codEmpresa,
        indOrcamentoOS,
        numOrcamentoOSNum
      ),
      orcamentoRepository.obterApontamentosOS(
        codEmpresa,
        indOrcamentoOS,
        numOrcamentoOSNum
      ),
      orcamentoRepository.obterTrocasOrcamento(
        codEmpresa,
        indOrcamentoOS,
        numOrcamentoOSNum
      ),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        orcamento: orcamentoCompleto.orcamento,
        itens: orcamentoCompleto.itens,
        apontamentos,
        trocas,
      },
    });
  } catch (erro) {
    return tratarErroAPI(erro, {
      endpoint: "/api/dashboard/comercial/orcamentos/[codEmpresa]/[indOrcamentoOS]/[numOrcamentoOS]",
      method: "GET",
    });
  }
}
