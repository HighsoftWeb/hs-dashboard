/**
 * Utilitários para respostas de API padronizadas
 */

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

/**
 * Cria uma resposta de sucesso padronizada
 */
export function criarRespostaSucesso<T>(data: T): RespostaApiSucesso<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Cria uma resposta de erro padronizada
 */
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

/**
 * Verifica se uma resposta é de sucesso
 */
export function isRespostaSucesso<T>(
  resposta: RespostaApi<T>
): resposta is RespostaApiSucesso<T> {
  return resposta.success === true;
}
