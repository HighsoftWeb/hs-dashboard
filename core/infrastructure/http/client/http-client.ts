import { RespostaApi } from "@/core/tipos/resposta-api";

export interface HttpClient {
  get<T>(url: string, config?: unknown): Promise<RespostaApi<T>>;
  post<T>(
    url: string,
    dados?: unknown,
    config?: unknown
  ): Promise<RespostaApi<T>>;
  put<T>(
    url: string,
    dados?: unknown,
    config?: unknown
  ): Promise<RespostaApi<T>>;
  delete<T>(url: string, config?: unknown): Promise<RespostaApi<T>>;
}
