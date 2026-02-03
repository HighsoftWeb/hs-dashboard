import { NextRequest, NextResponse } from "next/server";
import { validarAutenticacao } from "@/core/middleware/auth-middleware";
import { produtoService } from "@/core/domains/cadastros/services/produto-service";
import { PAGINACAO_PADRAO } from "@/core/constants/paginacao";
import { obterEmpresaConfigDoCookie } from "@/core/utils/obter-empresa-cookie";
import { criarHandler } from "@/core/utils/api-handler";
import { criarRespostaSucesso } from "@/core/utils/resposta-api";

export const GET = criarHandler(
  async (request: NextRequest): Promise<NextResponse> => {
    const payload = validarAutenticacao(request);
    const empresaConfig = obterEmpresaConfigDoCookie(request);
    const { searchParams } = new URL(request.url);

    const page = searchParams.get("page")
      ? parseInt(searchParams.get("page")!, 10)
      : PAGINACAO_PADRAO.PAGE_DEFAULT;
    const pageSizeRaw = searchParams.get("pageSize")
      ? parseInt(searchParams.get("pageSize")!, 10)
      : PAGINACAO_PADRAO.PAGE_SIZE;
    const pageSize = Math.min(pageSizeRaw, PAGINACAO_PADRAO.PAGE_SIZE_MAX);
    const search = searchParams.get("search") || undefined;
    const sit = searchParams.get("sit") || undefined;
    const ind = searchParams.get("ind") || undefined;

    const resultado = await produtoService.listar(payload.codEmpresa, {
      page,
      pageSize,
      search,
      sit,
      ind,
    }, empresaConfig);

    return NextResponse.json({
      ...criarRespostaSucesso(resultado.produtos),
      meta: {
        total: resultado.total,
        page: resultado.page,
        pageSize: resultado.pageSize,
        totalPages: resultado.totalPages,
      },
    });
  },
  { requerAutenticacao: true }
);

import { CriarProdutoSchema } from "@/core/schemas/produto-schemas";
import { ProdutoServicoDB } from "@/core/tipos/produto-db";

export const POST = criarHandler(
  async (request: NextRequest): Promise<NextResponse> => {
    const payload = validarAutenticacao(request);
    const empresaConfig = obterEmpresaConfigDoCookie(request);
    const body = await request.json();

    const validacao = CriarProdutoSchema.safeParse(body);

    if (!validacao.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: validacao.error.issues.map((e) => e.message).join(", "),
          },
        },
        { status: 400 }
      );
    }

    const dados: Omit<
      ProdutoServicoDB,
      "COD_EMPRESA" | "COD_PRODUTO" | "DAT_CADASTRO" | "DAT_ALTERACAO"
    > = {
      DES_PRODUTO: validacao.data.DES_PRODUTO || validacao.data.desProduto || null,
      COD_UNIDADE_MEDIDA: validacao.data.COD_UNIDADE_MEDIDA || validacao.data.codUnidadeMedida || null,
      IND_PRODUTO_SERVICO: validacao.data.IND_PRODUTO_SERVICO || validacao.data.indProdutoServico || null,
      SIT_PRODUTO: validacao.data.SIT_PRODUTO || validacao.data.sitProduto || "A",
      OBS_PRODUTO: validacao.data.OBS_PRODUTO || validacao.data.obsProduto || null,
      COD_USUARIO: payload.codUsuario,
    };

    const produto = await produtoService.criar(
      payload.codEmpresa,
      dados,
      empresaConfig,
      payload.codUsuario
    );

    return NextResponse.json(
      criarRespostaSucesso(produto),
      { status: 201 }
    );
  },
  { requerAutenticacao: true }
);

