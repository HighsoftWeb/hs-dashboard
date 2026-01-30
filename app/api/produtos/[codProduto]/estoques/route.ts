import { NextRequest, NextResponse } from "next/server";
import { validarAutenticacao } from "@/core/middleware/auth-middleware";
import { produtoService } from "@/core/service/produto-service";
import { logger } from "@/core/utils/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ codProduto: string }> }
): Promise<NextResponse> {
  try {
    const payload = validarAutenticacao(request);
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

    const estoques = await produtoService.listarEstoques(
      payload.codEmpresa,
      codProdutoNum
    );

    return NextResponse.json({
      success: true,
      data: estoques,
    });
  } catch (erro) {
    logger.error("Erro ao listar estoques", erro, {
      endpoint: "/api/produtos/[codProduto]/estoques",
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
          code: "STOCK_LIST_ERROR",
          message: mensagem,
        },
      },
      { status }
    );
  }
}
