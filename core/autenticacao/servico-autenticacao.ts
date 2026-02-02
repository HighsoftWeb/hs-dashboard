import Cookies from "js-cookie";
import { clienteHttp } from "../http/cliente-http";
import {
  CredenciaisLogin,
  DadosAutenticacao,
  Usuario,
} from "../tipos/usuario";
import { removerCodEmpresaDoCookie } from "../utils/cod-empresa-cookie";

class ServicoAutenticacao {
  async fazerLogin(
    credenciais: CredenciaisLogin
  ): Promise<DadosAutenticacao> {
    const dadosLogin: Record<string, string | number> = {
      login: credenciais.login,
      senha: credenciais.senha,
    };

    if (credenciais.codEmpresa !== undefined) {
      dadosLogin.codEmpresa = credenciais.codEmpresa;
    }

    if (credenciais.cnpj !== undefined) {
      dadosLogin.cnpj = credenciais.cnpj;
    }

    try {
      const resposta = await clienteHttp.post<DadosAutenticacao>(
        "/auth/login",
        dadosLogin
      );

      if (!resposta.success || !resposta.data) {
        const errorMessage = resposta.error?.message || "Erro ao fazer login";
        throw new Error(errorMessage);
      }

      const { usuario, token, permissoes } = resposta.data;

      Cookies.set("token", token, { expires: 7, sameSite: "strict" });
      Cookies.set("usuario", JSON.stringify(usuario), {
        expires: 7,
        sameSite: "strict",
      });
      Cookies.set("permissoes", JSON.stringify(permissoes || []), {
        expires: 7,
        sameSite: "strict",
      });

      return resposta.data;
    } catch (erro) {
      if (erro instanceof Error && erro.message) {
        throw erro;
      }
      
      throw new Error("Erro ao fazer login. Verifique suas credenciais.");
    }

  }

  /**
   * Realiza logout do usuário, removendo apenas dados de autenticação e código da empresa.
   * O CNPJ da empresa é mantido para facilitar novo login.
   */
  async fazerLogout(): Promise<void> {
    try {
    } catch {
    } finally {
      Cookies.remove("token");
      Cookies.remove("usuario");
      Cookies.remove("permissoes");
      removerCodEmpresaDoCookie();
    }
  }

  obterUsuarioAtual(): Usuario | null {
    const usuarioStr = Cookies.get("usuario");
    if (!usuarioStr) {
      return null;
    }

    try {
      const usuario = JSON.parse(usuarioStr) as Usuario;
      return usuario;
    } catch {
      return null;
    }
  }

  async obterUsuarioAtualDoServidor(): Promise<Usuario | null> {
    try {
      const resposta = await clienteHttp.get<Usuario>("/auth/me");

      if (!resposta.success || !resposta.data) {
        return null;
      }

      const usuario = resposta.data;
      Cookies.set("usuario", JSON.stringify(usuario), {
        expires: 7,
        sameSite: "strict",
      });

      return usuario;
    } catch {
      return null;
    }
  }

  obterToken(): string | null {
    return Cookies.get("token") || null;
  }

  estaAutenticado(): boolean {
    return !!this.obterToken() && !!this.obterUsuarioAtual();
  }
}

export const servicoAutenticacao = new ServicoAutenticacao();
