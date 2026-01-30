import { NextRequest, NextResponse } from "next/server";
import { validarAutenticacao } from "@/core/middleware/auth-middleware";
import { tratarErroAPI } from "@/core/utils/tratar-erro";
import { detalhesRepository } from "@/core/repository/detalhes-repository";
import { DEFAULT_COD_EMPRESA } from "@/core/db/validar-env";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ codProduto: string }> }
): Promise<NextResponse> {
  try {
    const usuario = validarAutenticacao(request);
    const codEmpresa = usuario.codEmpresa || DEFAULT_COD_EMPRESA;
    const { codProduto } = await params;
    const codProdutoNum = Number.parseInt(codProduto, 10);

    if (isNaN(codProdutoNum)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Parâmetro inválido",
          },
        },
        { status: 400 }
      );
    }

    const [produto, derivacoes, estoques, tabelasPreco] = await Promise.all([
      detalhesRepository.obterProdutoCompleto(codEmpresa, codProdutoNum),
      detalhesRepository.obterDerivacoesProduto(codEmpresa, codProdutoNum),
      detalhesRepository.obterEstoquesProduto(codEmpresa, codProdutoNum),
      detalhesRepository.obterTabelasPrecoProduto(codEmpresa, codProdutoNum),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        produto,
        derivacoes,
        estoques,
        tabelasPreco,
      },
    });
  } catch (erro) {
    return tratarErroAPI(erro, {
      endpoint: "/api/dashboard/cadastros/produtos/[codProduto]",
      method: "GET",
    });
  }
}
