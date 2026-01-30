import { usuarioRepository } from "../repository/usuario-repository";
import { gerarToken, PayloadJWT } from "../auth/jwt";
import { validarSenhaHS } from "../auth/senha";

export interface DadosLogin {
  login: string;
  senha: string;
  codEmpresa?: number;
}

export interface DadosAutenticacao {
  token: string;
  usuario: {
    codUsuario: number;
    nome: string;
    login: string;
    codGrupoUsuario: number | null;
    codEmpresa: number;
  };
  permissoes: Array<{
    menu: string;
    perAcesso: string | null;
    incRegistro: string | null;
    altRegistro: string | null;
    excRegistro: string | null;
    pesRegistro: string | null;
  }>;
}

export class AutenticacaoService {
  async fazerLogin(dados: DadosLogin): Promise<DadosAutenticacao> {
    const usuario = await usuarioRepository.obterPorLogin(dados.login);

    if (!usuario) {
      throw new Error("Credenciais inválidas");
    }

    if (usuario.SIT_USUARIO !== "A") {
      throw new Error("Usuário inativo");
    }

    if (!usuario.SEN_USUARIO) {
      throw new Error("Senha não configurada");
    }

    const senhaValida = validarSenhaHS(
      dados.senha,
      usuario.SEN_USUARIO,
      usuario.IND_CRIPTOGRAFADO || "N"
    );

    if (!senhaValida) {
      throw new Error("Credenciais inválidas");
    }

    const codEmpresa =
      dados.codEmpresa ||
      parseInt(process.env.DEFAULT_COD_EMPRESA || "1", 10);

    let permissoes: DadosAutenticacao["permissoes"] = [];
    if (usuario.COD_GRUPO_USUARIO) {
      const menus = await usuarioRepository.obterMenusGrupoUsuario(
        usuario.COD_GRUPO_USUARIO
      );
      permissoes = menus.map((menu) => ({
        menu: menu.NOM_MENU,
        perAcesso: menu.PER_ACESSO,
        incRegistro: menu.INC_REGISTRO,
        altRegistro: menu.ALT_REGISTRO,
        excRegistro: menu.EXC_REGISTRO,
        pesRegistro: menu.PES_REGISTRO,
      }));
    }
    const payload: PayloadJWT = {
      codUsuario: usuario.COD_USUARIO,
      codEmpresa,
      codGrupoUsuario: usuario.COD_GRUPO_USUARIO || undefined,
      login: usuario.ABR_USUARIO || usuario.NOM_USUARIO || "",
    };

    const token = gerarToken(payload);

    return {
      token,
      usuario: {
        codUsuario: usuario.COD_USUARIO,
        nome: usuario.NOM_USUARIO || "",
        login: usuario.ABR_USUARIO || usuario.NOM_USUARIO || "",
        codGrupoUsuario: usuario.COD_GRUPO_USUARIO,
        codEmpresa,
      },
      permissoes,
    };
  }

  async obterUsuarioPorToken(
    codUsuario: number
  ): Promise<DadosAutenticacao["usuario"] | null> {
    const usuario = await usuarioRepository.obterPorCodigo(codUsuario);

    if (!usuario || usuario.SIT_USUARIO !== "A") {
      return null;
    }

    const codEmpresa = parseInt(process.env.DEFAULT_COD_EMPRESA || "1", 10);

    return {
      codUsuario: usuario.COD_USUARIO,
      nome: usuario.NOM_USUARIO || "",
      login: usuario.ABR_USUARIO || usuario.NOM_USUARIO || "",
      codGrupoUsuario: usuario.COD_GRUPO_USUARIO,
      codEmpresa,
    };
  }
}

export const autenticacaoService = new AutenticacaoService();
