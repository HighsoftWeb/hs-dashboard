import { NextRequest, NextResponse } from "next/server";
import { validarAutenticacao } from "@/core/middleware/auth-middleware";
import { tratarErroAPI } from "@/core/utils/tratar-erro";
import { schemaParametrosConsulta } from "@/core/schemas/consulta-schemas";
import { consultaRepository } from "@/core/repository/consulta-repository";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    validarAutenticacao(request);

    const { searchParams } = new URL(request.url);
    const parametros = schemaParametrosConsulta.parse({
      page: searchParams.get("page") || undefined,
      pageSize: searchParams.get("pageSize") || undefined,
      sort: searchParams.get("sort") || undefined,
      order: searchParams.get("order") || undefined,
      search: searchParams.get("search") || undefined,
    });

    const colunas = [
      "COD_USUARIO",
      "NOM_USUARIO",
      "ABR_USUARIO",
      "SIT_USUARIO",
      "COD_GRUPO_USUARIO",
      "IND_CRIPTOGRAFADO",
    ];

    const resultado = await consultaRepository.consultar(
      "USUARIOS",
      colunas,
      parametros
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
      endpoint: "/api/dashboard/cadastros/usuarios",
      method: "GET",
    });
  }
}
