import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import Cookies from "js-cookie";
import { RespostaApi } from "../tipos/resposta-api";
import { removerCodEmpresaDoCookie } from "../utils/cod-empresa-cookie";

const TOKEN_REVOGADO_KEY = "tokenRevogado";
const MENSAGEM_REVOGACAO_KEY = "mensagemRevogacao";
const TOKEN_REVOGADO_MESSAGE =
  "Outro usuário acessou o sistema com este mesmo login e empresa. Você foi desconectado por segurança.";

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
          return Promise.reject(
            new Error("Configuração de requisição inválida")
          );
        }

        const token = Cookies.get("token");
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (erro) => Promise.reject(erro)
    );

    this.instancia.interceptors.response.use(
      (resposta: AxiosResponse<RespostaApi<unknown>>) => resposta,
      async (erro: unknown) => {
        const axiosError = erro as AxiosError<RespostaApi<unknown>>;

        if (axiosError.response?.status === 401) {
          const refreshToken = Cookies.get("refreshToken");
          const mensagemErro = axiosError.response?.data?.error?.message || "";
          const codigoErro = axiosError.response?.data?.error?.code || "";
          const mensagemErroUpper = mensagemErro.toUpperCase();
          const codigoErroUpper = codigoErro.toUpperCase();

          const isTokenRevogado =
            mensagemErro === "TOKEN_REVOGADO" ||
            codigoErro === "TOKEN_REVOGADO" ||
            mensagemErroUpper === "TOKEN_REVOGADO" ||
            codigoErroUpper === "TOKEN_REVOGADO" ||
            mensagemErroUpper.includes("TOKEN_REVOGADO") ||
            mensagemErroUpper.includes("TOKEN REVOGADO") ||
            mensagemErroUpper.includes("REVOGADO") ||
            mensagemErro.includes("revogado") ||
            mensagemErro.includes("Revogado");

          if (isTokenRevogado) {
            this.tratarErro401(axiosError);
            return Promise.reject(axiosError);
          }

          if (refreshToken) {
            try {
              const respostaRefresh = await axios.post<
                RespostaApi<{ token: string; refreshToken: string }>
              >("/api/auth/refresh", { refreshToken }, { baseURL: "" });

              if (respostaRefresh.data.success && respostaRefresh.data.data) {
                Cookies.set("token", respostaRefresh.data.data.token, {
                  expires: 7,
                  sameSite: "strict",
                });
                Cookies.set(
                  "refreshToken",
                  respostaRefresh.data.data.refreshToken,
                  { expires: 7, sameSite: "strict" }
                );

                const configOriginal = axiosError.config;
                if (configOriginal) {
                  configOriginal.headers = configOriginal.headers || {};
                  configOriginal.headers.Authorization = `Bearer ${respostaRefresh.data.data.token}`;
                  return this.instancia.request(configOriginal);
                }
              }
            } catch (refreshError) {
              this.tratarErro401(axiosError);
              return Promise.reject(refreshError);
            }
          }

          this.tratarErro401(axiosError);
        }

        if (axiosError.response?.data?.error?.message) {
          const mensagemErro = axiosError.response.data.error.message;
          const erroComMensagem = new Error(mensagemErro);
          Object.assign(erroComMensagem, {
            response: axiosError.response,
            isAxiosError: true,
          });
          return Promise.reject(erroComMensagem);
        }

        return Promise.reject(erro);
      }
    );
  }

  private tratarErro401(erro: AxiosError<RespostaApi<unknown>>): void {
    const mensagemErro = erro.response?.data?.error?.message || "";
    const codigoErro = erro.response?.data?.error?.code || "";
    const mensagemErroUpper = mensagemErro.toUpperCase();
    const codigoErroUpper = codigoErro.toUpperCase();

    const isTokenRevogado =
      mensagemErro === "TOKEN_REVOGADO" ||
      codigoErro === "TOKEN_REVOGADO" ||
      mensagemErroUpper === "TOKEN_REVOGADO" ||
      codigoErroUpper === "TOKEN_REVOGADO" ||
      mensagemErroUpper.includes("TOKEN_REVOGADO") ||
      mensagemErroUpper.includes("TOKEN REVOGADO") ||
      mensagemErroUpper.includes("REVOGADO") ||
      mensagemErro.includes("revogado") ||
      mensagemErro.includes("Revogado");

    this.limparSessao();

    if (typeof window !== "undefined") {
      if (isTokenRevogado) {
        const mensagemFinal =
          TOKEN_REVOGADO_MESSAGE ||
          "Outro usuário acessou o sistema com este mesmo login e empresa. Você foi desconectado por segurança.";
        sessionStorage.setItem(TOKEN_REVOGADO_KEY, "true");
        sessionStorage.setItem(MENSAGEM_REVOGACAO_KEY, mensagemFinal);

        console.log(
          "[ClienteHttp] Token revogado detectado. Mensagem salva:",
          mensagemFinal
        );
      }

      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
  }

  private limparSessao(): void {
    Cookies.remove("token");
    Cookies.remove("refreshToken");
    Cookies.remove("usuario");
    Cookies.remove("permissoes");
    removerCodEmpresaDoCookie();
  }

  async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<RespostaApi<T>> {
    const resposta = await this.instancia.get<RespostaApi<T>>(url, config);
    return resposta.data;
  }

  /**
   * POST mantido apenas para autenticação (login, refresh).
   * Projeto é somente leitura (Power BI style) - use apenas GET para dados.
   */
  async post<T>(
    url: string,
    dados?:
      | Record<string, string | number | boolean | null>
      | Array<string | number | boolean | null>,
    config?: AxiosRequestConfig
  ): Promise<RespostaApi<T>> {
    const resposta = await this.instancia.post<RespostaApi<T>>(
      url,
      dados,
      config
    );
    return resposta.data;
  }

  /** Stub para compatibilidade - projeto é somente leitura (Power BI style). */
  async put<T>(): Promise<RespostaApi<T>> {
    return Promise.reject(
      new Error("Operação não permitida. Projeto é somente leitura (Power BI style).")
    );
  }

  /** Stub para compatibilidade - projeto é somente leitura (Power BI style). */
  async delete<T>(): Promise<RespostaApi<T>> {
    return Promise.reject(
      new Error("Operação não permitida. Projeto é somente leitura (Power BI style).")
    );
  }
}

export const clienteHttp = new ClienteHttp();
