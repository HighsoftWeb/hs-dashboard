/**
 * Cliente HTTP para uso no servidor (Next.js API Routes)
 * Faz proxy para API backend externa
 */

const API_BACKEND_URL = process.env.API_BACKEND_URL || "http://localhost:3001";
const TIMEOUT_MS = 30000;

interface OpcoesRequest {
  token?: string | null;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  headers?: Record<string, string>;
}

/**
 * Faz requisição HTTP para o backend externo
 */
export async function requisicaoBackend<T>(
  endpoint: string,
  opcoes: OpcoesRequest = {}
): Promise<{ ok: boolean; status: number; dados: T | null; erro?: string }> {
  const { token, method = "GET", body, headers = {} } = opcoes;

  const headersRequisicao: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (token) {
    headersRequisicao.Authorization = `Bearer ${token}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const resposta = await fetch(`${API_BACKEND_URL}${endpoint}`, {
      method,
      headers: headersRequisicao,
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const dados = resposta.ok ? ((await resposta.json()) as T) : null;

    return {
      ok: resposta.ok,
      status: resposta.status,
      dados,
      erro: !resposta.ok ? `Erro ${resposta.status}` : undefined,
    };
  } catch (erro) {
    if (erro instanceof Error && erro.name === "AbortError") {
      return {
        ok: false,
        status: 408,
        dados: null,
        erro: "Timeout na requisição",
      };
    }

    return {
      ok: false,
      status: 500,
      dados: null,
      erro: erro instanceof Error ? erro.message : "Erro desconhecido",
    };
  }
}

/**
 * GET request para backend
 */
export async function getBackend<T>(
  endpoint: string,
  token?: string | null
): Promise<{ ok: boolean; status: number; dados: T | null; erro?: string }> {
  return requisicaoBackend<T>(endpoint, { token, method: "GET" });
}

/**
 * POST request para backend
 */
export async function postBackend<T>(
  endpoint: string,
  body: unknown,
  token?: string | null
): Promise<{ ok: boolean; status: number; dados: T | null; erro?: string }> {
  return requisicaoBackend<T>(endpoint, { token, method: "POST", body });
}

/**
 * PUT request para backend
 */
export async function putBackend<T>(
  endpoint: string,
  body: unknown,
  token?: string | null
): Promise<{ ok: boolean; status: number; dados: T | null; erro?: string }> {
  return requisicaoBackend<T>(endpoint, { token, method: "PUT", body });
}

/**
 * DELETE request para backend
 */
export async function deleteBackend<T>(
  endpoint: string,
  token?: string | null
): Promise<{ ok: boolean; status: number; dados: T | null; erro?: string }> {
  return requisicaoBackend<T>(endpoint, { token, method: "DELETE" });
}
