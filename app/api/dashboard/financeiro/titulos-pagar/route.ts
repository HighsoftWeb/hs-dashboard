import { NextRequest, NextResponse } from "next/server";
import { validarAutenticacao } from "@/core/middleware/auth-middleware";
import { tratarErroAPI } from "@/core/utils/tratar-erro";
import { schemaFiltroTitulo } from "@/core/schemas/consulta-schemas";
import { consultaRepository } from "@/core/repository/consulta-repository";
import { DEFAULT_COD_EMPRESA } from "@/core/db/validar-env";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const usuario = validarAutenticacao(request);
    const codEmpresa = usuario.codEmpresa || DEFAULT_COD_EMPRESA;

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
      endpoint: "/api/dashboard/financeiro/titulos-pagar",
      method: "GET",
    });
  }
}
