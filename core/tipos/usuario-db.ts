export interface UsuarioDB {
  COD_USUARIO: number;
  COD_GRUPO_USUARIO: number | null;
  NOM_USUARIO: string | null;
  ABR_USUARIO: string | null;
  SEN_USUARIO: string | null;
  EMP_USUARIO: string | null;
  SIT_USUARIO: string | null;
  IND_CRIPTOGRAFADO: string;
  NUM_WHATSAPP: string | null;
  TELAS_BI_ACESSO: string | null;
  NUM_TOKEN_POWER_BI: string | null;
  DAT_CADASTRO: Date | null;
  DAT_ALTERACAO: Date | null;
}

export interface GrupoUsuarioDB {
  COD_GRUPO_USUARIO: number;
  NOM_GRUPO_USUARIO: string | null;
  NIV_GRUPO: string | null;
  IND_PRECO_CUSTO: string | null;
  PER_MARGEM_MIN_CUSTO: number | null;
}

export interface MenuGrupoUsuarioDB {
  COD_GRUPO_USUARIO: number;
  NOM_MENU: string;
  PER_ACESSO: string | null;
  INC_REGISTRO: string | null;
  ALT_REGISTRO: string | null;
  EXC_REGISTRO: string | null;
  PES_REGISTRO: string | null;
  IND_SISTEMA: string;
}
