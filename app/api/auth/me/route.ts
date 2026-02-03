import { NextRequest, NextResponse } from "next/server";
import { validarAutenticacao } from "@/core/middleware/auth-middleware";
import { autenticacaoService } from "@/core/domains/auth/server/auth-service";
import { empresaConfigRepository } from "@/core/repository/empresa-config-repository";
import { criarHandler } from "@/core/utils/api-handler";
import {
  criarRespostaSucesso,
  criarRespostaErro,
} from "@/core/utils/resposta-api";

export const GET = criarHandler(
  async (request: NextRequest): Promise<NextResponse> => {
    const payload = validarAutenticacao(request);

    const cnpjCookie = request.cookies.get("empresa_cnpj")?.value;
    if (!cnpjCookie || cnpjCookie.length !== 14) {
      return NextResponse.json(
        criarRespostaErro(
          "CNPJ da empresa não encontrado",
          "EMPRESA_NOT_FOUND"
        ),
        { status: 400 }
      );
    }

    const empresaConfig = empresaConfigRepository.obterPorCnpj(cnpjCookie);
    if (!empresaConfig) {
      return NextResponse.json(
        criarRespostaErro("Empresa não encontrada", "EMPRESA_NOT_FOUND"),
        { status: 404 }
      );
    }

    const usuario = await autenticacaoService.obterUsuarioPorToken(
      payload.codUsuario,
      empresaConfig,
      payload.codEmpresa
    );

    if (!usuario) {
      return NextResponse.json(
        criarRespostaErro("Usuário não encontrado", "USER_NOT_FOUND"),
        { status: 404 }
      );
    }

    return NextResponse.json(criarRespostaSucesso(usuario));
  },
  { requerAutenticacao: true }
);
