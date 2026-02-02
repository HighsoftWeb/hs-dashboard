import { NextRequest, NextResponse } from "next/server";
import { validarAutenticacao } from "@/core/middleware/auth-middleware";
import { tratarErroAPI } from "@/core/utils/tratar-erro";
import { criarRespostaErro } from "@/core/utils/resposta-api";

export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    validarAutenticacao(_request);
    return NextResponse.json(
      criarRespostaErro("Método GET não implementado. Use as rotas de dashboard.", "NOT_IMPLEMENTED"),
      { status: 501 }
    );
  } catch (erro) {
    return tratarErroAPI(erro, {
      endpoint: "/api/financeiro/contas-receber",
      method: "GET",
    });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    validarAutenticacao(request);
    return NextResponse.json(
      criarRespostaErro("Método POST não implementado. Use as rotas de dashboard.", "NOT_IMPLEMENTED"),
      { status: 501 }
    );
  } catch (erro) {
    return tratarErroAPI(erro, {
      endpoint: "/api/financeiro/contas-receber",
      method: "POST",
    });
  }
}
