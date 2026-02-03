import { NextRequest, NextResponse } from "next/server";
import { validarAutenticacao } from "@/core/middleware/auth-middleware";
import { produtoService } from "@/core/domains/cadastros/services/produto-service";
import { ProdutoServicoDB } from "@/core/tipos/produto-db";
import { AtualizarProdutoSchema } from "@/core/schemas/produto-schemas";
import { obterEmpresaConfigDoCookie } from "@/core/utils/obter-empresa-cookie";
import {
  criarRespostaSucesso,
  criarRespostaErro,
} from "@/core/utils/resposta-api";
import { tratarErroAPI } from "@/core/utils/tratar-erro";

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
        criarRespostaErro("COD_PRODUTO inválido", "VALIDATION_ERROR"),
        { status: 400 }
      );
    }

    const produto = await produtoService.obterPorCodigo(
      payload.codEmpresa,
      codProdutoNum,
      empresaConfig
    );

    return NextResponse.json(criarRespostaSucesso(produto));
  } catch (erro) {
    return tratarErroAPI(erro, {
      endpoint: "/api/produtos/[codProduto]",
      method: "GET",
    });
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
        criarRespostaErro("COD_PRODUTO inválido", "VALIDATION_ERROR"),
        { status: 400 }
      );
    }

    const validacao = AtualizarProdutoSchema.safeParse(body);

    if (!validacao.success) {
      return NextResponse.json(
        criarRespostaErro(
          validacao.error.issues.map((e) => e.message).join(", "),
          "VALIDATION_ERROR"
        ),
        { status: 400 }
      );
    }

    const dados: Partial<
      Omit<
        ProdutoServicoDB,
        "COD_EMPRESA" | "COD_PRODUTO" | "DAT_CADASTRO" | "DAT_ALTERACAO"
      >
    > = {};

    if (
      validacao.data.DES_PRODUTO !== undefined ||
      validacao.data.desProduto !== undefined
    ) {
      dados.DES_PRODUTO =
        validacao.data.DES_PRODUTO || validacao.data.desProduto || null;
    }
    if (
      validacao.data.COD_UNIDADE_MEDIDA !== undefined ||
      validacao.data.codUnidadeMedida !== undefined
    ) {
      dados.COD_UNIDADE_MEDIDA =
        validacao.data.COD_UNIDADE_MEDIDA ||
        validacao.data.codUnidadeMedida ||
        null;
    }
    if (
      validacao.data.IND_PRODUTO_SERVICO !== undefined ||
      validacao.data.indProdutoServico !== undefined
    ) {
      dados.IND_PRODUTO_SERVICO =
        validacao.data.IND_PRODUTO_SERVICO ||
        validacao.data.indProdutoServico ||
        null;
    }
    if (
      validacao.data.SIT_PRODUTO !== undefined ||
      validacao.data.sitProduto !== undefined
    ) {
      dados.SIT_PRODUTO =
        validacao.data.SIT_PRODUTO || validacao.data.sitProduto || null;
    }
    if (
      validacao.data.OBS_PRODUTO !== undefined ||
      validacao.data.obsProduto !== undefined
    ) {
      dados.OBS_PRODUTO =
        validacao.data.OBS_PRODUTO || validacao.data.obsProduto || null;
    }

    dados.COD_USUARIO = payload.codUsuario;

    const produto = await produtoService.atualizar(
      payload.codEmpresa,
      codProdutoNum,
      dados,
      empresaConfig,
      payload.codUsuario
    );

    return NextResponse.json(criarRespostaSucesso(produto));
  } catch (erro) {
    return tratarErroAPI(erro, {
      endpoint: "/api/produtos/[codProduto]",
      method: "PUT",
    });
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
        criarRespostaErro("COD_PRODUTO inválido", "VALIDATION_ERROR"),
        { status: 400 }
      );
    }

    await produtoService.excluir(
      payload.codEmpresa,
      codProdutoNum,
      empresaConfig
    );

    return NextResponse.json(
      criarRespostaSucesso({ message: "Produto excluído com sucesso" })
    );
  } catch (erro) {
    return tratarErroAPI(erro, {
      endpoint: "/api/produtos/[codProduto]",
      method: "DELETE",
    });
  }
}
