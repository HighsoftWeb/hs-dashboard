import { NextRequest } from "next/server";
import {
  verificarToken,
  extrairTokenDoHeader,
  PayloadJWT,
} from "../domains/auth/jwt/jwt";
import { tokenRepository } from "../repository/token-repository";
import { logger } from "../utils/logger";

export interface RequestAutenticada extends NextRequest {
  usuario?: PayloadJWT;
}

export class ErroAutenticacao extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = "ErroAutenticacao";
  }
}

export function validarAutenticacao(request: NextRequest): PayloadJWT {
  const authorization = request.headers.get("authorization");
  const token = extrairTokenDoHeader(authorization);

  if (!token) {
    throw new ErroAutenticacao("Token não fornecido");
  }

  try {
    const payload = verificarToken(token);

    if (tokenRepository.isTokenRevogado(payload.jti)) {
      throw new ErroAutenticacao("TOKEN_REVOGADO");
    }

    const tokenCriadoEm = new Date(payload.iat * 1000);
    const loginMaisRecente = tokenRepository.verificarLoginMaisRecente(
      payload.codUsuario,
      payload.codEmpresa,
      tokenCriadoEm
    );

    if (loginMaisRecente) {
      const tempoDiferenca = Date.now() - tokenCriadoEm.getTime();
      if (tempoDiferenca > 2000) {
        tokenRepository.revogarToken(
          payload.jti,
          payload.codUsuario,
          payload.codEmpresa
        );
        throw new ErroAutenticacao("TOKEN_REVOGADO");
      }
    }

    return payload;
  } catch (erro) {
    if (erro instanceof ErroAutenticacao) {
      throw erro;
    }

    logger.warn("Falha na validação de token", {
      endpoint: request.url,
      erro: erro instanceof Error ? erro.message : String(erro),
    });

    if (erro instanceof Error) {
      throw new ErroAutenticacao(erro.message);
    }

    throw new ErroAutenticacao("Erro ao validar token");
  }
}
