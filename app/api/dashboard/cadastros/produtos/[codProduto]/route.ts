import { NextRequest, NextResponse } from "next/server";
import { validarAutenticacao } from "@/core/middleware/auth-middleware";
import { tratarErroAPI } from "@/core/utils/tratar-erro";
import { detalhesRepository } from "@/core/repository/detalhes-repository";
import {
  obterEmpresaConfigDoCookie,
  obterCodEmpresaDoCookie,
} from "@/core/utils/obter-empresa-cookie";
import {
  criarRespostaErro,
  criarRespostaSucesso,
} from "@/core/utils/resposta-api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ codProduto: string }> }
): Promise<NextResponse> {
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
    const { codProduto } = await params;
    const codProdutoNum = Number.parseInt(codProduto, 10);

    if (isNaN(codProdutoNum)) {
      return NextResponse.json(
        criarRespostaErro("Parâmetro inválido", "VALIDATION_ERROR"),
        { status: 400 }
      );
    }

    const [produto, derivacoes, estoques, tabelasPreco] = await Promise.all([
      detalhesRepository.obterProdutoCompleto(
        codEmpresa,
        codProdutoNum,
        empresaConfig
      ),
      detalhesRepository.obterDerivacoesProduto(
        codEmpresa,
        codProdutoNum,
        empresaConfig
      ),
      detalhesRepository.obterEstoquesProduto(
        codEmpresa,
        codProdutoNum,
        empresaConfig
      ),
      detalhesRepository.obterTabelasPrecoProduto(
        codEmpresa,
        codProdutoNum,
        empresaConfig
      ),
    ]);

    return NextResponse.json(
      criarRespostaSucesso({
        produto,
        derivacoes,
        estoques,
        tabelasPreco,
      })
    );
  } catch (erro) {
    return tratarErroAPI(erro, {
      endpoint: "/api/dashboard/cadastros/produtos/[codProduto]",
      method: "GET",
    });
  }
}
