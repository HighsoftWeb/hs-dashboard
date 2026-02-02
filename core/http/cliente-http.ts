import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import Cookies from "js-cookie";
import { RespostaApi } from "../tipos/resposta-api";
import { removerCodEmpresaDoCookie } from "../utils/cod-empresa-cookie";


class ClienteHttp {
  private instancia: AxiosInstance;

  constructor() {
    this.instancia = axios.create({
      baseURL: "/api",
      timeout: 30000,
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.configurarInterceptores();
  }

  private configurarInterceptores(): void {
    this.instancia.interceptors.request.use(
      (config) => {
        if (!config) {
          return Promise.reject(new Error("Configuração de requisição inválida"));
        }
        
        const token = Cookies.get("token");
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (erro) => {
        return Promise.reject(erro);
      }
    );

    this.instancia.interceptors.response.use(
      (resposta: AxiosResponse<RespostaApi<unknown>>) => {
        return resposta;
      },
      (erro: unknown) => {
        const axiosError = erro as AxiosError<RespostaApi<unknown>>;
        
        if (axiosError.response?.data?.error?.message) {
          const mensagemErro = axiosError.response.data.error.message;
          const erroComMensagem = new Error(mensagemErro);
          Object.assign(erroComMensagem, { 
            response: axiosError.response,
            isAxiosError: true 
          });
          
          if (axiosError.response.status === 401) {
            Cookies.remove("token");
            Cookies.remove("usuario");
            Cookies.remove("permissoes");
            removerCodEmpresaDoCookie();
            
            if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
              window.location.href = "/login";
            }
          }
          
          return Promise.reject(erroComMensagem);
        }

        if (axiosError.response?.status === 401) {
          Cookies.remove("token");
          Cookies.remove("usuario");
          Cookies.remove("permissoes");
          removerCodEmpresaDoCookie();
          
          if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
            window.location.href = "/login";
          }
        }
        return Promise.reject(erro);
      }
    );
  }

  async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<RespostaApi<T>> {
    const resposta = await this.instancia.get<RespostaApi<T>>(url, config);
    return resposta.data;
  }

  async post<T>(
    url: string,
    dados?: Record<string, string | number | boolean | null> | Array<string | number | boolean | null>,
    config?: AxiosRequestConfig
  ): Promise<RespostaApi<T>> {
    const resposta = await this.instancia.post<RespostaApi<T>>(
      url,
      dados,
      config
    );
    return resposta.data;
  }

  async put<T>(
    url: string,
    dados?: Record<string, string | number | boolean | null> | Array<string | number | boolean | null>,
    config?: AxiosRequestConfig
  ): Promise<RespostaApi<T>> {
    const resposta = await this.instancia.put<RespostaApi<T>>(
      url,
      dados,
      config
    );
    return resposta.data;
  }

  async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<RespostaApi<T>> {
    const resposta = await this.instancia.delete<RespostaApi<T>>(url, config);
    return resposta.data;
  }
}

export const clienteHttp = new ClienteHttp();
