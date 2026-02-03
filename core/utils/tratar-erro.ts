import { NextResponse } from "next/server";
import { logger } from "./logger";

interface OpcoesTratarErro {
  endpoint?: string;
  method?: string;
  contexto?: Record<string, string | number | boolean | null | undefined>;
}

const ERROR_CODES = {
  TOKEN_REVOGADO: "TOKEN_REVOGADO",
  UNAUTHORIZED: "UNAUTHORIZED",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export function tratarErroAPI(
  erro: unknown,
  opcoes?: OpcoesTratarErro
): NextResponse {
  const mensagem =
    erro instanceof Error ? erro.message : "Erro ao processar requisição";

  let status = 500;
  let codigo: ErrorCode = ERROR_CODES.INTERNAL_ERROR;

  if (mensagem === ERROR_CODES.TOKEN_REVOGADO || mensagem.includes(ERROR_CODES.TOKEN_REVOGADO)) {
    status = 401;
    codigo = ERROR_CODES.TOKEN_REVOGADO;
  } else if (mensagem.includes("Token") || mensagem.includes("não fornecido")) {
    status = 401;
    codigo = ERROR_CODES.UNAUTHORIZED;
  } else if (mensagem.includes("não encontrado")) {
    status = 404;
    codigo = ERROR_CODES.NOT_FOUND;
  } else if (mensagem.includes("validação") || mensagem.includes("inválido")) {
    status = 400;
    codigo = ERROR_CODES.VALIDATION_ERROR;
  }

  logger.error(
    `Erro em ${opcoes?.endpoint || "endpoint desconhecido"}`,
    erro,
    {
      method: opcoes?.method || "UNKNOWN",
      ...opcoes?.contexto,
    }
  );

  return NextResponse.json(
    {
      success: false,
      error: {
        code: codigo,
        message: mensagem,
      },
    },
    { status }
  );
}
