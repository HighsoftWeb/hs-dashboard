import { poolBanco } from "../db/pool-banco";
import { UsuarioDB, GrupoUsuarioDB, MenuGrupoUsuarioDB } from "../tipos/usuario-db";
import { EmpresaConfig } from "../entities/EmpresaConfig";

export class UsuarioRepository {
  async obterPorLogin(login: string, empresaConfig: EmpresaConfig): Promise<UsuarioDB | null> {
    const query = `
      SELECT 
        COD_USUARIO,
        COD_GRUPO_USUARIO,
        NOM_USUARIO,
        ABR_USUARIO,
        SEN_USUARIO,
        EMP_USUARIO,
        SIT_USUARIO,
        IND_CRIPTOGRAFADO,
        NUM_WHATSAPP,
        TELAS_BI_ACESSO,
        NUM_TOKEN_POWER_BI,
        DAT_CADASTRO,
        DAT_ALTERACAO
      FROM dbo.USUARIOS
      WHERE (ABR_USUARIO = @login OR NOM_USUARIO = @login)
        AND SIT_USUARIO = 'A'
    `;

    const resultados = await poolBanco.executarConsulta<UsuarioDB>(
      query,
      { login },
      empresaConfig
    );

    return resultados[0] || null;
  }

  async obterPorCodigo(codUsuario: number, empresaConfig: EmpresaConfig): Promise<UsuarioDB | null> {
    const query = `
      SELECT 
        COD_USUARIO,
        COD_GRUPO_USUARIO,
        NOM_USUARIO,
        ABR_USUARIO,
        SEN_USUARIO,
        EMP_USUARIO,
        SIT_USUARIO,
        IND_CRIPTOGRAFADO,
        NUM_WHATSAPP,
        TELAS_BI_ACESSO,
        NUM_TOKEN_POWER_BI,
        DAT_CADASTRO,
        DAT_ALTERACAO
      FROM dbo.USUARIOS
      WHERE COD_USUARIO = @codUsuario
    `;

    const resultados = await poolBanco.executarConsulta<UsuarioDB>(
      query,
      { codUsuario },
      empresaConfig
    );

    return resultados[0] || null;
  }

  async obterGrupoUsuario(
    codGrupoUsuario: number,
    empresaConfig: EmpresaConfig
  ): Promise<GrupoUsuarioDB | null> {
    const query = `
      SELECT 
        COD_GRUPO_USUARIO,
        NOM_GRUPO_USUARIO,
        NIV_GRUPO,
        IND_PRECO_CUSTO,
        PER_MARGEM_MIN_CUSTO
      FROM dbo.GRUPOS_USUARIOS
      WHERE COD_GRUPO_USUARIO = @codGrupoUsuario
    `;

    const resultados = await poolBanco.executarConsulta<GrupoUsuarioDB>(
      query,
      { codGrupoUsuario },
      empresaConfig
    );

    return resultados[0] || null;
  }

  async obterMenusGrupoUsuario(
    codGrupoUsuario: number,
    empresaConfig: EmpresaConfig
  ): Promise<MenuGrupoUsuarioDB[]> {
    const query = `
      SELECT 
        COD_GRUPO_USUARIO,
        NOM_MENU,
        PER_ACESSO,
        INC_REGISTRO,
        ALT_REGISTRO,
        EXC_REGISTRO,
        PES_REGISTRO,
        IND_SISTEMA
      FROM dbo.MENUS_GRUPOS_USUARIOS
      WHERE COD_GRUPO_USUARIO = @codGrupoUsuario
    `;

    return poolBanco.executarConsulta<MenuGrupoUsuarioDB>(
      query,
      { codGrupoUsuario },
      empresaConfig
    );
  }
}

export const usuarioRepository = new UsuarioRepository();
