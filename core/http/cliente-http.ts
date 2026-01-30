import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import Cookies from "js-cookie";
import { RespostaApi } from "../tipos/resposta-api";


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
      (resposta: AxiosResponse<RespostaApi>) => {
        return resposta;
      },
      (erro) => {
        if (erro.response?.status === 401) {
          Cookies.remove("token");
          Cookies.remove("usuario");
          Cookies.remove("permissoes");
          if (typeof window !== "undefined") {
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
