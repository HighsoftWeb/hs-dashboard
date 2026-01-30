import { NextResponse } from "next/server";
import { logger } from "./logger";

interface OpcoesTratarErro {
  endpoint?: string;
  method?: string;
  contexto?: Record<string, string | number | boolean | null | undefined>;
}

export function tratarErroAPI(
  erro: unknown,
  opcoes?: OpcoesTratarErro
): NextResponse {
  const mensagem =
    erro instanceof Error ? erro.message : "Erro ao processar requisição";

  let status = 500;
  let codigo = "INTERNAL_ERROR";

  if (mensagem.includes("Token") || mensagem.includes("não fornecido")) {
    status = 401;
    codigo = "UNAUTHORIZED";
  } else if (mensagem.includes("não encontrado")) {
    status = 404;
    codigo = "NOT_FOUND";
  } else if (mensagem.includes("validação") || mensagem.includes("inválido")) {
    status = 400;
    codigo = "VALIDATION_ERROR";
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
