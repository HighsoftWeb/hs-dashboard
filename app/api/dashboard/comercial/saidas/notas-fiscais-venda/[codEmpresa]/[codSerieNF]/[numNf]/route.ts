import { NextRequest, NextResponse } from "next/server";
import { validarAutenticacao } from "@/core/middleware/auth-middleware";
import { tratarErroAPI } from "@/core/utils/tratar-erro";
import { notasRepository } from "@/core/repository/notas-repository";
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
      codSerieNF: string;
      numNf: string;
    }>;
  }
): Promise<NextResponse> {
  try {
    validarAutenticacao(request);
    const empresaConfig = obterEmpresaConfigDoCookie(request);
    const codEmpresaCookie = obterCodEmpresaDoCookie(request);
    const { codEmpresa: codEmpresaParam, codSerieNF, numNf } = await params;

    const codEmpresa =
      codEmpresaCookie ??
      (codEmpresaParam ? Number.parseInt(codEmpresaParam, 10) : null);
    const numNfNum = Number.parseInt(numNf, 10);

    if (!codEmpresa || isNaN(codEmpresa) || isNaN(numNfNum)) {
      const mensagem =
        !codEmpresa || isNaN(codEmpresa)
          ? "Selecione uma empresa no header para continuar"
          : "Parâmetros inválidos";
      return NextResponse.json(
        criarRespostaErro(mensagem, "VALIDATION_ERROR"),
        { status: 400 }
      );
    }

    const notaCompleta = await notasRepository.obterNotaCompleta(
      codEmpresa,
      codSerieNF,
      numNfNum,
      empresaConfig
    );

    return NextResponse.json(
      criarRespostaSucesso({
        nota: notaCompleta.nota,
        itens: notaCompleta.itens,
      })
    );
  } catch (erro) {
    return tratarErroAPI(erro, {
      endpoint:
        "/api/dashboard/comercial/saidas/notas-fiscais-venda/[codEmpresa]/[codSerieNF]/[numNf]",
      method: "GET",
    });
  }
}
