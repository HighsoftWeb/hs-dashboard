import jwt from "jsonwebtoken";

export interface PayloadJWT {
  codUsuario: number;
  codEmpresa: number;
  codGrupoUsuario?: number;
  login: string;
}

export function gerarToken(payload: PayloadJWT): string {
  const secret: string = process.env.JWT_SECRET || "";
  if (!secret) {
    throw new Error("JWT_SECRET não definido");
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || "8h";

  return jwt.sign(payload, secret, { expiresIn });
}

export function verificarToken(token: string): PayloadJWT {
  const secret: string = process.env.JWT_SECRET || "";
  if (!secret) {
    throw new Error("JWT_SECRET não definido");
  }

  try {
    const decoded = jwt.verify(token, secret) as PayloadJWT;
    return decoded;
  } catch (erro) {
    if (erro instanceof jwt.JsonWebTokenError) {
      throw new Error("Token inválido");
    }
    if (erro instanceof jwt.TokenExpiredError) {
      throw new Error("Token expirado");
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
