import { NextRequest, NextResponse } from "next/server";
import { validarAutenticacao } from "@/core/middleware/auth-middleware";
import { tratarErroAPI } from "@/core/utils/tratar-erro";
import {
  criarRespostaErro,
  criarRespostaSucesso,
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

    const sit = searchParams.get("sit");
    const colunas = [
      "COD_USUARIO",
      "COD_GRUPO_USUARIO",
      "NOM_USUARIO",
      "ABR_USUARIO",
      "SIT_USUARIO",
      "NUM_WHATSAPP",
      "DAT_CADASTRO",
      "DAT_ALTERACAO",
    ];

    const filtrosAdicionais: Record<string, unknown> = {};
    if (sit) {
      filtrosAdicionais.SIT_USUARIO = sit;
    }

    const resultado = await consultaRepository.consultar(
      "USUARIOS",
      colunas,
      parametros,
      empresaConfig,
      undefined,
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
      endpoint: "/api/usuarios",
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
      endpoint: "/api/usuarios",
      method: "POST",
    });
  }
}
