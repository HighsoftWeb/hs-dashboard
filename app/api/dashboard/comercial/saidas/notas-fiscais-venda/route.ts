import { NextRequest, NextResponse } from "next/server";
import { validarAutenticacao } from "@/core/middleware/auth-middleware";
import { tratarErroAPI } from "@/core/utils/tratar-erro";
import { schemaFiltroTitulo } from "@/core/schemas/consulta-schemas";
import { consultaRepository } from "@/core/repository/consulta-repository";
import { DEFAULT_COD_EMPRESA } from "@/core/db/validar-env";
import { obterEmpresaConfigDoCookie } from "@/core/utils/obter-empresa-cookie";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const usuario = validarAutenticacao(request);
    const codEmpresa = usuario.codEmpresa || DEFAULT_COD_EMPRESA;
    const empresaConfig = obterEmpresaConfigDoCookie(request);

    const { searchParams } = new URL(request.url);
    const parametros = schemaFiltroTitulo.parse({
      page: searchParams.get("page") || undefined,
      pageSize: searchParams.get("pageSize") || undefined,
      sort: searchParams.get("sort") || undefined,
      order: searchParams.get("order") || undefined,
      search: searchParams.get("search") || undefined,
      sit: searchParams.get("sit") || undefined,
      codCliFor: searchParams.get("codCliFor") || undefined,
      dataInicio: searchParams.get("dataInicio") || undefined,
      dataFim: searchParams.get("dataFim") || undefined,
    });

    const colunas = [
      "COD_EMPRESA",
      "COD_SERIE_NF_VENDA",
      "NUM_NF_VENDA",
      "NUM_DOCUMENTO",
      "COD_CLI_FOR",
      "RAZ_CLI_FOR",
      "DAT_EMISSAO",
      "VLR_LIQUIDO",
      "SIT_NF",
    ];

    const filtrosAdicionais: Record<string, unknown> = {};
    if (parametros.sit) {
      filtrosAdicionais.SIT_NF = parametros.sit;
    }
    if (parametros.codCliFor) {
      filtrosAdicionais.COD_CLI_FOR = parametros.codCliFor;
    }
    const codSerie = searchParams.get("codSerie");
    const numNf = searchParams.get("numNf");
    if (codSerie) {
      filtrosAdicionais.COD_SERIE_NF_VENDA = codSerie;
    }
    if (numNf) {
      const num = parseInt(numNf, 10);
      if (!isNaN(num)) filtrosAdicionais.NUM_NF_VENDA = num;
    }

    const indOrc = searchParams.get("indOrc");
    const serieOrc = searchParams.get("serieOrc");
    const numOrc = searchParams.get("numOrc");
    if (indOrc) {
      filtrosAdicionais.IND_ORCAMENTO_OS = indOrc;
    }
    if (serieOrc) {
      filtrosAdicionais.COD_SERIE_ORC_OS = serieOrc;
    }
    if (numOrc) {
      const num = parseInt(numOrc, 10);
      if (!isNaN(num)) filtrosAdicionais.NUM_ORCAMENTO_OS = num;
    }

    if (parametros.dataInicio || parametros.dataFim) {
      filtrosAdicionais.DAT_EMISSAO = {
        ...(parametros.dataInicio ? { gte: parametros.dataInicio } : {}),
        ...(parametros.dataFim ? { lte: parametros.dataFim } : {}),
      };
    }

    const resultado = await consultaRepository.consultar(
      "NOTAS_FISCAIS_VENDA",
      colunas,
      parametros,
      empresaConfig,
      codEmpresa,
      filtrosAdicionais
    );

    return NextResponse.json({
      success: true,
      data: {
        data: resultado.dados,
        page: resultado.page,
        pageSize: resultado.pageSize,
        total: resultado.total,
      },
    });
  } catch (erro) {
    return tratarErroAPI(erro, {
      endpoint: "/api/dashboard/comercial/saidas/notas-fiscais-venda",
      method: "GET",
    });
  }
}
