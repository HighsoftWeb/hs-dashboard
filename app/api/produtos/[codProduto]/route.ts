import { NextRequest, NextResponse } from "next/server";
import { validarAutenticacao } from "@/core/middleware/auth-middleware";
import { produtoService } from "@/core/service/produto-service";
import { ProdutoServicoDB } from "@/core/tipos/produto-db";
import { AtualizarProdutoSchema } from "@/core/schemas/produto-schemas";
import { logger } from "@/core/utils/logger";
import { obterEmpresaConfigDoCookie } from "@/core/utils/obter-empresa-cookie";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ codProduto: string }> }
): Promise<NextResponse> {
  try {
    const payload = validarAutenticacao(request);
    const empresaConfig = obterEmpresaConfigDoCookie(request);
    const { codProduto } = await params;

    const codProdutoNum = parseInt(codProduto, 10);
    if (isNaN(codProdutoNum)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "COD_PRODUTO inválido",
          },
        },
        { status: 400 }
      );
    }

    const produto = await produtoService.obterPorCodigo(
      payload.codEmpresa,
      codProdutoNum,
      empresaConfig
    );

    return NextResponse.json({
      success: true,
      data: produto,
    });
  } catch (erro) {
    logger.error("Erro ao obter produto", erro, {
      endpoint: "/api/produtos/[codProduto]",
      method: "GET",
    });

    const mensagem =
      erro instanceof Error ? erro.message : "Erro ao processar requisição";

    const status = mensagem.includes("Token")
      ? 401
      : mensagem.includes("não encontrado")
      ? 404
      : 500;

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "PRODUCT_GET_ERROR",
          message: mensagem,
        },
      },
      { status }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ codProduto: string }> }
): Promise<NextResponse> {
  try {
    const payload = validarAutenticacao(request);
    const empresaConfig = obterEmpresaConfigDoCookie(request);
    const { codProduto } = await params;
    const body = await request.json();

    const codProdutoNum = parseInt(codProduto, 10);
    if (isNaN(codProdutoNum)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "COD_PRODUTO inválido",
          },
        },
        { status: 400 }
      );
    }

    const validacao = AtualizarProdutoSchema.safeParse(body);

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

    const dados: Partial<
      Omit<
        ProdutoServicoDB,
        "COD_EMPRESA" | "COD_PRODUTO" | "DAT_CADASTRO" | "DAT_ALTERACAO"
      >
    > = {};

    if (validacao.data.DES_PRODUTO !== undefined || validacao.data.desProduto !== undefined) {
      dados.DES_PRODUTO = validacao.data.DES_PRODUTO || validacao.data.desProduto || null;
    }
    if (
      validacao.data.COD_UNIDADE_MEDIDA !== undefined ||
      validacao.data.codUnidadeMedida !== undefined
    ) {
      dados.COD_UNIDADE_MEDIDA =
        validacao.data.COD_UNIDADE_MEDIDA || validacao.data.codUnidadeMedida || null;
    }
    if (
      validacao.data.IND_PRODUTO_SERVICO !== undefined ||
      validacao.data.indProdutoServico !== undefined
    ) {
      dados.IND_PRODUTO_SERVICO =
        validacao.data.IND_PRODUTO_SERVICO || validacao.data.indProdutoServico || null;
    }
    if (validacao.data.SIT_PRODUTO !== undefined || validacao.data.sitProduto !== undefined) {
      dados.SIT_PRODUTO = validacao.data.SIT_PRODUTO || validacao.data.sitProduto || null;
    }
    if (validacao.data.OBS_PRODUTO !== undefined || validacao.data.obsProduto !== undefined) {
      dados.OBS_PRODUTO = validacao.data.OBS_PRODUTO || validacao.data.obsProduto || null;
    }

    dados.COD_USUARIO = payload.codUsuario;

    const produto = await produtoService.atualizar(
      payload.codEmpresa,
      codProdutoNum,
      dados,
      empresaConfig,
      payload.codUsuario
    );

    return NextResponse.json({
      success: true,
      data: produto,
    });
  } catch (erro) {
    logger.error("Erro ao atualizar produto", erro, {
      endpoint: "/api/produtos/[codProduto]",
      method: "PUT",
    });

    const mensagem =
      erro instanceof Error ? erro.message : "Erro ao processar requisição";

    const status = mensagem.includes("Token")
      ? 401
      : mensagem.includes("não encontrado")
      ? 404
      : mensagem.includes("obrigatório") || mensagem.includes("máximo")
      ? 400
      : 500;

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "PRODUCT_UPDATE_ERROR",
          message: mensagem,
        },
      },
      { status }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ codProduto: string }> }
): Promise<NextResponse> {
  try {
    const payload = validarAutenticacao(request);
    const empresaConfig = obterEmpresaConfigDoCookie(request);
    const { codProduto } = await params;

    const codProdutoNum = parseInt(codProduto, 10);
    if (isNaN(codProdutoNum)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "COD_PRODUTO inválido",
          },
        },
        { status: 400 }
      );
    }

    await produtoService.excluir(payload.codEmpresa, codProdutoNum, empresaConfig);

    return NextResponse.json({
      success: true,
      data: { message: "Produto excluído com sucesso" },
    });
  } catch (erro) {
    logger.error("Erro ao excluir produto", erro, {
      endpoint: "/api/produtos/[codProduto]",
      method: "DELETE",
    });

    const mensagem =
      erro instanceof Error ? erro.message : "Erro ao processar requisição";

    const status = mensagem.includes("Token")
      ? 401
      : mensagem.includes("não encontrado")
      ? 404
      : 500;

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "PRODUCT_DELETE_ERROR",
          message: mensagem,
        },
      },
      { status }
    );
  }
}
