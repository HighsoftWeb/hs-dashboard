import { NextRequest, NextResponse } from "next/server";
import { validarAutenticacao } from "@/core/middleware/auth-middleware";
import { tratarErroAPI } from "@/core/utils/tratar-erro";
import { schemaFiltroOrcamentoOS } from "@/core/schemas/consulta-schemas";
import { consultaRepository } from "@/core/repository/consulta-repository";
import {
  obterEmpresaConfigDoCookie,
  obterCodEmpresaDoCookie,
} from "@/core/utils/obter-empresa-cookie";
import {
  criarRespostaSucesso,
  criarRespostaErro,
} from "@/core/utils/resposta-api";

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
      endpoint: "/api/dashboard/comercial/orcamentos",
      method: "GET",
    });
  }
}
