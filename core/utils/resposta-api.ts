export interface RespostaApiSucesso<T> {
  success: true;
  data: T;
}

export interface RespostaApiErro {
  success: false;
  error: {
    code?: string;
    message: string;
  };
}

export type RespostaApi<T> = RespostaApiSucesso<T> | RespostaApiErro;

export function criarRespostaSucesso<T>(data: T): RespostaApiSucesso<T> {
  return {
    success: true,
    data,
  };
}

export function criarRespostaErro(
  message: string,
  code?: string
): RespostaApiErro {
  return {
    success: false,
    error: {
      ...(code && { code }),
      message,
    },
  };
}

export function isRespostaSucesso<T>(
  resposta: RespostaApi<T>
): resposta is RespostaApiSucesso<T> {
  return resposta.success === true;
}
