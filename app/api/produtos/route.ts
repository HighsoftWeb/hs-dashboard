import { NextRequest, NextResponse } from "next/server";
import { validarAutenticacao } from "@/core/middleware/auth-middleware";
import { produtoService } from "@/core/service/produto-service";
import { ProdutoServicoDB } from "@/core/tipos/produto-db";
import { CriarProdutoSchema } from "@/core/schemas/produto-schemas";
import { logger } from "@/core/utils/logger";
import { PAGINACAO_PADRAO } from "@/core/constants/paginacao";
import { obterEmpresaConfigDoCookie } from "@/core/utils/obter-empresa-cookie";

export async function GET(
  request: NextRequest
): Promise<NextResponse> {
  try {
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
      success: true,
      data: resultado.produtos,
      meta: {
        total: resultado.total,
        page: resultado.page,
        pageSize: resultado.pageSize,
        totalPages: resultado.totalPages,
      },
    });
  } catch (erro) {
    logger.error("Erro ao listar produtos", erro, {
      endpoint: "/api/produtos",
      method: "GET",
    });

    const mensagem =
      erro instanceof Error ? erro.message : "Erro ao processar requisição";

    const status = mensagem.includes("Token") ? 401 : 500;

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "PRODUCT_LIST_ERROR",
          message: mensagem,
        },
      },
      { status }
    );
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse> {
  try {
    const payload = validarAutenticacao(request);
    const body = await request.json();

    const validacao = CriarProdutoSchema.safeParse(body);

    if (!validacao.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: validacao.error.errors.map((e) => e.message).join(", "),
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
      {
        success: true,
        data: produto,
      },
      { status: 201 }
    );
  } catch (erro) {
    logger.error("Erro ao criar produto", erro, {
      endpoint: "/api/produtos",
      method: "POST",
    });

    const mensagem =
      erro instanceof Error ? erro.message : "Erro ao processar requisição";

    const status = mensagem.includes("Token")
      ? 401
      : mensagem.includes("obrigatório") || mensagem.includes("máximo")
      ? 400
      : 500;

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "PRODUCT_CREATE_ERROR",
          message: mensagem,
        },
      },
      { status }
    );
  }
}
