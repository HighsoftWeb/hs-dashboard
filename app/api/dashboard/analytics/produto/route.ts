import { NextRequest, NextResponse } from "next/server";
import { validarAutenticacao } from "@/core/middleware/auth-middleware";
import {
  obterCodEmpresaDoCookie,
  obterEmpresaConfigDoCookie,
} from "@/core/utils/obter-empresa-cookie";
import { analyticsRepository } from "@/core/repository/analytics-repository";
import { tratarErroAPI } from "@/core/utils/tratar-erro";
import { criarRespostaErro, criarRespostaSucesso } from "@/core/utils/resposta-api";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    validarAutenticacao(request);
    const codEmpresa = obterCodEmpresaDoCookie(request);
    const empresaConfig = obterEmpresaConfigDoCookie(request);

    if (!codEmpresa) {
      return NextResponse.json(
        criarRespostaErro(
          "Selecione uma empresa no header para continuar",
          "VALIDATION_ERROR"
        ),
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const codProdutoParam = searchParams.get("codProduto");
    const dataInicio = searchParams.get("dataInicio") ?? undefined;
    const dataFim = searchParams.get("dataFim") ?? undefined;

    if (!codProdutoParam) {
      return NextResponse.json(
        criarRespostaErro("Parâmetro codProduto é obrigatório", "VALIDATION_ERROR"),
        { status: 400 }
      );
    }

    const codProduto = Number.parseInt(codProdutoParam, 10);
    if (Number.isNaN(codProduto)) {
      return NextResponse.json(
        criarRespostaErro("Parâmetro codProduto inválido", "VALIDATION_ERROR"),
        { status: 400 }
      );
    }

    const hoje = new Date();
    const inicioPadrao = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1)
      .toISOString()
      .slice(0, 10);
    const fimPadrao = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
      .toISOString()
      .slice(0, 10);

    const dataInicioUsar = dataInicio || inicioPadrao;
    const dataFimUsar = dataFim || fimPadrao;

    const [indicadores, materiasPrimaCompras] = await Promise.all([
      analyticsRepository.obterIndicadoresProduto(
        codEmpresa,
        codProduto,
        dataInicioUsar,
        dataFimUsar,
        empresaConfig
      ),
      analyticsRepository.obterHistoricoComprasMateriasProduto(
        codEmpresa,
        codProduto,
        dataInicioUsar,
        dataFimUsar,
        empresaConfig
      ),
    ]);

    return NextResponse.json(
      criarRespostaSucesso({
        indicadores,
        materiasPrimaCompras,
      })
    );
  } catch (erro) {
    return tratarErroAPI(erro, {
      endpoint: "/api/dashboard/analytics/produto",
      method: "GET",
    });
  }
}

