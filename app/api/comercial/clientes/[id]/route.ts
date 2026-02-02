import { NextRequest, NextResponse } from "next/server";
import { validarAutenticacao } from "@/core/middleware/auth-middleware";
import { tratarErroAPI } from "@/core/utils/tratar-erro";
import { criarRespostaErro } from "@/core/utils/resposta-api";
import { detalhesRepository } from "@/core/repository/detalhes-repository";
import { obterEmpresaConfigDoCookie } from "@/core/utils/obter-empresa-cookie";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    validarAutenticacao(_request);
    const empresaConfig = obterEmpresaConfigDoCookie(_request);
    const { id } = await params;
    const codCliFor = parseInt(id, 10);

    if (isNaN(codCliFor)) {
      return NextResponse.json(
        criarRespostaErro("ID do cliente inválido", "VALIDATION_ERROR"),
        { status: 400 }
      );
    }

    const cliente = await detalhesRepository.obterClienteCompleto(
      codCliFor,
      empresaConfig
    );

    return NextResponse.json({
      success: true,
      data: cliente,
    });
  } catch (erro) {
    return tratarErroAPI(erro, {
      endpoint: "/api/comercial/clientes/[id]",
      method: "GET",
    });
  }
}

export async function PUT(
  request: NextRequest,
  { params: _params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    validarAutenticacao(request);
    return NextResponse.json(
      criarRespostaErro("Método PUT não implementado. Use as rotas de dashboard.", "NOT_IMPLEMENTED"),
      { status: 501 }
    );
  } catch (erro) {
    return tratarErroAPI(erro, {
      endpoint: "/api/comercial/clientes/[id]",
      method: "PUT",
    });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params: _params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    validarAutenticacao(_request);
    return NextResponse.json(
      criarRespostaErro("Método DELETE não implementado. Use as rotas de dashboard.", "NOT_IMPLEMENTED"),
      { status: 501 }
    );
  } catch (erro) {
    return tratarErroAPI(erro, {
      endpoint: "/api/comercial/clientes/[id]",
      method: "DELETE",
    });
  }
}
