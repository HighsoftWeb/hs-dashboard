import { NextRequest, NextResponse } from "next/server";
import { validarAutenticacao } from "@/core/middleware/auth-middleware";
import {
  obterEmpresaConfigDoCookie,
  obterCodEmpresaDoCookie,
} from "@/core/utils/obter-empresa-cookie";
import { analyticsRepository } from "@/core/repository/analytics-repository";
import { tratarErroAPI } from "@/core/utils/tratar-erro";
import { criarRespostaSucesso } from "@/core/utils/resposta-api";

function obterIntervaloPadrao(): { dataInicio: string; dataFim: string } {
  const hoje = new Date();
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
  return {
    dataInicio: inicio.toISOString().slice(0, 10),
    dataFim: fim.toISOString().slice(0, 10),
  };
}

function obterUltimos12Meses(): { dataInicio: string; dataFim: string } {
  const hoje = new Date();
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 11, 1);
  const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
  return {
    dataInicio: inicio.toISOString().slice(0, 10),
    dataFim: fim.toISOString().slice(0, 10),
  };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    validarAutenticacao(request);
    const empresaConfig = obterEmpresaConfigDoCookie(request);
    const codEmpresa = obterCodEmpresaDoCookie(request);
    if (!codEmpresa) {
      return NextResponse.json(
        { success: false, error: { message: "Empresa não selecionada" } },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const dataInicio =
      searchParams.get("dataInicio") || obterIntervaloPadrao().dataInicio;
    const dataFim =
      searchParams.get("dataFim") || obterIntervaloPadrao().dataFim;
    const tipo = searchParams.get("tipo") || "geral";

    if (tipo === "geral") {
      const [
        agingReceber,
        agingPagar,
        tendenciaMensal,
        topClientes,
        topProdutos,
        funilVendas,
        metaRealizado,
      ] = await Promise.all([
        analyticsRepository.obterAgingReceber(codEmpresa, empresaConfig),
        analyticsRepository.obterAgingPagar(codEmpresa, empresaConfig),
        analyticsRepository.obterTendenciaMensal(
          codEmpresa,
          obterUltimos12Meses().dataInicio,
          obterUltimos12Meses().dataFim,
          empresaConfig
        ),
        analyticsRepository.obterTopClientes(
          codEmpresa,
          10,
          dataInicio,
          dataFim,
          empresaConfig
        ),
        analyticsRepository.obterTopProdutosOrcamento(
          codEmpresa,
          10,
          dataInicio,
          dataFim,
          empresaConfig
        ),
        analyticsRepository.obterFunilVendas(
          codEmpresa,
          dataInicio,
          dataFim,
          empresaConfig
        ),
        analyticsRepository.obterMetaRealizado(
          codEmpresa,
          dataInicio,
          dataFim,
          empresaConfig
        ),
      ]);

      return NextResponse.json(
        criarRespostaSucesso({
          agingReceber,
          agingPagar,
          tendenciaMensal,
          topClientes,
          topProdutos,
          funilVendas,
          metaRealizado,
        })
      );
    }

    if (tipo === "estoque") {
      const resumo = await analyticsRepository.obterResumoEstoqueAvancado(
        codEmpresa,
        empresaConfig,
        dataInicio,
        dataFim
      );
      return NextResponse.json(criarRespostaSucesso(resumo));
    }

    if (tipo === "clientes") {
      const resumo = await analyticsRepository.obterResumoClientes(
        codEmpresa,
        dataInicio,
        dataFim,
        empresaConfig
      );
      return NextResponse.json(criarRespostaSucesso(resumo));
    }

    if (tipo === "metricas") {
      const anoAtual = new Date().getFullYear();
      const dataInicioUsar = dataInicio || `${anoAtual}-01-01`;
      const dataFimUsar = dataFim || `${anoAtual}-12-31`;

      const [
        produtosMaisVendidos,
        produtosMaisLucro,
        produtosPrejuizo,
        produtosParados,
        topClientesFaturamento,
        clientesInativos,
        indicadoresCaixa,
        indicadoresInadimplencia,
        fluxoRecebimento,
      ] = await Promise.all([
        analyticsRepository.obterTopProdutosVenda(
          codEmpresa,
          10,
          dataInicioUsar,
          dataFimUsar,
          empresaConfig
        ),
        analyticsRepository.obterProdutosPorLucro(
          codEmpresa,
          dataInicioUsar,
          dataFimUsar,
          10,
          "maior",
          empresaConfig
        ),
        analyticsRepository.obterProdutosPorLucro(
          codEmpresa,
          dataInicioUsar,
          dataFimUsar,
          10,
          "menor",
          empresaConfig
        ),
        analyticsRepository.obterProdutosParados(
          codEmpresa,
          90,
          15,
          empresaConfig
        ),
        analyticsRepository.obterTopClientesPorFaturamento(
          codEmpresa,
          10,
          dataInicioUsar,
          dataFimUsar,
          empresaConfig
        ),
        analyticsRepository.obterClientesInativos(
          codEmpresa,
          90,
          10,
          empresaConfig
        ),
        analyticsRepository.obterIndicadoresCaixa(
          codEmpresa,
          empresaConfig,
          dataInicio,
          dataFim
        ),
        analyticsRepository.obterIndicadoresInadimplencia(
          codEmpresa,
          empresaConfig
        ),
        analyticsRepository.obterFluxoRecebimentoMensal(
          codEmpresa,
          6,
          empresaConfig,
          dataInicio,
          dataFim
        ),
      ]);

      return NextResponse.json(
        criarRespostaSucesso({
          produtosMaisVendidos,
          produtosMaisLucro,
          produtosPrejuizo,
          produtosParados,
          topClientesFaturamento,
          clientesInativos,
          indicadoresCaixa,
          indicadoresInadimplencia,
          fluxoRecebimento,
        })
      );
    }

    return NextResponse.json(
      { success: false, error: { message: "Tipo de análise inválido" } },
      { status: 400 }
    );
  } catch (erro) {
    return tratarErroAPI(erro, {
      endpoint: "/api/dashboard/analytics",
      method: "GET",
    });
  }
}
