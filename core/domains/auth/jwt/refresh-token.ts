import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";

export interface RefreshTokenPayload {
  codUsuario: number;
  codEmpresa: number;
  cnpj: string;
  jti: string;
  iat: number;
}

const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";
const REFRESH_TOKEN_BYTES = 32;

function obterJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET não definido");
  }
  return secret;
}

function gerarRefreshJTI(): string {
  return randomBytes(REFRESH_TOKEN_BYTES).toString("hex");
}

/**
 * Gera um refresh token com expiração longa
 */
export function gerarRefreshToken(
  codUsuario: number,
  codEmpresa: number,
  cnpj: string
): string {
  const jti = gerarRefreshJTI();
  const secret = obterJwtSecret();

  const payload: Omit<RefreshTokenPayload, "iat"> = {
    codUsuario,
    codEmpresa,
    cnpj,
    jti,
  };

  return jwt.sign(payload, secret, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
}

/**
 * Verifica e decodifica um refresh token
 */
export function verificarRefreshToken(token: string): RefreshTokenPayload {
  const secret = obterJwtSecret();

  try {
    const decoded = jwt.verify(token, secret) as RefreshTokenPayload;

    if (
      !decoded.jti ||
      !decoded.iat ||
      !decoded.codUsuario ||
      !decoded.codEmpresa ||
      !decoded.cnpj
    ) {
      throw new Error("Refresh token inválido: faltam campos obrigatórios");
    }

    return decoded;
  } catch (erro) {
    if (erro instanceof jwt.JsonWebTokenError) {
      throw new Error("Refresh token inválido");
    }
    if (erro instanceof jwt.TokenExpiredError) {
      throw new Error("Refresh token expirado");
    }
    if (erro instanceof Error) {
      throw erro;
    }
    throw new Error("Erro ao verificar refresh token");
  }
}
