import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";

export interface PayloadJWT {
  codUsuario: number;
  codEmpresa: number;
  codGrupoUsuario?: number;
  login: string;
  jti?: string;
  iat?: number;
}

interface DecodedToken extends PayloadJWT {
  iat: number;
  jti: string;
}

const JWT_SECRET_ENV = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";
const JTI_BYTES = 16;

if (!JWT_SECRET_ENV) {
  throw new Error("JWT_SECRET não definido");
}

const JWT_SECRET: string = JWT_SECRET_ENV;

function gerarJTI(): string {
  return randomBytes(JTI_BYTES).toString("hex");
}

export function gerarToken(payload: Omit<PayloadJWT, "jti" | "iat">): string {
  const jti = gerarJTI();

  return jwt.sign(
    {
      ...payload,
      jti,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verificarToken(token: string): DecodedToken {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

    if (!decoded.jti || !decoded.iat) {
      throw new Error("Token inválido: faltam campos obrigatórios");
    }

    return decoded;
  } catch (erro) {
    if (erro instanceof jwt.JsonWebTokenError) {
      throw new Error("Token inválido");
    }
    if (erro instanceof jwt.TokenExpiredError) {
      throw new Error("Token expirado");
    }
    if (erro instanceof Error) {
      throw erro;
    }
    throw new Error("Erro ao verificar token");
  }
}

export function extrairTokenDoHeader(
  authorization: string | null
): string | null {
  if (!authorization) {
    return null;
  }

  const parts = authorization.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
}
