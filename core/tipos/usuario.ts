export interface Usuario {
  codUsuario: number;
  nome: string;
  login: string;
  codGrupoUsuario: number | null;
  codEmpresa: number;
}

export interface CredenciaisLogin {
  login: string;
  senha: string;
  codEmpresa?: number;
}

export interface Permissao {
  menu: string;
  perAcesso: string | null;
  incRegistro: string | null;
  altRegistro: string | null;
  excRegistro: string | null;
  pesRegistro: string | null;
}

export interface DadosAutenticacao {
  usuario: Usuario;
  token: string;
  permissoes: Permissao[];
}
