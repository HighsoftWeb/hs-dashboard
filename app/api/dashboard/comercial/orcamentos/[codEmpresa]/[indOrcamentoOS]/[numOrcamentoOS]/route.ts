import { NextRequest, NextResponse } from "next/server";
import { validarAutenticacao } from "@/core/middleware/auth-middleware";
import { tratarErroAPI } from "@/core/utils/tratar-erro";
import { orcamentoRepository } from "@/core/repository/orcamento-repository";
import {
  obterEmpresaConfigDoCookie,
  obterCodEmpresaDoCookie,
} from "@/core/utils/obter-empresa-cookie";
import {
  criarRespostaErro,
  criarRespostaSucesso,
} from "@/core/utils/resposta-api";

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      codEmpresa: string;
      indOrcamentoOS: string;
      numOrcamentoOS: string;
    }>;
  }
): Promise<NextResponse> {
  try {
    validarAutenticacao(request);
    const empresaConfig = obterEmpresaConfigDoCookie(request);
    const codEmpresaCookie = obterCodEmpresaDoCookie(request);
    const {
      codEmpresa: codEmpresaParam,
      indOrcamentoOS,
      numOrcamentoOS,
    } = await params;

    const codEmpresa =
      codEmpresaCookie ??
      (codEmpresaParam ? Number.parseInt(codEmpresaParam, 10) : null);
    const numOrcamentoOSNum = Number.parseInt(numOrcamentoOS, 10);

    if (!codEmpresa || isNaN(codEmpresa) || isNaN(numOrcamentoOSNum)) {
      const mensagem =
        !codEmpresa || isNaN(codEmpresa)
          ? "Selecione uma empresa no header para continuar"
          : "Parâmetros inválidos";
      return NextResponse.json(
        criarRespostaErro(mensagem, "VALIDATION_ERROR"),
        { status: 400 }
      );
    }

    const [orcamentoCompleto, apontamentos, trocas] = await Promise.all([
      orcamentoRepository.obterOrcamentoCompleto(
        codEmpresa,
        indOrcamentoOS,
        numOrcamentoOSNum,
        empresaConfig
      ),
      orcamentoRepository.obterApontamentosOS(
        codEmpresa,
        indOrcamentoOS,
        numOrcamentoOSNum,
        empresaConfig
      ),
      orcamentoRepository.obterTrocasOrcamento(
        codEmpresa,
        indOrcamentoOS,
        numOrcamentoOSNum,
        empresaConfig
      ),
    ]);

    return NextResponse.json(
      criarRespostaSucesso({
        orcamento: orcamentoCompleto.orcamento,
        itens: orcamentoCompleto.itens,
        apontamentos,
        trocas,
      })
    );
  } catch (erro) {
    return tratarErroAPI(erro, {
      endpoint:
        "/api/dashboard/comercial/orcamentos/[codEmpresa]/[indOrcamentoOS]/[numOrcamentoOS]",
      method: "GET",
    });
  }
}
