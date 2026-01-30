import { NextRequest } from "next/server";
import { verificarToken, extrairTokenDoHeader, PayloadJWT } from "../auth/jwt";
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

export function validarAutenticacao(
  request: NextRequest
): PayloadJWT {
  const authorization = request.headers.get("authorization");
  const token = extrairTokenDoHeader(authorization);

  if (!token) {
    throw new ErroAutenticacao("Token não fornecido");
  }

  try {
    const payload = verificarToken(token);
    return payload;
  } catch (erro) {
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
