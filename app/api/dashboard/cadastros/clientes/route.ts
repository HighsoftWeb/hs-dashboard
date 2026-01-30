import { NextRequest, NextResponse } from "next/server";
import { validarAutenticacao } from "@/core/middleware/auth-middleware";
import { tratarErroAPI } from "@/core/utils/tratar-erro";
import { schemaFiltroClienteFornecedor } from "@/core/schemas/consulta-schemas";
import { consultaRepository } from "@/core/repository/consulta-repository";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    validarAutenticacao(request);

    const { searchParams } = new URL(request.url);
    const parametros = schemaFiltroClienteFornecedor.parse({
      page: searchParams.get("page") || undefined,
      pageSize: searchParams.get("pageSize") || undefined,
      sort: searchParams.get("sort") || undefined,
      order: searchParams.get("order") || undefined,
      search: searchParams.get("search") || undefined,
      sit: searchParams.get("sit") || undefined,
      tipo: searchParams.get("tipo") || undefined,
      tipCliFor: searchParams.get("tipCliFor") || undefined,
    });

    const colunas = [
      "COD_CLI_FOR",
      "RAZ_CLI_FOR",
      "FAN_CLI_FOR",
      "CLI_FOR_AMBOS",
      "TIP_CLI_FOR",
      "CGC_CPF",
      "SIT_CLI_FOR",
      "COD_CIDADE",
      "SIG_ESTADO",
      "TEL_CLI_FOR",
      "END_ELETRONICO",
    ];

    const filtrosAdicionais: Record<string, unknown> = {};
    if (parametros.sit) {
      filtrosAdicionais.SIT_CLI_FOR = parametros.sit;
    }
    if (parametros.tipo) {
      filtrosAdicionais.CLI_FOR_AMBOS = parametros.tipo;
    }
    if (parametros.tipCliFor) {
      filtrosAdicionais.TIP_CLI_FOR = parametros.tipCliFor;
    }

    const resultado = await consultaRepository.consultar(
      "CLIENTES_FORNECEDORES",
      colunas,
      parametros,
      undefined,
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
      endpoint: "/api/dashboard/cadastros/clientes",
      method: "GET",
    });
  }
}
