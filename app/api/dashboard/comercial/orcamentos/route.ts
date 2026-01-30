import { NextRequest, NextResponse } from "next/server";
import { validarAutenticacao } from "@/core/middleware/auth-middleware";
import { tratarErroAPI } from "@/core/utils/tratar-erro";
import { schemaFiltroOrcamentoOS } from "@/core/schemas/consulta-schemas";
import { consultaRepository } from "@/core/repository/consulta-repository";
import { DEFAULT_COD_EMPRESA } from "@/core/db/validar-env";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const usuario = validarAutenticacao(request);
    const codEmpresa = usuario.codEmpresa || DEFAULT_COD_EMPRESA;

    const { searchParams } = new URL(request.url);
    const parametros = schemaFiltroOrcamentoOS.parse({
      page: searchParams.get("page") || undefined,
      pageSize: searchParams.get("pageSize") || undefined,
      sort: searchParams.get("sort") || undefined,
      order: searchParams.get("order") || undefined,
      search: searchParams.get("search") || undefined,
      ind: searchParams.get("ind") || undefined,
      sit: searchParams.get("sit") || undefined,
      codCliFor: searchParams.get("codCliFor") || undefined,
    });

    const colunas = [
      "COD_EMPRESA",
      "IND_ORCAMENTO_OS",
      "NUM_ORCAMENTO_OS",
      "COD_CLI_FOR",
      "COD_SERIE_ORC_OS",
      "NUM_DOCUMENTO",
      "DAT_EMISSAO",
      "VLR_LIQUIDO",
      "SIT_ORCAMENTO_OS",
      "RAZ_CLI_FOR",
    ];

    const filtrosAdicionais: Record<string, unknown> = {};
    if (parametros.ind) {
      filtrosAdicionais.IND_ORCAMENTO_OS = parametros.ind;
    }
    if (parametros.sit) {
      filtrosAdicionais.SIT_ORCAMENTO_OS = parametros.sit;
    }
    if (parametros.codCliFor) {
      filtrosAdicionais.COD_CLI_FOR = parametros.codCliFor;
    }

    const resultado = await consultaRepository.consultar(
      "ORCAMENTOS_OS",
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
      endpoint: "/api/dashboard/comercial/orcamentos",
      method: "GET",
    });
  }
}
