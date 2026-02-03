import { usuarioRepository } from "../repository/usuario-repository";
import { gerarToken, PayloadJWT } from "../auth/jwt";
import { validarSenhaHS } from "../auth/senha";
import { empresaConfigRepository } from "../repository/empresa-config-repository";
import { poolBanco } from "../db/pool-banco";
import { tokenRepository } from "../repository/token-repository";
import type { EmpresaConfig } from "../entities/EmpresaConfig";

export interface DadosLogin {
  login: string;
  senha: string;
  codEmpresa?: number;
  cnpj?: string;
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

const DEFAULT_COD_EMPRESA = parseInt(process.env.DEFAULT_COD_EMPRESA || "1", 10);
const CNPJ_LENGTH = 14;

function validarCnpj(cnpj: string | undefined): string {
  if (!cnpj || typeof cnpj !== "string") {
    throw new Error("CNPJ é obrigatório");
  }

  const cnpjLimpo = cnpj.replace(/\D/g, "");
  
  if (cnpjLimpo.length !== CNPJ_LENGTH) {
    throw new Error("CNPJ inválido");
  }

  return cnpjLimpo;
}

function validarUsuarioPermitido(
  codUsuario: number,
  empresaConfig: EmpresaConfig
): void {
  if (!empresaConfig.codigosUsuariosPermitidos) {
    return;
  }

  const codigosPermitidos = empresaConfig.codigosUsuariosPermitidos
    .split(",")
    .map((cod) => cod.trim())
    .filter((cod) => cod.length > 0)
    .map((cod) => parseInt(cod, 10))
    .filter((cod) => !isNaN(cod));

  if (codigosPermitidos.length > 0 && !codigosPermitidos.includes(codUsuario)) {
    throw new Error("Usuário não autorizado para esta empresa");
  }
}

export class AutenticacaoService {
  async fazerLogin(dados: DadosLogin): Promise<DadosAutenticacao> {
    const cnpjLimpo = validarCnpj(dados.cnpj);
    
    const empresaConfig = empresaConfigRepository.obterPorCnpj(cnpjLimpo);
    if (!empresaConfig) {
      throw new Error("Empresa não encontrada");
    }

    await poolBanco.configurar(empresaConfig);

    const usuario = await usuarioRepository.obterPorLogin(
      dados.login,
      empresaConfig
    );

    if (!usuario) {
      throw new Error("Credenciais inválidas");
    }

    if (usuario.SIT_USUARIO !== "A") {
      throw new Error("Usuário inativo");
    }

    if (!usuario.SEN_USUARIO) {
      throw new Error("Senha não configurada");
    }

    validarUsuarioPermitido(usuario.COD_USUARIO, empresaConfig);

    const senhaValida = validarSenhaHS(
      dados.senha,
      usuario.SEN_USUARIO,
      usuario.IND_CRIPTOGRAFADO || "N"
    );

    if (!senhaValida) {
      throw new Error("Credenciais inválidas");
    }

    const codEmpresa = dados.codEmpresa || DEFAULT_COD_EMPRESA;

    let permissoes: DadosAutenticacao["permissoes"] = [];
    if (usuario.COD_GRUPO_USUARIO) {
      const menus = await usuarioRepository.obterMenusGrupoUsuario(
        usuario.COD_GRUPO_USUARIO,
        empresaConfig
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

    tokenRepository.revogarTodosTokensUsuario(usuario.COD_USUARIO, codEmpresa);

    const payload: Omit<PayloadJWT, "jti" | "iat"> = {
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
    codUsuario: number,
    empresaConfig: EmpresaConfig,
    codEmpresa?: number
  ): Promise<DadosAutenticacao["usuario"] | null> {
    if (!empresaConfig) {
      throw new Error("Configuração de empresa é obrigatória");
    }

    const usuario = await usuarioRepository.obterPorCodigo(
      codUsuario,
      empresaConfig
    );

    if (!usuario || usuario.SIT_USUARIO !== "A") {
      return null;
    }

    const empresaCod = codEmpresa || DEFAULT_COD_EMPRESA;

    return {
      codUsuario: usuario.COD_USUARIO,
      nome: usuario.NOM_USUARIO || "",
      login: usuario.ABR_USUARIO || usuario.NOM_USUARIO || "",
      codGrupoUsuario: usuario.COD_GRUPO_USUARIO,
      codEmpresa: empresaCod,
    };
  }
}

export const autenticacaoService = new AutenticacaoService();
