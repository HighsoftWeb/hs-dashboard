import { NextRequest, NextResponse } from "next/server";
import { validarAutenticacao } from "@/core/middleware/auth-middleware";
import { tratarErroAPI } from "@/core/utils/tratar-erro";
import { schemaFiltroProduto } from "@/core/schemas/consulta-schemas";
import { consultaRepository } from "@/core/repository/consulta-repository";
import { DEFAULT_COD_EMPRESA } from "@/core/db/validar-env";
import { obterEmpresaConfigDoCookie } from "@/core/utils/obter-empresa-cookie";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const usuario = validarAutenticacao(request);
    const codEmpresa = usuario.codEmpresa || DEFAULT_COD_EMPRESA;
    const empresaConfig = obterEmpresaConfigDoCookie(request);

    const { searchParams } = new URL(request.url);
    const parametros = schemaFiltroProduto.parse({
      page: searchParams.get("page") || undefined,
      pageSize: searchParams.get("pageSize") || undefined,
      sort: searchParams.get("sort") || undefined,
      order: searchParams.get("order") || undefined,
      search: searchParams.get("search") || undefined,
      sit: searchParams.get("sit") || undefined,
      ind: searchParams.get("ind") || undefined,
    });

    const colunas = [
      "COD_EMPRESA",
      "COD_PRODUTO",
      "DES_PRODUTO",
      "IND_PRODUTO_SERVICO",
      "SIT_PRODUTO",
      "COD_UNIDADE_MEDIDA",
      "OBS_PRODUTO",
      "COD_USUARIO",
    ];

    const filtrosAdicionais: Record<string, unknown> = {};
    if (parametros.sit) {
      filtrosAdicionais.SIT_PRODUTO = parametros.sit;
    }
    if (parametros.ind) {
      filtrosAdicionais.IND_PRODUTO_SERVICO = parametros.ind;
    }

    const resultado = await consultaRepository.consultar(
      "PRODUTOS_SERVICOS",
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
      endpoint: "/api/dashboard/cadastros/produtos",
      method: "GET",
    });
  }
}
