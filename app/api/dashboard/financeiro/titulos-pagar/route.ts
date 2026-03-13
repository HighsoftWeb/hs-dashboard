import { NextRequest, NextResponse } from "next/server";
import { validarAutenticacao } from "@/core/middleware/auth-middleware";
import { tratarErroAPI } from "@/core/utils/tratar-erro";
import { schemaFiltroTitulo } from "@/core/schemas/consulta-schemas";
import { consultaRepository } from "@/core/repository/consulta-repository";
import {
  obterEmpresaConfigDoCookie,
  obterCodEmpresaDoCookie,
} from "@/core/utils/obter-empresa-cookie";
import {
  criarRespostaSucesso,
  criarRespostaErro,
} from "@/core/utils/resposta-api";
import {
  obterDataRangeFaixa,
  type FaixaVencimento,
} from "@/core/utils/faixa-vencimento";

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
    const faixaParam = searchParams.get("faixa") as FaixaVencimento | null;
    const faixaRange =
      faixaParam && ["vencido", "0-30", "31-60", "61-90", "acima-90"].includes(faixaParam)
        ? obterDataRangeFaixa(faixaParam)
        : null;

    const parametros = schemaFiltroTitulo.parse({
      page: searchParams.get("page") || undefined,
      pageSize: searchParams.get("pageSize") || undefined,
      sort: searchParams.get("sort") || undefined,
      order: searchParams.get("order") || undefined,
      search: searchParams.get("search") || undefined,
      sit: searchParams.get("sit") || undefined,
      codCliFor: searchParams.get("codCliFor") || undefined,
      dataInicio: faixaRange?.dataInicio || searchParams.get("dataInicio") || undefined,
      dataFim: faixaRange?.dataFim || searchParams.get("dataFim") || undefined,
    });

    const colunas = [
      "COD_EMPRESA",
      "NUM_INTERNO",
      "NUM_PARCELA",
      "COD_CLI_FOR",
      "SIT_TITULO",
      "VCT_ORIGINAL",
      "VLR_ABERTO",
      "VLR_ORIGINAL",
    ];

    const filtrosAdicionais: Record<string, unknown> = {};
    if (parametros.sit) {
      filtrosAdicionais.SIT_TITULO = parametros.sit;
    } else if (faixaRange) {
      filtrosAdicionais.SIT_TITULO = "AB";
    }
    if (parametros.codCliFor) {
      filtrosAdicionais.COD_CLI_FOR = parametros.codCliFor;
    }
    if (parametros.dataInicio || parametros.dataFim) {
      const filtroData: { gte?: string; lte?: string } = {};
      if (parametros.dataInicio) {
        filtroData.gte = parametros.dataInicio;
      }
      if (parametros.dataFim) {
        filtroData.lte = parametros.dataFim;
      }
      filtrosAdicionais.VCT_ORIGINAL = filtroData;
    }

    const resultado = await consultaRepository.consultar(
      "TITULOS_PAGAR",
      colunas,
      parametros,
      empresaConfig,
      codEmpresa,
      filtrosAdicionais
    );

    return NextResponse.json(
      criarRespostaSucesso({
        data: resultado.dados,
        page: resultado.page,
        pageSize: resultado.pageSize,
        total: resultado.total,
      })
    );
  } catch (erro) {
    return tratarErroAPI(erro, {
      endpoint: "/api/dashboard/financeiro/titulos-pagar",
      method: "GET",
    });
  }
}
