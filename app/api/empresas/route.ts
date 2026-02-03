import { NextRequest, NextResponse } from "next/server";
import { validarAutenticacao } from "@/core/middleware/auth-middleware";
import { tratarErroAPI } from "@/core/utils/tratar-erro";
import {
  criarRespostaSucesso,
  criarRespostaErro,
} from "@/core/utils/resposta-api";
import { consultaRepository } from "@/core/repository/consulta-repository";
import { obterEmpresaConfigDoCookie } from "@/core/utils/obter-empresa-cookie";
import { schemaParametrosConsulta } from "@/core/schemas/consulta-schemas";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    validarAutenticacao(request);
    const empresaConfig = obterEmpresaConfigDoCookie(request);

    const { searchParams } = new URL(request.url);
    const parametros = schemaParametrosConsulta.parse({
      page: searchParams.get("page") || undefined,
      pageSize: searchParams.get("pageSize") || undefined,
      sort: searchParams.get("sort") || undefined,
      order: searchParams.get("order") || undefined,
      search: searchParams.get("search") || undefined,
    });

    const colunas = [
      "COD_EMPRESA",
      "NOM_EMPRESA",
      "FAN_EMPRESA",
      "CGC_EMPRESA",
      "SIT_EMPRESA",
      "COD_CIDADE",
      "SIG_ESTADO",
      "TEL_EMPRESA",
      "MAI_EMPRESA",
    ];

    const resultado = await consultaRepository.consultar(
      "EMPRESAS",
      colunas,
      parametros,
      empresaConfig
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
      endpoint: "/api/empresas",
      method: "GET",
    });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    validarAutenticacao(request);
    return NextResponse.json(
      criarRespostaErro(
        "Método POST não implementado. Use as rotas de dashboard.",
        "NOT_IMPLEMENTED"
      ),
      { status: 501 }
    );
  } catch (erro) {
    return tratarErroAPI(erro, {
      endpoint: "/api/empresas",
      method: "POST",
    });
  }
}
